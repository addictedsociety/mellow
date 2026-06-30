<script setup lang="ts">
import { ChartColumn, Flame, History, TrendingUp } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { usePomodoroStore } from '@/stores/pomodoro'
import { formatDuration } from '@/utils/time'

const RANGE_OPTIONS = [7, 14, 30] as const

const isOpen = defineModel<boolean>({ default: false })

const { t, locale } = useI18n()
const pomodoroStore = usePomodoroStore()

const selectedRangeDays = ref<(typeof RANGE_OPTIONS)[number]>(7)

const entries = computed(() => pomodoroStore.getHistoryRange(selectedRangeDays.value))
const tableEntries = computed(() =>
  [...entries.value]
    .reverse()
    .filter((entry) => entry.stats.focusSeconds > 0 || entry.stats.sessionsCompleted > 0)
)

const totalFocusSeconds = computed(() =>
  entries.value.reduce((sum, entry) => sum + entry.stats.focusSeconds, 0)
)
const totalSessions = computed(() =>
  entries.value.reduce((sum, entry) => sum + entry.stats.sessionsCompleted, 0)
)
const averageFocusSecondsPerDay = computed(() =>
  entries.value.length === 0 ? 0 : totalFocusSeconds.value / entries.value.length
)
const bestEntry = computed(() =>
  entries.value.reduce<(typeof entries.value)[number] | null>(
    (best, entry) => (!best || entry.stats.focusSeconds > best.stats.focusSeconds ? entry : best),
    null
  )
)
const maxFocusSeconds = computed(() =>
  Math.max(1, ...entries.value.map((entry) => entry.stats.focusSeconds))
)
const hasData = computed(() => totalFocusSeconds.value > 0 || totalSessions.value > 0)

const formatShortDate = (dateKey: string) =>
  new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: '2-digit' }).format(
    new Date(`${dateKey}T00:00:00`)
  )
const formatWeekday = (dateKey: string) =>
  new Intl.DateTimeFormat(locale.value, { weekday: 'short' }).format(
    new Date(`${dateKey}T00:00:00`)
  )
const getBarHeightPercent = (focusSeconds: number) =>
  Math.max(4, Math.round((focusSeconds / maxFocusSeconds.value) * 100))
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <ChartColumn class="size-5" />
          {{ t('pomodoro.stats.title') }}
        </DialogTitle>
        <DialogDescription>
          {{ t('pomodoro.stats.description') }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-6">
        <div class="bg-muted/60 flex w-fit items-center gap-1 rounded-full p-1">
          <button
            v-for="rangeOption in RANGE_OPTIONS"
            :key="rangeOption"
            type="button"
            class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors select-none"
            :class="
              selectedRangeDays === rangeOption
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            "
            @click="selectedRangeDays = rangeOption"
          >
            {{ t(`pomodoro.stats.range.${rangeOption}`) }}
          </button>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="border-border bg-card rounded-2xl border p-4">
            <p class="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <Flame class="size-3.5" />
              {{ t('pomodoro.stats.totalFocus') }}
            </p>
            <p class="mt-2 text-xl font-semibold tabular-nums">
              {{ formatDuration(totalFocusSeconds) }}
            </p>
          </div>
          <div class="border-border bg-card rounded-2xl border p-4">
            <p class="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <History class="size-3.5" />
              {{ t('pomodoro.stats.totalSessions') }}
            </p>
            <p class="mt-2 text-xl font-semibold tabular-nums">{{ totalSessions }}</p>
          </div>
          <div class="border-border bg-card rounded-2xl border p-4">
            <p class="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
              <TrendingUp class="size-3.5" />
              {{ t('pomodoro.stats.averagePerDay') }}
            </p>
            <p class="mt-2 text-xl font-semibold tabular-nums">
              {{ formatDuration(averageFocusSecondsPerDay) }}
            </p>
          </div>
        </div>

        <div v-if="hasData" class="border-border bg-card rounded-2xl border p-4">
          <div class="flex h-28 items-end gap-1">
            <div
              v-for="entry in entries"
              :key="entry.date"
              class="bg-primary/70 hover:bg-primary flex-1 rounded-t transition-colors"
              :style="{ height: `${getBarHeightPercent(entry.stats.focusSeconds)}%` }"
              :title="`${formatShortDate(entry.date)}: ${formatDuration(entry.stats.focusSeconds)}`"
            />
          </div>
          <div v-if="selectedRangeDays <= 14" class="mt-2 flex gap-1">
            <span
              v-for="entry in entries"
              :key="entry.date"
              class="text-muted-foreground flex-1 text-center text-[0.65rem] select-none"
            >
              {{ formatWeekday(entry.date) }}
            </span>
          </div>
        </div>

        <div class="border-border overflow-hidden rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ t('pomodoro.stats.tableDate') }}</TableHead>
                <TableHead class="text-right">{{ t('pomodoro.stats.tableFocusTime') }}</TableHead>
                <TableHead class="text-right">{{ t('pomodoro.stats.tableSessions') }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableEmpty v-if="tableEntries.length === 0" :colspan="3">
                {{ t('pomodoro.stats.empty') }}
              </TableEmpty>
              <TableRow
                v-for="entry in tableEntries"
                :key="entry.date"
                :class="
                  bestEntry?.date === entry.date && entry.stats.focusSeconds > 0 && 'bg-primary/5'
                "
              >
                <TableCell>{{ formatShortDate(entry.date) }}</TableCell>
                <TableCell class="text-right tabular-nums">
                  {{ formatDuration(entry.stats.focusSeconds) }}
                </TableCell>
                <TableCell class="text-right tabular-nums">
                  {{ entry.stats.sessionsCompleted }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
