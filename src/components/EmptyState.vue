<script setup lang="ts">
const { title, description = '' } = defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center text-card-foreground">
    <p class="font-medium">{{ title }}</p>
    <p v-if="description" class="mt-2 text-sm text-muted-foreground">{{ description }}</p>
  </div>
</template>
