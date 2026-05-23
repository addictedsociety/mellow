<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import mellowLogo from '@/assets/mellow_logo.png'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import NxrAnimatedBackground from '@/components/NxrAnimatedBackground.vue'

const authStore = useAuthStore()
const { t } = useI18n()

const username = ref('')
const password = ref('')
const isPasswordVisible = ref(false)

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

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
  <section
    class="bg-background text-foreground relative grid h-screen place-items-center overflow-hidden p-6"
  >
    <NxrAnimatedBackground />
    <Card
      class="bg-card/70 border-border/40 shadow-primary/30 relative z-10 w-full max-w-md rounded-lg px-2 py-8 shadow-2xl backdrop-blur-xl"
    >
      <CardHeader class="items-center text-center">
        <img
          :src="mellowLogo"
          :alt="t('app.name')"
          class="bg-secondary shadow-primary/20 mx-auto mb-3 size-20 rounded-3xl object-contain shadow-lg"
        />
        <CardTitle class="text-2xl select-none">{{ t('auth.welcome') }}</CardTitle>
        <CardDescription class="select-none">{{ t('auth.subtitle') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="submit">
          <h2 class="mb-5 text-lg font-medium select-none">{{ title }}</h2>

          <label class="text-muted-foreground block text-sm font-medium select-none">
            {{ t('auth.username') }}
            <input
              v-model="username"
              class="border-border bg-background text-foreground focus:border-ring mt-2 w-full rounded-2xl border px-4 py-3 outline-none"
              autocomplete="username"
              required
            />
          </label>

          <label class="text-muted-foreground mt-4 block text-sm font-medium select-none">
            {{ t('auth.password') }}
            <div class="relative mt-2">
              <input
                v-model="password"
                class="border-border bg-background text-foreground focus:border-ring w-full rounded-2xl border py-3 pr-12 pl-4 outline-none"
                :autocomplete="authStore.isRegisterMode ? 'new-password' : 'current-password'"
                :type="isPasswordVisible ? 'text' : 'password'"
                minlength="8"
                required
              />
              <button
                class="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center px-3 transition-colors"
                type="button"
                :aria-label="isPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')"
                :title="isPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')"
                tabindex="-1"
                @click="togglePasswordVisibility"
              >
                <EyeOff v-if="isPasswordVisible" class="size-5" />
                <Eye v-else class="size-5" />
              </button>
            </div>
            <span class="text-muted-foreground mt-1 block text-xs select-none">
              {{ t('auth.passwordHint') }}
            </span>
          </label>

          <p
            v-if="authStore.error"
            class="bg-destructive/10 text-destructive mt-4 rounded-2xl px-4 py-3 text-sm"
          >
            {{ authStore.error }}
          </p>

          <Button
            class="bg-primary text-primary-foreground mt-6 w-full rounded-2xl px-5 py-3 font-medium transition select-none hover:opacity-90 disabled:opacity-60"
            :disabled="authStore.isLoading"
            type="submit"
          >
            {{ submitLabel }}
          </Button>

          <p
            v-if="authStore.hasLocalUser"
            class="text-muted-foreground mt-5 text-center text-sm select-none"
          >
            {{ authStore.isRegisterMode ? t('auth.haveAccount') : t('auth.noAccount') }}
            <Button
              class="text-primary-foreground ml-1 font-medium underline-offset-4 select-none hover:underline"
              type="button"
              @click="toggleMode"
            >
              {{ authStore.isRegisterMode ? t('auth.toLogin') : t('auth.toRegister') }}
            </Button>
          </p>
        </form>
      </CardContent>
    </Card>
  </section>
</template>

<style scoped>
input::-ms-reveal,
input::-ms-clear {
  display: none;
}
</style>
