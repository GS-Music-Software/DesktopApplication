import { useState, useEffect, useCallback } from 'react';
import type { Song } from '../types';
import { authenticated_fetch_auth, get_token } from '../lib/api';

const STORAGE_KEY = 'likedSongs';

export function useLikedSongs() {
  const [liked_songs, set_liked_songs] = useState<Song[]>([]);
  const [is_synced, set_is_synced] = useState(false);

  const is_authenticated = !!get_token();

  const fetch_liked_songs = useCallback(async () => {
    if (!is_authenticated) {
      const saved = localStorage.getItem(STORAGE_KEY);
      set_liked_songs(saved ? JSON.parse(saved) : []);
      return;
    }

    try {
      const response = await authenticated_fetch_auth('/api/liked');
      if (response.ok) {
        const data = await response.json();
        set_liked_songs(data);
        set_is_synced(true);
      }
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY);
      set_liked_songs(saved ? JSON.parse(saved) : []);
    }
  }, [is_authenticated]);

  useEffect(() => {
    fetch_liked_songs();
  }, [fetch_liked_songs]);

  useEffect(() => {
    if (!is_authenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(liked_songs));
    }
  }, [liked_songs, is_authenticated]);

  const toggle_like = useCallback(async (song: Song) => {
    const liked = liked_songs.some(s => s.id === song.id);

    if (is_authenticated) {
      try {
        if (liked) {
          await authenticated_fetch_auth(`/api/liked/${song.id}`, { method: 'DELETE' });
        } else {
          await authenticated_fetch_auth('/api/liked', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(song),
          });
        }
      } catch {}
    }

    set_liked_songs(prev => {
      if (liked) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [song, ...prev];
      }
    });
  }, [is_authenticated, liked_songs]);

  const is_liked = useCallback((song: Song) => {
    return liked_songs.some(s => s.id === song.id);
  }, [liked_songs]);

  const get_local_liked_songs = useCallback((): Song[] => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  }, []);

  const clear_local_liked_songs = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refresh = useCallback(() => {
    fetch_liked_songs();
  }, [fetch_liked_songs]);

  return {
    liked_songs,
    toggle_like,
    is_liked,
    is_synced,
    get_local_liked_songs,
    clear_local_liked_songs,
    refresh,
  };
}
