<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Moon, Sun } from 'lucide-vue-next'
import type { ThemeMode, ThemeName, UserProfile } from '@/types/user.type'
import { themePresets } from '@/types/theme.type'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { user } = defineProps<{
  user: UserProfile | null
}>()

const emit = defineEmits<{
  save: [
    payload: {
      username: string
      language: 'de' | 'en'
      theme: ThemeName
      mode: ThemeMode
    }
  ]
}>()

const { t } = useI18n()

const username = ref('')
const language = ref<'de' | 'en'>('de')
const theme = ref<ThemeName>('violet-bloom')
const mode = ref<ThemeMode>('light')

const previewTheme = (next: ThemeName) => {
  theme.value = next
  document.documentElement.dataset.theme = next
}

const previewMode = (next: ThemeMode) => {
  mode.value = next
  document.documentElement.dataset.mode = next
}

const submit = () => {
  emit('save', {
    username: username.value,
    language: language.value,
    theme: theme.value,
    mode: mode.value
  })
}

watchEffect(() => {
  username.value = user?.username ?? ''
  language.value = user?.language ?? 'de'
  theme.value = user?.theme ?? 'violet-bloom'
  mode.value = user?.mode ?? 'light'
})
</script>

<template>
  <form class="max-w-2xl space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm" @submit.prevent="submit">
    <label class="block text-sm font-medium text-muted-foreground">
      {{ t('settings.userName') }}
      <input
        v-model="username"
        class="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
      />
    </label>

    <label class="block text-sm font-medium text-muted-foreground">
      {{ t('settings.language') }}
      <LanguageSwitcher v-model="language" class="mt-2" />
    </label>

    <fieldset class="space-y-2">
      <legend class="text-sm font-medium text-muted-foreground">{{ t('settings.mode') }}</legend>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition"
          :class="
            mode === 'light'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
          "
          @click="previewMode('light')"
        >
          <Sun class="size-4" />
          {{ t('settings.light') }}
        </button>
        <button
          type="button"
          class="flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition"
          :class="
            mode === 'dark'
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
          "
          @click="previewMode('dark')"
        >
          <Moon class="size-4" />
          {{ t('settings.dark') }}
        </button>
      </div>
    </fieldset>

    <fieldset class="space-y-3">
      <legend class="text-sm font-medium text-muted-foreground">{{ t('settings.theme') }}</legend>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          v-for="preset in themePresets"
          :key="preset.name"
          type="button"
          class="group flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition"
          :class="
            theme === preset.name
              ? 'border-primary bg-accent text-accent-foreground'
              : 'border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
          "
          @click="previewTheme(preset.name)"
        >
          <span class="flex flex-col">
            <span>{{ t(preset.labelKey) }}</span>
            <span class="mt-2 flex items-center gap-1.5">
              <span
                v-for="(color, index) in preset.swatches"
                :key="index"
                class="block size-3.5 rounded-full ring-1 ring-border"
                :style="{ backgroundColor: color }"
              />
            </span>
          </span>
          <Check v-if="theme === preset.name" class="size-4 shrink-0 text-primary" />
        </button>
      </div>
    </fieldset>

    <button
      class="rounded-2xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      type="submit"
    >
      {{ t('settings.save') }}
    </button>
  </form>
</template>
