import { invoke } from '@tauri-apps/api/core'
import type { TimeEntry } from '@/types/time-entry.type'

export const startTimer = (taskId: number) => invoke<TimeEntry>('start_timer', { taskId })

export const stopTimer = (taskId: number) => invoke<TimeEntry>('stop_timer', { taskId })

export const getRunningEntries = () => invoke<TimeEntry[]>('get_running_entries')
