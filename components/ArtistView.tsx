import { useState } from 'react';
import { ArrowLeft, Play, User, Disc, Clock } from 'lucide-react';
import type { ArtistDetails, Song, TrackMetadata } from '../types';

interface ArtistViewProps {
  artist: ArtistDetails;
  on_close: () => void;
  on_play_track: (song: Song, songs: Song[], index: number) => void;
  on_album_click: (album_id: string) => void;
  current_song_id?: string;
  is_playing?: boolean;
}

function AudioBars({ is_playing }: { is_playing: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-[3px] bg-green-500 rounded-sm"
          style={{
            height: is_playing ? undefined : '4px',
            animation: is_playing ? `artistBar${i} 0.5s ease-in-out infinite` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes artistBar1 {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
        @keyframes artistBar2 {
          0%, 100% { height: 10px; }
          50% { height: 4px; }
        }
        @keyframes artistBar3 {
          0%, 100% { height: 6px; }
          50% { height: 12px; }
        }
      `}</style>
    </div>
  );
}

function track_to_song(track: TrackMetadata): Song {
  const mins = Math.floor(track.duration_secs / 60);
  const secs = track.duration_secs % 60;
  return {
    id: track.id,
    title: track.title,
    channel: track.artist,
    duration: `${mins}:${secs.toString().padStart(2, '0')}`,
    duration_seconds: track.duration_secs,
    thumbnail: track.cover_url,
    release_year: track.release_year,
  };
}

function format_fans(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
}

export function ArtistView({ artist, on_close, on_play_track, on_album_click, current_song_id, is_playing = false }: ArtistViewProps) {
  const [hovered_index, set_hovered_index] = useState<number | null>(null);
  const top_songs = artist.top_tracks.map(track_to_song);

  const handle_play_all = () => {
    if (top_songs.length > 0) {
      on_play_track(top_songs[0], top_songs, 0);
    }
  };

  return (
    <div className="min-h-full">
      <div className="relative h-80 bg-gradient-to-b from-zinc-700 to-zinc-900">
        <button
          onClick={on_close}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-6">
          <div className="w-48 h-48 rounded-full bg-zinc-800 shadow-2xl overflow-hidden flex-shrink-0">
            {artist.picture_url ? (
              <img
                src={artist.picture_url}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-20 h-20 text-zinc-600" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-2">
            <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Artist</p>
            <h1 className="text-5xl font-bold truncate mb-4">{artist.name}</h1>
            <p className="text-sm text-zinc-400">
              {format_fans(artist.nb_fans)} fans • {artist.nb_albums} albums
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handle_play_all}
            disabled={top_songs.length === 0}
            className="w-14 h-14 rounded-full bg-white hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Play className="w-6 h-6 text-black ml-1" fill="black" />
          </button>
        </div>

        {top_songs.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Popular</h2>
            <div className="flex items-center gap-4 px-4 py-2 text-xs text-zinc-400 border-b border-zinc-800 mb-2">
              <span className="w-6 text-center">#</span>
              <span className="w-10"></span>
              <span className="flex-1">Title</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              {top_songs.map((track, index) => {
                const is_current = current_song_id === track.id;
                const is_hovered = hovered_index === index;
                return (
                  <div
                    key={track.id}
                    onClick={() => on_play_track(track, top_songs, index)}
                    onMouseEnter={() => set_hovered_index(index)}
                    onMouseLeave={() => set_hovered_index(null)}
                    className={`group flex items-center gap-4 px-4 py-2 rounded-md transition-colors cursor-pointer ${is_hovered ? 'bg-zinc-800/50' : ''}`}
                  >
                    <div className="w-6 flex items-center justify-center">
                      {is_current ? (
                        is_hovered ? (
                          <Play className="w-4 h-4 text-green-500" fill="currentColor" />
                        ) : (
                          <AudioBars is_playing={is_playing} />
                        )
                      ) : is_hovered ? (
                        <Play className="w-4 h-4 text-white" fill="currentColor" />
                      ) : (
                        <span className="text-sm text-zinc-500">{index + 1}</span>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded overflow-hidden bg-zinc-800 flex-shrink-0">
                      {track.thumbnail ? (
                        <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc className="w-5 h-5 text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate transition-colors ${is_current ? 'text-green-500' : 'text-white'}`}>{track.title}</p>
                    </div>
                    <span className="text-sm text-zinc-400">{track.duration}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {artist.albums.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Discography</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {artist.albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => on_album_click(album.id)}
                  className="group text-left p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/80 transition-all duration-200"
                >
                  <div className="relative aspect-square mb-3 rounded-lg overflow-hidden bg-zinc-800">
                    {album.cover_url ? (
                      <img
                        src={album.cover_url}
                        alt={album.title}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                        <Disc className="w-12 h-12 text-zinc-600" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm text-white truncate mb-1">{album.title}</h3>
                  <p className="text-xs text-zinc-500 truncate">Album</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {top_songs.length === 0 && artist.albums.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-zinc-500">No content found for this artist</p>
          </div>
        )}
      </div>
    </div>
  );
}
