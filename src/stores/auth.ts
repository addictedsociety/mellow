import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { i18n } from '@/i18n'
import {
  getCurrentUser,
  hasUsers as requestHasUsers,
  login as requestLogin,
  logout as requestLogout,
  registerUser
} from '@/services/auth.service'
import type { LoginPayload, UserProfile } from '@/types/user.type'

export type AuthMode = 'login' | 'register'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const user = ref<UserProfile | null>(null)
  const hasLocalUser = ref(true)
  const mode = ref<AuthMode>('login')
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(user.value))
  const isRegisterMode = computed(() => mode.value === 'register')

  const applyUser = (nextUser: UserProfile | null) => {
    user.value = nextUser

    if (nextUser) {
      i18n.global.locale.value = nextUser.language
    }
  }

  const setMode = (nextMode: AuthMode) => {
    mode.value = nextMode
    error.value = ''
  }

  const initialize = async () => {
    isLoading.value = true

    try {
      hasLocalUser.value = await requestHasUsers()
      mode.value = hasLocalUser.value ? 'login' : 'register'
      applyUser(await getCurrentUser())
    } finally {
      isInitialized.value = true
      isLoading.value = false
    }
  }

  const authenticate = async (payload: LoginPayload) => {
    isLoading.value = true
    error.value = ''

    try {
      const nextUser = isRegisterMode.value
        ? await registerUser(payload)
        : await requestLogin(payload)

      hasLocalUser.value = true
      mode.value = 'login'
      applyUser(nextUser)
      await router.push({ name: 'dashboard' })
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    await requestLogout()
    applyUser(null)
    mode.value = 'login'
    await router.push({ name: 'login' })
  }

  return {
    user,
    hasLocalUser,
    mode,
    isInitialized,
    isLoading,
    error,
    isAuthenticated,
    isRegisterMode,
    setMode,
    initialize,
    authenticate,
    applyUser,
    logout
  }
})
