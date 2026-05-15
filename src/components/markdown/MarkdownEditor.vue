<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import MarkdownPreview from './MarkdownPreview.vue'

const model = defineModel<string>({ default: '' })

const { t } = useI18n()

const activeTab = ref<'edit' | 'preview'>('edit')
</script>

<template>
  <div class="border-border bg-card text-card-foreground overflow-hidden rounded-3xl border">
    <div class="border-border bg-muted flex border-b p-1">
      <button
        class="rounded-2xl px-4 py-2 text-sm font-medium transition select-none"
        :class="
          activeTab === 'edit'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        type="button"
        @click="activeTab = 'edit'"
      >
        {{ t('markdown.edit') }}
      </button>
      <button
        class="rounded-2xl px-4 py-2 text-sm font-medium transition select-none"
        :class="
          activeTab === 'preview'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        type="button"
        @click="activeTab = 'preview'"
      >
        {{ t('markdown.preview') }}
      </button>
    </div>

    <textarea
      v-if="activeTab === 'edit'"
      v-model="model"
      class="bg-card text-foreground min-h-36 w-full resize-y p-4 text-sm outline-none"
      :placeholder="t('markdown.placeholder')"
    />
    <div v-else class="min-h-36 p-4">
      <MarkdownPreview :content="model" />
    </div>
  </div>
</template>
