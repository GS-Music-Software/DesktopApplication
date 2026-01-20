import { useState } from 'react';
import { X } from 'lucide-react';

interface CreatePlaylistDialogProps {
  on_create: (name: string, description?: string) => void;
  on_close: () => void;
}

export function CreatePlaylistDialog({ on_create, on_close }: CreatePlaylistDialogProps) {
  const [name, set_name] = useState('');
  const [description, set_description] = useState('');

  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      on_create(name.trim(), description.trim() || undefined);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-backdrop-enter">
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md border border-zinc-800 animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-300">Create Playlist</h2>
          <button
            onClick={on_close}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handle_submit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => set_name(e.target.value)}
              placeholder="My Playlist"
              className="w-full px-4 py-2.5 bg-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => set_description(e.target.value)}
              placeholder="Add a description..."
              className="w-full px-4 py-2.5 bg-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>

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
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-lg bg-zinc-600 text-white font-medium hover:bg-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
