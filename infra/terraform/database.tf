# ---------------------------------------------------------------------------
# database.tf — Aurora Serverless v2 PostgreSQL 16
#
# Why Serverless v2?
#   - Scales to 0.5 ACU when idle (demo sits idle most of the time)
#   - Max 2 ACU covers typical demo load
#   - No wasted capacity cost between demos
#
# Cost estimate:
#   - 0.5 ACU idle: ~$0.06/hr = ~$45/month (24/7)
#   - With scale-to-zero on pause: near-zero when no connections
#   - Full teardown: $0
#
# Note: Aurora Serverless v2 does NOT support true pause/resume (that is
# Serverless v1). v2 keeps the writer running at minimum ACU. For maximum
# cost savings between demos, use `terraform destroy` and re-apply.
# ---------------------------------------------------------------------------

# Subnet group — Aurora requires subnets in at least 2 AZs
resource "aws_db_subnet_group" "main" {
  name        = "${local.name_prefix}-db-subnet-group"
  description = "Aurora subnet group for Primus EHR — private subnets across 2 AZs"
  subnet_ids  = aws_subnet.private[*].id

  tags = { Name = "${local.name_prefix}-db-subnet-group" }
}

# ---------------------------------------------------------------------------
# Aurora Serverless v2 cluster
# ---------------------------------------------------------------------------
resource "aws_rds_cluster" "main" {
  cluster_identifier = "${local.name_prefix}-aurora"

  engine         = "aurora-postgresql"
  engine_version = "16.2"
  engine_mode    = "provisioned" # Serverless v2 uses "provisioned" engine_mode

  database_name   = "primusehr"
  master_username = "primusadmin"
  master_password = var.db_password

  # Restore from snapshot if available (preserves customer test data)
  snapshot_identifier = var.db_snapshot_identifier != "" ? var.db_snapshot_identifier : null

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  # Serverless v2 scaling config — on the cluster, not the instance
  serverlessv2_scaling_configuration {
    min_capacity = 0.5  # 0.5 ACU = minimum, ~$0.06/hr
    max_capacity = 2.0  # 2 ACU = comfortable demo headroom
  }

  # Storage
  storage_encrypted = true

  # Backup — minimal for demo (1 day), increase for staging/prod
  backup_retention_period = 1
  skip_final_snapshot     = true  # Demo: skip snapshot on destroy for $0 teardown
  deletion_protection     = false # Demo: allow easy destruction

  # Parameter group defaults are fine for demo PostgreSQL 16
  db_cluster_parameter_group_name = aws_rds_cluster_parameter_group.main.name

  tags = { Name = "${local.name_prefix}-aurora" }
}

# ---------------------------------------------------------------------------
# Aurora instance (writer) — Serverless v2 requires at least one db.serverless
# instance attached to the cluster.
# ---------------------------------------------------------------------------
resource "aws_rds_cluster_instance" "writer" {
  identifier         = "${local.name_prefix}-aurora-writer"
  cluster_identifier = aws_rds_cluster.main.id

  instance_class = "db.serverless" # Required for Serverless v2
  engine         = aws_rds_cluster.main.engine
  engine_version = aws_rds_cluster.main.engine_version

  db_subnet_group_name = aws_db_subnet_group.main.name

  # Performance insights disabled to reduce cost for demo
  performance_insights_enabled = false

  tags = { Name = "${local.name_prefix}-aurora-writer" }
}

# ---------------------------------------------------------------------------
# Cluster parameter group — enables logical replication and sets sensible
# Postgres defaults for an EHR workload.
# ---------------------------------------------------------------------------
resource "aws_rds_cluster_parameter_group" "main" {
  name        = "${local.name_prefix}-aurora-pg16"
  family      = "aurora-postgresql16"
  description = "Primus EHR Aurora PostgreSQL 16 parameter group"

  parameter {
    name  = "log_statement"
    value = "ddl" # Log DDL statements for audit trail
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries slower than 1s (ms)
  }

  tags = { Name = "${local.name_prefix}-aurora-pg16" }
}

# ---------------------------------------------------------------------------
# Outputs used by other modules and deploy.sh
# ---------------------------------------------------------------------------
output "db_endpoint" {
  description = "Aurora cluster writer endpoint — used in Spring Boot datasource URL"
  value       = aws_rds_cluster.main.endpoint
}

output "db_reader_endpoint" {
  description = "Aurora cluster reader endpoint — for read-replica routing"
  value       = aws_rds_cluster.main.reader_endpoint
}

output "db_name" {
  description = "Database name"
  value       = aws_rds_cluster.main.database_name
}

output "db_username" {
  description = "Database master username"
  value       = aws_rds_cluster.main.master_username
  sensitive   = true
}
