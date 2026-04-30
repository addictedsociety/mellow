import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const LoginView = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const TasksView = () => import('@/views/TasksView.vue')
const TaskDetailView = () => import('@/views/TaskDetailView.vue')
const CompletedTasksView = () => import('@/views/CompletedTasksView.vue')
const SettingsView = () => import('@/views/SettingsView.vue')

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { isPublic: true }
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView
    },
    {
      path: '/tasks/:id',
      name: 'task-detail',
      component: TaskDetailView,
      props: true
    },
    {
      path: '/completed',
      name: 'completed',
      component: CompletedTasksView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView
    }
  ]
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  if (!to.meta.isPublic && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})
