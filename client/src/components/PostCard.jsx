import { Link } from "react-router-dom";

function excerpt(text, length = 140) {
  if (!text) return "";
  return text.length > length ? `${text.slice(0, length).trim()}…` : text;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostCard({ post }) {
  return (
    <Link
      to={`/posts/${post.id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-sand-200 hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[16/9] bg-sand-200 overflow-hidden">
        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sand-300 text-4xl">
            ✈️
          </div>
        )}
      </div>
      <div className="p-5">
        <span className="inline-block text-xs font-semibold tracking-wide uppercase text-clay-600 bg-clay-500/10 px-2.5 py-1 rounded-full mb-3">
          {post.location}
        </span>
        <h3 className="font-serif text-xl font-bold mb-2 text-ink-900 group-hover:text-clay-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-ink-800/80 mb-4">{excerpt(post.content)}</p>
        <div className="flex items-center justify-between text-xs text-ink-800/60">
          <span>By {post.author}</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
}
