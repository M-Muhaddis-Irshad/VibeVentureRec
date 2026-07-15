# Vibeventure

A travel journal blog with full CRUD, built as a reference full-stack + AWS
deployment project.

- **Frontend:** React + Vite + Tailwind CSS (`client/`)
- **Backend:** Node.js + Express + Prisma ORM (`server/`)
- **Database:** PostgreSQL (local: Docker; cloud: RDS)
- **Images:** AWS S3
- **Infrastructure:** Terraform + Packer + GitHub Actions (`terraform/`, `packer/`, `.github/workflows/`)

## Quick start (local, no AWS needed except S3 for images)

```bash
# 1. Database
docker run --name vibeventure-pg -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=vibeventure -p 5432:5432 -d postgres:16

# 2. Backend
cd server
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run dev          # http://localhost:5000

# 3. Frontend (new terminal)
cd client
npm install
cp .env.example .env
npm run dev           # http://localhost:5173
```

Image upload requires a real S3 bucket + AWS credentials in `server/.env`.
Everything else runs fully local.

## Deploying to AWS

See [`terraform/README.md`](terraform/README.md) for the full bootstrap,
deploy order, and a cost breakdown for staying inside the Free Tier. Short
version:

1. Get the app running locally first.
2. Manually create the Terraform state bucket + lock table (one-time).
3. Build an AMI with Packer (or let CI do it on push to `main`).
4. `terraform apply`.
5. Every push to `main` after that rebuilds the AMI and rolls it out.

## Project structure

```
vibeventure/
├── client/          React frontend
├── server/          Express + Prisma API
├── terraform/        Infra as code (VPC, ALB, ASG, RDS, S3, Route53, KMS, CloudWatch)
├── packer/           AMI build template + systemd unit
└── .github/workflows/  CI (lint/test/plan) + Deploy (build AMI, apply, refresh)
```

## Architecture

Matches the original diagram, adapted for Free Tier by defaulting to 1 EC2
instance and single-AZ RDS (both easy to scale up — see the Terraform README).

```
Users -> Route53 -> ALB (TLS via ACM) -> Auto Scaling Group (EC2, 1-2 AZ) -> RDS PostgreSQL
                                                    |
                                                    v
                                              S3 (post images)
GitHub push -> GitHub Actions -> Packer (bakes AMI) -> Terraform apply -> ASG instance refresh
```

##About

A full-stack travel journal built with React + Vite frontend, Node.js/Express + Prisma backend, PostgreSQL database, image storage on AWSS3, and production infrastructure managed via Terraform (VPC, ALB, Auto Scaling, RDS) with automated CI/CD through GitHub Actions and Packer
-baked AMIs.