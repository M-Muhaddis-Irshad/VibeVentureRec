#!/bin/bash
set -euxo pipefail

# This script runs on every boot of instances launched from the Packer AMI.
# The AMI already has Node.js, PM2, and the app code baked in at
# /opt/vibeventure/server (see packer/app.pkr.hcl). This script only pulls
# runtime secrets from SSM and (re)starts the app via systemd/PM2.

REGION="${aws_region}"
APP_DIR="/opt/vibeventure/server"

DATABASE_URL=$(aws ssm get-parameter \
  --name "${database_url_ssm}" \
  --with-decryption \
  --region "$REGION" \
  --query "Parameter.Value" \
  --output text)

cat > "$APP_DIR/.env" <<EOF
DATABASE_URL=$DATABASE_URL
PORT=${app_port}
S3_BUCKET_NAME=${s3_bucket_name}
AWS_REGION=$REGION
CORS_ORIGIN=*
EOF

cd "$APP_DIR"
npx prisma migrate deploy || true

systemctl restart vibeventure-api || (pm2 restart vibeventure-api || pm2 start src/server.js --name vibeventure-api)
