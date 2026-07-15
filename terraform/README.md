# Vibeventure — Infrastructure

Terraform + Packer + GitHub Actions deployment for the Vibeventure travel
journal, adapted from the reference architecture to stay AWS Free-Tier
friendly. See the cost notes at the bottom before you `apply`.

## Architecture

```
Developer -> Git -> GitHub Actions (CI) -> Packer (bakes AMI) -> Terraform apply
                                                                     |
                        Route53 + ACM --- ALB (public subnets, 1-2 AZ) --- ASG (EC2)
                                                                     |
                                                          RDS PostgreSQL (single-AZ)
                                                                     |
                                                S3 (post images) + KMS (encryption)
                                                CloudWatch (logs + CPU/storage alarms)
```

## One-time manual bootstrap

Terraform's S3 backend can't create its own bucket, so do this once, by hand,
before the first `terraform init`:

```bash
aws s3api create-bucket \
  --bucket vibeventure-terraform-state \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1

aws s3api put-bucket-versioning \
  --bucket vibeventure-terraform-state \
  --versioning-configuration Status=Enabled

aws dynamodb create-table \
  --table-name vibeventure-tf-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1
```

You also need an IAM role that GitHub Actions can assume via OIDC (no
long-lived AWS keys in secrets). Create an OIDC identity provider for
`token.actions.githubusercontent.com` and a role trusting your repo, with
permissions to manage EC2/ASG/ALB/RDS/S3/IAM/Route53/ACM/KMS/CloudWatch/SSM.
Store its ARN in the repo secret `AWS_DEPLOY_ROLE_ARN`, and put your RDS
master password in the repo secret `DB_PASSWORD`.

## Running locally

```bash
cp terraform.tfvars.example terraform.tfvars   # fill in ami_id after your first Packer build
export TF_VAR_db_password="a-strong-password"  # never put this in a committed file

terraform init
terraform plan
terraform apply
```

## First deploy order

1. Build the app locally (`server/` + `client/`) and confirm it runs.
2. Run the Packer build once by hand (or let the `deploy.yml` workflow do it)
   to produce an AMI ID.
3. Put that AMI ID in `terraform.tfvars` (`ami_id = "ami-..."`).
4. `terraform apply`.
5. After that, pushes to `main` will rebuild the AMI and roll it out via an
   ASG instance refresh automatically (see `.github/workflows/deploy.yml`).

## Scaling up to the full 2-AZ diagram

This config defaults to `asg_desired_capacity = 1` and single-AZ RDS to
minimize cost. When you're ready to match the original architecture exactly:

- Set `asg_desired_capacity = 2` (min/max already allow it)
- Set `rds_multi_az = true` to add the standby replica
- Nothing else changes — the ASG already spans both AZs in `public_subnet_ids`

## Cost notes (Free Tier, ap-southeast-1, first 12 months)

| Component | Free tier? | Notes |
|---|---|---|
| EC2 (t2.micro x1) | ✅ 750 hrs/month | Only if you don't scale past 1 instance most of the time |
| RDS (db.t3.micro, single-AZ, 20GB) | ✅ 750 hrs/month + 20GB | Multi-AZ roughly doubles this — off by default |
| S3 | ✅ 5GB + requests | Fine for post images |
| ACM | ✅ Always free | Public certs are free |
| CloudWatch | ✅ Basic tier | Alarms above the free 10 may incur small charges |
| KMS | ⚠️ ~$1/month per key | Free tier covers 20,000 requests/month |
| **ALB** | ❌ Not free | ~$16-20/month base + per-LCU. Biggest line item here. |
| **Route53 hosted zone** | ❌ Not free | ~$0.50/month per zone (only if `domain_name` is set) |

If you want to cut the ALB entirely for a true $0 setup, tell me and I'll
swap it for a single EC2 + Elastic IP + Nginx reverse proxy — you lose
health-check-based failover and TLS termination convenience, but it's free.
