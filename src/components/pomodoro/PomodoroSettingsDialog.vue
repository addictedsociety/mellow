<script setup lang="ts">
import { Settings } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput
} from '@/components/ui/number-field'
import { usePomodoroStore, type PomodoroMode } from '@/stores/pomodoro'

const MIN_MINUTES = 1
const MAX_MINUTES = 180

const isOpen = defineModel<boolean>({ default: false })

const { t } = useI18n()
const pomodoroStore = usePomodoroStore()

const focusMinutes = ref(MIN_MINUTES)
const shortBreakMinutes = ref(MIN_MINUTES)
const longBreakMinutes = ref(MIN_MINUTES)

const clampMinutes = (value: number): number => {
  if (!Number.isFinite(value)) {
    return MIN_MINUTES
  }
  return Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, Math.round(value)))
}

const resetForm = () => {
  focusMinutes.value = Math.round(pomodoroStore.durations.focus / 60)
  shortBreakMinutes.value = Math.round(pomodoroStore.durations.shortBreak / 60)
  longBreakMinutes.value = Math.round(pomodoroStore.durations.longBreak / 60)
}

const handleSave = () => {
  const payload: Record<PomodoroMode, number> = {
    focus: clampMinutes(focusMinutes.value) * 60,
    shortBreak: clampMinutes(shortBreakMinutes.value) * 60,
    longBreak: clampMinutes(longBreakMinutes.value) * 60
  }
  pomodoroStore.updateDurations(payload)
  isOpen.value = false
}

const handleCancel = () => {
  isOpen.value = false
}

watch(isOpen, (next) => {
  if (next) {
    resetForm()
  }
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Settings class="size-5" />
          {{ t('pomodoro.settings.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('pomodoro.settings.description') }}
        </DialogDescription>
      </DialogHeader>

      <form class="flex flex-col gap-5" @submit.prevent="handleSave">
        <NumberField
          v-model="focusMinutes"
          :min="MIN_MINUTES"
          :max="MAX_MINUTES"
          :default-value="focusMinutes"
        >
          <label class="text-foreground text-sm font-medium select-none">
            {{ t('pomodoro.settings.focusMinutes') }}
          </label>
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>

        <NumberField
          v-model="shortBreakMinutes"
          :min="MIN_MINUTES"
          :max="MAX_MINUTES"
          :default-value="shortBreakMinutes"
        >
          <label class="text-foreground text-sm font-medium select-none">
            {{ t('pomodoro.settings.shortBreakMinutes') }}
          </label>
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>

        <NumberField
          v-model="longBreakMinutes"
          :min="MIN_MINUTES"
          :max="MAX_MINUTES"
          :default-value="longBreakMinutes"
        >
          <label class="text-foreground text-sm font-medium select-none">
            {{ t('pomodoro.settings.longBreakMinutes') }}
          </label>
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>

        <DialogFooter>
          <Button type="button" variant="outline" @click="handleCancel">
            {{ t('common.cancel') }}
          </Button>
          <Button type="submit">
            {{ t('pomodoro.settings.save') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
