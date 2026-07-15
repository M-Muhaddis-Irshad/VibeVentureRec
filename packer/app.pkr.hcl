packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "ap-southeast-1"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

# Set this to the git ref / tag you want baked into the AMI, e.g. from CI:
#   packer build -var "app_git_ref=$GITHUB_SHA" app.pkr.hcl
variable "app_git_ref" {
  type    = string
  default = "main"
}

variable "app_repo_url" {
  type    = string
  default = "https://github.com/YOUR_ORG/vibeventure.git"
}

source "amazon-ebs" "vibeventure" {
  ami_name      = "vibeventure-app-{{timestamp}}"
  instance_type = var.instance_type
  region        = var.aws_region

  source_ami_filter {
    filters = {
      name                = "al2023-ami-*-x86_64"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["137112412989"] # Amazon
  }

  ssh_username = "ec2-user"

  tags = {
    Name    = "vibeventure-app"
    Project = "vibeventure"
    GitRef  = var.app_git_ref
  }
}

build {
  name    = "vibeventure-app"
  sources = ["source.amazon-ebs.vibeventure"]

  provisioner "shell" {
    inline = [
      "sudo dnf update -y",
      "sudo dnf install -y git nodejs npm aws-cli",
      "sudo npm install -g pm2",
      "sudo mkdir -p /opt/vibeventure",
      "sudo chown ec2-user:ec2-user /opt/vibeventure",
    ]
  }

  provisioner "shell" {
    inline = [
      "git clone --branch ${var.app_git_ref} --depth 1 ${var.app_repo_url} /opt/vibeventure/src",
      "cp -r /opt/vibeventure/src/server /opt/vibeventure/server",
      "cd /opt/vibeventure/server && npm ci --omit=dev && npx prisma generate",
    ]
  }

  provisioner "file" {
    source      = "vibeventure-api.service"
    destination = "/tmp/vibeventure-api.service"
  }

  provisioner "shell" {
    inline = [
      "sudo mv /tmp/vibeventure-api.service /etc/systemd/system/vibeventure-api.service",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable vibeventure-api",
    ]
  }
}
