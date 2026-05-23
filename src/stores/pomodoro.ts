import { computed, onScopeDispose, ref } from 'vue'
import { defineStore } from 'pinia'

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak'

const DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
}

const SESSIONS_UNTIL_LONG_BREAK = 4

export const usePomodoroStore = defineStore('pomodoro', () => {
  const mode = ref<PomodoroMode>('focus')
  const remainingSeconds = ref(DURATIONS.focus)
  const isRunning = ref(false)
  const completedFocusSessions = ref(0)

  let intervalId: number | undefined

  const totalSeconds = computed(() => DURATIONS[mode.value])
  const progress = computed(() =>
    totalSeconds.value === 0 ? 0 : 1 - remainingSeconds.value / totalSeconds.value
  )
  const minutesLabel = computed(() =>
    Math.floor(remainingSeconds.value / 60)
      .toString()
      .padStart(2, '0')
  )
  const secondsLabel = computed(() => (remainingSeconds.value % 60).toString().padStart(2, '0'))
  const timeLabel = computed(() => `${minutesLabel.value}:${secondsLabel.value}`)

  const stopTicker = () => {
    window.clearInterval(intervalId)
    intervalId = undefined
  }

  const advanceMode = () => {
    if (mode.value === 'focus') {
      completedFocusSessions.value += 1
      const nextMode: PomodoroMode =
        completedFocusSessions.value % SESSIONS_UNTIL_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak'
      mode.value = nextMode
    } else {
      mode.value = 'focus'
    }

    remainingSeconds.value = DURATIONS[mode.value]
  }

  const handleCompletion = () => {
    stopTicker()
    isRunning.value = false
    advanceMode()
  }

  const tick = () => {
    if (remainingSeconds.value <= 1) {
      remainingSeconds.value = 0
      handleCompletion()
      return
    }

    remainingSeconds.value -= 1
  }

  const startTicker = () => {
    stopTicker()
    intervalId = window.setInterval(tick, 1000)
  }

  const start = () => {
    if (isRunning.value || remainingSeconds.value === 0) {
      return
    }

    isRunning.value = true
    startTicker()
  }

  const pause = () => {
    isRunning.value = false
    stopTicker()
  }

  const toggle = () => {
    if (isRunning.value) {
      pause()
    } else {
      start()
    }
  }

  const reset = () => {
    pause()
    remainingSeconds.value = DURATIONS[mode.value]
  }

  const setMode = (next: PomodoroMode) => {
    if (mode.value === next) {
      reset()
      return
    }

    pause()
    mode.value = next
    remainingSeconds.value = DURATIONS[next]
  }

  const skipForward = () => {
    pause()
    advanceMode()
  }

  onScopeDispose(() => {
    stopTicker()
  })

  return {
    mode,
    remainingSeconds,
    isRunning,
    completedFocusSessions,
    totalSeconds,
    progress,
    minutesLabel,
    secondsLabel,
    timeLabel,
    start,
    pause,
    toggle,
    reset,
    setMode,
    skipForward
  }
})
