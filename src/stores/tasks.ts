import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  completeTask as requestCompleteTask,
  createTask as requestCreateTask,
  deleteTask as requestDeleteTask,
  listTasks as requestTasks,
  updateTask as requestUpdateTask
} from '@/services/task.service'
import type { Task, TaskPayload, TaskStatus } from '@/types/task.type'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const error = ref('')

  const todoTasks = computed(() => filterByStatus('todo'))
  const inProgressTasks = computed(() => filterByStatus('in_progress'))
  const doneTasks = computed(() => filterByStatus('done'))

  const filterByStatus = (status: TaskStatus) =>
    tasks.value.filter((task) => task.status === status)

  const loadTasks = async () => {
    isLoading.value = true
    error.value = ''

    try {
      tasks.value = await requestTasks()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
    } finally {
      isLoading.value = false
    }
  }

  const createTask = async (payload: TaskPayload) => {
    const task = await requestCreateTask(payload)
    tasks.value = [task, ...tasks.value]
    await loadTasks()
  }

  const updateTask = async (id: number, payload: TaskPayload) => {
    const task = await requestUpdateTask(id, payload)
    tasks.value = tasks.value.map((currentTask) => (currentTask.id === id ? task : currentTask))
    await loadTasks()
  }

  const deleteTask = async (id: number) => {
    await requestDeleteTask(id)
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  const completeTask = async (id: number) => {
    const task = await requestCompleteTask(id)
    tasks.value = tasks.value.map((currentTask) => (currentTask.id === id ? task : currentTask))
    await loadTasks()
  }

  return {
    tasks,
    todoTasks,
    inProgressTasks,
    doneTasks,
    isLoading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    completeTask
  }
})
