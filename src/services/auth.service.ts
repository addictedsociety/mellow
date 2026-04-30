import { invoke } from '@tauri-apps/api/core'
import type { LoginPayload, UserProfile } from '@/types/user.type'

export const hasUsers = () => invoke<boolean>('has_users')

export const getCurrentUser = () => invoke<UserProfile | null>('current_user')

export const registerUser = (payload: LoginPayload) =>
  invoke<UserProfile>('register_user', { payload })

export const login = (payload: LoginPayload) => invoke<UserProfile>('login', { payload })

export const logout = () => invoke<void>('logout')
