<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import EmptyState from '@/components/EmptyState.vue'
import MarkdownPreview from '@/components/markdown/MarkdownPreview.vue'
import type { TimeEntry } from '@/types/time-entry.type'
import { formatDate, formatMinutes } from '@/utils/time'
import { CircleOff } from 'lucide-vue-next'

const { entries } = defineProps<{
  entries: TimeEntry[]
}>()

const { t } = useI18n()
</script>

<template>
  <section class="border-border bg-card text-card-foreground rounded-3xl border p-5 shadow-sm">
    <h2 class="text-lg font-semibold select-none">{{ t('timeEntries.title') }}</h2>

    <div v-if="entries.length" class="divide-border mt-4 divide-y">
      <article v-for="entry in entries" :key="entry.id" class="py-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-medium">{{ entry.taskTitle }}</p>
            <p class="text-muted-foreground text-sm">
              <span class="select-none">
                {{
                  entry.entryType === 'manual' ? t('timeEntries.manual') : t('timeEntries.tracked')
                }}
              </span>
              · {{ formatDate(entry.startTime) }}
            </p>
          </div>
          <span class="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-medium">
            {{ formatMinutes(entry.durationMinutes) }}
          </span>
        </div>
        <MarkdownPreview v-if="entry.noteMarkdown" class="mt-3" :content="entry.noteMarkdown" />
      </article>
    </div>
    <EmptyState v-else class="mt-4" :title="t('timeEntries.empty')" :icon="CircleOff" />
  </section>
</template>
