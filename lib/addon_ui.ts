import type {
  AddonUI,
  AddonButton,
  AddonMenuItem,
  AddonPanel,
  AddonView,
  ModalButton
} from '../types/addon'

export interface UIRegistry {
  buttons: Map<string, AddonButton>
  menu_items: Map<string, AddonMenuItem>
  panels: Map<string, AddonPanel>
  views: Map<string, AddonView>
  styles: Map<string, HTMLStyleElement>
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

let toast_callback: ((toast: ToastMessage) => void) | null = null
let modal_callback: ((state: ModalState | null) => void) | null = null
let ui_update_callback: (() => void) | null = null

export function set_toast_callback(cb: (toast: ToastMessage) => void): void {
  toast_callback = cb
}

export function set_modal_callback(cb: (state: ModalState | null) => void): void {
  modal_callback = cb
}

export function set_ui_update_callback(cb: () => void): void {
  ui_update_callback = cb
}

export const ui_registry: UIRegistry = {
  buttons: new Map(),
  menu_items: new Map(),
  panels: new Map(),
  views: new Map(),
  styles: new Map()
}

function generate_id(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export function create_addon_ui(addon_id: string): AddonUI {
  const registered_buttons: string[] = []
  const registered_menu_items: string[] = []
  const registered_panels: string[] = []
  const registered_views: string[] = []
  const registered_styles: string[] = []

  return {
    register_button: (button): string => {
      const id = generate_id()
      const full_button: AddonButton = {
        ...button,
        id,
        addon_id
      }
      ui_registry.buttons.set(id, full_button)
      registered_buttons.push(id)
      ui_update_callback?.()
      return id
    },

    unregister_button: (button_id): void => {
      ui_registry.buttons.delete(button_id)
      const index = registered_buttons.indexOf(button_id)
      if (index > -1) registered_buttons.splice(index, 1)
      ui_update_callback?.()
    },

    register_menu_item: (item): string => {
      const id = generate_id()
      const full_item: AddonMenuItem = {
        ...item,
        id,
        addon_id
      }
      ui_registry.menu_items.set(id, full_item)
      registered_menu_items.push(id)
      ui_update_callback?.()
      return id
    },

    unregister_menu_item: (item_id): void => {
      ui_registry.menu_items.delete(item_id)
      const index = registered_menu_items.indexOf(item_id)
      if (index > -1) registered_menu_items.splice(index, 1)
      ui_update_callback?.()
    },

    register_panel: (panel): string => {
      const id = generate_id()
      const full_panel: AddonPanel = {
        ...panel,
        id,
        addon_id
      }
      ui_registry.panels.set(id, full_panel)
      registered_panels.push(id)
      ui_update_callback?.()
      return id
    },

    unregister_panel: (panel_id): void => {
      ui_registry.panels.delete(panel_id)
      const index = registered_panels.indexOf(panel_id)
      if (index > -1) registered_panels.splice(index, 1)
      ui_update_callback?.()
    },

    register_view: (view): string => {
      const id = generate_id()
      const full_view: AddonView = {
        ...view,
        id,
        addon_id
      }
      ui_registry.views.set(id, full_view)
      registered_views.push(id)
      ui_update_callback?.()
      return id
    },

    unregister_view: (view_id): void => {
      ui_registry.views.delete(view_id)
      const index = registered_views.indexOf(view_id)
      if (index > -1) registered_views.splice(index, 1)
      ui_update_callback?.()
    },

    show_toast: (message, type = 'info', duration = 3000): void => {
      if (toast_callback) {
        toast_callback({
          id: generate_id(),
          message,
          type,
          duration
        })
      }
    },

    show_modal: (title, content, buttons = []): void => {
      if (modal_callback) {
        modal_callback({
          open: true,
          title,
          content,
          buttons
        })
      }
    },

    close_modal: (): void => {
      if (modal_callback) {
        modal_callback(null)
      }
    },

    inject_css: (css): string => {
      const style_id = `addon_style_${generate_id()}`
      const style_element = document.createElement('style')
      style_element.id = style_id
      style_element.textContent = css
      document.head.appendChild(style_element)
      ui_registry.styles.set(style_id, style_element)
      registered_styles.push(style_id)
      return style_id
    },

    remove_css: (style_id): void => {
      const style_element = ui_registry.styles.get(style_id)
      if (style_element) {
        style_element.remove()
        ui_registry.styles.delete(style_id)
        const index = registered_styles.indexOf(style_id)
        if (index > -1) registered_styles.splice(index, 1)
      }
    }
  }
}

export function cleanup_addon_ui(addon_id: string): void {
  for (const [id, button] of ui_registry.buttons) {
    if (button.addon_id === addon_id) {
      ui_registry.buttons.delete(id)
    }
  }

  for (const [id, item] of ui_registry.menu_items) {
    if (item.addon_id === addon_id) {
      ui_registry.menu_items.delete(id)
    }
  }

  for (const [id, panel] of ui_registry.panels) {
    if (panel.addon_id === addon_id) {
      ui_registry.panels.delete(id)
    }
  }

  for (const [id, view] of ui_registry.views) {
    if (view.addon_id === addon_id) {
      ui_registry.views.delete(id)
    }
  }

  for (const [id, style] of ui_registry.styles) {
    if (id.includes(addon_id)) {
      style.remove()
      ui_registry.styles.delete(id)
    }
  }

  ui_update_callback?.()
}
