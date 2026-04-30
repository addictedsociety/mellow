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
    return 'bg-amber-100 text-amber-700 ring-amber-200'
  }

  return {
    todo: 'bg-stone-100 text-stone-600 ring-stone-200',
    in_progress: 'bg-blue-100 text-blue-700 ring-blue-200',
    done: 'bg-emerald-100 text-emerald-700 ring-emerald-200'
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
