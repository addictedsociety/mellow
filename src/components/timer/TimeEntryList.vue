<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import EmptyState from '@/components/EmptyState.vue'
import MarkdownPreview from '@/components/markdown/MarkdownPreview.vue'
import type { TimeEntry } from '@/types/time-entry.type'
import { formatDate, formatMinutes } from '@/utils/time'

const { entries } = defineProps<{
  entries: TimeEntry[]
}>()

const { t } = useI18n()
</script>

<template>
  <section class="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
    <h2 class="text-lg font-semibold">{{ t('timeEntries.title') }}</h2>

    <div v-if="entries.length" class="mt-4 divide-y divide-stone-100">
      <article v-for="entry in entries" :key="entry.id" class="py-4">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="font-medium">{{ entry.taskTitle }}</p>
            <p class="text-sm text-stone-500">
              {{ entry.entryType === 'manual' ? t('timeEntries.manual') : t('timeEntries.tracked') }}
              · {{ formatDate(entry.startTime) }}
            </p>
          </div>
          <span class="rounded-full bg-stone-100 px-3 py-1 text-sm font-medium">
            {{ formatMinutes(entry.durationMinutes) }}
          </span>
        </div>
        <MarkdownPreview v-if="entry.noteMarkdown" class="mt-3" :content="entry.noteMarkdown" />
      </article>
    </div>
    <EmptyState v-else class="mt-4" :title="t('timeEntries.empty')" />
  </section>
</template>
