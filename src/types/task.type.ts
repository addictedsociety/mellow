export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: number
  title: string
  descriptionMarkdown: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  completedAt: string | null
  totalMinutes: number
  isRunning: boolean
}

export interface TaskPayload {
  title: string
  descriptionMarkdown?: string
  status?: TaskStatus
}
