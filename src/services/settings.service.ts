import { invoke } from '@tauri-apps/api/core'
import type { SettingsPayload, UserProfile } from '@/types/user.type'

export const updateSettings = (payload: SettingsPayload) =>
  invoke<UserProfile>('update_settings', { payload })
