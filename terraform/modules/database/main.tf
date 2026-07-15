resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-${var.environment}-db-subnets"
  subnet_ids = var.db_subnet_ids

  tags = { Name = "${var.project_name}-db-subnet-group" }
}

resource "aws_db_instance" "this" {
  identifier     = "${var.project_name}-${var.environment}-db"
  engine         = "postgres"
  engine_version = "16.4"

  instance_class    = var.instance_class
  allocated_storage = 20 # Free Tier: up to 20GB gp2/gp3
  storage_type      = "gp3"
  storage_encrypted = true
  kms_key_id        = var.kms_key_arn

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [var.rds_sg_id]

  multi_az            = var.multi_az
  publicly_accessible = false

  backup_retention_period = 7
  skip_final_snapshot     = true # set false in real production
  deletion_protection     = false

  tags = { Name = "${var.project_name}-db" }
}

# Store the connection string in SSM Parameter Store (SecureString) so the
# EC2 instance can pull it at boot instead of baking it into the AMI.
resource "aws_ssm_parameter" "database_url" {
  name  = "/${var.project_name}/${var.environment}/DATABASE_URL"
  type  = "SecureString"
  value = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.this.endpoint}/${var.db_name}?schema=public"
  key_id = var.kms_key_arn

  tags = { Name = "${var.project_name}-database-url" }
}
