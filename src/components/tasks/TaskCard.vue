<script setup lang="ts">
import { Check, ChevronRight, Play, Square, Trash2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownPreview from '@/components/markdown/MarkdownPreview.vue'
import NxrConfirmDialog from '@/components/NxrConfirmDialog.vue'
import NxrTimePill from '@/components/NxrTimePill.vue'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useTimerStore } from '@/stores/timer'
import type { Task } from '@/types/task.type'
import { formatDate, formatDuration } from '@/utils/time'
import StatusBadge from './StatusBadge.vue'

const TITLE_MAX_LENGTH = 200

const { task, isReadonly = false } = defineProps<{
  task: Task
  isReadonly?: boolean
}>()

const emit = defineEmits<{
  start: [taskId: number]
  stop: [taskId: number]
  complete: [taskId: number]
  delete: [taskId: number]
}>()

const { t } = useI18n()
const timerStore = useTimerStore()

const isDeleteDialogOpen = ref(false)
const isDescriptionOpen = ref(false)

const displayTitle = computed(() =>
  task.title.length > TITLE_MAX_LENGTH ? `${task.title.slice(0, TITLE_MAX_LENGTH)}…` : task.title
)
const hasDescription = computed(() => task.descriptionMarkdown.trim().length > 0)
const cumulativeLabel = computed(() => timerStore.getCumulativeLabel(task.id, task.totalSeconds))
const totalLabel = computed(() => formatDuration(task.totalSeconds))
const hasTrackedTime = computed(() => task.totalSeconds > 0)
const hasInlineActions = computed(() => !isReadonly)

const handleDeleteConfirm = () => {
  emit('delete', task.id)
}
</script>

<template>
  <article
    class="bg-card text-card-foreground group relative rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md"
    :class="
      task.isRunning
        ? 'border-primary/70 shadow-primary/20 ring-primary/30 shadow-lg ring-2'
        : 'border-border'
    "
  >
    <header class="flex items-start justify-between gap-3">
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <RouterLink
          class="text-foreground hover:text-primary text-base leading-snug font-semibold transition-colors"
          :to="{ name: 'task-detail', params: { id: task.id } }"
        >
          {{ displayTitle }}
        </RouterLink>

        <div class="flex items-center gap-x-3 gap-y-1.5">
          <StatusBadge :status="task.status" :is-tracking="task.isRunning" />
          <span v-if="task.completedAt" class="text-muted-foreground text-xs select-none">
            {{ formatDate(task.completedAt) }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-1.5">
        <NxrTimePill v-if="task.isRunning" :time="cumulativeLabel" is-live />
        <NxrTimePill v-else-if="hasTrackedTime" :time="totalLabel" />

        <Button
          size="icon-sm"
          variant="ghost"
          class="text-muted-foreground hover:text-destructive"
          :aria-label="t('tasks.delete')"
          :title="t('tasks.delete')"
          @click="isDeleteDialogOpen = true"
        >
          <Trash2 class="size-4" />
        </Button>
      </div>
    </header>
    <Collapsible v-if="hasDescription" v-model:open="isDescriptionOpen" class="mt-3">
      <CollapsibleTrigger
        class="text-muted-foreground hover:text-foreground group/desc inline-flex items-center gap-1 text-[0.7rem] font-medium tracking-wide select-none focus-visible:outline-none"
      >
        <ChevronRight
          class="size-3 transition-transform duration-200 group-data-[state=open]/desc:rotate-90"
        />
        {{ isDescriptionOpen ? t('tasks.hideDescription') : t('tasks.showDescription') }}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div class="border-border/40 text-muted-foreground/90 mt-2 border-l-2 pl-3 text-sm">
          <MarkdownPreview :content="task.descriptionMarkdown" />
        </div>
      </CollapsibleContent>
    </Collapsible>

    <footer v-if="hasInlineActions" class="mt-4 flex flex-wrap items-center gap-1.5">
      <Button
        v-if="!task.isRunning && task.status !== 'done'"
        size="sm"
        variant="default"
        @click="emit('start', task.id)"
      >
        <Play class="size-3.5" />
        {{ t('tasks.start') }}
      </Button>
      <Button v-if="task.isRunning" size="sm" variant="destructive" @click="emit('stop', task.id)">
        <Square class="size-3.5" />
        {{ t('tasks.stop') }}
      </Button>
      <Button
        v-if="task.status !== 'done'"
        size="sm"
        variant="outline"
        @click="emit('complete', task.id)"
      >
        <Check class="size-3.5" />
        {{ t('tasks.complete') }}
      </Button>
    </footer>

    <NxrConfirmDialog
      v-model="isDeleteDialogOpen"
      :title="t('tasks.confirmDelete.title')"
      :description="t('tasks.confirmDelete.description', { title: task.title })"
      :confirm-label="t('tasks.delete')"
      is-destructive
      @confirm="handleDeleteConfirm"
    />
  </article>
</template>
