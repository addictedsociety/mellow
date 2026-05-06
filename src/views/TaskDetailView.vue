<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MarkdownEditor from '@/components/markdown/MarkdownEditor.vue'
import MarkdownPreview from '@/components/markdown/MarkdownPreview.vue'
import StatusBadge from '@/components/tasks/StatusBadge.vue'
import TimeEntryList from '@/components/timer/TimeEntryList.vue'
import { listTimeEntries } from '@/services/time-entry.service'
import { useTasksStore } from '@/stores/tasks'
import type { TaskStatus } from '@/types/task.type'
import type { TimeEntry } from '@/types/time-entry.type'
import { formatDate, formatMinutes } from '@/utils/time'

const { id } = defineProps<{
  id: string
}>()

const router = useRouter()
const { t } = useI18n()
const tasksStore = useTasksStore()

const entries = ref<TimeEntry[]>([])
const title = ref('')
const descriptionMarkdown = ref('')
const status = ref<TaskStatus>('todo')

const taskId = computed(() => Number(id))
const task = computed(() => tasksStore.tasks.find((currentTask) => currentTask.id === taskId.value))
const isReadonly = computed(() => task.value?.status === 'done')

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
  entries.value = await listTimeEntries(taskId.value)
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
  <div
    v-if="task"
    class="scrollbar grid h-full gap-6 overflow-y-auto pr-4 xl:grid-cols-[1fr_420px]"
  >
    <section class="border-border bg-card text-card-foreground rounded-[2rem] border p-6 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <StatusBadge :status="task.status" :is-tracking="task.isRunning" />
            <span class="text-muted-foreground text-sm">{{
              formatMinutes(task.totalMinutes)
            }}</span>
          </div>
          <h1 class="mt-4 text-3xl font-semibold">{{ task.title }}</h1>
          <p class="text-muted-foreground mt-2 text-sm">{{ formatDate(task.createdAt) }}</p>
        </div>
      </div>

      <div v-if="isReadonly" class="mt-6">
        <p class="bg-muted text-muted-foreground mb-4 rounded-2xl px-4 py-3 text-sm">
          {{ t('tasks.completedReadonly') }}
        </p>
        <MarkdownPreview :content="task.descriptionMarkdown" />
      </div>

      <form v-else class="mt-6 space-y-4" @submit.prevent="save">
        <label class="text-muted-foreground block text-sm font-medium">
          {{ t('tasks.titleLabel') }}
          <input
            v-model="title"
            class="border-border bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3"
          />
        </label>

        <label class="text-muted-foreground block text-sm font-medium">
          {{ t('tasks.status') }}
          <select
            v-model="status"
            class="border-border bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3"
          >
            <option value="todo">{{ t('status.todo') }}</option>
            <option value="in_progress">{{ t('status.in_progress') }}</option>
            <option value="done">{{ t('status.done') }}</option>
          </select>
        </label>

        <label class="text-muted-foreground block text-sm font-medium">
          {{ t('tasks.description') }}
          <MarkdownEditor v-model="descriptionMarkdown" class="mt-2" />
        </label>

        <div class="flex gap-2">
          <button
            class="bg-primary text-primary-foreground rounded-2xl px-5 py-3 text-sm font-medium transition hover:opacity-90"
            type="submit"
          >
            {{ t('tasks.save') }}
          </button>
          <button
            class="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-2xl px-5 py-3 text-sm font-medium transition"
            type="button"
            @click="remove"
          >
            {{ t('tasks.delete') }}
          </button>
        </div>
      </form>
    </section>

    <TimeEntryList :entries="entries" />
  </div>
</template>
