<template>
  <div class="thunder-progress">
    <div v-if="label" class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span class="text-sm font-semibold text-thunder-orange">{{ percentage }}%</span>
    </div>
    
    <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        :class="[
          'thunder-progress-bar',
          'h-full',
          'rounded-full',
          'transition-all',
          'duration-500',
          'ease-out',
          variantClasses
        ]"
        :style="{ width: `${percentage}%` }"
      >
        <div v-if="animated" class="progress-shine"></div>
      </div>
    </div>
    
    <p v-if="description" class="mt-2 text-xs text-gray-500">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percentage: number
  label?: string
  description?: string
  variant?: 'primary' | 'success' | 'warning' | 'error'
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  animated: true
})

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-thunder-gradient',
    success: 'bg-green-500',
    warning: 'bg-thunder-orange',
    error: 'bg-red-500'
  }
  return variants[props.variant]
})
</script>

<style scoped>
.thunder-progress-bar {
  position: relative;
  overflow: hidden;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shine 2s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
</style>

