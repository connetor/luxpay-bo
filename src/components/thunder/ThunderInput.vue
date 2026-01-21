<template>
  <div class="thunder-input-group">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon :icon="icon" class="text-thunder-orange" width="18" height="18" />
      </div>
      
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'thunder-input',
          'w-full',
          'px-4',
          'py-3',
          'border',
          'border-thunder-yellow-light',
          'rounded-thunder',
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-thunder-yellow',
          'focus:border-thunder-yellow',
          'transition-all',
          'duration-300',
          'bg-white',
          'text-gray-800',
          'placeholder-gray-400',
          'disabled:bg-gray-100',
          'disabled:text-gray-500',
          'disabled:cursor-not-allowed',
          icon ? 'pl-10' : '',
          error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      
      <div v-if="error" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <Icon icon="mdi:alert-circle" class="text-red-500" width="18" height="18" />
      </div>
    </div>
    
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-if="hint && !error" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  label?: string
  placeholder?: string
  icon?: string
  disabled?: boolean
  required?: boolean
  error?: string
  hint?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()
</script>

<style scoped>
.thunder-input:focus {
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
}
</style>
