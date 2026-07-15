output "endpoint" {
  value = aws_db_instance.this.endpoint
}

output "db_instance_id" {
  value = aws_db_instance.this.id
}

output "connection_string_ssm_param" {
  value = aws_ssm_parameter.database_url.name
}
