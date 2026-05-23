export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'

export interface Task {
  id: number
  title: string
  descriptionMarkdown: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  completedAt: string | null
  totalSeconds: number
  isRunning: boolean
}

export interface TaskPayload {
  title: string
  descriptionMarkdown?: string
  status?: TaskStatus
}
