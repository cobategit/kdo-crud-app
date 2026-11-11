<script setup lang="ts">
import { useId } from 'vue'
import FormField from './FormField.vue'
import { fieldClass } from './fieldClasses'

export interface SelectOption {
  value: string
  label: string
}

const props = defineProps<{
  options: readonly SelectOption[]
  label?: string
  error?: string
  hint?: string
  required?: boolean
  id?: string
  placeholder?: string
  disabled?: boolean
  /** Label aksesibel bila tanpa label visual (mis. filter). */
  ariaLabel?: string
}>()
const model = defineModel<string | null | undefined>()
const autoId = useId()
const selectId = props.id ?? autoId
</script>

<template>
  <FormField :id="selectId" :label="label" :error="error" :hint="hint" :required="required">
    <select
      :id="selectId"
      v-model="model"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${selectId}-error` : undefined"
      :class="[fieldClass(error), 'pr-8']"
    >
      <option v-if="placeholder !== undefined" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </FormField>
</template>
