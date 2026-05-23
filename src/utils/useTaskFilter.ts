import { useFuse } from '@vueuse/integrations/useFuse'
import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
import type { Task, TaskStatus } from '@/types/task.type'

export type TaskSortField = 'title' | 'createdAt' | 'status' | 'totalSeconds'
export type SortOrder = 'asc' | 'desc'

const STATUS_ORDER: Record<TaskStatus, number> = {
  in_progress: 0,
  todo: 1,
  blocked: 2,
  done: 3
}

export const useTaskFilter = (
  source: MaybeRefOrGetter<Task[]>,
  options?: {
    initialSortField?: TaskSortField
    initialSortOrder?: SortOrder
  }
) => {
  const searchQuery = ref('')
  const sortField = ref<TaskSortField>(options?.initialSortField ?? 'createdAt')
  const sortOrder = ref<SortOrder>(options?.initialSortOrder ?? 'desc')

  const tasks = computed(() => toValue(source))

  const { results } = useFuse(searchQuery, tasks, {
    fuseOptions: {
      keys: ['title', 'descriptionMarkdown'],
      threshold: 0.4,
      ignoreLocation: true,
      shouldSort: false
    },
    matchAllWhenSearchEmpty: true
  })

  const compareTasks = (a: Task, b: Task): number => {
    switch (sortField.value) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'createdAt':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'status':
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      case 'totalSeconds':
        return a.totalSeconds - b.totalSeconds
    }
  }

  const filteredAndSorted = computed(() => {
    const list = results.value.map((result) => result.item)
    const direction = sortOrder.value === 'asc' ? 1 : -1

    return [...list].sort((a, b) => compareTasks(a, b) * direction)
  })

  return {
    searchQuery,
    sortField,
    sortOrder,
    filteredAndSorted
  }
}
