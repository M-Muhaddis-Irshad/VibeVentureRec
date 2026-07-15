resource "aws_kms_key" "this" {
  description             = "${var.project_name} encryption key (RDS storage + S3 SSE)"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = { Name = "${var.project_name}-kms" }
}

resource "aws_kms_alias" "this" {
  name          = "alias/${var.project_name}-key"
  target_key_id = aws_kms_key.this.key_id
}
