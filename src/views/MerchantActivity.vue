<script setup lang="ts">
import dayjs from 'dayjs';
import { reactive } from 'vue';
import { formatNumber } from '@/utils'
import { Icon } from '@iconify/vue';
import { Bar , Pie } from 'vue-chartjs'
import { genBarChart, genPieChart , chartOptionsMock } from '@/data/chart';
import { Chart as ChartJS, Title, Tooltip, Legend , ArcElement , BarElement, CategoryScale, LinearScale } from 'chart.js'

import { SettingOutlined, EditOutlined, EllipsisOutlined } from '@ant-design/icons-vue';

ChartJS.register(Title, Tooltip, Legend, BarElement , ArcElement , CategoryScale, LinearScale)

const loading = reactive({
    stats: false
})

const chartDatas = reactive({
    bar: genBarChart(7) ,
    pie: genPieChart(7)
})

const chartOptions = reactive({ ...chartOptionsMock })

const formStateSearch = reactive({
    date: [
        dayjs(dayjs() , 'YYYY-MM-DD'), 
        dayjs(dayjs() , 'YYYY-MM-DD')
    ]
})

const infos = reactive([
    { title: 'ยอดคงเหลือ' , key: 'balance' , value: 0 , prefix: '฿' , color: 'danger' , icon: 'dashicons:money-alt' , bg_icon: 'bg-green-500' } ,
    { title: 'ยอดฝากทั้งหมด' , key: 'total_deposit' , value: 0 , prefix: '฿' , sub_value: '+0.00' , color: 'success' , icon: 'dashicons:money-alt' , bg_icon: 'bg-green-500' } ,
    { title: 'ยอดถอนทั้งหมด' , key: 'total_withdraw' , value: 0 , prefix: '฿' , sub_value: '+0.00' , color: 'danger' , icon: 'dashicons:money-alt' , bg_icon: 'bg-red-500' } ,
])

</script>

<template>
    <a-row :gutter="[12 , 12]">
        <a-col :span="24">
            <a-typography-title :level="2" style="margin-bottom: 6px;">ข้อมูลร้านค้า</a-typography-title>
            <p>ข้อมูลความเคลื่อนไหวของร้านค้า</p>
        </a-col>
        <a-col :span="24">
            <a-card >
                <!-- <template #cover>
                    <img
                        alt="example"
                        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                        height="200px"
                    />
                </template> -->
                <template #actions>
                    <setting-outlined key="setting" />
                    <edit-outlined key="edit" />
                    <ellipsis-outlined key="ellipsis" />
                </template>
                <a-card-meta title="A" description="สาย digi mon">
                    <template #avatar>
                        <a-avatar size="large" src="https://cdn-icons-png.freepik.com/512/428/428573.png" />
                    </template>
                </a-card-meta>
                dsds
            </a-card>
        </a-col>
    </a-row>
</template>

