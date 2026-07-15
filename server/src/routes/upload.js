const express = require("express");
const multer = require("multer");
const { uploadImage } = require("../lib/s3");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// POST /api/upload  (multipart/form-data, field name: "image")
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const url = await uploadImage(req.file);
    res.status(201).json({ data: { url } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to upload image" });
  }
});

module.exports = router;
