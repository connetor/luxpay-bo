<script setup lang="ts">

import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { computed, ref } from 'vue';

const size = ref('default');

const props = defineProps<{
    value: [ Dayjs , Dayjs ]
}>()

const emit = defineEmits(['update:modelValue'])

const onPickDate = (e: Event) => {
    console.log(e);
    
}

const pickDate = computed(() => {
    const today = dayjs()
    // if(props.value[0].diff(today , 'day') == 1) {
    //     return 'today'
    // }
    // if(props.value[0].diff(props.value[1] , 'day') == 1) {
    //     return 'yesterday'
    // }
    // else if(props.value[0].diff(props.value[1] , 'day') == 0) {
    //     return 'today'
    // }
    // else if(props.value[0].diff(props.value[1] , 'week') == 1) {
    //     return 'last_week'
    // }
    // else if(props.value[0].diff(props.value[1] , 'month') == 1) {
    //     return 'last_month'
    // }
    // else {
    //     return 'this_week'
    // }
})

</script>

<template>
    <a-radio-group @change="onPickDate" :value="pickDate" button-style="solid">
      <a-radio-button value="today">วันนี้</a-radio-button>
      <a-radio-button value="yesterday">เมื่อวาน</a-radio-button>
      <a-radio-button value="this_week">อาทิตย์นี้</a-radio-button>
      <a-radio-button value="last_week">อาทิตย์ที่แล้ว</a-radio-button>
      <a-radio-button value="this_month">เดือนนี้</a-radio-button>
      <a-radio-button value="last_month">เดือนที่แล้ว</a-radio-button>
    </a-radio-group>
</template>