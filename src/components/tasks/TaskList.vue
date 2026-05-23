<script setup lang="ts">
import { CircleOff } from 'lucide-vue-next'
import EmptyState from '@/components/EmptyState.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Task } from '@/types/task.type'
import TaskCard from './TaskCard.vue'

const {
  title,
  tasks,
  isReadonly = false,
  emptyText
} = defineProps<{
  title: string
  tasks: Task[]
  isReadonly?: boolean
  emptyText: string
}>()

const emit = defineEmits<{
  start: [taskId: number]
  stop: [taskId: number]
  complete: [taskId: number]
  delete: [taskId: number]
}>()
</script>

<template>
  <Card class="rounded-3xl">
    <CardHeader>
      <CardTitle class="text-lg select-none">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="tasks.length" class="flex flex-col gap-4">
        <TaskCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :is-readonly="isReadonly"
          @start="emit('start', $event)"
          @stop="emit('stop', $event)"
          @complete="emit('complete', $event)"
          @delete="emit('delete', $event)"
        />
      </div>
      <EmptyState v-else :title="emptyText" :icon="CircleOff" />
    </CardContent>
  </Card>
</template>
