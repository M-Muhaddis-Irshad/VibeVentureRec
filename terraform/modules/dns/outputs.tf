output "acm_certificate_arn" {
  value = var.domain_name != "" ? aws_acm_certificate_validation.this[0].certificate_arn : ""
}

output "zone_id" {
  value = var.domain_name != "" ? local.zone_id : ""
}
