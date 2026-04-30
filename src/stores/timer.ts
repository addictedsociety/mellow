import { computed, onScopeDispose, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getRunningEntry,
  startTimer as requestStartTimer,
  stopTimer as requestStopTimer
} from '@/services/time-entry.service'
import type { TimeEntry } from '@/types/time-entry.type'
import { formatSeconds, getElapsedSeconds } from '@/utils/time'
import { useTasksStore } from './tasks'

export const useTimerStore = defineStore('timer', () => {
  const runningEntry = ref<TimeEntry | null>(null)
  const tick = ref(0)
  const isLoading = ref(false)
  const error = ref('')

  let intervalId: number | undefined

  const elapsedSeconds = computed(() => {
    tick.value
    return getElapsedSeconds(runningEntry.value?.startTime)
  })
  const elapsedLabel = computed(() => formatSeconds(elapsedSeconds.value))

  const startTicker = () => {
    window.clearInterval(intervalId)
    intervalId = window.setInterval(() => {
      tick.value += 1
    }, 1000)
  }

  const stopTicker = () => {
    window.clearInterval(intervalId)
    intervalId = undefined
  }

  const loadRunningEntry = async () => {
    runningEntry.value = await getRunningEntry()

    if (runningEntry.value) {
      startTicker()
    } else {
      stopTicker()
    }
  }

  const startTimer = async (taskId: number) => {
    const tasksStore = useTasksStore()
    isLoading.value = true
    error.value = ''

    try {
      runningEntry.value = await requestStartTimer(taskId)
      startTicker()
      await tasksStore.loadTasks()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
    } finally {
      isLoading.value = false
    }
  }

  const stopTimer = async () => {
    const tasksStore = useTasksStore()
    isLoading.value = true
    error.value = ''

    try {
      await requestStopTimer()
      runningEntry.value = null
      stopTicker()
      await tasksStore.loadTasks()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
    } finally {
      isLoading.value = false
    }
  }

  onScopeDispose(() => {
    stopTicker()
  })

  return {
    runningEntry,
    isLoading,
    error,
    elapsedSeconds,
    elapsedLabel,
    loadRunningEntry,
    startTimer,
    stopTimer
  }
})
