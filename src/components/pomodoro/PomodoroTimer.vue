<script setup lang="ts">
import {
  ChartColumn,
  Clock,
  Coffee,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Settings,
  SkipForward,
  Sparkles
} from 'lucide-vue-next'
import type { FunctionalComponent } from 'vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import NxrConfirmDialog from '@/components/NxrConfirmDialog.vue'
import PomodoroSettingsDialog from '@/components/pomodoro/PomodoroSettingsDialog.vue'
import PomodoroStatsDialog from '@/components/pomodoro/PomodoroStatsDialog.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePomodoroStore, type PomodoroMode } from '@/stores/pomodoro'

type ModeStyle = {
  icon: FunctionalComponent
  bg: string
  ring: string
  accentText: string
  iconBg: string
}

const MODE_STYLES: Record<PomodoroMode, ModeStyle> = {
  focus: {
    icon: Flame,
    bg: 'bg-rose-500/10',
    ring: 'ring-rose-500/30',
    accentText: 'text-rose-500',
    iconBg: 'bg-rose-500/20'
  },
  shortBreak: {
    icon: Coffee,
    bg: 'bg-cyan-500/10',
    ring: 'ring-cyan-500/30',
    accentText: 'text-cyan-500',
    iconBg: 'bg-cyan-500/20'
  },
  longBreak: {
    icon: Sparkles,
    bg: 'bg-violet-500/10',
    ring: 'ring-violet-500/30',
    accentText: 'text-violet-500',
    iconBg: 'bg-violet-500/20'
  }
}

const { t } = useI18n()

const pomodoroStore = usePomodoroStore()

const isResetDialogOpen = ref(false)
const isSkipDialogOpen = ref(false)
const isModeChangeDialogOpen = ref(false)
const isSettingsDialogOpen = ref(false)
const isStatsDialogOpen = ref(false)
const pendingMode = ref<PomodoroMode | null>(null)

const modes = computed<{ key: PomodoroMode; label: string }[]>(() => [
  { key: 'focus', label: t('pomodoro.modes.focus') },
  { key: 'shortBreak', label: t('pomodoro.modes.shortBreak') },
  { key: 'longBreak', label: t('pomodoro.modes.longBreak') }
])

const statusLabel = computed(() => {
  if (pomodoroStore.mode === 'focus') {
    return t('pomodoro.status.focus')
  }

  if (pomodoroStore.mode === 'shortBreak') {
    return t('pomodoro.status.shortBreak')
  }

  return t('pomodoro.status.longBreak')
})

const sessionLabel = computed(
  () => `${pomodoroStore.completedFocusSessions + (pomodoroStore.mode === 'focus' ? 1 : 0)}`
)

const modeStyle = computed<ModeStyle>(() => MODE_STYLES[pomodoroStore.mode])

const pendingModeLabel = computed(() =>
  pendingMode.value ? t(`pomodoro.modes.${pendingMode.value}`) : ''
)

const handleSelectMode = (next: PomodoroMode) => {
  if (next === pomodoroStore.mode) {
    return
  }

  pendingMode.value = next
  isModeChangeDialogOpen.value = true
}

const handleModeChangeConfirm = () => {
  if (!pendingMode.value) {
    return
  }

  pomodoroStore.setMode(pendingMode.value)
  pendingMode.value = null
}

const handleToggle = () => {
  pomodoroStore.toggle()
}

const handleResetRequest = () => {
  isResetDialogOpen.value = true
}

const handleResetConfirm = () => {
  pomodoroStore.reset()
}

const handleSkipRequest = () => {
  isSkipDialogOpen.value = true
}

const handleSkipConfirm = () => {
  pomodoroStore.skipForward()
}

onMounted(() => {
  pomodoroStore.ensureToday()
})
</script>

