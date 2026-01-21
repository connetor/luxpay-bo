<template>
  <div 
    :class="[
      'thunder-stats-card',
      'bg-white',
      'rounded-thunder-lg',
      'p-6',
      'shadow-thunder-light',
      'hover:shadow-thunder',
      'transition-all',
      'duration-300',
      'border',
      'border-thunder-yellow-light',
      'hover:border-thunder-yellow',
      'group',
      'cursor-pointer'
    ]"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-600 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 mb-2">{{ value }}</p>
        <div v-if="change !== undefined" class="flex items-center gap-1">
          <Icon 
            :icon="change >= 0 ? 'mdi:trending-up' : 'mdi:trending-down'" 
            :class="change >= 0 ? 'text-green-500' : 'text-red-500'"
            width="16" 
            height="16" 
          />
          <span 
            :class="change >= 0 ? 'text-green-600' : 'text-red-600'"
            class="text-sm font-medium"
          >
            {{ Math.abs(change) }}%
          </span>
          <span class="text-sm text-gray-500">{{ changeLabel }}</span>
        </div>
      </div>
      
      <div 
        :class="[
          'w-12',
          'h-12',
          'rounded-thunder',
          'flex',
          'items-center',
          'justify-center',
          'group-hover:scale-110',
          'transition-transform',
          'duration-300',
          iconBgClasses
        ]"
      >
        <Icon :icon="icon" :class="iconClasses" width="24" height="24" />
      </div>
    </div>
    
    <div v-if="description" class="mt-4 pt-4 border-t border-thunder-yellow-light">
      <p class="text-xs text-gray-500">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  title: string
  value: string | number
  icon: string
  change?: number
  changeLabel?: string
  description?: string
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  changeLabel: 'จากเดือนที่แล้ว'
})

defineEmits<{
  click: []
}>()

const iconBgClasses = computed(() => {
  const classes = {
    primary: 'bg-thunder-gradient',
    success: 'bg-green-100',
    warning: 'bg-thunder-gradient-light',
    error: 'bg-red-100',
    info: 'bg-blue-100'
  }
  return classes[props.variant]
})

const iconClasses = computed(() => {
  const classes = {
    primary: 'text-white',
    success: 'text-green-600',
    warning: 'text-thunder-orange',
    error: 'text-red-600',
    info: 'text-blue-600'
  }
  return classes[props.variant]
})
</script>

<style scoped>
.thunder-stats-card:hover {
  transform: translateY(-2px);
}
</style>

