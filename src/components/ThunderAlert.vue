<template>
  <Transition name="thunder-alert">
    <div 
      v-if="visible"
      :class="[
        'thunder-alert',
        'rounded-thunder',
        'border',
        'p-4',
        'shadow-thunder-light',
        'transition-all',
        'duration-300',
        variantClasses
      ]"
    >
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <Icon :icon="icon" :class="iconClasses" width="20" height="20" />
        </div>
        
        <div class="flex-1">
          <h4 v-if="title" :class="titleClasses" class="font-semibold mb-1">
            {{ title }}
          </h4>
          <p :class="messageClasses" class="text-sm">
            <slot>{{ message }}</slot>
          </p>
        </div>
        
        <button 
          v-if="closable"
          @click="$emit('close')"
          :class="[
            'flex-shrink-0',
            'w-6',
            'h-6',
            'rounded-full',
            'flex',
            'items-center',
            'justify-center',
            'transition-colors',
            'duration-200',
            closeButtonClasses
          ]"
        >
          <Icon icon="mdi:close" width="14" height="14" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  visible?: boolean
  variant?: 'success' | 'warning' | 'error' | 'info'
  title?: string
  message?: string
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  variant: 'info',
  closable: true
})

defineEmits<{
  close: []
}>()

const icon = computed(() => {
  const icons = {
    success: 'mdi:check-circle',
    warning: 'mdi:alert',
    error: 'mdi:alert-circle',
    info: 'mdi:information'
  }
  return icons[props.variant]
})

const variantClasses = computed(() => {
  const variants = {
    success: 'bg-green-50 border-green-200',
    warning: 'bg-thunder-gradient-light border-thunder-yellow',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  }
  return variants[props.variant]
})

const iconClasses = computed(() => {
  const classes = {
    success: 'text-green-500',
    warning: 'text-thunder-orange',
    error: 'text-red-500',
    info: 'text-blue-500'
  }
  return classes[props.variant]
})

const titleClasses = computed(() => {
  const classes = {
    success: 'text-green-800',
    warning: 'text-thunder-orange',
    error: 'text-red-800',
    info: 'text-blue-800'
  }
  return classes[props.variant]
})

const messageClasses = computed(() => {
  const classes = {
    success: 'text-green-700',
    warning: 'text-thunder-orange',
    error: 'text-red-700',
    info: 'text-blue-700'
  }
  return classes[props.variant]
})

const closeButtonClasses = computed(() => {
  const classes = {
    success: 'hover:bg-green-100 text-green-500',
    warning: 'hover:bg-thunder-yellow-light text-thunder-orange',
    error: 'hover:bg-red-100 text-red-500',
    info: 'hover:bg-blue-100 text-blue-500'
  }
  return classes[props.variant]
})
</script>

<style scoped>
.thunder-alert-enter-active,
.thunder-alert-leave-active {
  transition: all 0.3s ease;
}

.thunder-alert-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.thunder-alert-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

