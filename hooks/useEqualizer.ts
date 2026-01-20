import { useState, useEffect, useCallback } from 'react';
import type { EqualizerPreset, EqualizerState } from '../types';
// no .env file for now, will add later in dev
const API_BASE = 'http://127.0.0.1:3000/api';
const STORAGE_KEY = 'gs_music_equalizer';

export const EQ_PRESETS: EqualizerPreset[] = [
  { name: 'Flat', bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Boost', bands: [6, 5, 4, 2, 1, 0, 0, 0, 0, 0] },
  { name: 'Bass Boost+', bands: [8, 7, 5, 3, 1, 0, 0, 0, 0, 0] },
  { name: 'Treble Boost', bands: [0, 0, 0, 0, 0, 1, 2, 3, 4, 5] },
  { name: 'Vocal', bands: [-2, -1, 0, 2, 4, 4, 3, 1, 0, -1] },
  { name: 'Rock', bands: [4, 3, 2, 1, 0, -1, 0, 2, 3, 4] },
  { name: 'Electronic', bands: [4, 3, 1, 0, -1, 1, 0, 2, 4, 5] },
  { name: 'Jazz', bands: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3] },
  { name: 'Pop', bands: [-1, 1, 3, 4, 3, 1, 0, -1, -1, -1] },
  { name: 'Classical', bands: [3, 2, 1, 1, 0, 0, 0, 1, 2, 3] },
];

export const EQ_FREQUENCIES = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export function useEqualizer() {
  const [state, set_state] = useState<EqualizerState>({
    enabled: false,
    preset: 'Flat',
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        set_state(parsed);
        if (parsed.enabled) {
          apply_eq(parsed.bands);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const apply_eq = useCallback(async (bands: number[]) => {
    try {
      await fetch(`${API_BASE}/equalizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bands, enabled: true }),
      });
    } catch (error) {
      console.error('failed to apply equalizer:', error);
    }
  }, []);

  const disable_eq = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/equalizer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], enabled: false }),
      });
    } catch (error) {
      console.error('failed to disable equalizer:', error);
    }
  }, []);

  const toggle_enabled = useCallback(async () => {
    const new_enabled = !state.enabled;
    set_state(prev => ({ ...prev, enabled: new_enabled }));
    if (new_enabled) {
      await apply_eq(state.bands);
    } else {
      await disable_eq();
    }
  }, [state.enabled, state.bands, apply_eq, disable_eq]);

  const set_preset = useCallback(async (preset_name: string) => {
    const preset = EQ_PRESETS.find(p => p.name === preset_name);
    if (!preset) return;
    set_state(prev => ({ ...prev, preset: preset_name, bands: [...preset.bands] }));
    if (state.enabled) {
      await apply_eq(preset.bands);
    }
  }, [state.enabled, apply_eq]);

  const set_band = useCallback(async (index: number, value: number) => {
    const new_bands = [...state.bands];
    new_bands[index] = value;
    set_state(prev => ({ ...prev, preset: 'Custom', bands: new_bands }));
    if (state.enabled) {
      await apply_eq(new_bands);
    }
  }, [state.bands, state.enabled, apply_eq]);

  const reset = useCallback(async () => {
    const flat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    set_state({ enabled: false, preset: 'Flat', bands: flat });
    await disable_eq();
  }, [disable_eq]);

  const reapply = useCallback(async () => {
    if (state.enabled) {
      await apply_eq(state.bands);
    }
  }, [state.enabled, state.bands, apply_eq]);

  return {
    enabled: state.enabled,
    preset: state.preset,
    bands: state.bands,
    presets: EQ_PRESETS,
    frequencies: EQ_FREQUENCIES,
    toggle_enabled,
    set_preset,
    set_band,
    reset,
    reapply,
  };
}
