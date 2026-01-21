<template>
  <div 
    :class="[
      'thunder-card',
      'bg-white',
      'rounded-thunder-lg',
      'shadow-thunder-light',
      'hover:shadow-thunder',
      'transition-all',
      'duration-300',
      'border',
      'border-thunder-yellow-light',
      'hover:border-thunder-yellow',
      'overflow-hidden',
      variant === 'gradient' ? 'bg-thunder-gradient-light' : '',
      variant === 'primary' ? 'bg-thunder-gradient' : '',
      variant === 'primary' ? 'text-white' : 'text-gray-800'
    ]"
  >
    <!-- Header -->
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-thunder-yellow-light">
      <slot name="header">
        <div class="flex items-center gap-3">
          <div v-if="icon" class="w-8 h-8 bg-thunder-gradient rounded-lg flex items-center justify-center">
            <Icon :icon="icon" class="text-white" width="18" height="18" />
          </div>
          <h3 class="text-lg font-semibold" :class="variant === 'primary' ? 'text-white' : 'text-thunder-orange'">
            {{ title }}
          </h3>
        </div>
      </slot>
    </div>

    <!-- Content -->
    <div class="p-6">
      <slot></slot>
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-thunder-yellow-light bg-thunder-gradient-light">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Props {
  title?: string
  icon?: string
  variant?: 'default' | 'gradient' | 'primary'
}

defineProps<Props>()
</script>

<style scoped>
.thunder-card {
  backdrop-filter: blur(10px);
}

.thunder-card:hover {
  transform: translateY(-2px);
}
</style>

