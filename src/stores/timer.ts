import { computed, onScopeDispose, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  getRunningEntries,
  startTimer as requestStartTimer,
  stopTimer as requestStopTimer
} from '@/services/time-entry.service'
import type { TimeEntry } from '@/types/time-entry.type'
import { formatSeconds } from '@/utils/time'
import { useTasksStore } from './tasks'

export const useTimerStore = defineStore('timer', () => {
  const runningEntries = ref<TimeEntry[]>([])
  const tick = ref(Date.now())
  const isLoading = ref(false)
  const error = ref('')

  let intervalId: number | undefined

  const elapsedSecondsByTask = computed<Record<number, number>>(() => {
    const result: Record<number, number> = {}
    for (const entry of runningEntries.value) {
      if (!entry.startTime) {
        continue
      }
      result[entry.taskId] = Math.max(
        0,
        Math.floor((tick.value - new Date(entry.startTime).getTime()) / 1000)
      )
    }
    return result
  })

  const elapsedLabelByTask = computed<Record<number, string>>(() => {
    const result: Record<number, string> = {}
    for (const [taskId, seconds] of Object.entries(elapsedSecondsByTask.value)) {
      result[Number(taskId)] = formatSeconds(seconds)
    }
    return result
  })

  const totalElapsedSeconds = computed(() =>
    Object.values(elapsedSecondsByTask.value).reduce((sum, value) => sum + value, 0)
  )

  const totalElapsedLabel = computed(() => formatSeconds(totalElapsedSeconds.value))

  const activeCount = computed(() => runningEntries.value.length)

  const getElapsedSeconds = (taskId: number) => elapsedSecondsByTask.value[taskId] ?? 0

  const getElapsedLabel = (taskId: number) => elapsedLabelByTask.value[taskId] ?? formatSeconds(0)

  const getCumulativeSeconds = (taskId: number, baseSeconds: number) =>
    baseSeconds + getElapsedSeconds(taskId)

  const getCumulativeLabel = (taskId: number, baseSeconds: number) =>
    formatSeconds(getCumulativeSeconds(taskId, baseSeconds))

  const isTaskRunning = (taskId: number) =>
    runningEntries.value.some((entry) => entry.taskId === taskId)

  const startTicker = () => {
    if (intervalId !== undefined) {
      return
    }
    intervalId = window.setInterval(() => {
      tick.value = Date.now()
    }, 1000)
  }

  const stopTicker = () => {
    window.clearInterval(intervalId)
    intervalId = undefined
  }

  const syncTicker = () => {
    if (runningEntries.value.length > 0) {
      startTicker()
    } else {
      stopTicker()
    }
  }

  const loadRunningEntries = async () => {
    runningEntries.value = await getRunningEntries()
    tick.value = Date.now()
    syncTicker()
  }

  const startTimer = async (taskId: number) => {
    const tasksStore = useTasksStore()
    isLoading.value = true
    error.value = ''

    try {
      const entry = await requestStartTimer(taskId)
      const existingIndex = runningEntries.value.findIndex((item) => item.taskId === taskId)
      if (existingIndex >= 0) {
        runningEntries.value.splice(existingIndex, 1, entry)
      } else {
        runningEntries.value.push(entry)
      }
      tick.value = Date.now()
      syncTicker()
      await tasksStore.loadTasks()
    } catch (caughtError) {
      error.value = caughtError instanceof Error ? caughtError.message : String(caughtError)
    } finally {
      isLoading.value = false
    }
  }

  const stopTimer = async (taskId: number) => {
    const tasksStore = useTasksStore()
    isLoading.value = true
    error.value = ''

    try {
      await requestStopTimer(taskId)
      runningEntries.value = runningEntries.value.filter((entry) => entry.taskId !== taskId)
      syncTicker()
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
    runningEntries,
    isLoading,
    error,
    activeCount,
    totalElapsedSeconds,
    totalElapsedLabel,
    elapsedLabelByTask,
    elapsedSecondsByTask,
    getElapsedSeconds,
    getElapsedLabel,
    getCumulativeSeconds,
    getCumulativeLabel,
    isTaskRunning,
    loadRunningEntries,
    startTimer,
    stopTimer
  }
})
