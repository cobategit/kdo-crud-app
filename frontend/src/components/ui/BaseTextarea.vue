<script setup lang="ts">
import { useId } from 'vue'
import FormField from './FormField.vue'
import { fieldClass } from './fieldClasses'

const props = defineProps<{
  label?: string
  error?: string
  hint?: string
  id?: string
  rows?: number
  placeholder?: string
  maxlength?: number
}>()
const model = defineModel<string | null>()
const autoId = useId()
const inputId = props.id ?? autoId
</script>

<template>
  <FormField :id="inputId" :label="label" :error="error" :hint="hint">
    <textarea
      :id="inputId"
      v-model="model"
      :rows="rows ?? 3"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :aria-invalid="error ? 'true' : undefined"
      :class="fieldClass(error)"
    />
  </FormField>
</template>
