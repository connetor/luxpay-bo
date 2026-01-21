<template>
  <button
    :class="[
      'thunder-button',
      'font-semibold',
      'transition-all',
      'duration-300',
      'rounded-thunder',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-thunder-yellow',
      'focus:ring-offset-2',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:hover:transform-none',
      sizeClasses,
      variantClasses
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <div class="flex items-center justify-center gap-2">
      <Icon v-if="icon" :icon="icon" :width="iconSize" :height="iconSize" />
      <slot></slot>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-thunder-gradient text-white shadow-thunder-light hover:shadow-thunder hover:transform hover:-translate-y-0.5',
    secondary: 'bg-thunder-gradient-light text-thunder-orange border border-thunder-yellow hover:bg-thunder-gradient hover:text-white hover:shadow-thunder-light',
    outline: 'border-2 border-thunder-yellow text-thunder-orange hover:bg-thunder-yellow hover:text-white hover:shadow-thunder-light',
    ghost: 'text-thunder-orange hover:bg-thunder-gradient-light hover:shadow-thunder-light',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg'
  }
  return variants[props.variant]
})

const iconSize = computed(() => {
  const sizes = {
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20
  }
  return sizes[props.size]
})
</script>

<style scoped>
.thunder-button:active {
  transform: translateY(0);
}
</style>
