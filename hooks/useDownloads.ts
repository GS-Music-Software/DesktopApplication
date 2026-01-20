import { useState, useEffect, useCallback } from 'react';
import type { Song, DownloadedSong } from '../types';
import { API_BASE } from '../lib/api';

export function useDownloads() {
  const [downloaded_songs, set_downloaded_songs] = useState<DownloadedSong[]>([]);
  const [download_path, set_download_path] = useState<string>('');
  const [downloading, set_downloading] = useState<Set<string>>(new Set());
  const [loading, set_loading] = useState(true);

  const fetch_downloads = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/downloads`);
      if (response.ok) {
        const data = await response.json();
        set_downloaded_songs(data);
      }
    } catch (err) {
      console.error('Failed to fetch downloads:', err);
    } finally {
      set_loading(false);
    }
  }, []);

  const fetch_download_path = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/downloads/path`);
      if (response.ok) {
        const data = await response.json();
        set_download_path(data.path);
      }
    } catch (err) {
      console.error('Failed to fetch download path:', err);
    }
  }, []);

  useEffect(() => {
    fetch_downloads();
    fetch_download_path();
  }, [fetch_downloads, fetch_download_path]);

  const download_song = useCallback(async (song: Song): Promise<boolean> => {
    if (downloading.has(song.id)) return false;

    set_downloading(prev => new Set(prev).add(song.id));

    try {
      const response = await fetch(`${API_BASE}/api/downloads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(song),
      });

      if (response.ok) {
        const downloaded = await response.json();
        set_downloaded_songs(prev => [downloaded, ...prev.filter(s => s.id !== song.id)]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Download failed:', err);
      return false;
    } finally {
      set_downloading(prev => {
        const next = new Set(prev);
        next.delete(song.id);
        return next;
      });
    }
  }, [downloading]);

  const download_songs = useCallback(async (songs: Song[]): Promise<number> => {
    let success_count = 0;
    for (const song of songs) {
      if (!is_downloaded_sync(song)) {
        const result = await download_song(song);
        if (result) success_count++;
      }
    }
    return success_count;

    function is_downloaded_sync(song: Song): boolean {
      return downloaded_songs.some(s => s.id === song.id);
    }
  }, [download_song, downloaded_songs]);

  const remove_download = useCallback(async (song_id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/downloads/${song_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        set_downloaded_songs(prev => prev.filter(s => s.id !== song_id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Remove download failed:', err);
      return false;
    }
  }, []);

  const update_download_path = useCallback(async (path: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/downloads/path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });

      if (response.ok) {
        set_download_path(path);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update download path failed:', err);
      return false;
    }
  }, []);

  const is_downloaded = useCallback((song: Song): boolean => {
    return downloaded_songs.some(s => s.id === song.id);
  }, [downloaded_songs]);

  const is_downloading = useCallback((song_id: string): boolean => {
    return downloading.has(song_id);
  }, [downloading]);

  const get_downloaded_song = useCallback((song_id: string): DownloadedSong | undefined => {
    return downloaded_songs.find(s => s.id === song_id);
  }, [downloaded_songs]);

  return {
    downloaded_songs,
    download_path,
    loading,
    downloading_count: downloading.size,
    download_song,
    download_songs,
    remove_download,
    update_download_path,
    is_downloaded,
    is_downloading,
    get_downloaded_song,
    refresh: fetch_downloads,
  };
}
