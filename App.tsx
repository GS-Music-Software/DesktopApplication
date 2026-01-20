import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import { Loader2 } from 'lucide-react'
import { emit, listen } from '@tauri-apps/api/event'
import { Setup } from './Setup'
import { Settings } from './Settings'
import { Login } from './Login'
import {
  SidebarWithAddons, AlbumView, ArtistView, PlayerBar, PlaylistView,
  LikedSongsView, Equalizer, CreatePlaylistDialog, ImportPlaylistDialog,
  AddToPlaylistMenu, LyricsView, DJView, VideoPlayer, DownloadsView,
  QueueView, TitleBar, RadioView, PageTransition, ToastContainer,
  ProfileView, BackendDownloadModal,
} from './components'
import { SearchView } from './views/SearchView'
import { ToastProvider } from './contexts/ToastContext'
import { AddonProvider } from './contexts/AddonContext'
import { usePlayer } from './hooks/usePlayer'
import { useLikedSongs } from './hooks/useLikedSongs'
import { useSearch } from './hooks/useSearch'
import { usePlaylists } from './hooks/usePlaylists'
import { useEqualizer } from './hooks/useEqualizer'
import { useAuth } from './hooks/useAuth'
import { useDJ } from './hooks/useDJ'
import { useDownloads } from './hooks/useDownloads'
import { useTheme } from './hooks/useTheme'
import { use_shortcut_listener } from './hooks/use_shortcuts'
import { use_nav } from './hooks/use_nav'
import { use_radio } from './hooks/use_radio'
import { useToast } from './hooks/useToast'
import { authenticated_fetch } from './lib/api'
import { make_bindings } from './lib/bindings'
import type { Song } from './types'

