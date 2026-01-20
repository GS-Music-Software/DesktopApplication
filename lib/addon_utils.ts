import type { AddonUtils } from '../types/addon'

export function create_addon_utils(): AddonUtils {
  return {
    format_duration: (seconds: number): string => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${minutes}:${secs.toString().padStart(2, '0')}`
    },

    format_date: (timestamp: number): string => {
      return new Date(timestamp).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    debounce: <T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T => {
      let timeout_id: ReturnType<typeof setTimeout> | null = null

      return ((...args: unknown[]) => {
        if (timeout_id) clearTimeout(timeout_id)
        timeout_id = setTimeout(() => fn(...args), ms)
      }) as T
    },

    throttle: <T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T => {
      let last_call = 0

      return ((...args: unknown[]) => {
        const now = Date.now()
        if (now - last_call >= ms) {
          last_call = now
          return fn(...args)
        }
      }) as T
    },

    generate_id: (): string => {
      return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`
    },

    sleep: (ms: number): Promise<void> => {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  }
}
