import { useEffect, useRef } from 'react';
import { Play, ListPlus, Heart, Trash2, Radio, User, Disc3, Share2, Copy, Download, Loader2, Check } from 'lucide-react';
import type { Song } from '../types';

interface SongContextMenuProps {
  song: Song;
  position: { x: number; y: number };
  on_close: () => void;
  on_play: () => void;
  on_play_next?: () => void;
  on_add_to_queue?: () => void;
  on_add_to_playlist?: (e: React.MouseEvent) => void;
  on_toggle_like?: () => void;
  on_remove?: () => void;
  on_go_to_artist?: () => void;
  on_go_to_album?: () => void;
  on_download?: () => void;
  is_liked?: boolean;
  is_downloaded?: boolean;
  is_downloading?: boolean;
  show_remove?: boolean;
  remove_label?: string;
}

export function SongContextMenu({
  song,
  position,
  on_close,
  on_play,
  on_play_next,
  on_add_to_queue,
  on_add_to_playlist,
  on_toggle_like,
  on_remove,
  on_go_to_artist,
  on_go_to_album,
  on_download,
  is_liked = false,
  is_downloaded = false,
  is_downloading = false,
  show_remove = false,
  remove_label,
}: SongContextMenuProps) {
  const menu_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle_click_outside = (e: MouseEvent) => {
      if (menu_ref.current && !menu_ref.current.contains(e.target as Node)) {
        on_close();
      }
    };

    const handle_escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        on_close();
      }
    };

    document.addEventListener('mousedown', handle_click_outside);
    document.addEventListener('keydown', handle_escape);

    return () => {
      document.removeEventListener('mousedown', handle_click_outside);
      document.removeEventListener('keydown', handle_escape);
    };
  }, [on_close]);


  useEffect(() => {
    if (menu_ref.current) {
      const rect = menu_ref.current.getBoundingClientRect();
      const viewport_width = window.innerWidth;
      const viewport_height = window.innerHeight;

      if (rect.right > viewport_width) {
        menu_ref.current.style.left = `${position.x - rect.width}px`;
      }
      if (rect.bottom > viewport_height) {
        menu_ref.current.style.top = `${position.y - rect.height}px`;
      }
    }
  }, [position]);

  const handle_copy_link = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`https://youtube.com/watch?v=${song.id}`);
    } catch {
      
      const textarea = document.createElement('textarea');
      textarea.value = `https://youtube.com/watch?v=${song.id}`;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    on_close();
  };

  const handle_open_youtube = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://youtube.com/watch?v=${song.id}`, '_blank', 'noopener,noreferrer');
    on_close();
  };

  const menu_item_class = "flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white cursor-pointer transition-colors";

  return (
    <div
      ref={menu_ref}
      className="fixed z-50 min-w-[200px] bg-zinc-800 rounded-lg shadow-xl border border-zinc-700 py-1 overflow-hidden"
      style={{ left: position.x, top: position.y }}
    >
      <div className="px-3 py-2 border-b border-zinc-700">
        <p className="text-sm font-medium text-white truncate">{song.title}</p>
        <p className="text-xs text-zinc-400 truncate">{song.channel}</p>
      </div>

      <div className="py-1">
        <div className={menu_item_class} onClick={() => { on_play(); on_close(); }}>
          <Play className="w-4 h-4" />
          Play
        </div>

        {on_play_next && (
          <div className={menu_item_class} onClick={() => { on_play_next(); on_close(); }}>
            <Play className="w-4 h-4" />
            Play next
          </div>
        )}

        {on_add_to_queue && (
          <div className={menu_item_class} onClick={() => { on_add_to_queue(); on_close(); }}>
            <Radio className="w-4 h-4" />
            Add to queue
          </div>
        )}
      </div>

      <div className="border-t border-zinc-700 py-1">
        {on_add_to_playlist && (
          <div className={menu_item_class} onClick={(e) => { on_add_to_playlist(e); on_close(); }}>
            <ListPlus className="w-4 h-4" />
            Add to playlist
          </div>
        )}

        {on_toggle_like && (
          <div className={menu_item_class} onClick={() => { on_toggle_like(); on_close(); }}>
            <Heart className="w-4 h-4" fill={is_liked ? "currentColor" : "none"} />
            {is_liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
          </div>
        )}

        {on_download && (
          <div
            className={`${menu_item_class} ${is_downloaded ? 'text-green-400' : ''} ${is_downloading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => { if (!is_downloading && !is_downloaded) { on_download(); on_close(); } }}
          >
            {is_downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : is_downloaded ? (
              <Check className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {is_downloading ? 'Downloading...' : is_downloaded ? 'Downloaded' : 'Download'}
          </div>
        )}

        {show_remove && on_remove && (
          <div className={`${menu_item_class} text-red-400 hover:text-red-300`} onClick={() => { on_remove(); on_close(); }}>
            <Trash2 className="w-4 h-4" />
            {remove_label || 'Remove from this list'}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-700 py-1">
        {on_go_to_artist && (
          <div className={menu_item_class} onClick={() => { on_go_to_artist(); on_close(); }}>
            <User className="w-4 h-4" />
            Go to artist
          </div>
        )}

        {on_go_to_album && song.release_year && (
          <div className={menu_item_class} onClick={() => { on_go_to_album(); on_close(); }}>
            <Disc3 className="w-4 h-4" />
            Go to album
          </div>
        )}
      </div>

      <div className="border-t border-zinc-700 py-1">
        <div className={menu_item_class} onClick={handle_copy_link}>
          <Copy className="w-4 h-4" />
          Copy song link
        </div>

        <div className={menu_item_class} onClick={handle_open_youtube}>
          <Share2 className="w-4 h-4" />
          Open in YouTube
        </div>
      </div>
    </div>
  );
}
