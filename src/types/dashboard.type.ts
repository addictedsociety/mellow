import type { Task } from './task.type'
import type { TimeEntry } from './time-entry.type'

export interface DashboardSummary {
  runningEntries: TimeEntry[]
  todaySeconds: number
  tasks: Task[]
}
