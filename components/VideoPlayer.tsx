import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import type { Song } from '../types';

interface VideoPlayerProps {
  song: Song;
  position: number;
  on_close: () => void;
}

export function VideoPlayer({ song, position, on_close }: VideoPlayerProps) {
  const [loading, set_loading] = useState(true);
  const [error, set_error] = useState<string | null>(null);
  const [video_id, set_video_id] = useState<string | null>(null);
  const [is_fullscreen, set_is_fullscreen] = useState(false);
  const container_ref = useRef<HTMLDivElement>(null);
  const initial_position_ref = useRef<number>(position);

  useEffect(() => {
    initial_position_ref.current = position;
  }, []);

  useEffect(() => {
    const fetch_video_id = async () => {
      set_loading(true);
      set_error(null);
      try {
        const params = new URLSearchParams({
          artist: song.channel,
          title: song.title,
        });
        const response = await fetch(`http://127.0.0.1:3000/api/video?${params}`);
        if (!response.ok) {
          throw new Error('Failed to find video');
        }
        const data = await response.json();
        set_video_id(data.video_id);
        set_loading(false);
      } catch (err) {
        set_error(err instanceof Error ? err.message : 'Failed to load video');
        set_loading(false);
      }
    };

    fetch_video_id();
  }, [song.channel, song.title]);

  useEffect(() => {
    const handle_fullscreen_change = () => {
      set_is_fullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handle_fullscreen_change);
    return () => {
      document.removeEventListener('fullscreenchange', handle_fullscreen_change);
    };
  }, []);

  const toggle_fullscreen = async () => {
    if (!container_ref.current) return;

    if (is_fullscreen) {
      await document.exitFullscreen();
    } else {
      await container_ref.current.requestFullscreen();
    }
  };

  const start_seconds = Math.floor(initial_position_ref.current);

  return (
    <div
      ref={container_ref}
      className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in"
    >
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-white truncate">{song.title}</h2>
          <p className="text-sm text-zinc-400 truncate">{song.channel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle_fullscreen}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
          >
            {is_fullscreen ? (
              <Minimize2 className="w-5 h-5 text-white" />
            ) : (
              <Maximize2 className="w-5 h-5 text-white" />
            )}
          </button>
          <button
            onClick={on_close}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center pt-16">
        {loading && (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-zinc-500 animate-spin" />
            <p className="text-zinc-400 mt-4">Finding video...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={on_close}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {video_id && !loading && !error && (
          <iframe
            src={`https://www.youtube.com/embed/${video_id}?autoplay=1&start=${start_seconds}&mute=1&controls=1&modestbranding=1&rel=0`}
            className="w-full h-full max-w-[90%] max-h-[85%] aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 'none' }}
          />
        )}
      </div>
    </div>
  );
}
