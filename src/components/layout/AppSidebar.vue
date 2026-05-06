<script setup lang="ts">
import { CheckCircle2, LayoutDashboard, ListTodo, LogOut, Settings } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import mellowLogo from '@/assets/mellow_logo.png'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'

const { userName } = defineProps<{
  userName: string
}>()

const emit = defineEmits<{
  logout: []
}>()

const { t } = useI18n()
const route = useRoute()

const links = [
  { name: 'dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { name: 'tasks', label: 'nav.tasks', icon: ListTodo },
  { name: 'completed', label: 'nav.completed', icon: CheckCircle2 },
  { name: 'settings', label: 'nav.settings', icon: Settings }
]
</script>

<template>
  <Sidebar collapsible="none" class="border-sidebar-border border-r shadow-sm">
    <SidebarHeader class="p-5">
      <RouterLink :to="{ name: 'dashboard' }" class="flex items-center gap-3">
        <img :src="mellowLogo" :alt="t('app.name')" class="size-11 rounded-2xl object-contain" />
        <span>
          <strong class="block text-lg font-semibold">{{ t('app.name') }}</strong>
          <span class="text-muted-foreground text-xs">{{ t('app.tagline') }}</span>
        </span>
      </RouterLink>
    </SidebarHeader>

    <SidebarContent class="px-3">
      <SidebarMenu>
        <SidebarMenuItem v-for="link in links" :key="link.name">
          <SidebarMenuButton
            as-child
            size="lg"
            :is-active="route.name === link.name"
            class="rounded-2xl"
          >
            <RouterLink :to="{ name: link.name }">
              <component :is="link.icon" class="size-4" />
              <span>{{ t(link.label) }}</span>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarContent>

    <SidebarFooter class="p-5">
      <div class="border-sidebar-border bg-card text-card-foreground rounded-3xl border p-4">
        <p class="text-muted-foreground text-xs tracking-[0.2em] uppercase">Local</p>
        <p class="mt-1 truncate font-medium">{{ userName }}</p>
        <Button
          variant="secondary"
          class="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition"
          type="button"
          @click="emit('logout')"
        >
          <LogOut class="size-4" />
          {{ t('nav.logout') }}
        </Button>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
