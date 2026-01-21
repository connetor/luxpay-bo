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
        <thead class="bg-gray-800">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              class="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider"
            >
              {{ column.title }}
            </th>
            <th v-if="$slots.actions" class="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">
              การดำเนินการ
            </th>
          </tr>
        </thead>
        <tbody class="bg-gray-800 divide-y divide-gray-600">
          <tr 
            v-for="(row, index) in data" 
            :key="index"
            class="hover:bg-gray-700 transition-colors duration-200"
          >
            <td 
              v-for="column in columns" 
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm text-white"
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
            <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-white">
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
      <h3 class="text-lg font-medium text-white mb-1">ไม่มีข้อมูล</h3>
      <p class="text-sm text-gray-300">ยังไม่มีข้อมูลในตารางนี้</p>
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
  background-color: #1f2937;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid #374151;
  overflow: hidden;
}

th {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
