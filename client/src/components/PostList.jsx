import PostCard from "./PostCard.jsx";

export default function PostList({ posts }) {
  if (!posts.length) {
    return (
      <div className="text-center py-24 text-ink-800/60">
        <p className="text-lg font-serif">No journal entries yet.</p>
        <p className="text-sm mt-1">Be the first to write about your adventures.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
