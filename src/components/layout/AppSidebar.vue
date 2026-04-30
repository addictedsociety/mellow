<script setup lang="ts">
import { CheckCircle2, Clock3, LayoutDashboard, ListTodo, LogOut, Settings } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

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
  <aside class="flex min-h-screen flex-col border-r border-stone-200/80 bg-white/70 p-5 shadow-sm">
    <RouterLink :to="{ name: 'dashboard' }" class="mb-8 flex items-center gap-3">
      <span class="flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <Clock3 class="size-5" />
      </span>
      <span>
        <strong class="block text-lg font-semibold">{{ t('app.name') }}</strong>
        <span class="text-xs text-stone-500">{{ t('app.tagline') }}</span>
      </span>
    </RouterLink>

    <nav class="space-y-2">
      <RouterLink
        v-for="link in links"
        :key="link.name"
        :to="{ name: link.name }"
        class="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
        active-class="bg-stone-900 text-white hover:bg-stone-900"
      >
        <component :is="link.icon" class="size-4" />
        {{ t(link.label) }}
      </RouterLink>
    </nav>

    <div class="mt-auto rounded-3xl border border-stone-200 bg-white p-4">
      <p class="text-xs uppercase tracking-[0.2em] text-stone-400">Local</p>
      <p class="mt-1 truncate font-medium">{{ userName }}</p>
      <button
        class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
        type="button"
        @click="emit('logout')"
      >
        <LogOut class="size-4" />
        {{ t('nav.logout') }}
      </button>
    </div>
  </aside>
</template>
