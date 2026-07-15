const express = require("express");
const prisma = require("../lib/prisma");
const { deleteImageByUrl } = require("../lib/s3");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

function validatePostBody(body, { partial = false } = {}) {
  const errors = [];
  const required = ["title", "content", "author", "location"];

  for (const field of required) {
    if (!partial || body[field] !== undefined) {
      if (!body[field] || typeof body[field] !== "string" || !body[field].trim()) {
        errors.push(`"${field}" is required and must be a non-empty string`);
      }
    }
  }

  if (body.title && body.title.length > 200) {
    errors.push('"title" must be 200 characters or fewer');
  }

  if (body.tags !== undefined && !Array.isArray(body.tags)) {
    errors.push('"tags" must be an array of strings');
  }

  return errors;
}

// GET /api/posts?page=1&pageSize=10&search=paris
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize, 10) || 10, 1), 50);
    const search = (req.query.search || "").trim();

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      data: posts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /api/posts/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST /api/posts
router.post("/", requireAuth, async (req, res) => {
  try {
    const errors = validatePostBody(req.body);
    if (errors.length) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const { title, content, author, location, coverImageUrl, tags } = req.body;

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content,
        author: author.trim(),
        location: location.trim(),
        coverImageUrl: coverImageUrl || null,
        tags: Array.isArray(tags) ? tags : [],
        userId: req.user.userId,
      },
    });

    res.status(201).json({ data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT /api/posts/:id
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    const errors = validatePostBody(req.body, { partial: true });
    if (errors.length) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existing.userId && existing.userId !== req.user.userId) {
      return res.status(403).json({ error: "You can only edit your own posts" });
    }

    const { title, content, author, location, coverImageUrl, tags } = req.body;

    if (
      coverImageUrl !== undefined &&
      existing.coverImageUrl &&
      coverImageUrl !== existing.coverImageUrl
    ) {
      deleteImageByUrl(existing.coverImageUrl);
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(content !== undefined && { content }),
        ...(author !== undefined && { author: author.trim() }),
        ...(location !== undefined && { location: location.trim() }),
        ...(coverImageUrl !== undefined && { coverImageUrl }),
        ...(tags !== undefined && { tags }),
      },
    });

    res.json({ data: post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /api/posts/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid post id" });
    }

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existing.userId && existing.userId !== req.user.userId) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    await prisma.post.delete({ where: { id } });

    if (existing.coverImageUrl) {
      deleteImageByUrl(existing.coverImageUrl);
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// GET /api/posts/:id/comments
router.get("/:id/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true } } },
    });
    res.json({ data: comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// POST /api/posts/:id/comments
router.post("/:id/comments", requireAuth, async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: "Comment cannot be empty" });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = await prisma.comment.create({
      data: { content: content.trim(), postId, userId: req.user.userId },
      include: { user: { select: { name: true } } },
    });
    res.status(201).json({ data: comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

module.exports = router;
