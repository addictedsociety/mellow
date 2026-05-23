<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MarkdownEditor from '@/components/markdown/MarkdownEditor.vue'
import NxrTimePill from '@/components/NxrTimePill.vue'
import StatusBadge from '@/components/tasks/StatusBadge.vue'
import { useTasksStore } from '@/stores/tasks'
import { useTimerStore } from '@/stores/timer'
import type { TaskStatus } from '@/types/task.type'
import { formatDate, formatDuration } from '@/utils/time'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const { id } = defineProps<{
  id: string
}>()

const router = useRouter()
const { t } = useI18n()
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

const title = ref('')
const descriptionMarkdown = ref('')
const status = ref<TaskStatus>('todo')

const taskId = computed(() => Number(id))
const task = computed(() => tasksStore.tasks.find((currentTask) => currentTask.id === taskId.value))
const cumulativeLabel = computed(() =>
  task.value ? timerStore.getCumulativeLabel(task.value.id, task.value.totalSeconds) : ''
)

const save = async () => {
  await tasksStore.updateTask(taskId.value, {
    title: title.value,
    descriptionMarkdown: descriptionMarkdown.value,
    status: status.value
  })
}

const remove = async () => {
  await tasksStore.deleteTask(taskId.value)
  await router.push({ name: 'tasks' })
}

onMounted(async () => {
  await tasksStore.loadTasks()
})

watchEffect(() => {
  if (!task.value) {
    return
  }

  title.value = task.value.title
  descriptionMarkdown.value = task.value.descriptionMarkdown
  status.value = task.value.status
})
</script>

<template>
  <div v-if="task" class="scrollbar h-full overflow-y-auto pr-4">
    <section class="border-border bg-card text-card-foreground rounded-[2rem] border p-6 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <StatusBadge :status="task.status" :is-tracking="task.isRunning" />
            <span class="text-muted-foreground text-sm select-none">
              {{ formatDuration(task.totalSeconds) }}
            </span>
          </div>
          <h1 class="mt-4 text-3xl font-semibold">{{ task.title }}</h1>
          <p class="text-muted-foreground mt-2 text-sm">{{ formatDate(task.createdAt) }}</p>
        </div>

        <NxrTimePill v-if="task.isRunning" :time="cumulativeLabel" is-live />
        <NxrTimePill v-else-if="task.totalSeconds > 0" :time="formatDuration(task.totalSeconds)" />
      </div>

      <form class="mt-6 space-y-4" @submit.prevent="save">
        <label class="text-muted-foreground block text-sm font-medium select-none">
          {{ t('tasks.titleLabel') }}
          <Input
            v-model="title"
            class="border-border bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3"
          />
        </label>

        <label class="text-muted-foreground block text-sm font-medium select-none">
          {{ t('tasks.status') }}
          <Select v-model="status">
            <SelectTrigger
              class="border-border bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3"
            >
              <SelectValue :placeholder="t('tasks.status')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">{{ t('status.todo') }}</SelectItem>
              <SelectItem value="in_progress">{{ t('status.in_progress') }}</SelectItem>
              <SelectItem value="blocked">{{ t('status.blocked') }}</SelectItem>
              <SelectItem value="done">{{ t('status.done') }}</SelectItem>
            </SelectContent>
          </Select>
        </label>

        <label class="text-muted-foreground block text-sm font-medium select-none">
          {{ t('tasks.description') }}
          <MarkdownEditor v-model="descriptionMarkdown" class="mt-2" />
        </label>

        <div class="flex gap-2">
          <Button type="submit" class="select-none">
            {{ t('tasks.save') }}
          </Button>
          <Button type="button" variant="outline" class="select-none" @click="remove">
            {{ t('tasks.delete') }}
          </Button>
        </div>
      </form>
    </section>
  </div>
</template>
