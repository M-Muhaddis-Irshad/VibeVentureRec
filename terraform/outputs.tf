output "alb_dns_name" {
  description = "Public DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

output "rds_endpoint" {
  description = "RDS PostgreSQL connection endpoint"
  value       = module.database.endpoint
}

output "s3_bucket_name" {
  description = "S3 bucket storing post cover images"
  value       = module.storage.bucket_name
}

output "vpc_id" {
  value = module.network.vpc_id
}

output "kms_key_arn" {
  value = module.kms.key_arn
}
