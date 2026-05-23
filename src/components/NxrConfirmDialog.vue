<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

const {
  title,
  description,
  confirmLabel,
  cancelLabel,
  isDestructive = false
} = defineProps<{
  title: string
  description?: string
  confirmLabel: string
  cancelLabel?: string
  isDestructive?: boolean
}>()

const emit = defineEmits<{
  confirm: []
}>()

const isOpen = defineModel<boolean>({ default: false })

const { t } = useI18n()

const handleConfirm = () => {
  emit('confirm')
  isOpen.value = false
}
</script>

<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="description">
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ cancelLabel ?? t('common.cancel') }}</AlertDialogCancel>
        <AlertDialogAction
          :class="isDestructive && 'bg-destructive hover:bg-destructive/90 text-white'"
          @click="handleConfirm"
        >
          {{ confirmLabel }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
