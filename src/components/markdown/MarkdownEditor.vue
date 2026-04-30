<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownPreview from './MarkdownPreview.vue'

const model = defineModel<string>({ default: '' })

const { t } = useI18n()

const activeTab = ref<'edit' | 'preview'>('edit')
</script>

<template>
  <div class="overflow-hidden rounded-3xl border border-stone-200 bg-white">
    <div class="flex border-b border-stone-200 bg-stone-50 p-1">
      <button
        class="rounded-2xl px-4 py-2 text-sm font-medium"
        :class="activeTab === 'edit' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'"
        type="button"
        @click="activeTab = 'edit'"
      >
        {{ t('markdown.edit') }}
      </button>
      <button
        class="rounded-2xl px-4 py-2 text-sm font-medium"
        :class="activeTab === 'preview' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'"
        type="button"
        @click="activeTab = 'preview'"
      >
        {{ t('markdown.preview') }}
      </button>
    </div>

    <textarea
      v-if="activeTab === 'edit'"
      v-model="model"
      class="min-h-36 w-full resize-y bg-white p-4 text-sm outline-none"
      :placeholder="t('markdown.placeholder')"
    />
    <div v-else class="min-h-36 p-4">
      <MarkdownPreview :content="model" />
    </div>
  </div>
</template>
