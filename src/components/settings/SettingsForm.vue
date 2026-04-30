<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UserProfile } from '@/types/user.type'
import LanguageSwitcher from './LanguageSwitcher.vue'

const { user } = defineProps<{
  user: UserProfile | null
}>()

const emit = defineEmits<{
  save: [payload: { username: string; language: 'de' | 'en'; theme: 'light' | 'dark' }]
}>()

const { t } = useI18n()

const username = ref('')
const language = ref<'de' | 'en'>('de')
const theme = ref<'light' | 'dark'>('light')

const submit = () => {
  emit('save', {
    username: username.value,
    language: language.value,
    theme: theme.value
  })
}

watchEffect(() => {
  username.value = user?.username ?? ''
  language.value = user?.language ?? 'de'
  theme.value = user?.theme ?? 'light'
})
</script>

<template>
  <form class="max-w-2xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm" @submit.prevent="submit">
    <label class="block text-sm font-medium text-stone-600">
      {{ t('settings.userName') }}
      <input v-model="username" class="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3" />
    </label>

    <label class="mt-4 block text-sm font-medium text-stone-600">
      {{ t('settings.language') }}
      <LanguageSwitcher v-model="language" class="mt-2" />
    </label>

    <label class="mt-4 block text-sm font-medium text-stone-600">
      {{ t('settings.theme') }}
      <select v-model="theme" class="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3">
        <option value="light">{{ t('settings.light') }}</option>
        <option value="dark">{{ t('settings.dark') }}</option>
      </select>
    </label>

    <button class="mt-6 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-medium text-white" type="submit">
      {{ t('settings.save') }}
    </button>
  </form>
</template>
