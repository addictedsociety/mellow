<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const isLoginView = computed(() => route.name === 'login')
</script>

<template>
  <main class="min-h-screen bg-background text-foreground">
    <RouterView v-if="isLoginView" />

    <div v-else class="grid min-h-screen grid-cols-[260px_1fr]">
      <AppSidebar
        v-if="authStore.isAuthenticated"
        :user-name="authStore.user?.username ?? 'Mellow'"
        @logout="authStore.logout"
      />

      <section class="min-w-0 p-6">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </section>
    </div>
  </main>
</template>
