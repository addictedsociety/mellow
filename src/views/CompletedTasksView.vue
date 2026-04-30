<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TaskList from '@/components/tasks/TaskList.vue'
import { useTasksStore } from '@/stores/tasks'

const { t } = useI18n()
const tasksStore = useTasksStore()

onMounted(() => {
  tasksStore.loadTasks()
})
</script>

<template>
  <div class="space-y-6">
    <header>
      <h1 class="text-3xl font-semibold">{{ t('nav.completed') }}</h1>
      <p class="mt-1 text-stone-500">{{ t('tasks.completedReadonly') }}</p>
    </header>

    <TaskList
      :title="t('status.done')"
      :tasks="tasksStore.doneTasks"
      :empty-text="t('tasks.empty')"
      is-readonly
    />
  </div>
</template>
