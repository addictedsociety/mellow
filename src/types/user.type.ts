export type ThemeMode = 'light' | 'dark'

export type ThemeName =
  | 'default'
  | 'violet-bloom'
  | 'vercel'
  | 'twitter'
  | 'tangerine'
  | 't3-chat'
  | 'supabase'
  | 'solar-dusk'
  | 'mono'
  | 'doom-64'

export interface UserProfile {
  id: number
  username: string
  language: 'de' | 'en'
  theme: ThemeName
  mode: ThemeMode
  createdAt: string
  updatedAt: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface SettingsPayload {
  username: string
  language: 'de' | 'en'
  theme: ThemeName
  mode: ThemeMode
}
