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
    class="bg-card text-card-foreground rounded-3xl border p-5 shadow-sm transition"
    :class="task.isRunning ? 'border-primary shadow-primary/20' : 'border-border'"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <RouterLink
          class="text-foreground hover:text-primary text-lg font-semibold underline underline-offset-4 transition"
          :to="{ name: 'task-detail', params: { id: task.id } }"
        >
          {{ task.title }}
        </RouterLink>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge :status="task.status" :is-tracking="task.isRunning" />
          <span class="text-muted-foreground inline-flex items-center gap-1 text-xs">
            <Clock3 class="size-3.5" />
            {{ formatMinutes(task.totalMinutes) }}
          </span>
          <span v-if="task.completedAt" class="text-muted-foreground text-xs">
            {{ formatDate(task.completedAt) }}
          </span>
        </div>
      </div>
    </div>

    <MarkdownPreview v-if="preview" class="mt-4 line-clamp-3" :content="preview" />

    <div v-if="!isReadonly" class="mt-5 flex flex-wrap gap-2">
      <button
        v-if="!task.isRunning && task.status !== 'done'"
        class="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition select-none hover:opacity-90"
        type="button"
        @click="emit('start', task.id)"
      >
        <Play class="size-4" />
        {{ t('tasks.start') }}
      </button>
      <button
        v-if="task.isRunning"
        class="bg-destructive text-destructive-foreground inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition select-none hover:opacity-90"
        type="button"
        @click="emit('stop')"
      >
        <Square class="size-4" />
        {{ t('tasks.stop') }}
      </button>
      <button
        v-if="task.status !== 'done'"
        class="bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground rounded-2xl px-4 py-2 text-sm font-medium transition select-none"
        type="button"
        @click="emit('complete', task.id)"
      >
        {{ t('tasks.complete') }}
      </button>
      <button
        class="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-2xl px-4 py-2 text-sm font-medium transition select-none"
        type="button"
        @click="emit('delete', task.id)"
      >
        {{ t('tasks.delete') }}
      </button>
    </div>
  </article>
</template>
