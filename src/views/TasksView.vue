<script setup lang="ts">
import { ListTodo } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownEditor from '@/components/markdown/MarkdownEditor.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import NxrFilterBar from '@/components/NxrFilterBar.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useTasksStore } from '@/stores/tasks'
import { useTimerStore } from '@/stores/timer'
import type { TaskStatus } from '@/types/task.type'
import { useTaskFilter } from '@/utils/useTaskFilter'

const { t } = useI18n()
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

const title = ref('')
const descriptionMarkdown = ref('')
const status = ref<TaskStatus>('todo')

const { searchQuery, sortField, sortOrder, filteredAndSorted } = useTaskFilter(
  () => tasksStore.activeTasks,
  { initialSortField: 'status', initialSortOrder: 'asc' }
)

const sortFields = computed(() => [
  { value: 'title', label: t('filter.fields.title') },
  { value: 'createdAt', label: t('filter.fields.createdAt') },
  { value: 'status', label: t('filter.fields.status') },
  { value: 'totalSeconds', label: t('filter.fields.totalTime') }
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

onMounted(async () => {
  await Promise.all([tasksStore.loadTasks(), timerStore.loadRunningEntries()])
})
</script>

<template>
  <div class="scrollbar grid h-full gap-6 overflow-y-auto pr-4 xl:grid-cols-[420px_1fr]">
    <aside class="space-y-4">
      <header>
        <div class="flex flex-col items-center justify-center text-center">
          <div class="flex items-center gap-2">
            <ListTodo class="size-8" />
            <h1 class="text-3xl font-semibold select-none">{{ t('tasks.title') }}</h1>
          </div>
          <p class="text-muted-foreground mt-1 select-none">{{ t('tasks.subtitle') }}</p>
        </div>
      </header>

      <form
        class="border-border bg-card text-card-foreground rounded-[2rem] border p-5 shadow-sm"
        @submit.prevent="submitTask"
      >
        <h2 class="text-start text-lg font-semibold select-none">{{ t('tasks.newTask') }}</h2>

        <label class="text-muted-foreground mt-4 block text-start text-sm font-medium select-none">
          {{ t('tasks.titleLabel') }}
          <Input
            v-model="title"
            class="border-border bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3"
            required
          />
        </label>

        <label class="text-muted-foreground mt-4 block text-start text-sm font-medium select-none">
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
            </SelectContent>
          </Select>
        </label>

        <label class="text-muted-foreground mt-4 block text-start text-sm font-medium select-none">
          {{ t('tasks.description') }}
          <MarkdownEditor v-model="descriptionMarkdown" class="mt-2" />
        </label>
        <div class="flex justify-center">
          <Button type="submit" class="mt-4 justify-center select-none">
            {{ t('tasks.create') }}
          </Button>
        </div>
      </form>
    </aside>

    <section class="space-y-6">
      <p
        v-if="timerStore.error"
        class="bg-accent text-accent-foreground rounded-2xl px-4 py-3 text-sm select-none"
      >
        {{ timerStore.error }}
      </p>

      <NxrFilterBar
        v-model:search="searchQuery"
        v-model:sort-field="sortField"
        v-model:sort-order="sortOrder"
        :sort-fields="sortFields"
      />

      <TaskList
        :title="t('tasks.title')"
        :tasks="filteredAndSorted"
        :empty-text="t('tasks.empty')"
        @start="timerStore.startTimer"
        @stop="timerStore.stopTimer"
        @complete="tasksStore.completeTask"
        @delete="tasksStore.deleteTask"
      />
    </section>
  </div>
</template>
