<template>
  <Teleport to="body">
    <Transition name="thunder-modal">
      <div v-if="visible" class="thunder-modal-overlay" @click="handleOverlayClick">
        <div 
          :class="[
            'thunder-modal',
            'bg-white',
            'rounded-thunder-lg',
            'shadow-thunder-lg',
            'border',
            'border-thunder-yellow-light',
            'overflow-hidden',
            sizeClasses
          ]"
          @click.stop
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="px-6 py-4 border-b border-thunder-yellow-light bg-thunder-gradient-light">
            <slot name="header">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div v-if="icon" class="w-8 h-8 bg-thunder-gradient rounded-lg flex items-center justify-center">
                    <Icon :icon="icon" class="text-white" width="18" height="18" />
                  </div>
                  <h3 class="text-lg font-semibold text-thunder-orange">{{ title }}</h3>
                </div>
                <button 
                  @click="$emit('close')"
                  class="w-8 h-8 bg-gray-100 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Icon icon="mdi:close" class="text-gray-500 hover:text-red-500" width="16" height="16" />
                </button>
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
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

interface Props {
  visible: boolean
  title?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true
})

defineEmits<{
  close: []
}>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-96 max-w-sm',
    md: 'w-full max-w-md',
    lg: 'w-full max-w-lg',
    xl: 'w-full max-w-xl',
    full: 'w-full max-w-4xl'
  }
  return sizes[props.size]
})

const handleOverlayClick = () => {
  if (props.closable) {
    // Emit close event
  }
}
</script>

<style scoped>
.thunder-modal-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.thunder-modal {
  max-height: 90vh;
  overflow-y: auto;
}

.thunder-modal-enter-active,
.thunder-modal-leave-active {
  transition: all 0.3s ease;
}

.thunder-modal-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.thunder-modal-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
</style>

