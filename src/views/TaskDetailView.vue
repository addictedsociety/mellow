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
  <div v-if="task" class="grid gap-6 xl:grid-cols-[1fr_420px]">
    <section class="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <StatusBadge :status="task.status" :is-tracking="task.isRunning" />
            <span class="text-sm text-stone-500">{{ formatMinutes(task.totalMinutes) }}</span>
          </div>
          <h1 class="mt-4 text-3xl font-semibold">{{ task.title }}</h1>
          <p class="mt-2 text-sm text-stone-500">{{ formatDate(task.createdAt) }}</p>
        </div>
      </div>

      <div v-if="isReadonly" class="mt-6">
        <p class="mb-4 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-500">
          {{ t('tasks.completedReadonly') }}
        </p>
        <MarkdownPreview :content="task.descriptionMarkdown" />
      </div>

      <form v-else class="mt-6 space-y-4" @submit.prevent="save">
        <label class="block text-sm font-medium text-stone-600">
          {{ t('tasks.titleLabel') }}
          <input v-model="title" class="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3" />
        </label>

        <label class="block text-sm font-medium text-stone-600">
          {{ t('tasks.status') }}
          <select v-model="status" class="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3">
            <option value="todo">{{ t('status.todo') }}</option>
            <option value="in_progress">{{ t('status.in_progress') }}</option>
            <option value="done">{{ t('status.done') }}</option>
          </select>
        </label>

        <label class="block text-sm font-medium text-stone-600">
          {{ t('tasks.description') }}
          <MarkdownEditor v-model="descriptionMarkdown" class="mt-2" />
        </label>

        <div class="flex gap-2">
          <button class="rounded-2xl bg-stone-900 px-5 py-3 text-sm font-medium text-white" type="submit">
            {{ t('tasks.save') }}
          </button>
          <button
            class="rounded-2xl bg-stone-100 px-5 py-3 text-sm font-medium text-stone-600"
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
