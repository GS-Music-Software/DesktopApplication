import { useState } from 'react';
import { X, Download } from 'lucide-react';

interface ImportPlaylistDialogProps {
  on_import: (playlist_id: string) => Promise<boolean>;
  on_close: () => void;
}

export function ImportPlaylistDialog({ on_import, on_close }: ImportPlaylistDialogProps) {
  const [playlist_id, set_playlist_id] = useState('');
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlist_id.trim()) return;

    set_loading(true);
    set_error(null);

    const success = await on_import(playlist_id.trim());

    if (success) {
      on_close();
    } else {
      set_error('playlist not found or failed to import');
      set_loading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdrop-enter">
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md border border-zinc-800 animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-300">Import Shared Playlist</h2>
          <button
            onClick={on_close}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handle_submit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Playlist ID</label>
            <input
              type="text"
              value={playlist_id}
              onChange={(e) => set_playlist_id(e.target.value)}
              placeholder="pl_1234567890_abc1234"
              className="w-full px-4 py-2.5 bg-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
              autoFocus
            />
            <p className="mt-2 text-xs text-zinc-500">
              paste the playlist id from a shared playlist link
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={on_close}
              className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-white font-medium hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!playlist_id.trim() || loading}
              className="flex-1 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              {loading ? 'importing...' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
