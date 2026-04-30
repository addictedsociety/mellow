import { invoke } from '@tauri-apps/api/core'
import type { DashboardSummary } from '@/types/dashboard.type'
import type { Task, TaskPayload } from '@/types/task.type'

export const listTasks = () => invoke<Task[]>('list_tasks')

export const createTask = (payload: TaskPayload) => invoke<Task>('create_task', { payload })

export const updateTask = (id: number, payload: TaskPayload) =>
  invoke<Task>('update_task', { id, payload })

export const deleteTask = (id: number) => invoke<void>('delete_task', { id })

export const completeTask = (id: number) => invoke<Task>('complete_task', { id })

export const getDashboardSummary = () => invoke<DashboardSummary>('dashboard_summary')
