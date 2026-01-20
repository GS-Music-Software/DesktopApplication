import { useState, useMemo } from 'react';
import { ArrowLeft, Play, Clock, Search } from 'lucide-react';
import { SongContextMenu } from './SongContextMenu';
import type { AlbumMetadata, Song } from '../types';

interface AlbumViewProps {
  album: AlbumMetadata;
  on_close: () => void;
  on_play_track: (song: Song, songs: Song[], index: number) => void;
  on_play_all: () => void;
  on_toggle_like?: (song: Song) => void;
  on_add_to_playlist?: (song: Song, e: React.MouseEvent) => void;
  is_song_liked?: (song_id: string) => boolean;
  current_song_id?: string;
  is_playing?: boolean;
}

function format_duration(secs: number): string {
  const mins = Math.floor(secs / 60);
  const seconds = secs % 60;
  return `${mins}:${seconds.toString().padStart(2, '0')}`;
}

function track_to_song(track: AlbumMetadata['tracks'][0], album: AlbumMetadata): Song {
  return {
    id: track.id,
    title: track.title,
    channel: track.artist,
    duration: format_duration(track.duration_secs),
    duration_seconds: track.duration_secs,
    thumbnail: album.cover_url || track.cover_url,
    release_year: album.release_date?.split('-')[0],
  };
}

function AudioBars({ is_playing }: { is_playing: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`w-[3px] bg-green-500 rounded-sm ${is_playing ? 'animate-pulse' : ''}`}
          style={{
            height: is_playing ? undefined : '4px',
            animation: is_playing ? `bar${i} 0.5s ease-in-out infinite` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes bar1 {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        @keyframes bar2 {
          0%, 100% { height: 10px; }
          50% { height: 4px; }
        }
        @keyframes bar3 {
          0%, 100% { height: 6px; }
          50% { height: 12px; }
        }
      `}</style>
    </div>
  );
}

export function AlbumView({
  album,
  on_close,
  on_play_track,
  on_play_all,
  on_toggle_like,
  on_add_to_playlist,
  is_song_liked,
  current_song_id,
  is_playing = false,
}: AlbumViewProps) {
  const [hovered_index, set_hovered_index] = useState<number | null>(null);
  const [search_query, set_search_query] = useState('');
  const [context_menu, set_context_menu] = useState<{ song: Song; position: { x: number; y: number } } | null>(null);
  const songs = album.tracks.map(t => track_to_song(t, album));
  const total_duration = album.tracks.reduce((acc, t) => acc + t.duration_secs, 0);
  const total_mins = Math.floor(total_duration / 60);

  const filtered_tracks = useMemo(() => {
    if (!search_query.trim()) return album.tracks;
    const query = search_query.toLowerCase();
    return album.tracks.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query)
    );
  }, [album.tracks, search_query]);

  const handle_context_menu = (e: React.MouseEvent, song: Song) => {
    e.preventDefault();
    set_context_menu({ song, position: { x: e.clientX, y: e.clientY } });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-end gap-6 p-6 pt-14 bg-gradient-to-b from-zinc-800/80 to-transparent">
        <div className="w-48 h-48 rounded-md overflow-hidden shadow-2xl flex-shrink-0 relative">
          <button
            onClick={(e) => { e.stopPropagation(); on_close(); }}
            className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-20 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {album.cover_url ? (
            <img
              src={album.cover_url}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-zinc-700" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase">Album</span>
          <h1 className="text-4xl font-bold">{album.title}</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <span className="font-medium">{album.artist}</span>
            {album.release_date && (
              <>
                <span className="text-zinc-500">•</span>
                <span>{album.release_date.split('-')[0]}</span>
              </>
            )}
            <span className="text-zinc-500">•</span>
            <span>{album.tracks.length} songs, {total_mins} min</span>
          </div>
        </div>
      </div>

      <div className="p-6 pt-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={on_play_all}
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-105 hover:bg-zinc-200 transition-all shadow-lg"
          >
            <Play className="w-6 h-6 text-black fill-black ml-1" />
          </button>

          {album.tracks.length > 5 && (
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={search_query}
                onChange={(e) => set_search_query(e.target.value)}
                placeholder="Search in album"
                className="w-full h-9 pl-9 pr-4 bg-zinc-800/80 rounded-md text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>
          )}
        </div>

        {filtered_tracks.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400">No tracks match "{search_query}"</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 px-4 py-2 text-xs text-zinc-400 border-b border-zinc-800 mb-2">
              <span className="w-8 text-center">#</span>
              <span className="flex-1">Title</span>
              <Clock className="w-4 h-4" />
            </div>

            <div className="flex flex-col">
              {filtered_tracks.map((track, index) => {
                const original_index = album.tracks.findIndex(t => t.id === track.id);
                const song = songs[original_index];
                const filtered_songs = filtered_tracks.map(t => songs[album.tracks.findIndex(at => at.id === t.id)]);
                const is_hovered = hovered_index === index;
                return (
                  <div
                    key={track.id}
                    onClick={() => on_play_track(song, filtered_songs, index)}
                    onContextMenu={(e) => handle_context_menu(e, song)}
                    onMouseEnter={() => set_hovered_index(index)}
                    onMouseLeave={() => set_hovered_index(null)}
                    className={`flex items-center gap-4 px-4 py-3 rounded-md transition-colors text-left cursor-pointer ${is_hovered ? 'bg-zinc-800/50' : ''}`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {current_song_id === track.id ? (
                        is_hovered ? (
                          <Play className="w-4 h-4 text-green-500" fill="currentColor" />
                        ) : (
                          <AudioBars is_playing={is_playing} />
                        )
                      ) : is_hovered ? (
                        <Play className="w-4 h-4 text-white" fill="white" />
                      ) : (
                        <span className="text-sm text-zinc-400">{original_index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate transition-colors ${current_song_id === track.id ? 'text-green-500' : 'text-white'}`}>{track.title}</p>
                      <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                    </div>
                    <span className="text-sm text-zinc-400">
                      {format_duration(track.duration_secs)}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {context_menu && (
        <SongContextMenu
          song={context_menu.song}
          position={context_menu.position}
          on_close={() => set_context_menu(null)}
          on_play={() => {
            const index = songs.findIndex(s => s.id === context_menu.song.id);
            const filtered_songs = filtered_tracks.map(t => songs[album.tracks.findIndex(at => at.id === t.id)]);
            on_play_track(context_menu.song, filtered_songs, index);
          }}
          on_add_to_playlist={(e) => on_add_to_playlist?.(context_menu.song, e)}
          on_toggle_like={() => on_toggle_like?.(context_menu.song)}
          is_liked={is_song_liked?.(context_menu.song.id) ?? false}
          show_remove={false}
        />
      )}
    </div>
  );
}
