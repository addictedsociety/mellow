<script setup lang="ts">
import SettingsForm from '@/components/settings/SettingsForm.vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { Settings } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
</script>

<template>
  <div class="scrollbar h-full space-y-6 overflow-y-auto pr-4">
    <header>
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center gap-2">
          <Settings class="size-7" />
          <h1 class="text-3xl font-semibold">{{ t('settings.title') }}</h1>
        </div>
        <p class="text-muted-foreground mt-1">{{ t('settings.subtitle') }}</p>
      </div>
    </header>

    <SettingsForm :user="authStore.user" @save="settingsStore.updateSettings" />

    <p
      v-if="settingsStore.error"
      class="bg-destructive/10 text-destructive rounded-2xl px-4 py-3 text-sm"
    >
      {{ settingsStore.error }}
    </p>
  </div>
</template>
