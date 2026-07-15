import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchPost, deletePost } from "../services/api.js";
import client from "../services/api.js";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [commentSaving, setCommentSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPost(id)
      .then(setPost)
      .catch((err) => setError(err.response?.data?.error || "Couldn't load this entry."))
      .finally(() => setLoading(false));

    client.get(`/api/posts/${id}/comments`)
      .then(res => setComments(res.data.data))
      .catch(() => {});
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePost(id);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete entry.");
      setDeleting(false);
      setModalOpen(false);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentSaving(true);
    setCommentError("");
    try {
      const res = await client.post(`/api/posts/${id}/comments`, { content: commentText });
      setComments(c => [...c, res.data.data]);
      setCommentText("");
    } catch (err) {
      setCommentError(err.response?.data?.error || "Failed to post comment.");
    } finally {
      setCommentSaving(false);
    }
  }

  const isOwner = user && post && user.name === post.author;

  if (loading) return <p className="text-center py-24 text-ink-800/60 dark:text-sand-300">Loading…</p>;

  if (error && !post) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/" className="text-clay-600 underline">Back to journal</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/" className="text-sm text-clay-600 hover:underline mb-6 inline-block">
        ← Back to journal
      </Link>

      {post.coverImageUrl && (
        <img src={post.coverImageUrl} alt={post.title}
          className="w-full rounded-2xl mb-8 max-h-[420px] object-cover" />
      )}

      <span className="inline-block text-xs font-semibold tracking-wide uppercase text-clay-600 bg-clay-500/10 px-2.5 py-1 rounded-full mb-3">
        {post.location}
      </span>

      <h1 className="font-serif text-4xl font-bold mb-3 dark:text-sand-100">{post.title}</h1>

      <div className="flex items-center justify-between text-sm text-ink-800/60 dark:text-sand-300 mb-8 border-b border-sand-200 dark:border-ink-800 pb-6">
        <span>By {post.author} · {formatDate(post.createdAt)}</span>
        {isOwner && (
          <div className="flex gap-3">
            <button onClick={() => navigate(`/edit/${post.id}`)}
              className="px-3 py-1.5 rounded-full border border-sand-300 dark:border-ink-800 hover:bg-sand-100 dark:hover:bg-ink-800 transition-colors text-ink-800 dark:text-sand-100">
              Edit
            </button>
            <button onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="prose-content dark:text-sand-100">{post.content}</div>

      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs bg-sand-100 dark:bg-ink-800 text-ink-800/70 dark:text-sand-300 px-3 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Comments */}
      <div className="mt-12 border-t border-sand-200 dark:border-ink-800 pt-8">
        <h2 className="font-serif text-2xl font-bold mb-6 dark:text-sand-100">
          Comments {comments.length > 0 && <span className="text-base font-normal text-ink-800/50 dark:text-sand-300">({comments.length})</span>}
        </h2>

        {comments.length === 0 && (
          <p className="text-sm text-ink-800/50 dark:text-sand-300 mb-6">No comments yet. Be the first!</p>
        )}

        <div className="space-y-4 mb-8">
          {comments.map(c => (
            <div key={c.id} className="bg-sand-50 dark:bg-ink-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-ink-900 dark:text-sand-100">{c.user.name}</span>
                <span className="text-xs text-ink-800/40 dark:text-sand-300">{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-sm text-ink-800 dark:text-sand-100">{c.content}</p>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={handleComment} className="flex flex-col gap-3">
            {commentError && <p className="text-red-600 text-sm">{commentError}</p>}
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={3}
              placeholder="Share your thoughts…"
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 focus:outline-none focus:ring-2 focus:ring-clay-500 bg-white dark:bg-ink-800 dark:border-ink-800 dark:text-sand-100 text-sm resize-none"
            />
            <button type="submit" disabled={commentSaving || !commentText.trim()}
              className="self-end bg-clay-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-clay-600 transition-colors disabled:opacity-50">
              {commentSaving ? "Posting…" : "Post comment"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-ink-800/60 dark:text-sand-300">
            <Link to="/login" className="text-clay-600 hover:underline">Sign in</Link> to leave a comment.
          </p>
        )}
      </div>

      <DeleteConfirmModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
