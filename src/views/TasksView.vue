<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownEditor from '@/components/markdown/MarkdownEditor.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import ManualTimeEntryDialog from '@/components/timer/ManualTimeEntryDialog.vue'
import TimeEntryList from '@/components/timer/TimeEntryList.vue'
import { createManualTimeEntry, listTimeEntries } from '@/services/time-entry.service'
import { useTasksStore } from '@/stores/tasks'
import { useTimerStore } from '@/stores/timer'
import type { TaskStatus } from '@/types/task.type'
import type { ManualTimeEntryPayload, TimeEntry } from '@/types/time-entry.type'

const { t } = useI18n()
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

const title = ref('')
const descriptionMarkdown = ref('')
const status = ref<TaskStatus>('todo')
const entries = ref<TimeEntry[]>([])

const groupedTasks = computed(() => [
  { title: t('status.todo'), tasks: tasksStore.todoTasks },
  { title: t('status.in_progress'), tasks: tasksStore.inProgressTasks }
])

const resetForm = () => {
  title.value = ''
  descriptionMarkdown.value = ''
  status.value = 'todo'
}

const submitTask = async () => {
  await tasksStore.createTask({
    title: title.value,
    descriptionMarkdown: descriptionMarkdown.value,
    status: status.value
  })
  resetForm()
}

const addManualEntry = async (payload: ManualTimeEntryPayload) => {
  await createManualTimeEntry(payload)
  entries.value = await listTimeEntries()
  await tasksStore.loadTasks()
}

onMounted(async () => {
  await Promise.all([tasksStore.loadTasks(), timerStore.loadRunningEntry()])
  entries.value = await listTimeEntries()
})
</script>

<template>
  <div class="grid gap-6 xl:grid-cols-[420px_1fr]">
    <aside class="space-y-4">
      <header>
        <h1 class="text-3xl font-semibold">{{ t('tasks.title') }}</h1>
        <p class="mt-1 text-stone-500">{{ t('tasks.subtitle') }}</p>
      </header>

      <form class="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm" @submit.prevent="submitTask">
        <h2 class="text-lg font-semibold">{{ t('tasks.newTask') }}</h2>

        <label class="mt-4 block text-sm font-medium text-stone-600">
          {{ t('tasks.titleLabel') }}
          <input
            v-model="title"
            class="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3"
            required
          />
        </label>

        <label class="mt-4 block text-sm font-medium text-stone-600">
          {{ t('tasks.status') }}
          <select v-model="status" class="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3">
            <option value="todo">{{ t('status.todo') }}</option>
            <option value="in_progress">{{ t('status.in_progress') }}</option>
          </select>
        </label>

        <label class="mt-4 block text-sm font-medium text-stone-600">
          {{ t('tasks.description') }}
          <MarkdownEditor v-model="descriptionMarkdown" class="mt-2" />
        </label>

        <button class="mt-5 w-full rounded-2xl bg-stone-900 px-4 py-3 font-medium text-white" type="submit">
          {{ t('tasks.create') }}
        </button>
      </form>

      <ManualTimeEntryDialog :tasks="tasksStore.tasks" @save="addManualEntry" />
    </aside>

    <section class="space-y-6">
      <p v-if="timerStore.error" class="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
        {{ timerStore.error }}
      </p>

      <div class="grid gap-6 xl:grid-cols-2">
        <TaskList
          v-for="group in groupedTasks"
          :key="group.title"
          :title="group.title"
          :tasks="group.tasks"
          :empty-text="t('tasks.empty')"
          @start="timerStore.startTimer"
          @stop="timerStore.stopTimer"
          @complete="tasksStore.completeTask"
          @delete="tasksStore.deleteTask"
        />
      </div>

      <TimeEntryList :entries="entries" />
    </section>
  </div>
</template>
