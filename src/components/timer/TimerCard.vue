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
  <section class="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
    <div class="flex items-center justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-amber-700">{{ t('dashboard.activeTask') }}</p>
        <h2 class="mt-2 text-2xl font-semibold text-stone-900">
          {{ runningEntry?.taskTitle ?? t('dashboard.noActiveTask') }}
        </h2>
      </div>
      <div class="flex size-14 items-center justify-center rounded-3xl bg-white text-amber-700 shadow-sm">
        <PlayCircle class="size-7" />
      </div>
    </div>

    <div class="mt-6 flex items-end justify-between">
      <p class="font-mono text-4xl font-semibold text-stone-900">{{ elapsedLabel }}</p>
      <button
        v-if="runningEntry"
        class="rounded-2xl bg-stone-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
        type="button"
        @click="emit('stop')"
      >
        {{ t('tasks.stop') }}
      </button>
    </div>
  </section>
</template>
