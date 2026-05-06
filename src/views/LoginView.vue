<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import mellowLogo from '@/assets/mellow_logo.png'

const authStore = useAuthStore()
const { t } = useI18n()

const username = ref('')
const password = ref('')

const title = computed(() => {
  if (!authStore.hasLocalUser) {
    return t('auth.firstUser')
  }

  return authStore.isRegisterMode ? t('auth.register') : t('auth.login')
})

const submitLabel = computed(() =>
  authStore.isRegisterMode ? t('auth.register') : t('auth.login')
)

const submit = () => {
  authStore.authenticate({
    username: username.value,
    password: password.value
  })
}

const toggleMode = () => {
  authStore.setMode(authStore.isRegisterMode ? 'login' : 'register')
}
</script>

<template>
  <section class="grid min-h-screen place-items-center bg-background p-6 text-foreground">
    <form
      class="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 text-card-foreground shadow-sm"
      @submit.prevent="submit"
    >
      <div class="mb-8 flex items-center gap-3">
        <img
          :src="mellowLogo"
          :alt="t('app.name')"
          class="size-12 rounded-3xl object-contain"
        />
        <div>
          <h1 class="text-2xl font-semibold">{{ t('auth.welcome') }}</h1>
          <p class="mt-1 text-sm text-muted-foreground">{{ t('auth.subtitle') }}</p>
        </div>
      </div>

      <h2 class="mb-5 text-lg font-medium">{{ title }}</h2>

      <label class="block text-sm font-medium text-muted-foreground">
        {{ t('auth.username') }}
        <input
          v-model="username"
          class="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-ring"
          autocomplete="username"
          required
        />
      </label>

      <label class="mt-4 block text-sm font-medium text-muted-foreground">
        {{ t('auth.password') }}
        <input
          v-model="password"
          class="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-ring"
          :autocomplete="authStore.isRegisterMode ? 'new-password' : 'current-password'"
          minlength="8"
          required
          type="password"
        />
        <span class="mt-1 block text-xs text-muted-foreground">{{ t('auth.passwordHint') }}</span>
      </label>

      <p
        v-if="authStore.error"
        class="mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
      >
        {{ authStore.error }}
      </p>

      <button
        class="mt-6 w-full rounded-2xl bg-primary px-5 py-3 font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        :disabled="authStore.isLoading"
        type="submit"
      >
        {{ submitLabel }}
      </button>

      <p v-if="authStore.hasLocalUser" class="mt-5 text-center text-sm text-muted-foreground">
        {{ authStore.isRegisterMode ? t('auth.haveAccount') : t('auth.noAccount') }}
        <button
          class="ml-1 font-medium text-foreground underline-offset-4 hover:underline"
          type="button"
          @click="toggleMode"
        >
          {{ authStore.isRegisterMode ? t('auth.toLogin') : t('auth.toRegister') }}
        </button>
      </p>
    </form>
  </section>
</template>