<template>
  <div class="flex w-full flex-col items-center">
    <Card
      class="bg-card/60 border-border/40 relative w-full rounded-3xl shadow-xl backdrop-blur-xl"
    >
      <div class="absolute top-4 left-4 flex items-center gap-2">
        <div
          class="bg-muted/60 ring-border/40 text-muted-foreground flex items-center gap-2 rounded-full px-3 py-1.5 text-xs ring-1 backdrop-blur-md select-none"
          :title="t('pomodoro.todayFocusedHint')"
        >
          <Clock class="size-3.5" />
          <div class="flex flex-row gap-1.5">
            {{ t('pomodoro.todayFocused') }}:
            <span class="text-foreground tabular-num font-semibold">{{
              pomodoroStore.todayFocusLabel
            }}</span>
          </div>
        </div>
        <button
          type="button"
          class="bg-muted/60 ring-border/40 text-muted-foreground hover:text-foreground hover:bg-muted flex items-center rounded-full p-2 ring-1 backdrop-blur-md transition-colors"
          :aria-label="t('pomodoro.stats.title')"
          :title="t('pomodoro.stats.title')"
          @click="isStatsDialogOpen = true"
        >
          <ChartColumn class="size-3.5" />
        </button>
      </div>

      <Button
        size="icon"
        variant="ghost"
        class="text-muted-foreground hover:text-foreground absolute top-4 right-4"
        :aria-label="t('pomodoro.settings.title')"
        :title="t('pomodoro.settings.title')"
        @click="isSettingsDialogOpen = true"
      >
        <Settings class="size-5" />
      </Button>
      <CardContent class="flex flex-col items-center gap-8 px-6 py-10 sm:px-10">
        <div
          class="bg-muted/60 flex flex-wrap items-center justify-center gap-1 rounded-full p-1 backdrop-blur-md"
        >
          <button
            v-for="modeOption in modes"
            :key="modeOption.key"
            type="button"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors select-none"
            :class="
              pomodoroStore.mode === modeOption.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="handleSelectMode(modeOption.key)"
          >
            {{ modeOption.label }}
          </button>
        </div>

        <div
          class="font-semibold tabular-nums select-none"
          style="font-size: clamp(5rem, 18vw, 8rem); line-height: 1"
        >
          {{ pomodoroStore.timeLabel }}
        </div>

        <div class="flex items-center gap-3">
          <Button
            size="lg"
            class="px-6 py-6"
            :aria-label="t('pomodoro.reset')"
            @click="handleResetRequest"
          >
            <RotateCcw class="size-5" />
          </Button>
          <Button
            size="lg"
            class="min-w-40 rounded-full px-8 py-6 text-lg font-semibold tracking-wide uppercase"
            @click="handleToggle"
          >
            <component :is="pomodoroStore.isRunning ? Pause : Play" class="size-5" />
            {{ pomodoroStore.isRunning ? t('pomodoro.pause') : t('pomodoro.start') }}
          </Button>
          <Button
            size="lg"
            class="px-6 py-6"
            :aria-label="t('pomodoro.skip')"
            @click="handleSkipRequest"
          >
            <SkipForward class="size-5" />
          </Button>
        </div>

        <div
          class="flex items-center gap-3 rounded-full px-5 py-2.5 ring-1 transition-colors duration-700 select-none"
          :class="[modeStyle.bg, modeStyle.ring]"
        >
          <div
            class="flex size-10 items-center justify-center rounded-full transition-colors duration-700"
            :class="modeStyle.iconBg"
          >
            <component :is="modeStyle.icon" class="size-5" :class="modeStyle.accentText" />
          </div>
          <div class="text-left">
            <p
              class="text-[0.7rem] font-medium tracking-wider uppercase transition-colors duration-700"
              :class="modeStyle.accentText"
            >
              {{ t('pomodoro.session') }} #{{ sessionLabel }}
            </p>
            <p class="text-foreground text-sm font-semibold">{{ statusLabel }}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <NxrConfirmDialog
      v-model="isResetDialogOpen"
      :title="t('pomodoro.confirmReset.title')"
      :description="t('pomodoro.confirmReset.description')"
      :confirm-label="t('pomodoro.reset')"
      is-destructive
      @confirm="handleResetConfirm"
    />

    <NxrConfirmDialog
      v-model="isSkipDialogOpen"
      :title="t('pomodoro.confirmSkip.title')"
      :description="t('pomodoro.confirmSkip.description')"
      :confirm-label="t('pomodoro.skip')"
      @confirm="handleSkipConfirm"
    />

    <NxrConfirmDialog
      v-model="isModeChangeDialogOpen"
      :title="t('pomodoro.confirmModeChange.title', { mode: pendingModeLabel })"
      :description="t('pomodoro.confirmModeChange.description')"
      :confirm-label="t('pomodoro.confirmModeChange.confirm')"
      @confirm="handleModeChangeConfirm"
    />

    <PomodoroSettingsDialog v-model="isSettingsDialogOpen" @open-stats="isStatsDialogOpen = true" />
    <PomodoroStatsDialog v-model="isStatsDialogOpen" />
  </div>
</template>
