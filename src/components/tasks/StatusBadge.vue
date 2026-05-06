<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { TaskStatus } from '@/types/task.type'

const { status, isTracking = false } = defineProps<{
  status: TaskStatus
  isTracking?: boolean
}>()

const { t } = useI18n()

const label = computed(() => (isTracking ? t('status.tracking') : t(`status.${status}`)))
const classes = computed(() => {
  if (isTracking) {
    return 'bg-primary text-primary-foreground ring-primary/40'
  }

  return {
    todo: 'bg-muted text-muted-foreground ring-border',
    in_progress: 'bg-accent text-accent-foreground ring-accent',
    done: 'bg-secondary text-secondary-foreground ring-border'
  }[status]
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1"
    :class="classes"
  >
    {{ label }}
  </span>
</template>
