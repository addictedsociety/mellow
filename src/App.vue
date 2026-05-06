<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
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
        ? 'bg-background text-foreground min-h-screen overflow-hidden'
        : 'bg-background text-foreground grid h-screen place-items-center overflow-hidden p-5'
    "
  >
    <RouterView v-if="isLoginView" />

    <SidebarProvider
      v-else
      class="border-border bg-background shadow-primary/10 h-full min-h-0 w-full overflow-hidden rounded-3xl border shadow-2xl"
    >
      <AppSidebar
        v-if="authStore.isAuthenticated"
        :user-name="authStore.user?.username ?? 'Mellow'"
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
