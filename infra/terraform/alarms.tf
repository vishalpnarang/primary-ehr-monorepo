# ---------------------------------------------------------------------------
# alarms.tf — CloudWatch Alarms for production monitoring
#
# Alarms:
#   1. ECS CPU utilization        > 80% for 5 min
#   2. ECS Memory utilization     > 80% for 5 min
#   3. ALB 5xx error count        > 5 per 5 min
#   4. ALB target response time   > 2s p95
#   5. Aurora CPU utilization     > 80%
#   6. Aurora database connections > 80
#
# All alarms notify via var.alarm_sns_topic_arn (if set).
# Cost: ~$0.10/alarm/month = ~$0.60/month total. $0 after terraform destroy.
# ---------------------------------------------------------------------------

locals {
  # Only add the SNS topic as an alarm action if it's configured.
  # This allows alarms to exist (and show in CloudWatch console) even without
  # an SNS topic, which is useful for initial deployments.
  alarm_actions = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []
}

# ---------------------------------------------------------------------------
# 1. ECS Backend — CPU Utilization > 80% for 5 minutes
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "ecs_cpu_high" {
  alarm_name          = "${local.name_prefix}-ecs-cpu-high"
  alarm_description   = "ECS backend service CPU utilization exceeds 80% for 5 minutes — consider scaling or right-sizing"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 300 # 5 minutes
  statistic           = "Average"
  threshold           = 80
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.backend.name
  }

  alarm_actions = local.alarm_actions
  ok_actions    = local.alarm_actions

  tags = { Name = "${local.name_prefix}-ecs-cpu-high" }
}

# ---------------------------------------------------------------------------
# 2. ECS Backend — Memory Utilization > 80% for 5 minutes
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "ecs_memory_high" {
  alarm_name          = "${local.name_prefix}-ecs-memory-high"
  alarm_description   = "ECS backend service memory utilization exceeds 80% for 5 minutes — risk of OOM kill"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  treat_missing_data  = "notBreaching"

  dimensions = {
    ClusterName = aws_ecs_cluster.main.name
    ServiceName = aws_ecs_service.backend.name
  }

  alarm_actions = local.alarm_actions
  ok_actions    = local.alarm_actions

  tags = { Name = "${local.name_prefix}-ecs-memory-high" }
}

# ---------------------------------------------------------------------------
# 3. ALB — 5xx Error Count > 5 per 5 minutes
# High 5xx rate indicates backend failures, misconfigurations, or outages.
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "alb_5xx_high" {
  alarm_name          = "${local.name_prefix}-alb-5xx-high"
  alarm_description   = "ALB returning more than 5 HTTP 5xx errors in 5 minutes — backend may be unhealthy"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "HTTPCode_ELB_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching" # No 5xx = healthy, not missing data

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = local.alarm_actions
  ok_actions    = local.alarm_actions

  tags = { Name = "${local.name_prefix}-alb-5xx-high" }
}

# ---------------------------------------------------------------------------
# 4. ALB — Target Response Time > 2 seconds (p95)
# Slow responses degrade provider UX and may indicate DB or service issues.
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "alb_response_time_high" {
  alarm_name          = "${local.name_prefix}-alb-response-time-high"
  alarm_description   = "ALB p95 target response time exceeds 2 seconds — investigate backend latency"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 300
  extended_statistic  = "p95"
  threshold           = 2 # 2 seconds
  treat_missing_data  = "notBreaching"

  dimensions = {
    LoadBalancer = aws_lb.main.arn_suffix
  }

  alarm_actions = local.alarm_actions
  ok_actions    = local.alarm_actions

  tags = { Name = "${local.name_prefix}-alb-response-time-high" }
}

# ---------------------------------------------------------------------------
# 5. Aurora — CPU Utilization > 80%
# High DB CPU usually means slow queries, missing indexes, or under-provisioned ACUs.
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "aurora_cpu_high" {
  alarm_name          = "${local.name_prefix}-aurora-cpu-high"
  alarm_description   = "Aurora PostgreSQL CPU utilization exceeds 80% — check slow queries and scaling configuration"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBClusterIdentifier = aws_rds_cluster.main.cluster_identifier
  }

  alarm_actions = local.alarm_actions
  ok_actions    = local.alarm_actions

  tags = { Name = "${local.name_prefix}-aurora-cpu-high" }
}

# ---------------------------------------------------------------------------
# 6. Aurora — Database Connections > 80
# High connection count can exhaust the max_connections limit and cause failures.
# Serverless v2 at 0.5-2 ACU supports ~45-180 connections; 80 is a safe threshold.
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_metric_alarm" "aurora_connections_high" {
  alarm_name          = "${local.name_prefix}-aurora-connections-high"
  alarm_description   = "Aurora PostgreSQL has more than 80 active connections — risk of exhausting max_connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  treat_missing_data  = "notBreaching"

  dimensions = {
    DBClusterIdentifier = aws_rds_cluster.main.cluster_identifier
  }

  alarm_actions = local.alarm_actions
  ok_actions    = local.alarm_actions

  tags = { Name = "${local.name_prefix}-aurora-connections-high" }
}
