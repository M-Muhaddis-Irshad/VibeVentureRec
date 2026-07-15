variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ap-southeast-1"
}

variable "project_name" {
  description = "Short name used to prefix/tag all resources"
  type        = string
  default     = "vibeventure"
}

variable "environment" {
  description = "Deployment environment name"
  type        = string
  default     = "dev"
}

# --- Networking ---
variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "One CIDR per AZ. Free-tier setup keeps everything in public subnets (no NAT Gateway)."
  type        = list(string)
  default     = ["10.20.1.0/24", "10.20.2.0/24"]
}

variable "availability_zones" {
  type    = list(string)
  default = ["ap-southeast-1a", "ap-southeast-1b"]
}

# --- Compute / ASG ---
variable "ami_id" {
  description = "AMI ID produced by the Packer build (see packer/). Placeholder until first build."
  type        = string
  default     = "ami-0000000000000000"
}

variable "instance_type" {
  type    = string
  default = "t2.micro" # Free Tier eligible
}

variable "app_port" {
  type    = number
  default = 5000
}

variable "asg_min_size" {
  type    = number
  default = 1
}

variable "asg_max_size" {
  type    = number
  default = 2
}

variable "asg_desired_capacity" {
  type    = number
  default = 1 # Bump to 2 + set availability_zones to both AZs to match the full diagram
}

# --- Database ---
variable "db_name" {
  type    = string
  default = "vibeventure"
}

variable "db_username" {
  type    = string
  default = "vibeventure_admin"
}

variable "db_password" {
  description = "RDS master password. Pass via TF_VAR_db_password or a .tfvars file that is gitignored — never commit it."
  type        = string
  sensitive   = true
}

variable "rds_instance_class" {
  type    = string
  default = "db.t3.micro" # Free Tier eligible for the first 12 months
}

variable "rds_multi_az" {
  description = "Set true to add the standby replica shown in the original diagram (roughly doubles RDS cost)."
  type        = bool
  default     = false
}

# --- DNS ---
variable "domain_name" {
  description = "Domain name for Route53 + ACM. Leave blank to skip DNS/ACM (ALB will only be reachable via its own DNS name)."
  type        = string
  default     = ""
}

variable "create_route53_zone" {
  description = "Whether Terraform should create the hosted zone (false if it already exists)"
  type        = bool
  default     = false
}
