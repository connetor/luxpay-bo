<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import { onMounted } from 'vue';

const ui = useUiStore()

// Set default language to Thai if not set
onMounted(() => {
  if (!ui.lang) {
    ui.lang = 'th'
  }
})
</script>

<template>
    <a-select
      ref="select"
      v-model:value="ui.lang"
      size="large"
      style="width: 100%;"
      class="language-select"
      placeholder="เลือกภาษา"
      :default-value="'th'"
    >
      <a-select-option value="th">
        <div class="flex items-center gap-2">
          <img src="/img/th.png" alt="th" width="16">
          <span> ภาษาไทย</span>
        </div>
      </a-select-option>
      <a-select-option value="en">
        <div class="flex items-center gap-2">
          <img src="/img/eng.png" alt="en" width="16">
          <span> English</span>
        </div>
      </a-select-option>
    </a-select>


</template>

<style scoped>
.language-select :deep(.ant-select-selector) {
  border-radius: 12px;
  border: 2px solid var(--gray-200);
  transition: all 0.3s ease;
  font-size: 16px;
  padding: 12px 16px;
  height: 48px;
}

.language-select :deep(.ant-select-selector:hover) {
  border-color: var(--primary-light);
}

.language-select :deep(.ant-select-focused .ant-select-selector) {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
}
</style>
