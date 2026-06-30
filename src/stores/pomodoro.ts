import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, onScopeDispose, ref } from 'vue'
import { playCompletionChime } from '@/utils/sound'

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak'

export interface PomodoroDayStats {
  focusSeconds: number
  sessionsCompleted: number
}

export interface PomodoroHistoryEntry {
  date: string
  stats: PomodoroDayStats
}

const DEFAULT_DURATIONS: Record<PomodoroMode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
}

const SESSIONS_UNTIL_LONG_BREAK = 4
const DEFAULT_SOUND_VOLUME = 0.5
const DURATIONS_STORAGE_KEY = 'mellow:pomodoro:durations'
const TODAY_FOCUS_SECONDS_KEY = 'mellow:pomodoro:todayFocusSeconds'
const TODAY_DATE_KEY = 'mellow:pomodoro:todayDate'
const HISTORY_STORAGE_KEY = 'mellow:pomodoro:history'
const SOUND_ENABLED_KEY = 'mellow:pomodoro:soundEnabled'
const SOUND_VOLUME_KEY = 'mellow:pomodoro:soundVolume'

const getDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getTodayKey = () => getDateKey(new Date())

export const usePomodoroStore = defineStore('pomodoro', () => {
  const durations = useLocalStorage<Record<PomodoroMode, number>>(
    DURATIONS_STORAGE_KEY,
    { ...DEFAULT_DURATIONS },
    { mergeDefaults: true }
  )
  const todayFocusSeconds = useLocalStorage<number>(TODAY_FOCUS_SECONDS_KEY, 0)
  const todayDate = useLocalStorage<string>(TODAY_DATE_KEY, '')
  const history = useLocalStorage<Record<string, PomodoroDayStats>>(HISTORY_STORAGE_KEY, {})
  const isSoundEnabled = useLocalStorage<boolean>(SOUND_ENABLED_KEY, true)
  const soundVolume = useLocalStorage<number>(SOUND_VOLUME_KEY, DEFAULT_SOUND_VOLUME)

  const mode = ref<PomodoroMode>('focus')
  const remainingSeconds = ref(durations.value.focus)
  const isRunning = ref(false)
  const completedFocusSessions = ref(0)

  let intervalId: number | undefined

  const getDayStats = (dateKey: string): PomodoroDayStats =>
    history.value[dateKey] ?? { focusSeconds: 0, sessionsCompleted: 0 }

  const ensureToday = () => {
    const today = getTodayKey()
    if (todayDate.value !== today) {
      todayDate.value = today
      todayFocusSeconds.value = 0
    }
    if (!history.value[today]) {
      history.value[today] = { focusSeconds: 0, sessionsCompleted: 0 }
    }
  }

  ensureToday()

  const totalSeconds = computed(() => durations.value[mode.value])
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
  const todayFocusLabel = computed(() => {
    const total = todayFocusSeconds.value
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const seconds = total % 60

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`
    }
    if (minutes > 0) {
      return `${minutes}m`
    }
    return `${seconds}s`
  })

  const stopTicker = () => {
    window.clearInterval(intervalId)
    intervalId = undefined
  }

  const advanceMode = () => {
    if (mode.value === 'focus') {
      completedFocusSessions.value += 1
      ensureToday()
      history.value[getTodayKey()].sessionsCompleted += 1
      const nextMode: PomodoroMode =
        completedFocusSessions.value % SESSIONS_UNTIL_LONG_BREAK === 0 ? 'longBreak' : 'shortBreak'
      mode.value = nextMode
    } else {
      mode.value = 'focus'
    }

    remainingSeconds.value = durations.value[mode.value]
  }

  const handleCompletion = () => {
    stopTicker()
    isRunning.value = false
    if (isSoundEnabled.value) {
      playCompletionChime(soundVolume.value)
    }
    advanceMode()
  }

  const tick = () => {
    if (mode.value === 'focus') {
      ensureToday()
      todayFocusSeconds.value += 1
      history.value[getTodayKey()].focusSeconds += 1
    }

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
    remainingSeconds.value = durations.value[mode.value]
  }

  const setMode = (next: PomodoroMode) => {
    if (mode.value === next) {
      reset()
      return
    }

    pause()
    mode.value = next
    remainingSeconds.value = durations.value[next]
  }

  const skipForward = () => {
    pause()
    advanceMode()
  }

  const updateDurations = (payload: Partial<Record<PomodoroMode, number>>) => {
    const currentMode = mode.value
    const next: Record<PomodoroMode, number> = { ...durations.value }
    let isCurrentAffected = false

    for (const key of Object.keys(payload) as PomodoroMode[]) {
      const value = payload[key]
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        continue
      }
      next[key] = Math.round(value)
      if (key === currentMode) {
        isCurrentAffected = true
      }
    }

    durations.value = next

    if (isCurrentAffected) {
      reset()
    }
  }

  const updateSound = (payload: { isEnabled: boolean; volume: number }) => {
    isSoundEnabled.value = payload.isEnabled
    soundVolume.value = Math.min(1, Math.max(0, payload.volume))
  }

  const previewSound = (volume = soundVolume.value) => {
    playCompletionChime(volume)
  }

  const getHistoryRange = (days: number): PomodoroHistoryEntry[] => {
    const entries: PomodoroHistoryEntry[] = []
    for (let offset = days - 1; offset >= 0; offset -= 1) {
      const date = new Date()
      date.setDate(date.getDate() - offset)
      const dateKey = getDateKey(date)
      entries.push({ date: dateKey, stats: getDayStats(dateKey) })
    }
    return entries
  }

  onScopeDispose(() => {
    stopTicker()
  })

  return {
    mode,
    remainingSeconds,
    isRunning,
    completedFocusSessions,
    durations,
    todayFocusSeconds,
    history,
    isSoundEnabled,
    soundVolume,
    totalSeconds,
    progress,
    minutesLabel,
    secondsLabel,
    timeLabel,
    todayFocusLabel,
    start,
    pause,
    toggle,
    reset,
    setMode,
    skipForward,
    updateDurations,
    updateSound,
    previewSound,
    ensureToday,
    getDayStats,
    getHistoryRange
  }
})
