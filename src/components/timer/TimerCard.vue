<script setup lang="ts">
import { Timer } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import type { TimeEntry } from '@/types/time-entry.type'

const { runningEntries, totalElapsedLabel } = defineProps<{
  runningEntries: TimeEntry[]
  totalElapsedLabel: string
}>()

const { t } = useI18n()
</script>

<template>
  <section
    class="border-primary/40 bg-accent text-accent-foreground rounded-[2rem] border p-6 shadow-sm"
  >
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-primary text-sm font-medium select-none">
          {{ t('dashboard.activeTimers') }}
        </p>
        <h2 class="text-foreground mt-2 text-2xl font-semibold select-none">
          {{
            runningEntries.length === 0
              ? t('dashboard.noActiveTimers')
              : t('dashboard.activeTimersCount', { count: runningEntries.length })
          }}
        </h2>
      </div>
      <div
        class="bg-card text-primary flex size-14 items-center justify-center rounded-3xl shadow-sm"
      >
        <Timer class="size-7" />
      </div>
    </div>

    <div class="mt-6 flex items-end justify-between">
      <p class="text-foreground font-mono text-4xl font-semibold tabular-nums">
        {{ totalElapsedLabel }}
      </p>
    </div>

    <ul v-if="runningEntries.length" class="mt-5 space-y-2">
      <li
        v-for="entry in runningEntries"
        :key="entry.id"
        class="border-border/40 bg-card/60 text-card-foreground flex items-center justify-between gap-3 rounded-2xl border px-3 py-2 text-sm"
      >
        <span class="truncate font-medium">{{ entry.taskTitle }}</span>
      </li>
    </ul>
  </section>
</template>
