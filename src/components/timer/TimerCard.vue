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
  <section class="rounded-[2rem] border border-primary/40 bg-accent p-6 text-accent-foreground shadow-sm">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-primary">{{ t('dashboard.activeTask') }}</p>
        <h2 class="mt-2 text-2xl font-semibold text-foreground">
          {{ runningEntry?.taskTitle ?? t('dashboard.noActiveTask') }}
        </h2>
      </div>
      <div class="flex size-14 items-center justify-center rounded-3xl bg-card text-primary shadow-sm">
        <PlayCircle class="size-7" />
      </div>
    </div>

    <div class="mt-6 flex items-end justify-between">
      <p class="font-mono text-4xl font-semibold text-foreground">{{ elapsedLabel }}</p>
      <button
        v-if="runningEntry"
        class="rounded-2xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        type="button"
        @click="emit('stop')"
      >
        {{ t('tasks.stop') }}
      </button>
    </div>
  </section>
</template>
