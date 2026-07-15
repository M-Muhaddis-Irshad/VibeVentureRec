const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

const region = process.env.AWS_REGION || "ap-southeast-1";
const bucket = process.env.S3_BUCKET_NAME;

const s3 = new S3Client({ region });

/**
 * Uploads a single file buffer to S3 and returns the public URL.
 * Bucket must have a policy allowing public GET on the "posts/" prefix,
 * or you swap this for a CloudFront/signed-URL setup later.
 */
async function uploadImage(file) {
  if (!bucket) {
    throw new Error("S3_BUCKET_NAME is not set in the environment");
  }

  const ext = file.originalname.split(".").pop();
  const key = `posts/${uuidv4()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Deletes an image from S3 given its full public URL (best-effort;
 * failures are logged but not thrown so a post delete never hard-fails
 * because of a storage cleanup issue).
 */
async function deleteImageByUrl(url) {
  if (!url || !bucket) return;
  try {
    const marker = `.amazonaws.com/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const key = url.slice(idx + marker.length);
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  } catch (err) {
    console.error("Non-fatal: failed to delete S3 object for", url, err.message);
  }
}

module.exports = { uploadImage, deleteImageByUrl };
