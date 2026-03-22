# ---------------------------------------------------------------------------
# waf.tf — AWS WAFv2 Web ACL for ALB protection
#
# Provides:
#   - OWASP Core Rule Set (common web exploits)
#   - Known Bad Inputs (Log4j, host header injection, etc.)
#   - SQL Injection protection
#   - Rate-based rule: 2000 requests per 5 minutes per IP
#
# Cost: ~$5/month for the Web ACL + $1/month per rule + $0.60/million requests.
# $0 after terraform destroy.
# ---------------------------------------------------------------------------

resource "aws_wafv2_web_acl" "alb" {
  name        = "${local.name_prefix}-waf"
  description = "WAF Web ACL for Primus EHR ALB — OWASP core rules, SQLi, rate limiting"
  scope       = "REGIONAL" # ALB requires REGIONAL scope (not CLOUDFRONT)

  default_action {
    allow {} # Allow traffic that passes all rules
  }

  # ---------------------------------------------------------------------------
  # Rule 1: AWS Managed Rules — Common Rule Set (OWASP core protections)
  # Covers: XSS, path traversal, local/remote file inclusion, etc.
  # ---------------------------------------------------------------------------
  rule {
    name     = "aws-managed-common-rules"
    priority = 10

    override_action {
      none {} # Use the managed rule group's own actions (block/count)
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.name_prefix}-waf-common"
      sampled_requests_enabled   = true
    }
  }

  # ---------------------------------------------------------------------------
  # Rule 2: AWS Managed Rules — Known Bad Inputs
  # Covers: Log4j/Log4Shell, Java deserialization, host header injection
  # ---------------------------------------------------------------------------
  rule {
    name     = "aws-managed-known-bad-inputs"
    priority = 20

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.name_prefix}-waf-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  # ---------------------------------------------------------------------------
  # Rule 3: AWS Managed Rules — SQL Injection
  # Covers: SQL injection patterns in query strings, body, URI, headers
  # ---------------------------------------------------------------------------
  rule {
    name     = "aws-managed-sqli-rules"
    priority = 30

    override_action {
      none {}
    }

    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesSQLiRuleSet"
        vendor_name = "AWS"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.name_prefix}-waf-sqli"
      sampled_requests_enabled   = true
    }
  }

  # ---------------------------------------------------------------------------
  # Rule 4: Rate-based rule — 2000 requests per 5 minutes per IP
  # Mitigates brute-force login attempts, credential stuffing, and DDoS.
  # WAFv2 rate-based rules evaluate over a rolling 5-minute window.
  # ---------------------------------------------------------------------------
  rule {
    name     = "rate-limit-per-ip"
    priority = 40

    action {
      block {} # Block IPs exceeding the threshold
    }

    statement {
      rate_based_statement {
        limit              = 2000 # Requests per 5-minute window per IP
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.name_prefix}-waf-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  # Top-level visibility config for the entire Web ACL
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${local.name_prefix}-waf"
    sampled_requests_enabled   = true
  }

  tags = { Name = "${local.name_prefix}-waf" }
}

# ---------------------------------------------------------------------------
# Associate the WAF Web ACL with the ALB
# ---------------------------------------------------------------------------
resource "aws_wafv2_web_acl_association" "alb" {
  resource_arn = aws_lb.main.arn
  web_acl_arn  = aws_wafv2_web_acl.alb.arn
}
