import type { AddonStorage } from '../types/addon'

const STORAGE_PREFIX = 'gs_addon_'

export function create_addon_storage(addon_id: string): AddonStorage {
  const prefix = `${STORAGE_PREFIX}${addon_id}_`

  return {
    get: <T>(key: string, default_value?: T): T | undefined => {
      try {
        const item = localStorage.getItem(`${prefix}${key}`)
        if (item === null) return default_value
        return JSON.parse(item) as T
      } catch {
        return default_value
      }
    },

    set: <T>(key: string, value: T): void => {
      try {
        localStorage.setItem(`${prefix}${key}`, JSON.stringify(value))
      } catch {
        console.error(`Failed to save addon data: ${key}`)
      }
    },

    remove: (key: string): void => {
      localStorage.removeItem(`${prefix}${key}`)
    },

    clear: (): void => {
      const keys_to_remove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(prefix)) {
          keys_to_remove.push(key)
        }
      }
      keys_to_remove.forEach(key => localStorage.removeItem(key))
    },

    keys: (): string[] => {
      const result: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(prefix)) {
          result.push(key.slice(prefix.length))
        }
      }
      return result
    }
  }
}
