import type { Song, Playlist } from './index'

export interface Addon {
  id: string
  name: string
  description: string
  version: string
  author: string
  enabled: boolean
  code: string
  created_at: number
  updated_at: number
}

export interface AddonManifest {
  name: string
  description: string
  version: string
  author: string
}

export interface AddonButton {
  id: string
  addon_id: string
  label: string
  icon?: string
  position: 'sidebar' | 'player' | 'toolbar' | 'context_menu'
  on_click: () => void
}

export interface AddonMenuItem {
  id: string
  addon_id: string
  label: string
  icon?: string
  on_click: (context: MenuContext) => void
}

export interface AddonPanel {
  id: string
  addon_id: string
  title: string
  render: () => HTMLElement | string
}

export interface AddonView {
  id: string
  addon_id: string
  name: string
  icon?: string
  render: () => HTMLElement | string
}

export interface MenuContext {
  type: 'song' | 'playlist' | 'artist' | 'album'
  song?: Song
  playlist?: Playlist
  artist?: { id: string; name: string }
  album?: { id: string; title: string }
}

export interface AddonEventMap {
  'song:play': { song: Song }
  'song:pause': { song: Song | null }
  'song:stop': {}
  'song:next': { song: Song }
  'song:prev': { song: Song }
  'song:seek': { position: number }
  'song:end': { song: Song }
  'volume:change': { volume: number }
  'queue:add': { song: Song }
  'queue:remove': { song: Song; index: number }
  'queue:clear': {}
  'playlist:create': { playlist: Playlist }
  'playlist:delete': { id: string }
  'playlist:song_add': { playlist_id: string; song: Song }
  'playlist:song_remove': { playlist_id: string; song_id: string }
  'like:add': { song: Song }
  'like:remove': { song: Song }
  'view:change': { view: string }
  'addon:load': { addon_id: string }
  'addon:unload': { addon_id: string }
}

export type AddonEventType = keyof AddonEventMap

export interface AddonStorage {
  get: <T>(key: string, default_value?: T) => T | undefined
  set: <T>(key: string, value: T) => void
  remove: (key: string) => void
  clear: () => void
  keys: () => string[]
}

export interface AddonUI {
  register_button: (button: Omit<AddonButton, 'id' | 'addon_id'>) => string
  unregister_button: (button_id: string) => void
  register_menu_item: (item: Omit<AddonMenuItem, 'id' | 'addon_id'>) => string
  unregister_menu_item: (item_id: string) => void
  register_panel: (panel: Omit<AddonPanel, 'id' | 'addon_id'>) => string
  unregister_panel: (panel_id: string) => void
  register_view: (view: Omit<AddonView, 'id' | 'addon_id'>) => string
  unregister_view: (view_id: string) => void
  show_toast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', duration?: number) => void
  show_modal: (title: string, content: string | HTMLElement, buttons?: ModalButton[]) => void
  close_modal: () => void
  inject_css: (css: string) => string
  remove_css: (style_id: string) => void
}

export interface ModalButton {
  label: string
  variant?: 'primary' | 'secondary' | 'danger'
  on_click: () => void
}

export interface ToastMessage {
  id: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration: number
}

export interface ModalState {
  open: boolean
  title: string
  content: string | HTMLElement
  buttons: ModalButton[]
}

export interface AddonPlayer {
  play: (song?: Song) => void
  pause: () => void
  resume: () => void
  stop: () => void
  next: () => void
  prev: () => void
  seek: (position: number) => void
  set_volume: (volume: number) => void
  get_volume: () => number
  toggle_mute: () => void
  is_muted: () => boolean
  is_playing: () => boolean
  get_current_song: () => Song | null
  get_position: () => number
  get_duration: () => number
  get_queue: () => Song[]
  add_to_queue: (song: Song) => void
  remove_from_queue: (index: number) => void
  clear_queue: () => void
  play_next: (song: Song) => void
  shuffle: (enabled?: boolean) => void
  repeat: (mode?: 'off' | 'all' | 'one') => void
}

export interface AddonLibrary {
  get_liked_songs: () => Song[]
  is_liked: (song: Song) => boolean
  toggle_like: (song: Song) => void
  get_playlists: () => Playlist[]
  get_playlist: (id: string) => Playlist | undefined
  create_playlist: (name: string, description?: string) => Promise<Playlist>
  delete_playlist: (id: string) => Promise<void>
  add_to_playlist: (playlist_id: string, song: Song) => Promise<void>
  remove_from_playlist: (playlist_id: string, song_id: string) => Promise<void>
}

export interface AddonSearch {
  search: (query: string) => Promise<Song[]>
  search_artists: (query: string) => Promise<{ id: string; name: string; thumbnail: string }[]>
  search_albums: (query: string) => Promise<{ id: string; title: string; artist: string; thumbnail: string }[]>
}

export interface AddonHttp {
  get: <T>(url: string, options?: RequestInit) => Promise<T>
  post: <T>(url: string, body?: unknown, options?: RequestInit) => Promise<T>
  put: <T>(url: string, body?: unknown, options?: RequestInit) => Promise<T>
  delete: <T>(url: string, options?: RequestInit) => Promise<T>
}

export interface AddonUtils {
  format_duration: (seconds: number) => string
  format_date: (timestamp: number) => string
  debounce: <T extends (...args: unknown[]) => unknown>(fn: T, ms: number) => T
  throttle: <T extends (...args: unknown[]) => unknown>(fn: T, ms: number) => T
  generate_id: () => string
  sleep: (ms: number) => Promise<void>
}

export interface GSMusicAPI {
  player: AddonPlayer
  library: AddonLibrary
  search: AddonSearch
  ui: AddonUI
  storage: AddonStorage
  http: AddonHttp
  utils: AddonUtils
  on: <K extends AddonEventType>(event: K, handler: (data: AddonEventMap[K]) => void) => () => void
  off: <K extends AddonEventType>(event: K, handler: (data: AddonEventMap[K]) => void) => void
  emit: <K extends AddonEventType>(event: K, data: AddonEventMap[K]) => void
}

export interface AddonRuntime {
  addon: Addon
  api: GSMusicAPI
  cleanup: () => void
}
