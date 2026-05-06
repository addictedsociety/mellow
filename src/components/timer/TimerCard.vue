<script setup lang="ts">
import { PlayCircle } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { TimeEntry } from '@/types/time-entry.type'

const { runningEntry, elapsedLabel } = defineProps<{
  runningEntry: TimeEntry | null
  elapsedLabel: string
}>()

const emit = defineEmits<{
  stop: []
}>()

const { t } = useI18n()
</script>

<template>
  <section
    class="border-primary/40 bg-accent text-accent-foreground rounded-[2rem] border p-6 shadow-sm"
  >
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-primary text-sm font-medium">{{ t('dashboard.activeTask') }}</p>
        <h2 class="text-foreground mt-2 text-2xl font-semibold">
          {{ runningEntry?.taskTitle ?? t('dashboard.noActiveTask') }}
        </h2>
      </div>
      <div
        class="bg-card text-primary flex size-14 items-center justify-center rounded-3xl shadow-sm"
      >
        <PlayCircle class="size-7" />
      </div>
    </div>

    <div class="mt-6 flex items-end justify-between">
      <p class="text-foreground font-mono text-4xl font-semibold">{{ elapsedLabel }}</p>
      <button
        v-if="runningEntry"
        class="bg-primary text-primary-foreground rounded-2xl px-5 py-2 text-sm font-medium transition hover:opacity-90"
        type="button"
        @click="emit('stop')"
      >
        {{ t('tasks.stop') }}
      </button>
    </div>
  </section>
</template>
