<script setup lang="ts">
import TaskList from '@/components/tasks/TaskList.vue'
import { useTasksStore } from '@/stores/tasks'
import { CheckCircle2 } from 'lucide-vue-next'
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const tasksStore = useTasksStore()

onMounted(() => {
  tasksStore.loadTasks()
})
</script>

<template>
  <div class="scrollbar h-full space-y-6 overflow-y-auto pr-4">
    <header>
      <div class="flex flex-col items-center justify-center text-center">
        <div class="flex items-center gap-2">
          <CheckCircle2 class="size-7" />
          <h1 class="text-3xl font-semibold">{{ t('nav.completed') }}</h1>
        </div>
        <p class="text-muted-foreground mt-1">{{ t('tasks.completedReadonly') }}</p>
      </div>
    </header>

    <TaskList
      :title="t('status.done')"
      :tasks="tasksStore.doneTasks"
      :empty-text="t('tasks.empty')"
      is-readonly
    />
  </div>
</template>
