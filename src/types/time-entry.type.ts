export type TimeEntryType = 'tracked' | 'manual'

export interface TimeEntry {
  id: number
  taskId: number
  taskTitle: string
  startTime: string | null
  endTime: string | null
  durationMinutes: number
  noteMarkdown: string
  entryType: TimeEntryType
  createdAt: string
  updatedAt: string
}
