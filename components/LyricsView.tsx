import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { X, Music2, Loader2, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { API_BASE } from '../lib/api';
import type { LyricsResult, Song, PlaybackState, SyncedLine } from '../types';

interface LyricsViewProps {
  song: Song | null;
  playback: PlaybackState;
  on_close: () => void;
  on_play_pause: () => void;
  on_next: () => void;
  on_prev: () => void;
  on_seek: (position: number) => void;
}

function extract_colors(img: HTMLImageElement): string[] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return ['80, 80, 80', '60, 60, 60', '40, 40, 40'];

  canvas.width = 50;
  canvas.height = 50;
  ctx.drawImage(img, 0, 0, 50, 50);

  const data = ctx.getImageData(0, 0, 50, 50).data;
  const colors: { r: number; g: number; b: number; count: number }[] = [];

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;

    if (brightness < 20 || brightness > 235) continue;

    let found = false;
    for (const color of colors) {
      const dr = Math.abs(color.r / color.count - r);
      const dg = Math.abs(color.g / color.count - g);
      const db = Math.abs(color.b / color.count - b);
      if (dr < 40 && dg < 40 && db < 40) {
        color.r += r;
        color.g += g;
        color.b += b;
        color.count++;
        found = true;
        break;
      }
    }

    if (!found && colors.length < 10) {
      colors.push({ r, g, b, count: 1 });
    }
  }

  colors.sort((a, b) => b.count - a.count);
  const top_colors = colors.slice(0, 3).map(c =>
    `${Math.round(c.r / c.count)}, ${Math.round(c.g / c.count)}, ${Math.round(c.b / c.count)}`
  );

  while (top_colors.length < 3) {
    top_colors.push('80, 80, 80');
  }

  return top_colors;
}

function parse_line(text: string): { main: string; adlib: string | null } {
  const adlib_match = text.match(/\(([^)]+)\)$/);
  if (adlib_match) {
    return {
      main: text.replace(adlib_match[0], '').trim(),
      adlib: adlib_match[1].toLowerCase(),
    };
  }
  return { main: text, adlib: null };
}

interface LyricsLineProps {
  main: string;
  adlib: string | null;
  distance_from_active: number;
  is_active: boolean;
  on_click: () => void;
}

const LyricsLine = memo(function LyricsLine({ main, adlib, distance_from_active, is_active, on_click }: LyricsLineProps) {
  const get_line_style = () => {
    if (is_active) {
      return {
        opacity: 1,
        filter: 'blur(0px)',
        transform: 'scale(1)',
        fontWeight: 700,
        textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)',
      };
    }

    const abs_distance = Math.abs(distance_from_active);

    if (distance_from_active < 0) {
      const opacity = Math.max(0.25, Math.pow(0.75, abs_distance * 0.8));
      const blur = Math.min(Math.pow(abs_distance, 1.15) * 0.9, 4);
      return {
        opacity,
        filter: `blur(${blur}px)`,
        transform: 'scale(0.97)',
        fontWeight: 600,
        textShadow: 'none',
      };
    }

    const opacity_base = Math.max(0, 1 - Math.pow(abs_distance / 5, 1.5));
    const opacity = Math.max(0.15, opacity_base * 0.7 + 0.2);
    const blur = Math.min(Math.pow(abs_distance, 1.1) * 0.75, 3.5);
    const translateY = Math.max(0, Math.pow(Math.max(0, abs_distance - 3), 1.3) * 4);

    return {
      opacity,
      filter: `blur(${blur}px)`,
      transform: `scale(0.98) translateY(${translateY}px)`,
      fontWeight: 600,
      textShadow: 'none',
    };
  };

  const style = get_line_style();

  return (
    <div
      onClick={on_click}
      style={{
        transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), text-shadow 0.6s ease-out, font-weight 0.3s ease',
        cursor: 'pointer',
        willChange: 'opacity, filter, transform',
        ...style,
      }}
      className="mb-6 hover:opacity-80"
    >
      <p
        className="text-[32px] leading-[1.4] text-white"
        style={{ fontWeight: style.fontWeight, textShadow: style.textShadow }}
      >
        {main}
      </p>
      {adlib && (
        <p
          className="text-[18px] font-medium leading-[1.5] mt-1.5 italic text-white"
          style={{ opacity: style.opacity * 0.65 }}
        >
          {adlib}
        </p>
      )}
    </div>
  );
});

