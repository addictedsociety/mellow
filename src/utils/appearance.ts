import type { ThemeMode, ThemeName } from '@/types/user.type'

const THEME_STORAGE_KEY = 'mellow:theme'
const MODE_STORAGE_KEY = 'mellow:mode'

const DEFAULT_THEME: ThemeName = 'violet-bloom'
const DEFAULT_MODE: ThemeMode = 'dark'

export const readStoredTheme = (): ThemeName => {
  try {
    return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeName) || DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export const readStoredMode = (): ThemeMode => {
  try {
    return (localStorage.getItem(MODE_STORAGE_KEY) as ThemeMode) || DEFAULT_MODE
  } catch {
    return DEFAULT_MODE
  }
}

export const applyAppearance = (theme: ThemeName, mode: ThemeMode) => {
  document.documentElement.dataset.theme = theme
  document.documentElement.dataset.mode = mode

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
    localStorage.setItem(MODE_STORAGE_KEY, mode)
  } catch {
    // localStorage might be disabled; UI-Update reicht in dem Fall
  }
}
