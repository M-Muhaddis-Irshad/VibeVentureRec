resource "aws_s3_bucket" "images" {
  bucket = "${var.project_name}-images-${var.environment}"

  tags = { Name = "${var.project_name}-images" }
}

resource "aws_s3_bucket_public_access_block" "images" {
  bucket = aws_s3_bucket.images.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# Public read-only on the posts/ prefix so cover images render in the
# browser without needing signed URLs or a CDN in front of it.
resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.images.id
  depends_on = [aws_s3_bucket_public_access_block.images]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadPosts"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.images.arn}/posts/*"
      }
    ]
  })
}

resource "aws_s3_bucket_cors_configuration" "images" {
  bucket = aws_s3_bucket.images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"] # Tighten to your domain once you have one
    max_age_seconds = 3000
  }
}

# Versioning left OFF intentionally to keep storage cost near zero.
