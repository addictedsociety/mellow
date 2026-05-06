<script setup lang="ts">
import MarkdownEditor from '@/components/markdown/MarkdownEditor.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import ManualTimeEntryDialog from '@/components/timer/ManualTimeEntryDialog.vue'
import TimeEntryList from '@/components/timer/TimeEntryList.vue'
import { createManualTimeEntry, listTimeEntries } from '@/services/time-entry.service'
import { useTasksStore } from '@/stores/tasks'
import { useTimerStore } from '@/stores/timer'
import type { TaskStatus } from '@/types/task.type'
import type { ManualTimeEntryPayload, TimeEntry } from '@/types/time-entry.type'
import { ListTodo } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
  <div class="scrollbar grid h-full gap-6 overflow-y-auto pr-4 xl:grid-cols-[420px_1fr]">
    <aside class="space-y-4">
      <header>
        <div class="flex flex-col items-center justify-center text-center">
          <div class="flex items-center gap-2">
            <ListTodo class="size-8" />
            <h1 class="text-3xl font-semibold">{{ t('tasks.title') }}</h1>
          </div>
          <p class="text-muted-foreground mt-1">{{ t('tasks.subtitle') }}</p>
        </div>
      </header>

      <form
        class="border-border bg-card text-card-foreground rounded-[2rem] border p-5 shadow-sm"
        @submit.prevent="submitTask"
      >
        <h2 class="text-lg font-semibold">{{ t('tasks.newTask') }}</h2>

        <label class="text-muted-foreground mt-4 block text-sm font-medium">
          {{ t('tasks.titleLabel') }}
          <input
            v-model="title"
            class="border-border bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3"
            required
          />
        </label>

        <label class="text-muted-foreground mt-4 block text-sm font-medium">
          {{ t('tasks.status') }}
          <select
            v-model="status"
            class="border-border bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3"
          >
            <option value="todo">{{ t('status.todo') }}</option>
            <option value="in_progress">{{ t('status.in_progress') }}</option>
          </select>
        </label>

        <label class="text-muted-foreground mt-4 block text-sm font-medium">
          {{ t('tasks.description') }}
          <MarkdownEditor v-model="descriptionMarkdown" class="mt-2" />
        </label>

        <button
          class="bg-primary text-primary-foreground mt-5 w-full rounded-2xl px-4 py-3 font-medium transition hover:opacity-90"
          type="submit"
        >
          {{ t('tasks.create') }}
        </button>
      </form>

      <ManualTimeEntryDialog :tasks="tasksStore.tasks" @save="addManualEntry" />
    </aside>

    <section class="space-y-6">
      <p
        v-if="timerStore.error"
        class="bg-accent text-accent-foreground rounded-2xl px-4 py-3 text-sm"
      >
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
