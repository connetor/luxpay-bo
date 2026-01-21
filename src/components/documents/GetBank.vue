<script setup lang="ts">
import api from '@/configs/api'
import { onMounted, reactive, ref } from 'vue'

const columns = reactive({
    headers: [
        { title: 'Key' , dataIndex: 'key' , key: 'key' } ,
        { title: 'Value' , dataIndex: 'value' , key: 'value' } ,
    ] ,
    data: [
        { title: '#' , width: '5%' , dataIndex: 'id' , key: 'id' , align: 'center'},
        { title: 'ธนาคาร' , width: '10%' , dataIndex: 'img' , key: 'img' , align: 'center' },
        { title: 'ชื่อ' , dataIndex: 'nameTh' , key: 'nameTh' },
        { title: 'รหัส' , dataIndex: 'code' , key: 'code' },
        { title: 'ตัวย่อ' , dataIndex: 'short' , key: 'short' }
    ]
})

const loading = ref(false)
const banks = ref([])

const headers = reactive([
    { key: 'Content-Type' , value: 'application/json' }
])

const data = reactive({
    status: 'true' ,
    msg: 'success' ,
    data: [
        {
            code: "002" ,
            img: "https://business.krungthai.com/ktb/rest/biznext-channel/static/img/bank/bangkok-bank-logo.png" ,
            nameEn: null,
            nameTh: "ธนาคารกรุงเทพ",
            short: "BBL",
        }
    ]
})
const prettyJson = JSON.stringify(data, null, 2)
const activeKey = ref('')

const loadData = async () => {
    loading.value = true
    try {
        const res = await api.get('api/v1/bo/bank' ).then(res => res.data)
        banks.value = res.data
    } catch(e) {}
    loading.value = false
}

onMounted(async () => {
    await loadData()
})

</script>

<template>
    <a-card class="shadow-sm">
        <template #extra>
            <a target="_blank" href="https://documenter.getpostman.com/view/45735306/2sB3HtFce3#8593af45-ce82-4c80-b126-e3359d946859">คู่มือ</a>
        </template>
        <a-typography-title :level="4" style="margin-bottom: 6px;">Get Bank</a-typography-title>
        <p class="text-gray-400"><span class="text-yellow-500 font-bold mr-[8px]">POST</span> { endPoint } /api/v1/mc/bank</p>
        <p>ดึงข้อมูลรหัสธนาคาร</p>

        <a-collapse v-model:activeKey="activeKey" ghost>
            <a-collapse-panel key="1" header="Headers">
                <a-table :data-source="headers" :columns="columns.headers" />
            </a-collapse-panel>
            <a-collapse-panel key="3" header="Response (ตัวอย่าง)">
                <pre class="bg-gray-900 text-green-300 text-sm p-4 rounded font-mono overflow-auto">{{ prettyJson }}</pre>
            </a-collapse-panel>
            <a-collapse-panel key="4" header="ข้อมูลธนาคาร">
                <a-table 
                    :columns="columns.data" 
                    :data-source="banks" 
                    :loading="loading" 
                    bordered 
                    :scroll="{ x: 'max-content' }"
                    :pagination="false"
                >
                    <template #bodyCell="{ column , index , record }">
                        <template v-if="column.key === 'id'">
                            {{ index + 1 }}
                        </template>
                        <template v-if="column.key === 'img'">
                            <img :src="record.img" :alt="record.nameTh" class="h-[30px] block mx-auto" />
                        </template>
                    </template>
                </a-table>
            </a-collapse-panel>
        </a-collapse>
    </a-card>
</template>