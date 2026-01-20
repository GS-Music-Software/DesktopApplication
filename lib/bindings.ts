import type { Song, Playlist, RepeatMode } from '../types'
import type { APIBindings } from './addon_api'

interface Player {
  pause: () => void
  resume: () => void
  stop: () => void
  next: () => void
  prev: () => void
  seek: (p: number) => void
  changeVolume: (v: number) => void
  volume: number
  toggleMute: () => void
  muted: boolean
  playing: boolean
  currentSong: Song | null
  position: number
  duration: number
  queue: Song[]
  addToQueue: (s: Song) => void
  removeFromQueue: (i: number) => void
  clearQueue: () => void
  playNext: (s: Song) => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  shuffle: boolean
  repeat: RepeatMode
}

interface Refs {
  player: { current: Player }
  liked: { current: Song[] }
  pls: { current: Playlist[] }
}

interface Fns {
  play: (s: Song) => void
  is_liked: (s: Song) => boolean
  toggle_like: (s: Song) => void
  get_playlist: (id: string) => Playlist | undefined
  create_playlist: (n: string, d?: string) => Promise<Playlist>
  delete_playlist: (id: string) => void
  add_song: (pid: string, s: Song) => void
  remove_song: (pid: string, sid: string) => void
}

export function make_bindings(refs: Refs, fns: Fns): APIBindings {
  return {
    play: (s?: Song) => s && fns.play(s),
    pause: () => refs.player.current.pause(),
    resume: () => refs.player.current.resume(),
    stop: () => refs.player.current.stop(),
    next: () => refs.player.current.next(),
    prev: () => refs.player.current.prev(),
    seek: (p: number) => refs.player.current.seek(p),
    set_volume: (v: number) => refs.player.current.changeVolume(v),
    get_volume: () => refs.player.current.volume,
    toggle_mute: () => refs.player.current.toggleMute(),
    is_muted: () => refs.player.current.muted,
    is_playing: () => refs.player.current.playing,
    get_current_song: () => refs.player.current.currentSong,
    get_position: () => refs.player.current.position,
    get_duration: () => refs.player.current.duration,
    get_queue: () => refs.player.current.queue,
    add_to_queue: (s: Song) => refs.player.current.addToQueue(s),
    remove_from_queue: (i: number) => refs.player.current.removeFromQueue(i),
    clear_queue: () => refs.player.current.clearQueue(),
    play_next: (s: Song) => refs.player.current.playNext(s),
    toggle_shuffle: () => refs.player.current.toggleShuffle(),
    cycle_repeat: () => refs.player.current.cycleRepeat(),
    get_shuffle: () => refs.player.current.shuffle,
    get_repeat: () => refs.player.current.repeat,
    get_liked_songs: () => refs.liked.current,
    is_liked: fns.is_liked,
    toggle_like: fns.toggle_like,
    get_playlists: () => refs.pls.current,
    get_playlist: fns.get_playlist,
    create_playlist: async (n: string, d?: string) => fns.create_playlist(n, d),
    delete_playlist: async (id: string) => { fns.delete_playlist(id) },
    add_to_playlist: async (pid: string, s: Song) => { fns.add_song(pid, s) },
    remove_from_playlist: async (pid: string, sid: string) => { fns.remove_song(pid, sid) },
  }
}
