import { ref } from 'vue'
import { defineStore } from 'pinia'
import { i18n } from '@/i18n'
import { updateSettings as requestUpdateSettings } from '@/services/settings.service'
import type { SettingsPayload } from '@/types/user.type'
import { useAuthStore } from './auth'

export const useSettingsStore = defineStore('settings', () => {
  const defaultView = ref('dashboard')
  const isLoading = ref(false)
  const error = ref('')

  const updateSettings = async (payload: SettingsPayload) => {
    const authStore = useAuthStore()
    isLoading.value = true
    error.value = ''

    try {
      const user = await requestUpdateSettings(payload)
      authStore.applyUser(user)
      i18n.global.locale.value = user.language
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
    } finally {
      isLoading.value = false
    }
  }

  return {
    defaultView,
    isLoading,
    error,
    updateSettings
  }
})
