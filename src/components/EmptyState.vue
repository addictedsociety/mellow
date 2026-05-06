<script setup lang="ts">
const { title, description = '' } = defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div
    class="border-border bg-card/60 text-card-foreground rounded-3xl border border-dashed p-8 text-center"
  >
    <p class="font-medium">{{ title }}</p>
    <p v-if="description" class="text-muted-foreground mt-2 text-sm">{{ description }}</p>
  </div>
</template>
