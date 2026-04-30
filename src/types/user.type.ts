export interface UserProfile {
  id: number
  username: string
  language: 'de' | 'en'
  theme: 'light' | 'dark'
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
  theme: 'light' | 'dark'
}
