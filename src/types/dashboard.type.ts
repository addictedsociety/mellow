import type { Task } from './task.type'
import type { TimeEntry } from './time-entry.type'

export interface DashboardSummary {
  runningEntry: TimeEntry | null
  todayMinutes: number
  tasks: Task[]
}
