<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { LayoutDashboard } from 'lucide-vue-next'
import TaskList from '@/components/tasks/TaskList.vue'
import TimerCard from '@/components/timer/TimerCard.vue'
import { getDashboardSummary } from '@/services/task.service'
import { useTasksStore } from '@/stores/tasks'
import { useTimerStore } from '@/stores/timer'
import type { DashboardSummary } from '@/types/dashboard.type'
import { formatMinutes } from '@/utils/time'

const { t } = useI18n()
const tasksStore = useTasksStore()
const timerStore = useTimerStore()

const summary = ref<DashboardSummary | null>(null)

const todayTotal = computed(() => formatMinutes(summary.value?.todayMinutes ?? 0))

const loadDashboard = async () => {
  summary.value = await getDashboardSummary()
  await timerStore.loadRunningEntry()
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
          <h1 class="text-3xl font-semibold">{{ t('dashboard.title') }}</h1>
        </div>
        <p class="text-muted-foreground mt-1">{{ t('dashboard.subtitle') }}</p>
      </div>
    </header>

    <div class="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <TimerCard
        :running-entry="timerStore.runningEntry"
        :elapsed-label="timerStore.elapsedLabel"
        @stop="timerStore.stopTimer"
      />

      <section
        class="border-border bg-card text-card-foreground rounded-[2rem] border p-6 shadow-sm"
      >
        <p class="text-muted-foreground text-sm font-medium">{{ t('dashboard.todayTotal') }}</p>
        <p class="mt-4 text-4xl font-semibold">{{ todayTotal }}</p>
      </section>
    </div>

    <div class="grid gap-6 xl:grid-cols-3">
      <TaskList
        :title="t('status.todo')"
        :tasks="tasksStore.todoTasks"
        :empty-text="t('tasks.empty')"
        @start="timerStore.startTimer"
        @stop="timerStore.stopTimer"
        @complete="tasksStore.completeTask"
        @delete="tasksStore.deleteTask"
      />
      <TaskList
        :title="t('status.in_progress')"
        :tasks="tasksStore.inProgressTasks"
        :empty-text="t('tasks.empty')"
        @start="timerStore.startTimer"
        @stop="timerStore.stopTimer"
        @complete="tasksStore.completeTask"
        @delete="tasksStore.deleteTask"
      />
      <TaskList
        :title="t('status.done')"
        :tasks="tasksStore.doneTasks"
        :empty-text="t('tasks.empty')"
        is-readonly
      />
    </div>
  </div>
</template>
