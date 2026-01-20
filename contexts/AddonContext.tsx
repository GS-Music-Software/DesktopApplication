import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Addon, AddonManifest, ToastMessage, ModalState, AddonButton, AddonView } from '../types/addon'
import { addon_manager } from '../lib/addon_manager'
import { set_api_bindings, type APIBindings } from '../lib/addon_api'
import { set_toast_callback, set_modal_callback, set_ui_update_callback, ui_registry } from '../lib/addon_ui'
import { addon_events } from '../lib/addon_events'

interface AddonContextValue {
  addons: Addon[]
  enabled_count: number
  toasts: ToastMessage[]
  modal: ModalState | null
  buttons: AddonButton[]
  views: AddonView[]
  create_addon: (manifest: AddonManifest, code: string) => Addon
  update_addon: (id: string, updates: Partial<Pick<Addon, 'name' | 'description' | 'version' | 'author' | 'code'>>) => void
  delete_addon: (id: string) => void
  toggle_addon: (id: string) => boolean
  enable_addon: (id: string) => boolean
  disable_addon: (id: string) => void
  export_addon: (id: string) => string | null
  import_addon: (json: string) => Addon | null
  close_modal: () => void
  dismiss_toast: (id: string) => void
}

const AddonContext = createContext<AddonContextValue | null>(null)

interface AddonProviderProps {
  children: ReactNode
  bindings: APIBindings
}

export function AddonProvider({ children, bindings }: AddonProviderProps) {
  const [addons, set_addons] = useState<Addon[]>([])
  const [toasts, set_toasts] = useState<ToastMessage[]>([])
  const [modal, set_modal] = useState<ModalState | null>(null)
  const [buttons, set_buttons] = useState<AddonButton[]>([])
  const [views, set_views] = useState<AddonView[]>([])
  const [, force_update] = useState({})

  useEffect(() => {
    set_api_bindings(bindings)
  }, [bindings])

  useEffect(() => {
    set_toast_callback((toast) => {
      set_toasts(prev => [...prev, toast])
      setTimeout(() => {
        set_toasts(prev => prev.filter(t => t.id !== toast.id))
      }, toast.duration)
    })

    set_modal_callback((state) => {
      set_modal(state)
    })

    set_ui_update_callback(() => {
      set_buttons(Array.from(ui_registry.buttons.values()))
      set_views(Array.from(ui_registry.views.values()))
      force_update({})
    })

    const unsubscribe = addon_manager.on_change(() => {
      set_addons(addon_manager.get_all())
    })

    set_addons(addon_manager.get_all())
    addon_manager.init_enabled_addons()

    return unsubscribe
  }, [])

  const create_addon = useCallback((manifest: AddonManifest, code: string) => {
    return addon_manager.create(manifest, code)
  }, [])

  const update_addon = useCallback((id: string, updates: Partial<Pick<Addon, 'name' | 'description' | 'version' | 'author' | 'code'>>) => {
    addon_manager.update(id, updates)
  }, [])

  const delete_addon = useCallback((id: string) => {
    addon_manager.delete(id)
  }, [])

  const toggle_addon = useCallback((id: string) => {
    return addon_manager.toggle(id)
  }, [])

  const enable_addon = useCallback((id: string) => {
    return addon_manager.enable(id)
  }, [])

  const disable_addon = useCallback((id: string) => {
    addon_manager.disable(id)
  }, [])

  const export_addon = useCallback((id: string) => {
    return addon_manager.export_addon(id)
  }, [])

  const import_addon = useCallback((json: string) => {
    return addon_manager.import_addon(json)
  }, [])

  const close_modal = useCallback(() => {
    set_modal(null)
  }, [])

  const dismiss_toast = useCallback((id: string) => {
    set_toasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const enabled_count = addons.filter(a => a.enabled).length

  const value: AddonContextValue = {
    addons,
    enabled_count,
    toasts,
    modal,
    buttons,
    views,
    create_addon,
    update_addon,
    delete_addon,
    toggle_addon,
    enable_addon,
    disable_addon,
    export_addon,
    import_addon,
    close_modal,
    dismiss_toast
  }

  return (
    <AddonContext.Provider value={value}>
      {children}
    </AddonContext.Provider>
  )
}

export function useAddonContext(): AddonContextValue {
  const context = useContext(AddonContext)
  if (!context) {
    throw new Error('useAddonContext must be used within AddonProvider')
  }
  return context
}

export { addon_events }
