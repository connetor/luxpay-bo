<template>
  <div class="thunder-table-container">
    <!-- Table Header -->
    <div v-if="title || $slots.header" class="px-6 py-4 border-b border-thunder-yellow-light bg-thunder-gradient-light">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-thunder-orange">{{ title }}</h3>
          <div class="flex items-center gap-2">
            <slot name="actions"></slot>
          </div>
        </div>
      </slot>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-thunder-gradient-light">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              class="px-6 py-4 text-left text-xs font-semibold text-thunder-orange uppercase tracking-wider"
            >
              {{ column.title }}
            </th>
            <th v-if="$slots.actions" class="px-6 py-4 text-right text-xs font-semibold text-thunder-orange uppercase tracking-wider">
              การดำเนินการ
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-thunder-yellow-light">
          <tr 
            v-for="(row, index) in data" 
            :key="index"
            class="hover:bg-thunder-gradient-light transition-colors duration-200"
          >
            <td 
              v-for="column in columns" 
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
            >
              <slot 
                :name="`cell-${column.key}`" 
                :row="row" 
                :value="row[column.key]"
                :column="column"
              >
                {{ row[column.key] }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <slot name="actions" :row="row" :index="index"></slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="data.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-thunder-gradient-light rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon icon="mdi:database-off" class="text-thunder-orange" width="32" height="32" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-1">ไม่มีข้อมูล</h3>
      <p class="text-sm text-gray-500">ยังไม่มีข้อมูลในตารางนี้</p>
    </div>

    <!-- Table Footer -->
    <div v-if="$slots.footer" class="px-6 py-4 border-t border-thunder-yellow-light bg-thunder-gradient-light">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

interface Column {
  key: string
  title: string
}

interface Props {
  data: any[]
  columns: Column[]
  title?: string
}

defineProps<Props>()
</script>

<style scoped>
.thunder-table-container {
  @apply bg-white rounded-thunder-lg shadow-thunder-light border border-thunder-yellow-light overflow-hidden;
}

th {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>

