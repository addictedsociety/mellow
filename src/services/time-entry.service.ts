import { invoke } from '@tauri-apps/api/core'
import type { TimeEntry } from '@/types/time-entry.type'

export const startTimer = (taskId: number) => invoke<TimeEntry>('start_timer', { taskId })

export const stopTimer = () => invoke<TimeEntry>('stop_timer')

export const getRunningEntry = () => invoke<TimeEntry | null>('get_running_entry')

export const listTimeEntries = (taskId?: number) =>
  invoke<TimeEntry[]>('list_time_entries', { taskId: taskId ?? null })
