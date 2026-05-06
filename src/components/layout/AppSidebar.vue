<script setup lang="ts">
import { CheckCircle2, LayoutDashboard, ListTodo, LogOut, Settings } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import mellowLogo from '@/assets/mellow_logo.png'

const { userName } = defineProps<{
  userName: string
}>()

const emit = defineEmits<{
  logout: []
}>()

const { t } = useI18n()

const links = [
  { name: 'dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { name: 'tasks', label: 'nav.tasks', icon: ListTodo },
  { name: 'completed', label: 'nav.completed', icon: CheckCircle2 },
  { name: 'settings', label: 'nav.settings', icon: Settings }
]
</script>

<template>
  <aside class="flex min-h-screen flex-col border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground shadow-sm">
    <RouterLink :to="{ name: 'dashboard' }" class="mb-8 flex items-center gap-3">
      <img
        :src="mellowLogo"
        :alt="t('app.name')"
        class="size-11 rounded-2xl object-contain"
      />
      <span>
        <strong class="block text-lg font-semibold">{{ t('app.name') }}</strong>
        <span class="text-xs text-muted-foreground">{{ t('app.tagline') }}</span>
      </span>
    </RouterLink>

    <nav class="space-y-2">
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="{ name: link.name }"
        class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-sidebar-foreground transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        active-class="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
      >
        <component :is="link.icon" class="size-4" />
        {{ t(link.label) }}
      </RouterLink>
    </nav>

    <div class="mt-auto rounded-3xl border border-sidebar-border bg-card p-4 text-card-foreground">
      <p class="text-xs uppercase tracking-[0.2em] text-muted-foreground">Local</p>
      <p class="mt-1 truncate font-medium">{{ userName }}</p>
      <button
        class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-muted px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
        type="button"
        @click="emit('logout')"
      >
        <LogOut class="size-4" />
        {{ t('nav.logout') }}
      </button>
    </div>
  </aside>
</template>
