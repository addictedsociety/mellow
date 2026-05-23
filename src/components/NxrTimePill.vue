<script setup lang="ts">
import { Clock3 } from 'lucide-vue-next'

const { time, isLive = false } = defineProps<{
  time: string
  isLive?: boolean
}>()
</script>

<template>
  <div
    class="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5"
    :class="
      isLive
        ? 'border-primary/40 from-primary/15 to-primary/5 bg-gradient-to-br'
        : 'border-border/60 bg-muted/40'
    "
  >
    <span v-if="isLive" class="relative flex size-2 shrink-0">
      <span
        class="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
      />
      <span class="bg-primary relative inline-flex size-2 rounded-full" />
    </span>
    <Clock3 v-else class="text-muted-foreground size-3 shrink-0" />

    <span
      class="font-mono text-sm leading-none font-semibold tabular-nums select-none"
      :class="isLive ? 'text-primary' : 'text-foreground'"
    >
      {{ time }}
    </span>
  </div>
</template>
