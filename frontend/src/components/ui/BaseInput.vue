<script setup lang="ts">
import { useId } from 'vue'
import FormField from './FormField.vue'
import { fieldClass } from './fieldClasses'

const props = defineProps<{
  label?: string
  error?: string
  hint?: string
  required?: boolean
  id?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  inputmode?: 'text' | 'numeric' | 'search'
  maxlength?: number
  autocomplete?: string
}>()
const model = defineModel<string | number | null>()
const autoId = useId()
const inputId = props.id ?? autoId
defineEmits<{ blur: [FocusEvent] }>()
</script>

<template>
  <FormField :id="inputId" :label="label" :error="error" :hint="hint" :required="required">
    <input
      :id="inputId"
      v-model="model"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      :inputmode="inputmode"
      :maxlength="maxlength"
      :autocomplete="autocomplete ?? 'off'"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
      :class="fieldClass(error)"
      @blur="$emit('blur', $event)"
    />
  </FormField>
</template>
