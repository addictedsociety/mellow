<script setup lang="ts">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'

const { content = '' } = defineProps<{
  content?: string
}>()

const markdown = new MarkdownIt({
  breaks: true,
  linkify: true
})

const renderedContent = computed(() => DOMPurify.sanitize(markdown.render(content)))
</script>

<template>
  <div class="markdown-body" v-html="renderedContent" />
</template>
