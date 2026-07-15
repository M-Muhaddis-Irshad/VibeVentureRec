terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # One-time manual setup required before this backend works:
  #   1. Create an S3 bucket for state (versioning enabled)
  #   2. Create a DynamoDB table "vibeventure-tf-locks" with partition key "LockID" (String)
  # See README.md "Bootstrap" section.
  backend "s3" {
    bucket         = "vibeventure-terraform-state"
    key            = "vibeventure/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "vibeventure-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

module "kms" {
  source       = "./modules/kms"
  project_name = var.project_name
}

module "network" {
  source             = "./modules/network"
  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidrs = var.public_subnet_cidrs
  availability_zones  = var.availability_zones
}

module "security" {
  source       = "./modules/security"
  project_name = var.project_name
  vpc_id       = module.network.vpc_id
  app_port     = var.app_port
}

module "storage" {
  source       = "./modules/storage"
  project_name = var.project_name
  environment  = var.environment
}

module "dns" {
  source      = "./modules/dns"
  domain_name = var.domain_name
  create_zone = var.create_route53_zone
}

module "alb" {
  source            = "./modules/alb"
  project_name      = var.project_name
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
  app_port          = var.app_port
  acm_certificate_arn = module.dns.acm_certificate_arn
}

module "database" {
  source            = "./modules/database"
  project_name      = var.project_name
  environment       = var.environment
  db_subnet_ids     = module.network.public_subnet_ids # Free-tier: no NAT, RDS still isolated via SG
  rds_sg_id         = module.security.rds_sg_id
  db_name           = var.db_name
  db_username       = var.db_username
  db_password       = var.db_password
  instance_class    = var.rds_instance_class
  multi_az          = var.rds_multi_az
  kms_key_arn       = module.kms.key_arn
}

module "compute" {
  source              = "./modules/compute"
  project_name        = var.project_name
  ami_id              = var.ami_id
  instance_type       = var.instance_type
  public_subnet_ids   = module.network.public_subnet_ids
  ec2_sg_id           = module.security.ec2_sg_id
  target_group_arn    = module.alb.target_group_arn
  min_size            = var.asg_min_size
  max_size            = var.asg_max_size
  desired_capacity    = var.asg_desired_capacity
  app_port            = var.app_port
  database_url_ssm    = module.database.connection_string_ssm_param
  s3_bucket_name      = module.storage.bucket_name
  aws_region          = var.aws_region
  instance_profile_name = module.compute_iam.instance_profile_name
}

module "compute_iam" {
  source         = "./modules/compute-iam"
  project_name   = var.project_name
  s3_bucket_arn  = module.storage.bucket_arn
  kms_key_arn    = module.kms.key_arn
}

# A-record alias: domain -> ALB. Declared at root level since it depends on
# both the dns module (zone) and the alb module (target), avoiding a cycle
# between those two modules.
resource "aws_route53_record" "app" {
  count   = var.domain_name != "" ? 1 : 0
  zone_id = module.dns.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = module.alb.alb_dns_name
    zone_id                = module.alb.alb_zone_id
    evaluate_target_health = true
  }
}

module "cloudwatch" {
  source          = "./modules/cloudwatch"
  project_name    = var.project_name
  asg_name        = module.compute.asg_name
  db_instance_id  = module.database.db_instance_id
}
