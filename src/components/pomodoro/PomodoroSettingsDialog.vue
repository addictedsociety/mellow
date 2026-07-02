<script setup lang="ts">
import { Play, Settings, Volume2, VolumeX } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
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
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { usePomodoroStore, type PomodoroMode } from '@/stores/pomodoro'

const MIN_MINUTES = 1
const MAX_MINUTES = 180

const isOpen = defineModel<boolean>({ default: false })

const { t } = useI18n()
const pomodoroStore = usePomodoroStore()

const focusMinutes = ref(MIN_MINUTES)
const shortBreakMinutes = ref(MIN_MINUTES)
const longBreakMinutes = ref(MIN_MINUTES)
const isSoundEnabled = ref(true)
const volumePercent = ref(0)

const volumeModel = computed(() => [volumePercent.value])

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
  isSoundEnabled.value = pomodoroStore.isSoundEnabled
  volumePercent.value = Math.round(pomodoroStore.soundVolume * 100)
}

const handleVolumeChange = (value: number[] | undefined) => {
  volumePercent.value = value?.[0] ?? 0
}

const handlePreviewSound = () => {
  pomodoroStore.previewSound(volumePercent.value / 100)
}

const handleSave = () => {
  const payload: Record<PomodoroMode, number> = {
    focus: clampMinutes(focusMinutes.value) * 60,
    shortBreak: clampMinutes(shortBreakMinutes.value) * 60,
    longBreak: clampMinutes(longBreakMinutes.value) * 60
  }
  pomodoroStore.updateDurations(payload)
  pomodoroStore.updateSound({
    isEnabled: isSoundEnabled.value,
    volume: volumePercent.value / 100
  })
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

        <div class="border-border flex flex-col gap-4 rounded-lg border p-4">
          <div class="flex items-center justify-between">
            <label class="text-foreground text-sm font-medium select-none">
              {{ t('pomodoro.settings.soundEnabled') }}
            </label>
            <Switch v-model="isSoundEnabled" />
          </div>

          <div class="flex items-center gap-3" :class="!isSoundEnabled && 'opacity-50'">
            <component
              :is="isSoundEnabled ? Volume2 : VolumeX"
              class="text-muted-foreground size-4 shrink-0"
            />
            <Slider
              :model-value="volumeModel"
              :min="0"
              :max="100"
              :step="1"
              :disabled="!isSoundEnabled"
              @update:model-value="handleVolumeChange"
            />
            <span class="text-muted-foreground w-9 text-right text-sm tabular-nums select-none">
              {{ volumePercent }}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              :disabled="!isSoundEnabled"
              :aria-label="t('pomodoro.settings.previewSound')"
              :title="t('pomodoro.settings.previewSound')"
              @click="handlePreviewSound"
            >
              <Play class="size-4" />
            </Button>
          </div>
        </div>

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
