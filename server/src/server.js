require("dotenv").config();
const express = require("express");
const cors = require("cors");

const postsRouter = require("./routes/posts");
const uploadRouter = require("./routes/upload");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
  })
);
app.use(express.json({ limit: "2mb" }));

// Health check — used by the ALB target group / ASG health checks in prod.
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/posts", postsRouter);
app.use("/api/upload", uploadRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Vibeventure API listening on port ${PORT}`);
});

module.exports = app;
