<script setup lang="ts">
import { LucideIcon } from 'lucide-vue-next'

const { title, description = '' } = defineProps<{
  title: string
  description?: string
  icon?: LucideIcon
}>()
</script>

<template>
  <div
    class="bg-card/80 text-card-foreground border-primary/35 rounded-3xl border p-8 text-center select-none"
  >
    <div class="flex flex-col items-center justify-center gap-2">
      <component :is="icon" class="text-muted-foreground size-10 animate-pulse" />
      <p class="text-foreground/50 font-semibold select-none">{{ title }}</p>
      <p v-if="description" class="text-muted-foreground/50 font-regular mt-2 text-sm select-none">
        {{ description }}
      </p>
    </div>
  </div>
</template>
