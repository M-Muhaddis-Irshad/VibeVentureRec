function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON in request body" });
  }

  if (err instanceof require("multer").MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
}

module.exports = { notFoundHandler, errorHandler };
