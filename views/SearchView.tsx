import { Search, Loader2 } from 'lucide-react'
import {
  SongCard,
  AlbumCard,
  ArtistCard,
  DownloadProgress,
} from '../components'
import type { Song, AlbumMetadata, ArtistMetadata, DownloadProgress as DlProg } from '../types'

interface Props {
  query: string
  set_query: (q: string) => void
  on_search: (e: React.FormEvent) => void
  loading: boolean
  songs: Song[]
  albums: AlbumMetadata[]
  artists: ArtistMetadata[]
  dl_progress: DlProg | null
  is_liked: (s: Song) => boolean
  is_downloaded: (s: Song) => boolean
  is_downloading: (id: string) => boolean
  on_play: (s: Song, list: Song[], i: number) => void
  on_like: (s: Song) => void
  on_add_to_pl: (s: Song, e: React.MouseEvent) => void
  on_download: (s: Song) => void
  on_artist_click: (name: string) => void
  on_play_next: (s: Song) => void
  on_add_queue: (s: Song) => void
  on_album_click: (id: string) => void
  on_artist_select: (a: ArtistMetadata) => void
}

export function SearchView({
  query,
  set_query,
  on_search,
  loading,
  songs,
  albums,
  artists,
  dl_progress,
  is_liked,
  is_downloaded,
  is_downloading,
  on_play,
  on_like,
  on_add_to_pl,
  on_download,
  on_artist_click,
  on_play_next,
  on_add_queue,
  on_album_click,
  on_artist_select,
}: Props) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <form onSubmit={on_search}>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => set_query(e.target.value)}
              placeholder="What do you want to listen to?"
              className="w-full h-11 pl-11 pr-4 bg-zinc-800 rounded-full text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all"
            />
          </div>
        </form>
      </div>

      {dl_progress && (
        <div className="mb-4">
          <DownloadProgress progress={dl_progress} />
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
        </div>
      )}

      {!loading && artists.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Artists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
            {artists.map((a, i) => (
              <ArtistCard
                key={a.id}
                artist={a}
                on_click={() => on_artist_select(a)}
                animation_index={i}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && albums.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
            {albums.map((a, i) => (
              <AlbumCard
                key={a.id}
                album={a}
                onClick={() => on_album_click(a.id)}
                animation_index={i}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && songs.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-4">Songs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1">
            {songs.map((s, i) => (
              <SongCard
                key={s.id}
                song={s}
                is_liked={is_liked(s)}
                is_downloaded={is_downloaded(s)}
                is_downloading={is_downloading(s.id)}
                on_play={() => on_play(s, songs, i)}
                on_toggle_like={() => on_like(s)}
                on_add_to_playlist={(e) => on_add_to_pl(s, e)}
                on_download={() => on_download(s)}
                on_artist_click={on_artist_click}
                on_play_next={() => on_play_next(s)}
                on_add_to_queue={() => on_add_queue(s)}
                animation_index={i}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && songs.length === 0 && albums.length === 0 && artists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Search className="w-12 h-12 text-zinc-700 mb-4" />
          <p className="text-zinc-400">Search for songs, artists, or albums</p>
        </div>
      )}
    </>
  )
}
