<template>
  <span
    :class="[
      'thunder-badge',
      'inline-flex',
      'items-center',
      'gap-1',
      'px-2.5',
      'py-1',
      'rounded-full',
      'text-xs',
      'font-medium',
      'transition-all',
      'duration-300',
      sizeClasses,
      variantClasses
    ]"
  >
    <Icon v-if="icon" :icon="icon" :width="iconSize" :height="iconSize" />
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md'
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }
  return sizes[props.size]
})

const variantClasses = computed(() => {
  const variants = {
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-thunder-gradient-light text-thunder-orange border border-thunder-yellow',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    primary: 'bg-thunder-gradient text-white shadow-thunder-light',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200'
  }
  return variants[props.variant]
})

const iconSize = computed(() => {
  const sizes = {
    sm: 12,
    md: 14,
    lg: 16
  }
  return sizes[props.size]
})
</script>

<style scoped>
.thunder-badge {
  backdrop-filter: blur(10px);
}
</style>
