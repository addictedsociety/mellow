<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownEditor from '@/components/markdown/MarkdownEditor.vue'
import type { Task } from '@/types/task.type'
import type { ManualTimeEntryPayload } from '@/types/time-entry.type'

const { tasks } = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  save: [payload: ManualTimeEntryPayload]
}>()

const { t } = useI18n()

const isOpen = ref(false)
const taskId = ref<number | null>(null)
const durationMinutes = ref(30)
const date = ref('')
const noteMarkdown = ref('')

const activeTasks = computed(() => tasks.filter((task) => task.status !== 'done'))

const resetForm = () => {
  taskId.value = activeTasks.value[0]?.id ?? null
  durationMinutes.value = 30
  date.value = ''
  noteMarkdown.value = ''
}

const open = () => {
  resetForm()
  isOpen.value = true
}

const submit = () => {
  if (!taskId.value) {
    return
  }

  emit('save', {
    taskId: taskId.value,
    durationMinutes: durationMinutes.value,
    date: date.value ? new Date(date.value).toISOString() : undefined,
    noteMarkdown: noteMarkdown.value
  })
  isOpen.value = false
}
</script>

<template>
  <button
    class="bg-primary text-primary-foreground rounded-2xl px-4 py-2 text-sm font-medium transition select-none hover:opacity-90"
    type="button"
    @click="open"
  >
    {{ t('timeEntries.manual') }}
  </button>

  <div v-if="isOpen" class="bg-foreground/40 fixed inset-0 z-50 grid place-items-center p-6">
    <form
      class="border-border bg-card text-card-foreground w-full max-w-xl rounded-[2rem] border p-6 shadow-xl"
      @submit.prevent="submit"
    >
      <h2 class="text-xl font-semibold select-none">{{ t('timeEntries.manual') }}</h2>

      <label class="text-muted-foreground mt-5 block text-sm font-medium select-none">
        {{ t('tasks.titleLabel') }}
        <select
          v-model.number="taskId"
          class="border-border bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3"
        >
          <option v-for="task in activeTasks" :key="task.id" :value="task.id">
            {{ task.title }}
          </option>
        </select>
      </label>

      <div class="mt-4 grid grid-cols-2 gap-4">
        <label class="text-muted-foreground block text-sm font-medium select-none">
          {{ t('timeEntries.duration') }}
          <input
            v-model.number="durationMinutes"
            class="border-border bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3"
            min="1"
            type="number"
          />
        </label>
        <label class="text-muted-foreground block text-sm font-medium select-none">
          {{ t('timeEntries.date') }}
          <input
            v-model="date"
            class="border-border bg-background text-foreground mt-2 w-full rounded-2xl border px-4 py-3"
            type="datetime-local"
          />
        </label>
      </div>

      <label class="text-muted-foreground mt-4 block text-sm font-medium select-none">
        {{ t('timeEntries.note') }}
        <MarkdownEditor v-model="noteMarkdown" class="mt-2" />
      </label>

      <div class="mt-6 flex justify-end gap-2">
        <button
          class="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-2xl px-4 py-2 text-sm font-medium transition select-none"
          type="button"
          @click="isOpen = false"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          class="bg-primary text-primary-foreground rounded-2xl px-4 py-2 text-sm font-medium transition select-none hover:opacity-90"
          type="submit"
        >
          {{ t('timeEntries.add') }}
        </button>
      </div>
    </form>
  </div>
</template>
