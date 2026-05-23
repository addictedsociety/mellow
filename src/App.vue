<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import NxrAnimatedBackground from '@/components/NxrAnimatedBackground.vue'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const isLoginView = computed(() => route.name === 'login')
</script>

<template>
  <main
    :class="
      isLoginView
        ? 'bg-background text-foreground relative min-h-screen overflow-hidden'
        : 'bg-background text-foreground relative grid h-screen place-items-center overflow-hidden p-5'
    "
  >
    <div
      v-if="!isLoginView"
      class="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <NxrAnimatedBackground :intensity="0.4" :particle-count="35" />
    </div>

    <RouterView v-if="isLoginView" />

    <SidebarProvider
      v-else
      class="border-border bg-background shadow-primary/10 relative z-10 h-full min-h-0 w-full overflow-hidden rounded-3xl border shadow-2xl"
    >
      <AppSidebar
        v-if="authStore.isAuthenticated"
        :user-name="authStore.user?.username ?? 'mellow'"
        @logout="authStore.logout"
      />

      <SidebarInset class="min-h-0 min-w-0 overflow-hidden">
        <section class="h-full min-w-0 overflow-hidden p-6">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </section>
      </SidebarInset>
    </SidebarProvider>
  </main>
</template>
