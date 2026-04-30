<script setup lang="ts">
const model = defineModel<'de' | 'en'>({ default: 'de' })
</script>

<template>
  <select v-model="model" class="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3">
    <option value="de">Deutsch</option>
    <option value="en">English</option>
  </select>
</template>
