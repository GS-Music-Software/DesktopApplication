import { useState, useRef, useEffect } from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX, X, Pin } from 'lucide-react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { cn } from '../lib/utils';
import type { Song } from '../types';

const current_window = getCurrentWebviewWindow();

interface MiniPlayerProps {
  current_song: Song | null;
  playing: boolean;
  volume: number;
  muted: boolean;
  position: number;
  duration: number;
  is_liked: boolean;
  on_play_pause: () => void;
  on_next: () => void;
  on_prev: () => void;
  on_seek: (value: number[]) => void;
  on_volume_change: (value: number[]) => void;
  on_toggle_mute: () => void;
  on_toggle_like: () => void;
  on_close: () => void;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function MiniPlayer({
  current_song,
  playing,
  volume,
  muted,
  position,
  duration,
  is_liked,
  on_play_pause,
  on_next,
  on_prev,
  on_seek,
  on_volume_change,
  on_toggle_mute,
  on_toggle_like,
  on_close,
}: MiniPlayerProps) {
  const [is_seeking, set_is_seeking] = useState(false);
  const [is_pinned, set_is_pinned] = useState(true);
  const container_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    current_window.setAlwaysOnTop(true);
  }, []);

  const toggle_pin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const new_pinned_state = !is_pinned;
      await current_window.setAlwaysOnTop(new_pinned_state);
      set_is_pinned(new_pinned_state);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  return (
    <div
      ref={container_ref}
      className="h-screen w-full bg-zinc-950 flex flex-col overflow-hidden"
    >
      <div
        data-tauri-drag-region
        className="flex items-center justify-between px-2.5 py-1.5 bg-zinc-900 border-b border-zinc-800 cursor-move"
      >
        <button
          onClick={toggle_pin}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded transition-all",
            is_pinned
              ? "text-white bg-zinc-800"
              : "text-zinc-500 hover:text-white hover:bg-zinc-800"
          )}
        >
          <Pin className="w-2.5 h-2.5" />
        </button>
        <button
          onClick={on_close}
          className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-all"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      </div>

      {current_song ? (
        <div className="flex-1 flex flex-col p-2.5 bg-zinc-950">
          <div className="flex items-center gap-2.5 mb-2.5">
            <img
              src={current_song.thumbnail}
              alt={current_song.title}
              className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-medium text-white truncate">
                {current_song.title}
              </h4>
              <p className="text-[10px] text-zinc-400 truncate">
                {current_song.channel}
              </p>
            </div>
            <button
              onClick={on_toggle_like}
              className={cn(
                "w-6 h-6 flex items-center justify-center flex-shrink-0 transition-all",
                is_liked ? "text-white" : "text-zinc-500 hover:text-white"
              )}
            >
              <Heart className="w-3 h-3" fill={is_liked ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="mb-2.5">
            <Slider.Root
              className="relative flex items-center select-none touch-none h-2 group"
              value={[position]}
              max={duration || 100}
              step={0.1}
              onValueChange={(value) => {
                if (!is_seeking) set_is_seeking(true);
                on_seek(value);
              }}
              onValueCommit={() => set_is_seeking(false)}
              disabled={!current_song}
            >
              <Slider.Track className="bg-zinc-800 relative grow rounded-full h-0.5 group-hover:h-1 transition-all">
                <Slider.Range className="absolute bg-white group-hover:bg-green-500 rounded-full h-full transition-colors" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 focus:outline-none transition-opacity"
                aria-label="Seek"
              />
            </Slider.Root>
            <div className="flex justify-between mt-0.5">
              <span className="text-[9px] text-zinc-500 tabular-nums">{formatTime(position)}</span>
              <span className="text-[9px] text-zinc-500 tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <button
              onClick={on_prev}
              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <SkipBack className="w-3.5 h-3.5" fill="currentColor" />
            </button>

            <button
              onClick={on_play_pause}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-all"
            >
              {playing ? (
                <Pause className="w-3.5 h-3.5" fill="currentColor" />
              ) : (
                <Play className="w-3.5 h-3.5 ml-0.5" fill="currentColor" />
              )}
            </button>

            <button
              onClick={on_next}
              className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            >
              <SkipForward className="w-3.5 h-3.5" fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={on_toggle_mute}
              className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors flex-shrink-0"
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-3 h-3" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </button>
            <Slider.Root
              className="relative flex items-center select-none touch-none flex-1 h-2 group"
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={on_volume_change}
            >
              <Slider.Track className="bg-zinc-800 relative grow rounded-full h-0.5 group-hover:h-1 transition-all">
                <Slider.Range className="absolute bg-white rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 focus:outline-none transition-opacity"
                aria-label="Volume"
              />
            </Slider.Root>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 bg-zinc-950">
          <div className="w-12 h-12 rounded-full bg-zinc-900 mb-2 flex items-center justify-center">
            <Play className="w-5 h-5 text-zinc-600" />
          </div>
          <p className="text-[10px]">No track playing</p>
        </div>
      )}
    </div>
  );
}
