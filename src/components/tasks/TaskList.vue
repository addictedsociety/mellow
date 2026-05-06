<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
import type { Task } from '@/types/task.type'
import TaskCard from './TaskCard.vue'

const { title, tasks, isReadonly = false, emptyText } = defineProps<{
  title: string
  tasks: Task[]
  isReadonly?: boolean
  emptyText: string
}>()

const emit = defineEmits<{
  start: [taskId: number]
  stop: []
  complete: [taskId: number]
  delete: [taskId: number]
}>()
</script>

<template>
  <section>
    <h2 class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {{ title }}
    </h2>

    <div v-if="tasks.length" class="space-y-3">
      <TaskCard
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        :is-readonly="isReadonly"
        @start="emit('start', $event)"
        @stop="emit('stop')"
        @complete="emit('complete', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
    <EmptyState v-else :title="emptyText" />
  </section>
</template>
