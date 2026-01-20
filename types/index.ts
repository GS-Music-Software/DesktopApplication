export interface Song {
  id: string;
  title: string;
  channel: string;
  duration: string;
  duration_seconds?: number;
  thumbnail: string;
  release_year?: string;
}

export interface DownloadProgress {
  progress: number;
  status: string;
}

export interface PlaybackState {
  position: number;
  duration: number;
  is_playing: boolean;
}

export interface AlbumMetadata {
  id: string;
  title: string;
  artist: string;
  release_date?: string;
  cover_url?: string;
  tracks: TrackMetadata[];
}

export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration_secs: number;
  cover_url: string;
  release_year?: string;
}

export interface ArtistMetadata {
  id: string;
  name: string;
  picture_url: string;
}

export interface ArtistDetails {
  id: string;
  name: string;
  picture_url: string;
  nb_albums: number;
  nb_fans: number;
  top_tracks: TrackMetadata[];
  albums: AlbumMetadata[];
}

export type RepeatMode = 'off' | 'all' | 'one';
export type View = 'search' | 'radio' | 'liked' | 'playlists' | 'playlist' | 'dj' | 'downloads';

export interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
}

export interface DJInterest {
  id: string;
  name: string;
  type: 'artist' | 'genre';
}

export interface DJSettings {
  interests: DJInterest[];
  energy_level: 'chill' | 'balanced' | 'energetic';
  discovery_mode: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  songs: Song[];
  created_at: number;
  updated_at: number;
}

export interface EqualizerPreset {
  name: string;
  bands: number[];
}

export interface EqualizerState {
  enabled: boolean;
  preset: string;
  bands: number[];
}

export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  banner_url?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SyncedLine {
  time: number;
  text: string;
}

export interface LyricsResult {
  title: string;
  artist: string;
  lyrics: string;
  synced_lyrics?: SyncedLine[];
  album?: string;
  album_art?: string;
  release_date?: string;
  genius_url?: string;
}

export interface DownloadedSong extends Song {
  file_path: string;
  file_size: number;
  downloaded_at: number;
}