function format_time(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function LyricsView({ song, playback, on_close, on_play_pause, on_next, on_prev, on_seek }: LyricsViewProps) {
  const [lyrics, set_lyrics] = useState<LyricsResult | null>(null);
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState<string | null>(null);
  const [gradient_colors, set_gradient_colors] = useState(['80, 80, 80', '60, 60, 60', '40, 40, 40']);
  const [current_line_index, set_current_line_index] = useState(-1);
  const lyrics_container_ref = useRef<HTMLDivElement>(null);
  const active_line_ref = useRef<HTMLDivElement>(null);
  const playback_ref = useRef(playback);

  const album_art = lyrics?.album_art || song?.thumbnail;

  const load_colors = useCallback((url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => set_gradient_colors(extract_colors(img));
    img.src = url;
  }, []);

  useEffect(() => {
    if (album_art) load_colors(album_art);
  }, [album_art, load_colors]);

  useEffect(() => {
    if (!song) {
      set_lyrics(null);
      return;
    }

    set_current_line_index(-1);
    if (lyrics_container_ref.current) {
      lyrics_container_ref.current.scrollTop = 0;
    }

    const fetch_lyrics = async () => {
      set_loading(true);
      set_error(null);

      try {
        const artist = song.channel.replace(' - Topic', '').replace(' VEVO', '').trim();
        const title = song.title
          .replace(/\(Official.*?\)/gi, '')
          .replace(/\[Official.*?\]/gi, '')
          .replace(/\(Lyrics.*?\)/gi, '')
          .replace(/\[Lyrics.*?\]/gi, '')
          .replace(/\(Audio.*?\)/gi, '')
          .replace(/\[Audio.*?\]/gi, '')
          .replace(/\(Music Video\)/gi, '')
          .replace(/\[Music Video\)/gi, '')
          .replace(/\(Visualizer\)/gi, '')
          .replace(/\[Visualizer\]/gi, '')
          .replace(/ft\..*/gi, '')
          .replace(/feat\..*/gi, '')
          .trim();

        const response = await fetch(
          `${API_BASE}/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`
        );

        if (!response.ok) throw new Error('Lyrics not found');

        const data = await response.json();
        set_lyrics(data);
      } catch {
        set_error('Could not find lyrics for this song');
      } finally {
        set_loading(false);
      }
    };

    fetch_lyrics();
  }, [song?.id]);

  useEffect(() => {
    playback_ref.current = playback;
  }, [playback]);

  useEffect(() => {
    if (!lyrics?.synced_lyrics) return;

    const LYRICS_OFFSET = 0.3;
    const synced = lyrics.synced_lyrics;

    const find_line_index = (pos: number): number => {
      const adjusted = pos + LYRICS_OFFSET;
      for (let i = synced.length - 1; i >= 0; i--) {
        if (synced[i].time <= adjusted) return i;
      }
      return -1;
    };

    let raf_id: number;
    let last_index = -1;

    const tick = () => {
      const pb = playback_ref.current;
      const index = find_line_index(pb.position);

      if (index !== last_index) {
        last_index = index;
        set_current_line_index(index);
      }

      raf_id = requestAnimationFrame(tick);
    };

    tick();

    return () => cancelAnimationFrame(raf_id);
  }, [lyrics?.synced_lyrics]);

  useEffect(() => {
    if (active_line_ref.current && lyrics?.synced_lyrics && lyrics_container_ref.current) {
      const total_lines = lyrics.synced_lyrics.length;
      if (current_line_index < total_lines - 2) {
        const container = lyrics_container_ref.current;
        const element = active_line_ref.current;

        const element_top = element.offsetTop;
        const element_height = element.offsetHeight;
        const container_height = container.clientHeight;
        const target_scroll = element_top - (container_height / 2) + (element_height / 2);

        const start_scroll = container.scrollTop;
        const distance = target_scroll - start_scroll;
        const duration = 800;
        let start_time: number | null = null;

        const animate_scroll = (current_time: number) => {
          if (start_time === null) start_time = current_time;
          const elapsed = current_time - start_time;
          const progress = Math.min(elapsed / duration, 1);

          const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

          container.scrollTop = start_scroll + distance * eased;

          if (progress < 1) {
            requestAnimationFrame(animate_scroll);
          }
        };

        requestAnimationFrame(animate_scroll);
      }
    }
  }, [current_line_index, lyrics?.synced_lyrics]);

  const handle_line_click = useCallback((time: number) => {
    on_seek(time);
  }, [on_seek]);

  const render_synced_lyrics = (synced: SyncedLine[]) => {
    return synced.map((line, index) => {
      const is_active = index === current_line_index;
      const distance_from_active = index - current_line_index;
      const { main, adlib } = parse_line(line.text);

      return (
        <div
          key={index}
          ref={is_active ? active_line_ref : null}
        >
          <LyricsLine
            main={main}
            adlib={adlib}
            distance_from_active={distance_from_active}
            is_active={is_active}
            on_click={() => handle_line_click(line.time)}
          />
        </div>
      );
    });
  };

  const render_plain_lyrics = (text: string) => {
    return text.split('\n').map((line, index) => {
      const is_section = line.startsWith('[') && line.endsWith(']');
      const is_empty = line.trim() === '';

      if (is_empty) return <div key={index} className="h-5" />;

      if (is_section) {
        return (
          <p key={index} className="text-xs text-white/35 uppercase tracking-wider font-semibold mt-10 mb-5">
            {line.slice(1, -1)}
          </p>
        );
      }

      const { main, adlib } = parse_line(line);

      return (
        <div key={index} className="mb-6">
          <p className="text-[32px] font-bold leading-[1.4] text-white/80">
            {main}
          </p>
          {adlib && (
            <p className="text-[18px] font-medium leading-[1.5] mt-1.5 italic text-white/55">
              {adlib}
            </p>
          )}
        </div>
      );
    });
  };

  const has_synced = lyrics?.synced_lyrics && lyrics.synced_lyrics.length > 0;

  return (
    <div className="fixed inset-0 z-[90] bg-[rgb(15,15,15)] overflow-hidden animate-fade-in">
      <div className="absolute inset-0">
        <div
          className="absolute w-[150%] h-[150%] -top-[25%] -left-[25%] opacity-70"
          style={{
            background: `radial-gradient(circle at center, rgb(${gradient_colors[0]}) 0%, transparent 70%)`,
            filter: 'blur(100px)',
            animation: 'float1 25s ease-in-out infinite',
          }}
        />

        <div
          className="absolute w-[140%] h-[140%] top-[10%] -right-[20%] opacity-60"
          style={{
            background: `radial-gradient(circle at center, rgb(${gradient_colors[1]}) 0%, transparent 65%)`,
            filter: 'blur(120px)',
            animation: 'float2 30s ease-in-out infinite',
          }}
        />

        <div
          className="absolute w-[130%] h-[130%] -bottom-[15%] left-[5%] opacity-50"
          style={{
            background: `radial-gradient(circle at center, rgb(${gradient_colors[2]}) 0%, transparent 60%)`,
            filter: 'blur(110px)',
            animation: 'float3 35s ease-in-out infinite',
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(15, 15, 15, 0.3) 50%, rgb(15, 15, 15) 100%)',
          }}
        />
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          25% { transform: translate(5%, -8%) scale(1.05); }
          50% { transform: translate(-3%, 5%) scale(0.95); }
          75% { transform: translate(8%, 3%) scale(1.02); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          30% { transform: translate(-6%, 7%) scale(1.03); }
          60% { transform: translate(4%, -5%) scale(0.97); }
          90% { transform: translate(-5%, 4%) scale(1.01); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          35% { transform: translate(7%, -4%) scale(0.98); }
          65% { transform: translate(-4%, 6%) scale(1.04); }
          85% { transform: translate(5%, -3%) scale(0.99); }
        }
      `}</style>

      <div className="h-full flex flex-col md:flex-row relative z-10">
        <div className="md:w-[380px] flex-shrink-0 p-10 flex flex-col items-center justify-center backdrop-blur-xl bg-black/10 relative z-10">
          {album_art ? (
            <img
              src={album_art}
              alt={lyrics?.title || song?.title}
              className="w-56 h-56 md:w-64 md:h-64 rounded-lg shadow-2xl object-cover"
            />
          ) : (
            <div className="w-56 h-56 md:w-64 md:h-64 rounded-lg bg-white/5 flex items-center justify-center">
              <Music2 className="w-16 h-16 text-white/15" />
            </div>
          )}
          <div className="mt-6 text-center">
            <h2 className="text-lg font-semibold text-white">
              {lyrics?.title || song?.title || 'No song playing'}
            </h2>
            <p className="text-white/50 text-sm mt-1">
              {lyrics?.artist || song?.channel}
            </p>
          </div>

          <div className="w-full mt-6 px-4">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5 group"
              value={[playback.position]}
              max={playback.duration || 100}
              step={1}
              onValueChange={(v) => on_seek(v[0])}
            >
              <Slider.Track className="bg-white/20 relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-white rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 focus:outline-none transition-opacity"
                aria-label="Seek"
              />
            </Slider.Root>
            <div className="flex justify-between mt-1">
              <span className="text-[11px] text-white/50">{format_time(playback.position)}</span>
              <span className="text-[11px] text-white/50">{format_time(playback.duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4">
            <button
              onClick={on_prev}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5" fill="currentColor" />
            </button>
            <button
              onClick={on_play_pause}
              className="w-14 h-14 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 transition-transform"
            >
              {playback.is_playing ? (
                <Pause className="w-6 h-6" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 ml-1" fill="currentColor" />
              )}
            </button>
            <button
              onClick={on_next}
              className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5" fill="currentColor" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div
            ref={lyrics_container_ref}
            className="h-full overflow-y-auto px-8 md:px-12 py-20"
            style={{ scrollbarWidth: 'none' }}
          >
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
              </div>
            )}

            {error && !loading && (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/30 text-sm">{error}</p>
              </div>
            )}

            {lyrics && !loading && (
              <div className="max-w-xl">
                {has_synced ? render_synced_lyrics(lyrics.synced_lyrics!) : render_plain_lyrics(lyrics.lyrics)}
              </div>
            )}

            {!song && !loading && (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/30 text-sm">No song playing</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-14 right-8 z-[100]">
        <button
          onClick={on_close}
          className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:scale-105 transition-all border border-white/5 shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
