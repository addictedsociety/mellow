<script setup lang="ts">
import { ArrowDown, ArrowUp, Search } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { SortOrder } from '@/utils/useTaskFilter'

const { sortFields, searchPlaceholder } = defineProps<{
  sortFields: { value: string; label: string }[]
  searchPlaceholder?: string
}>()

const search = defineModel<string>('search', { default: '' })
const sortField = defineModel<string>('sortField', { required: true })
const sortOrder = defineModel<SortOrder>('sortOrder', { required: true })

const { t } = useI18n()

const toggleOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <div class="relative min-w-0 flex-1">
      <Search class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        v-model="search"
        :placeholder="searchPlaceholder ?? t('filter.search')"
        class="rounded-2xl pl-9"
      />
    </div>

    <Select v-model="sortField">
      <SelectTrigger class="w-48 rounded-2xl">
        <SelectValue :placeholder="t('filter.sortBy')" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="field in sortFields" :key="field.value" :value="field.value">
          {{ field.label }}
        </SelectItem>
      </SelectContent>
    </Select>

    <Button
      type="button"
      variant="outline"
      class="rounded-2xl"
      :aria-label="sortOrder === 'asc' ? t('filter.ascending') : t('filter.descending')"
      @click="toggleOrder"
    >
      <component :is="sortOrder === 'asc' ? ArrowUp : ArrowDown" class="size-4" />
    </Button>
  </div>
</template>
