<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import SettingsForm from '@/components/settings/SettingsForm.vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const { t } = useI18n()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-3xl font-semibold">{{ t('settings.title') }}</h1>
      <p class="mt-1 text-muted-foreground">{{ t('settings.subtitle') }}</p>
    </header>

    <SettingsForm :user="authStore.user" @save="settingsStore.updateSettings" />

    <p
      v-if="settingsStore.error"
      class="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {{ settingsStore.error }}
    </p>
  </div>
</template>
