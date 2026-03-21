# ---------------------------------------------------------------------------
# s3_frontend.tf — Static frontend hosting via S3 + CloudFront
#
# Architecture:
#   Browser → CloudFront → S3 (private bucket, OAI only)
#
# Path routing:
#   /           → provider portal (apps/provider-portal build output)
#   /patient/*  → patient portal  (apps/patient-portal build output)
#
# React Router note: CloudFront custom error pages redirect 403/404 to
# index.html so client-side routing works correctly on hard refresh.
#
# Cost:
#   S3: ~$0.023/GB/month storage + $0.004/10K GET requests
#   CloudFront: first 1TB/month free tier; after that $0.0085/GB
#   Total demo cost: effectively $0-2/month
#   $0 after terraform destroy (bucket empties, distribution disabled)
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# S3 Bucket — private, no public access
# ---------------------------------------------------------------------------
resource "aws_s3_bucket" "frontend" {
  bucket        = "${local.name_prefix}-frontend-${data.aws_caller_identity.current.account_id}"
  force_destroy = true # Deletes all objects on terraform destroy — required for demo teardown

  tags = { Name = "${local.name_prefix}-frontend" }
}

# Block all public access — CloudFront uses OAI to read objects privately
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Versioning disabled for demo (saves storage cost on repeated deploys)
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Disabled"
  }
}

# Server-side encryption — free with S3-managed keys
resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# ---------------------------------------------------------------------------
# CloudFront Origin Access Identity
# Allows CloudFront to read from the private S3 bucket.
# ---------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_identity" "frontend" {
  comment = "OAI for Primus EHR frontend — ${local.name_prefix}"
}

# Bucket policy: allow CloudFront OAI to read objects
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontOAI"
        Effect = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.frontend.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# CloudFront Distribution
# ---------------------------------------------------------------------------
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "Primus EHR frontend — ${local.name_prefix}"
  price_class         = "PriceClass_100" # USA + Europe only — cheapest class

  # Aliases: add custom domain here when var.domain_name is set
  aliases = var.domain_name != "" ? [var.domain_name] : []

  # ---------------------------------------------------------------------------
  # Origins
  # ---------------------------------------------------------------------------

  # S3 origin — serves all static assets
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.frontend.cloudfront_access_identity_path
    }
  }

  # ALB origin — proxies /api/* and /auth/* through CloudFront (optional, for unified domain)
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "ALB-${local.name_prefix}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # ---------------------------------------------------------------------------
  # Cache Behaviors
  # ---------------------------------------------------------------------------

  # /api/* — forward to ALB, do not cache
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB-${local.name_prefix}"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type", "Accept", "Origin"]
      cookies { forward = "all" }
    }

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    viewer_protocol_policy = "allow-all"
    compress               = false
  }

  # /auth/* — forward to ALB (Keycloak), do not cache
  ordered_cache_behavior {
    path_pattern     = "/auth/*"
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB-${local.name_prefix}"

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type", "Accept", "Origin", "Cookie"]
      cookies { forward = "all" }
    }

    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
    viewer_protocol_policy = "allow-all"
    compress               = false
  }

  # /patient/* — patient portal SPA from S3
  ordered_cache_behavior {
    path_pattern     = "/patient/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl                = 0
    default_ttl            = 86400   # 1 day for HTML/JS assets
    max_ttl                = 31536000 # 1 year max (cache-busted by Vite content hashing)
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # /* default — provider portal SPA from S3
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # ---------------------------------------------------------------------------
  # SPA routing: redirect 403/404 → index.html with 200
  # This allows React Router to handle client-side routes on direct URL access.
  # ---------------------------------------------------------------------------
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  # No geographic restrictions for demo
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # TLS — default CloudFront certificate (no custom domain cert needed for demo)
  viewer_certificate {
    cloudfront_default_certificate = var.domain_name == "" ? true : false

    # Uncomment and set acm_certificate_arn when using a custom domain:
    # acm_certificate_arn      = aws_acm_certificate.main.arn
    # ssl_support_method       = "sni-only"
    # minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = { Name = "${local.name_prefix}-cloudfront" }
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------
output "cloudfront_url" {
  description = "CloudFront URL — share this as the demo access URL"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_domain" {
  description = "CloudFront domain name (without https://)"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "s3_frontend_bucket" {
  description = "S3 bucket name — use `aws s3 sync` to upload frontend builds"
  value       = aws_s3_bucket.frontend.id
}

output "s3_frontend_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.frontend.arn
}
