<script lang="ts" setup>
import { useUiStore } from '@/stores/ui';
import ThunderSpinner from './ThunderSpinner.vue';

const ui = useUiStore()
</script>

<template>
    <div class="w-full h-[100vh] fixed flex items-center justify-center backdrop-blur-sm bg-white/80" style="z-index: 1000;" v-if="ui.loading"> 
        <div class="flex flex-col items-center gap-4">
            <ThunderSpinner size="xl" />
            <div class="text-center">
                <h3 class="text-lg font-semibold text-thunder-orange mb-1">OrderPay</h3>
                <p class="text-sm text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
        </div>
    </div>
</template>