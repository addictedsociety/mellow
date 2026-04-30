<script setup lang="ts">
const { title, description = '' } = defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="rounded-3xl border border-dashed border-stone-300 bg-white/60 p-8 text-center">
    <p class="font-medium text-stone-700">{{ title }}</p>
    <p v-if="description" class="mt-2 text-sm text-stone-500">{{ description }}</p>
  </div>
</template>
