<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const model = defineModel<'de' | 'en'>({ default: 'de' })
</script>

<template>
  <Select v-model="model">
    <SelectTrigger class="bg-background h-11 w-full rounded-2xl px-4">
      <SelectValue placeholder="Select a language" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Languages</SelectLabel>
        <SelectItem value="de"> Deutsch </SelectItem>
        <SelectItem value="en"> English </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