function Content() {
  const [setup, set_setup] = useState(!localStorage.getItem('setupCompleted'))
  const [settings, set_settings] = useState(false)
  const [eq_open, set_eq] = useState(false)
  const [create_pl, set_create_pl] = useState(false)
  const [import_pl, set_import_pl] = useState(false)
  const [profile, set_profile] = useState(false)
  const [lyrics, set_lyrics] = useState(false)
  const [video, set_video] = useState(false)
  const [queue_open, set_queue] = useState(false)
  const [pl_menu, set_pl_menu] = useState<{ song: Song; pos: { x: number; y: number } } | null>(null)

  const auth = useAuth()
  const { show_toast } = useToast()
  const player = usePlayer()
  const radio = use_radio(player.stop)
  const { liked_songs, toggle_like, is_liked, get_local_liked_songs, clear_local_liked_songs, refresh: refresh_liked } = useLikedSongs()
  const { search_query, set_search_query, search_results, album_results, artist_results, selected_album, selected_artist, loading, handle_search, get_album_details, close_album, get_artist_details, close_artist } = useSearch()
  const { playlists, create_playlist, delete_playlist, rename_playlist, update_description, update_cover, add_song, remove_song, reorder_playlists, get_playlist, is_song_in_playlist, get_local_playlists, clear_local_playlists, refresh: refresh_playlists, import_shared_playlist } = usePlaylists()
  const eq = useEqualizer()
  const dj = useDJ(liked_songs)
  const downloads = useDownloads()
  const nav = use_nav(close_artist, close_album)

  useTheme()

  const playback = useMemo(() => ({ position: player.position, duration: player.duration, is_playing: player.playing }), [player.position, player.duration, player.playing])
  const cur_pl = nav.playlist_id ? get_playlist(nav.playlist_id) : undefined

  useEffect(() => { (window as any).set_splash?.('init') }, [])
  useEffect(() => {
    if (auth.is_loading) (window as any).set_splash?.('auth')
    else { (window as any).set_splash?.('ui'); setTimeout(() => document.getElementById('splash')?.remove(), 150) }
  }, [auth.is_loading, auth.is_authenticated])

  use_shortcut_listener(useCallback((a: string) => {
    if (a === 'play_pause') player.playing ? player.pause() : player.resume()
    else if (a === 'next_track') player.next()
    else if (a === 'prev_track') player.prev()
    else if (a === 'volume_up') player.changeVolume(Math.min(1, player.volume + 0.1))
    else if (a === 'volume_down') player.changeVolume(Math.max(0, player.volume - 0.1))
  }, [player]))

  useEffect(() => {
    const h = (e: MouseEvent) => { if (e.button === 3) { e.preventDefault(); nav.go_back() } else if (e.button === 4) { e.preventDefault(); nav.go_fwd() } }
    window.addEventListener('mousedown', h)
    return () => window.removeEventListener('mousedown', h)
  }, [nav.go_back, nav.go_fwd])

  useEffect(() => { if (selected_artist) nav.push_artist(selected_artist.id) }, [selected_artist?.id])
  useEffect(() => { if (selected_album) nav.push_album(selected_album.id) }, [selected_album?.id])

  const play = (song: Song, songs?: Song[], idx?: number) => {
    if (radio.playing) radio.stop()
    if (songs && idx !== undefined) player.play(song, songs, idx)
    else if (cur_pl) player.play(song, cur_pl.songs, cur_pl.songs.findIndex(s => s.id === song.id))
    else { const list = nav.view === 'liked' ? liked_songs : search_results; player.play(song, list, list.findIndex(s => s.id === song.id)) }
  }

  const like = (song: Song) => { const was = is_liked(song); toggle_like(song); show_toast(was ? 'Removed from liked songs' : 'Added to liked songs', was ? 'info' : 'success') }

  useEffect(() => {
    const unsub = listen('mini-player-command', (e: any) => {
      const { command, data } = e.payload
      if (command === 'play-pause') player.playing ? player.pause() : player.resume()
      else if (command === 'next') player.next()
      else if (command === 'prev') player.prev()
      else if (command === 'seek') player.seek(data)
      else if (command === 'volume') player.changeVolume(data)
      else if (command === 'toggle-mute') player.toggleMute()
      else if (command === 'toggle-like' && player.currentSong) like(player.currentSong)
    })
    return () => { unsub.then(fn => fn()) }
  }, [player])

  useEffect(() => {
    emit('player-state-update', { current_song: player.currentSong, playing: player.playing, volume: player.volume, muted: player.muted, position: player.position, duration: player.duration, is_liked: player.currentSong ? is_liked(player.currentSong) : false })
  }, [player.currentSong, player.playing, player.volume, player.muted, player.position, player.duration, is_liked])

  const artist_click = async (name: string) => {
    nav.set_view('search'); nav.set_playlist_id(undefined); set_search_query(name)
    const res = await fetch(`http://127.0.0.1:3000/api/metadata/artists?query=${encodeURIComponent(name)}`)
    if (res.ok) { const a = await res.json(); if (a.length) get_artist_details(a.find((x: any) => x.name.toLowerCase() === name.toLowerCase()) || a[0]) }
  }

  const song_click = async (song: Song) => {
    nav.set_view('search'); nav.set_playlist_id(undefined); set_search_query(`${song.title} ${song.channel}`)
    const res = await fetch(`http://127.0.0.1:3000/api/metadata/albums?query=${encodeURIComponent(`${song.title} ${song.channel}`)}`)
    if (res.ok) { const a = await res.json(); if (a.length) get_album_details(a[0].id) }
  }

  useEffect(() => {
    if (!auth.is_authenticated) return
    const migrate = async () => {
      const lp = get_local_playlists(), ll = get_local_liked_songs()
      if (lp.length || ll.length) {
        try { await authenticated_fetch('/api/migrate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playlists: lp.map(p => ({ name: p.name, description: p.description, songs: p.songs })), liked_songs: ll }) }); clear_local_playlists(); clear_local_liked_songs() } catch {}
      }
      refresh_playlists(); refresh_liked()
    }
    migrate()
  }, [auth.is_authenticated])

  useEffect(() => { if (player.currentSong) { const t = setTimeout(() => eq.reapply(), 500); return () => clearTimeout(t) } }, [player.currentSong?.id])

  const player_ref = useRef(player); player_ref.current = player
  const liked_ref = useRef(liked_songs); liked_ref.current = liked_songs
  const pl_ref = useRef(playlists); pl_ref.current = playlists

  const bindings = useMemo(() => make_bindings(
    { player: player_ref, liked: liked_ref, pls: pl_ref },
    { play, is_liked, toggle_like, get_playlist, create_playlist, delete_playlist, add_song, remove_song }
  ), [])

  if (auth.is_loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>
  if (!auth.is_authenticated) return <Login on_login={auth.login} on_register={auth.register} error={auth.error} is_loading={auth.is_loading} clear_error={auth.clear_error} />
  if (setup) return <Setup on_done={() => set_setup(false)} />

  const key = cur_pl && !lyrics && !video && !queue_open ? `pl-${cur_pl.id}` : selected_artist ? `ar-${selected_artist.id}` : selected_album ? `al-${selected_album.id}` : nav.view

  return (
    <AddonProvider bindings={bindings}>
      {settings && <Settings onClose={() => set_settings(false)} onImportLikedSongs={(s) => s.forEach(x => { if (!is_liked(x)) toggle_like(x) })} onCreatePlaylist={async (n, s) => { const p = await create_playlist(n); for (const x of s) await add_song(p.id, x) }} />}
      {create_pl && <CreatePlaylistDialog on_create={(n, d) => { create_playlist(n, d); set_create_pl(false); show_toast(`Playlist "${n}" created`, 'success') }} on_close={() => set_create_pl(false)} />}
      {import_pl && <ImportPlaylistDialog on_import={async (id) => { const ok = await import_shared_playlist(id); if (ok) show_toast('Playlist imported', 'success'); return ok }} on_close={() => set_import_pl(false)} />}
      {profile && auth.user && <ProfileView user={auth.user} playlists={playlists} on_close={() => set_profile(false)} on_update_avatar={auth.update_avatar} on_update_banner={auth.update_banner} on_select_playlist={nav.select_playlist} />}
      {eq_open && <Equalizer enabled={eq.enabled} preset={eq.preset} bands={eq.bands} presets={eq.presets} frequencies={eq.frequencies} on_toggle_enabled={eq.toggle_enabled} on_set_preset={eq.set_preset} on_set_band={eq.set_band} on_reset={eq.reset} on_close={() => set_eq(false)} />}
      {pl_menu && <AddToPlaylistMenu song={pl_menu.song} playlists={playlists} position={pl_menu.pos} on_add={(id) => { add_song(id, pl_menu.song); set_pl_menu(null); show_toast(`Added to ${get_playlist(id)?.name || 'playlist'}`, 'success') }} on_create_new={() => { set_pl_menu(null); set_create_pl(true) }} on_close={() => set_pl_menu(null)} is_in_playlist={(id) => is_song_in_playlist(id, pl_menu.song.id)} />}
      {lyrics && <LyricsView song={player.currentSong} playback={playback} on_close={() => set_lyrics(false)} on_play_pause={() => player.playing ? player.pause() : player.resume()} on_next={player.next} on_prev={player.prev} on_seek={player.seek} />}
      {video && player.currentSong && <VideoPlayer song={player.currentSong} position={player.position} on_close={() => set_video(false)} />}
      {queue_open && <QueueView queue={player.queue} queue_index={player.queueIndex} on_close={() => set_queue(false)} on_play_index={player.playAtIndex} on_remove_from_queue={player.removeFromQueue} on_reorder={player.reorderQueue} on_clear_queue={player.clearQueue} />}

      <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
        <TitleBar />
        <div className="flex-1 flex overflow-hidden">
          <SidebarWithAddons view={nav.view} set_view={(v) => { nav.set_view(v); if (v !== 'playlist') nav.set_playlist_id(undefined); close_artist(); close_album() }} liked_songs_count={liked_songs.length} playlists={playlists} user={auth.user} on_logout={auth.logout} on_open_profile={() => set_profile(true)} on_open_settings={() => set_settings(true)} on_create_playlist={() => set_create_pl(true)} on_import_playlist={() => set_import_pl(true)} on_select_playlist={nav.select_playlist} on_delete_playlist={delete_playlist} on_reorder_playlists={reorder_playlists} on_open_equalizer={() => set_eq(true)} selected_playlist_id={nav.playlist_id} />
          <main className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-zinc-900/50 to-zinc-950">
            <ScrollArea.Root className="flex-1 overflow-hidden">
              <ScrollArea.Viewport className="h-full w-full">
                <PageTransition transition_key={key}>
                  {cur_pl && !lyrics && !video && !queue_open ? (
                    <PlaylistView playlist={cur_pl} on_close={() => { nav.set_playlist_id(undefined); nav.set_view('search') }} on_play_track={play} on_play_all={() => cur_pl.songs.length && play(cur_pl.songs[0], cur_pl.songs, 0)} on_remove_song={(id) => remove_song(cur_pl.id, id)} on_rename={(n) => rename_playlist(cur_pl.id, n)} on_update_description={(d) => update_description(cur_pl.id, d)} on_update_cover={(f) => update_cover(cur_pl.id, f)} on_artist_click={artist_click} on_play_next={player.playNext} on_add_to_queue={player.addToQueue} current_song_id={player.currentSong?.id} is_playing={player.playing} />
                  ) : selected_artist ? (
                    <ArtistView artist={selected_artist} on_close={close_artist} on_play_track={play} on_album_click={(id) => { close_artist(); get_album_details(id) }} current_song_id={player.currentSong?.id} is_playing={player.playing} />
                  ) : selected_album ? (
                    <AlbumView album={selected_album} on_close={close_album} on_play_track={play} on_play_all={() => { if (selected_album.tracks.length) { const s: Song[] = selected_album.tracks.map(t => ({ id: t.id, title: t.title, channel: t.artist, duration: `${Math.floor(t.duration_secs / 60)}:${(t.duration_secs % 60).toString().padStart(2, '0')}`, duration_seconds: t.duration_secs, thumbnail: selected_album.cover_url || t.cover_url, release_year: selected_album.release_date?.split('-')[0] })); play(s[0], s, 0) } }} current_song_id={player.currentSong?.id} is_playing={player.playing} />
                  ) : (
                    <div className="px-6 pb-6 pt-16">
                      {nav.view === 'search' && <SearchView query={search_query} set_query={set_search_query} on_search={handle_search} loading={loading} songs={search_results} albums={album_results} artists={artist_results} dl_progress={player.downloadProgress} is_liked={is_liked} is_downloaded={downloads.is_downloaded} is_downloading={downloads.is_downloading} on_play={play} on_like={like} on_add_to_pl={(s, e) => set_pl_menu({ song: s, pos: { x: e.clientX, y: e.clientY } })} on_download={(s) => { downloads.download_song(s); show_toast(`Downloading ${s.title}`, 'info') }} on_artist_click={artist_click} on_play_next={(s) => { player.playNext(s); show_toast('Added to play next', 'success') }} on_add_queue={(s) => { player.addToQueue(s); show_toast('Added to queue', 'success') }} on_album_click={get_album_details} on_artist_select={get_artist_details} />}
                      {nav.view === 'liked' && !lyrics && !video && !queue_open && <LikedSongsView songs={liked_songs} on_play_track={play} on_play_all={() => liked_songs.length && play(liked_songs[0], liked_songs, 0)} on_toggle_like={like} on_add_to_playlist={(s, e) => set_pl_menu({ song: s, pos: { x: e.clientX, y: e.clientY } })} on_artist_click={artist_click} on_play_next={player.playNext} on_add_to_queue={player.addToQueue} current_song_id={player.currentSong?.id} is_playing={player.playing} />}
                      {nav.view === 'dj' && <DJView settings={dj.settings} is_active={dj.is_active} current_queue={dj.current_queue} loading={dj.loading} current_song_id={player.currentSong?.id} is_playing={player.playing} on_start={async () => { const s = await dj.start_dj(); if (s.length) play(s[0], s, 0) }} on_stop={() => { dj.stop_dj(); player.stop() }} on_play_track={(s, l, i) => { dj.mark_played(s.id); play(s, l, i) }} on_add_interest={dj.add_interest} on_remove_interest={dj.remove_interest} on_set_energy={dj.set_energy_level} on_toggle_discovery={dj.toggle_discovery_mode} />}
                      {nav.view === 'downloads' && <DownloadsView songs={downloads.downloaded_songs} download_path={downloads.download_path} on_play_track={play} on_play_all={() => downloads.downloaded_songs.length && play(downloads.downloaded_songs[0], downloads.downloaded_songs, 0)} on_remove_download={downloads.remove_download} on_update_path={downloads.update_download_path} on_artist_click={artist_click} current_song_id={player.currentSong?.id} is_playing={player.playing} />}
                      {nav.view === 'radio' && <RadioView current_station={radio.station} is_playing={radio.playing} on_play_station={radio.play} on_stop={radio.stop} favorite_stations={radio.favs} on_toggle_favorite={radio.toggle_fav} />}
                    </div>
                  )}
                </PageTransition>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar className="flex select-none touch-none p-0.5 bg-transparent data-[orientation=vertical]:w-2" orientation="vertical"><ScrollArea.Thumb className="flex-1 bg-zinc-700 rounded-full" /></ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </main>
        </div>
        <PlayerBar currentSong={player.currentSong} playing={player.playing} volume={radio.playing ? radio.vol : player.volume} muted={player.muted} position={player.position} duration={player.duration} shuffle={player.shuffle} repeat={player.repeat} isLiked={player.currentSong ? is_liked(player.currentSong) : false} showLyrics={lyrics} showVideo={video} showQueue={queue_open} queueLength={player.queue.length} radioStation={radio.station} radioPlaying={radio.playing} onPlayPause={() => player.playing ? player.pause() : player.resume()} onStop={player.stop} onNext={player.next} onPrev={player.prev} onSeek={(v) => player.seek(v[0])} onSeekStart={player.startSeeking} onSeekChange={(v) => player.updateSeekPosition(v[0])} onVolumeChange={(v) => player.changeVolume(v[0])} onRadioVolumeChange={(v) => radio.set_volume(v[0])} onToggleMute={player.toggleMute} onToggleShuffle={player.toggleShuffle} onCycleRepeat={player.cycleRepeat} onToggleLike={() => player.currentSong && like(player.currentSong)} onToggleLyrics={() => set_lyrics(!lyrics)} onToggleVideo={() => set_video(!video)} onToggleQueue={() => set_queue(!queue_open)} onRadioPlayPause={() => radio.playing ? radio.stop() : (radio.station && radio.play(radio.station))} onArtistClick={artist_click} onSongClick={song_click} />
      </div>
    </AddonProvider>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <BackendDownloadModal />
      <ToastContainer />
      <Content />
    </ToastProvider>
  )
}
