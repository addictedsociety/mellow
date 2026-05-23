<script setup lang="ts">
import { CheckCircle2 } from 'lucide-vue-next'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TaskList from '@/components/tasks/TaskList.vue'
import VeFilterBar from '@/components/VeFilterBar.vue'
import { useTasksStore } from '@/stores/tasks'
import { useTaskFilter } from '@/utils/useTaskFilter'

const { t } = useI18n()
const tasksStore = useTasksStore()

const { searchQuery, sortField, sortOrder, filteredAndSorted } = useTaskFilter(
  () => tasksStore.doneTasks,
  { initialSortField: 'createdAt', initialSortOrder: 'desc' }
)

const sortFields = computed(() => [
  { value: 'title', label: t('filter.fields.title') },
  { value: 'createdAt', label: t('filter.fields.createdAt') },
  { value: 'totalMinutes', label: t('filter.fields.totalMinutes') }
])

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
          <h1 class="text-3xl font-semibold select-none">{{ t('nav.completed') }}</h1>
        </div>
        <p class="text-muted-foreground mt-1 select-none">{{ t('tasks.completedReadonly') }}</p>
      </div>
    </header>

    <VeFilterBar
      v-model:search="searchQuery"
      v-model:sort-field="sortField"
      v-model:sort-order="sortOrder"
      :sort-fields="sortFields"
    />

    <TaskList
      :title="t('status.done')"
      :tasks="filteredAndSorted"
      :empty-text="t('tasks.empty')"
      is-readonly
    />
  </div>
</template>
