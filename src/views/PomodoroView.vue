<script setup lang="ts">
import { ClockFading } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import PomodoroBackground from '@/components/pomodoro/PomodoroBackground.vue'
import PomodoroTimer from '@/components/pomodoro/PomodoroTimer.vue'
import { usePomodoroStore } from '@/stores/pomodoro'

const { t } = useI18n()
const pomodoroStore = usePomodoroStore()
</script>

<template>
  <div class="relative h-full overflow-hidden rounded-3xl">
    <PomodoroBackground :mode="pomodoroStore.mode" />

    <div class="relative z-10 flex h-full flex-col px-6 py-6">
      <header class="shrink-0">
        <div class="flex flex-col items-center justify-center text-center">
          <div class="flex items-center gap-2">
            <ClockFading class="size-7" />
            <h1 class="text-3xl font-semibold select-none">{{ t('nav.pomodoro') }}</h1>
          </div>
          <p class="mt-1 select-none">{{ t('pomodoro.subtitle') }}</p>
        </div>
      </header>

      <div class="flex min-h-0 flex-1 items-center justify-center">
        <PomodoroTimer />
      </div>
    </div>
  </div>
</template>
