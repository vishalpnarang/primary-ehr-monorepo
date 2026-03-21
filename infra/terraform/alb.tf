# ---------------------------------------------------------------------------
# alb.tf — Application Load Balancer
#
# Routes:
#   /api/*    → ECS backend (Spring Boot)
#   /auth/*   → ECS Keycloak
#   /*        → (default) fixed 302 redirect to CloudFront URL
#
# The frontend is served from CloudFront → S3, not through the ALB.
# The ALB is the single ingress point for API and auth traffic.
#
# Cost: ~$16-20/month for the ALB itself (LCU charges on top for traffic).
# $0 after terraform destroy.
# ---------------------------------------------------------------------------

resource "aws_lb" "main" {
  name               = "${local.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  # Access logs — disabled for demo to avoid S3 storage cost
  # Enable for staging/prod: access_logs { bucket = "..." enabled = true }
  enable_deletion_protection = false # Demo: allow easy destruction

  tags = { Name = "${local.name_prefix}-alb" }
}

# ---------------------------------------------------------------------------
# Target Groups
# ---------------------------------------------------------------------------

# Backend target group — Spring Boot Actuator health check
resource "aws_lb_target_group" "backend" {
  name        = "${local.name_prefix}-tg-backend"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # Required for Fargate awsvpc networking

  health_check {
    enabled             = true
    path                = "/actuator/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 5
    interval            = 30
    timeout             = 10
    matcher             = "200"
  }

  # Drain quickly for demo deploys
  deregistration_delay = 30

  tags = { Name = "${local.name_prefix}-tg-backend" }
}

# Keycloak target group — Keycloak health check endpoint
resource "aws_lb_target_group" "keycloak" {
  name        = "${local.name_prefix}-tg-keycloak"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    path                = "/auth/health/ready"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 5
    interval            = 30
    timeout             = 10
    matcher             = "200"
  }

  deregistration_delay = 30

  tags = { Name = "${local.name_prefix}-tg-keycloak" }
}

# ---------------------------------------------------------------------------
# Listener — HTTP port 80
# Production should use HTTPS (port 443) with an ACM certificate.
# For demo without a custom domain, HTTP is fine.
# ---------------------------------------------------------------------------
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # Default action: redirect browser to CloudFront (provider portal)
  default_action {
    type = "redirect"

    redirect {
      host        = aws_cloudfront_distribution.frontend.domain_name
      path        = "/#{path}"
      query       = "#{query}"
      protocol    = "HTTPS"
      status_code = "HTTP_302"
    }
  }
}

# ---------------------------------------------------------------------------
# Listener Rules — evaluated top-down by priority
# ---------------------------------------------------------------------------

# Priority 10: /api/* → backend target group
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  condition {
    path_pattern {
      values = ["/api/*", "/api"]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Priority 20: /auth/* → Keycloak target group
resource "aws_lb_listener_rule" "auth" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 20

  condition {
    path_pattern {
      values = ["/auth/*", "/auth"]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.keycloak.arn
  }
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------
output "alb_dns_name" {
  description = "ALB DNS name — use for API and Keycloak access"
  value       = aws_lb.main.dns_name
}

output "api_url" {
  description = "REST API base URL"
  value       = "http://${aws_lb.main.dns_name}/api"
}

output "keycloak_url" {
  description = "Keycloak admin console URL"
  value       = "http://${aws_lb.main.dns_name}/auth"
}
