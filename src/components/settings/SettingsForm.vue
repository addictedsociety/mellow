<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Moon, Sun } from 'lucide-vue-next'
import type { ThemeMode, ThemeName, UserProfile } from '@/types/user.type'
import { themePresets } from '@/types/theme.type'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { applyAppearance, readStoredMode, readStoredTheme } from '@/utils/appearance'
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
const theme = ref<ThemeName>(readStoredTheme())
const mode = ref<ThemeMode>(readStoredMode())

const previewTheme = (next: ThemeName) => {
  theme.value = next
  applyAppearance(next, mode.value)
}

const previewMode = (next: ThemeMode) => {
  mode.value = next
  applyAppearance(theme.value, next)
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
  theme.value = readStoredTheme()
  mode.value = readStoredMode()
})
</script>

<template>
  <Card class="w-full rounded-[2rem]">
    <CardContent class="p-6">
      <form class="w-full space-y-6" @submit.prevent="submit">
        <label class="text-muted-foreground block text-sm font-medium select-none">
          {{ t('settings.userName') }}
          <Input v-model="username" class="bg-background mt-2 h-11 rounded-2xl px-4" />
        </label>

        <label class="text-muted-foreground block text-sm font-medium select-none">
          <p class="mb-2">{{ t('settings.language') }}</p>
          <LanguageSwitcher v-model="language" />
        </label>

        <fieldset class="space-y-2">
          <legend class="text-muted-foreground text-sm font-medium select-none">
            {{ t('settings.mode') }}
          </legend>
          <div class="grid grid-cols-2 gap-2">
            <Button
              type="button"
              class="rounded-2xl select-none"
              :variant="mode === 'light' ? 'default' : 'outline'"
              size="lg"
              @click="previewMode('light')"
            >
              <Sun class="size-4" />
              {{ t('settings.light') }}
            </Button>
            <Button
              type="button"
              class="rounded-2xl select-none"
              :variant="mode === 'dark' ? 'default' : 'outline'"
              size="lg"
              @click="previewMode('dark')"
            >
              <Moon class="size-4" />
              {{ t('settings.dark') }}
            </Button>
          </div>
        </fieldset>

        <fieldset class="space-y-3">
          <legend class="text-muted-foreground text-sm font-medium select-none">
            {{ t('settings.theme') }}
          </legend>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Button
              v-for="preset in themePresets"
              :key="preset.name"
              type="button"
              class="h-auto justify-between rounded-2xl px-4 py-3 text-left select-none"
              :variant="theme === preset.name ? 'secondary' : 'outline'"
              @click="previewTheme(preset.name)"
            >
              <span class="flex flex-col">
                <span>{{ t(preset.labelKey) }}</span>
                <span class="mt-2 flex items-center gap-1.5">
                  <span
                    v-for="(color, index) in preset.swatches"
                    :key="index"
                    class="ring-border block size-3.5 rounded-full ring-1"
                    :style="{ backgroundColor: color }"
                  />
                </span>
              </span>
              <Check v-if="theme === preset.name" class="text-primary size-4 shrink-0" />
            </Button>
          </div>
        </fieldset>

        <Button class="rounded-2xl select-none" type="submit" size="lg">
          {{ t('settings.save') }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>
