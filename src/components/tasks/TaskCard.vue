<script setup lang="ts">
import { Clock3, Play, Square } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownPreview from '@/components/markdown/MarkdownPreview.vue'
import type { Task } from '@/types/task.type'
import { formatDate, formatMinutes } from '@/utils/time'
import StatusBadge from './StatusBadge.vue'

const { task, isReadonly = false } = defineProps<{
  task: Task
  isReadonly?: boolean
}>()

const emit = defineEmits<{
  start: [taskId: number]
  stop: []
  complete: [taskId: number]
  delete: [taskId: number]
}>()

const { t } = useI18n()

const preview = computed(() => task.descriptionMarkdown.slice(0, 180))
</script>

<template>
  <article
    class="rounded-3xl border bg-white p-5 shadow-sm transition"
    :class="task.isRunning ? 'border-amber-300 shadow-amber-100' : 'border-stone-200'"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <RouterLink
          class="text-lg font-semibold text-stone-900 transition hover:text-amber-700"
          :to="{ name: 'task-detail', params: { id: task.id } }"
        >
          {{ task.title }}
        </RouterLink>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge :status="task.status" :is-tracking="task.isRunning" />
          <span class="inline-flex items-center gap-1 text-xs text-stone-500">
            <Clock3 class="size-3.5" />
            {{ formatMinutes(task.totalMinutes) }}
          </span>
          <span v-if="task.completedAt" class="text-xs text-stone-500">
            {{ formatDate(task.completedAt) }}
          </span>
        </div>
      </div>
    </div>

    <MarkdownPreview v-if="preview" class="mt-4 line-clamp-3" :content="preview" />

    <div v-if="!isReadonly" class="mt-5 flex flex-wrap gap-2">
      <button
        v-if="!task.isRunning && task.status !== 'done'"
        class="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
        type="button"
        @click="emit('start', task.id)"
      >
        <Play class="size-4" />
        {{ t('tasks.start') }}
      </button>
      <button
        v-if="task.isRunning"
        class="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
        type="button"
        @click="emit('stop')"
      >
        <Square class="size-4" />
        {{ t('tasks.stop') }}
      </button>
      <button
        v-if="task.status !== 'done'"
        class="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-200"
        type="button"
        @click="emit('complete', task.id)"
      >
        {{ t('tasks.complete') }}
      </button>
      <button
        class="rounded-2xl bg-stone-100 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-200"
        type="button"
        @click="emit('delete', task.id)"
      >
        {{ t('tasks.delete') }}
      </button>
    </div>
  </article>
</template>
