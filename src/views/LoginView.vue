<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Clock3 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { t } = useI18n()

const username = ref('')
const password = ref('')

const title = computed(() => (authStore.hasLocalUser ? t('auth.login') : t('auth.firstUser')))

const submit = () => {
  authStore.authenticate({
    username: username.value,
    password: password.value
  })
}
</script>

<template>
  <section class="grid min-h-screen place-items-center bg-[#f7f4ee] p-6">
    <form
      class="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm"
      @submit.prevent="submit"
    >
      <div class="mb-8 flex items-center gap-3">
        <span class="flex size-12 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
          <Clock3 class="size-6" />
        </span>
        <div>
          <h1 class="text-2xl font-semibold">{{ t('auth.welcome') }}</h1>
          <p class="mt-1 text-sm text-stone-500">{{ t('auth.subtitle') }}</p>
        </div>
      </div>

      <h2 class="mb-5 text-lg font-medium">{{ title }}</h2>

      <label class="block text-sm font-medium text-stone-600">
        {{ t('auth.username') }}
        <input
          v-model="username"
          class="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-300"
          autocomplete="username"
          required
        />
      </label>

      <label class="mt-4 block text-sm font-medium text-stone-600">
        {{ t('auth.password') }}
        <input
          v-model="password"
          class="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none focus:border-amber-300"
          autocomplete="current-password"
          minlength="8"
          required
          type="password"
        />
        <span class="mt-1 block text-xs text-stone-400">{{ t('auth.passwordHint') }}</span>
      </label>

      <p v-if="authStore.error" class="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {{ authStore.error }}
      </p>

      <button
        class="mt-6 w-full rounded-2xl bg-stone-900 px-5 py-3 font-medium text-white transition hover:bg-stone-700 disabled:opacity-60"
        :disabled="authStore.isLoading"
        type="submit"
      >
        {{ authStore.hasLocalUser ? t('auth.login') : t('auth.register') }}
      </button>
    </form>
  </section>
</template>
