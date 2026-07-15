export default function DeleteConfirmModal({ open, onCancel, onConfirm, loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-ink-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h3 className="font-serif text-xl font-bold mb-2 dark:text-sand-100">Delete this entry?</h3>
        <p className="text-sm text-ink-800/70 dark:text-sand-300 mb-6">
          This action can't be undone. The journal entry and its cover image will be permanently removed.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} disabled={loading}
            className="px-4 py-2 rounded-full text-sm font-medium border border-sand-300 dark:border-ink-800 dark:text-sand-100 hover:bg-sand-100 dark:hover:bg-ink-900 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 rounded-full text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50">
            {loading ? "Deleting…" : "Delete entry"}
          </button>
        </div>
      </div>
    </div>
  );
}
