# DNS + ACM are both optional: if domain_name is left blank, this module
# creates nothing and the ALB is only reachable via its own AWS DNS name.

resource "aws_route53_zone" "this" {
  count = var.domain_name != "" && var.create_zone ? 1 : 0
  name  = var.domain_name
}

data "aws_route53_zone" "existing" {
  count = var.domain_name != "" && !var.create_zone ? 1 : 0
  name  = var.domain_name
}

locals {
  zone_id = var.domain_name == "" ? "" : (
    var.create_zone ? aws_route53_zone.this[0].zone_id : data.aws_route53_zone.existing[0].zone_id
  )
}

resource "aws_acm_certificate" "this" {
  count             = var.domain_name != "" ? 1 : 0
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = ["*.${var.domain_name}"]

  lifecycle {
    create_before_destroy = true
  }

  tags = { Name = var.domain_name }
}

resource "aws_route53_record" "cert_validation" {
  for_each = var.domain_name != "" ? {
    for dvo in aws_acm_certificate.this[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  } : {}

  zone_id = local.zone_id
  name    = each.value.name
  type    = each.value.type
  records = [each.value.record]
  ttl     = 60
}

resource "aws_acm_certificate_validation" "this" {
  count                   = var.domain_name != "" ? 1 : 0
  certificate_arn         = aws_acm_certificate.this[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cert_validation : r.fqdn]
}
