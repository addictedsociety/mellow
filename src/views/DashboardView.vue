<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LayoutDashboard } from 'lucide-vue-next'
import NxrFilterBar from '@/components/NxrFilterBar.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import TimerCard from '@/components/timer/TimerCard.vue'
import { getDashboardSummary } from '@/services/task.service'
import { useTasksStore } from '@/stores/tasks'
import { useTimerStore } from '@/stores/timer'
import type { DashboardSummary } from '@/types/dashboard.type'
import { formatDuration } from '@/utils/time'
import { useTaskFilter } from '@/utils/useTaskFilter'

const { t } = useI18n()
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

const summary = ref<DashboardSummary | null>(null)

const { searchQuery, sortField, sortOrder, filteredAndSorted } = useTaskFilter(
  () => tasksStore.tasks,
  { initialSortField: 'createdAt', initialSortOrder: 'desc' }
)

const sortFields = computed(() => [
  { value: 'title', label: t('filter.fields.title') },
  { value: 'createdAt', label: t('filter.fields.createdAt') },
  { value: 'status', label: t('filter.fields.status') },
  { value: 'totalSeconds', label: t('filter.fields.totalTime') }
])

const todayTotal = computed(() => formatDuration(summary.value?.todaySeconds ?? 0))

const filteredTodo = computed(() =>
  filteredAndSorted.value.filter((task) => task.status === 'todo')
)
const filteredInProgress = computed(() =>
  filteredAndSorted.value.filter((task) => task.status === 'in_progress')
)
const filteredDone = computed(() =>
  filteredAndSorted.value.filter((task) => task.status === 'done')
)

const loadDashboard = async () => {
  summary.value = await getDashboardSummary()
  await timerStore.loadRunningEntries()
  await tasksStore.loadTasks()
}

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="scrollbar h-full space-y-6 overflow-y-auto pr-4">
    <header>
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center gap-2">
          <LayoutDashboard class="size-7" />
          <h1 class="text-3xl font-semibold select-none">{{ t('dashboard.title') }}</h1>
        </div>
        <p class="text-muted-foreground mt-1 select-none">{{ t('dashboard.subtitle') }}</p>
      </div>
    </header>

    <div class="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <TimerCard
        :running-entries="timerStore.runningEntries"
        :total-elapsed-label="timerStore.totalElapsedLabel"
      />

      <section
        class="border-border bg-card text-card-foreground rounded-[2rem] border p-6 shadow-sm"
      >
        <p class="text-muted-foreground text-sm font-medium select-none">
          {{ t('dashboard.todayTotal') }}
        </p>
        <p class="mt-4 text-4xl font-semibold select-none">{{ todayTotal }}</p>
      </section>
    </div>

    <NxrFilterBar
      v-model:search="searchQuery"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      :sort-fields="sortFields"
    />

    <div class="grid gap-6 xl:grid-cols-3">
      <TaskList
        :title="t('status.todo')"
        :tasks="filteredTodo"
        :empty-text="t('tasks.empty')"
        @start="timerStore.startTimer"
        @stop="timerStore.stopTimer"
        @complete="tasksStore.completeTask"
        @delete="tasksStore.deleteTask"
      />
      <TaskList
        :title="t('status.in_progress')"
        :tasks="filteredInProgress"
        :empty-text="t('tasks.empty')"
        @start="timerStore.startTimer"
        @stop="timerStore.stopTimer"
        @complete="tasksStore.completeTask"
        @delete="tasksStore.deleteTask"
      />
      <TaskList
        :title="t('status.done')"
        :tasks="filteredDone"
        :empty-text="t('tasks.empty')"
        is-readonly
        @delete="tasksStore.deleteTask"
      />
    </div>
  </div>
</template>
