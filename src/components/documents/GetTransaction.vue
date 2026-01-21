<script setup lang="ts">
import { reactive, ref } from 'vue'


const columns = reactive({
    headers: [
        { title: 'Key' , dataIndex: 'key' , key: 'key' } ,
        { title: 'Value' , dataIndex: 'value' , key: 'value' } ,
    ] ,
    body: [
        { title: 'Key' , dataIndex: 'key' , key: 'key' } ,
        { title: 'Type' , dataIndex: 'type' , key: 'type' } ,
        { title: 'Description' , dataIndex: 'description' , key: 'description' } ,
    ]
})

const headers = reactive([
    { key: 'Content-Type' , value: 'application/json' } ,
    { key: 'x-api-key' , value: '{ api key }'}
])

const bodys = reactive([
    { key: 'startDate' , type: 'string' , description: 'วันที่ตั่งต้น' , ex: '01-01-2025' } ,
    { key: 'endDate' , type: 'string' , description: 'ถึงวันที่' , ex: '01-02-2025' } ,
    { key: 'signatrue' , type: 'string' , description: 'การเข้ารหัสข้อมูล' } ,
])

const data = reactive({
  "status": true,
  "msg": "success",
  "data": []
})
const prettyJson = JSON.stringify(data, null, 2)
const activeKey = ref('')
</script>

<template>
    <a-card class="shadow-sm">
        <template #extra>
            <a target="_blank" href="https://documenter.getpostman.com/view/45735306/2sB3HtFce3#8593af45-ce82-4c80-b126-e3359d946859">คู่มือ</a>
        </template>
        <a-typography-title :level="4" style="margin-bottom: 6px;">Get Transaction</a-typography-title>
        <p class="text-gray-400"><span class="text-green-500 font-bold mr-[8px]">GET</span>{ endPoint } /api/v1/mc/transaction</p>
        <p>ดึงประวัติธุรกรรม</p>

        <a-collapse v-model:activeKey="activeKey" ghost>
            <a-collapse-panel key="1" header="Headers">
                <a-table :data-source="headers" :columns="columns.headers" />
            </a-collapse-panel>
            <a-collapse-panel key="2" header="Body (JSON)">
                <a-table :dataSource="bodys" :columns="columns.body" :pagination="false" :scroll="{ x: 'max-content' }">
                    <template #bodyCell="{ column , text , record }">
                        <template v-if="column.key === 'description'">
                            <p style="margin-bottom: 0px;">{{ text }}</p>
                            <span class="text-xs text-gray-400" v-if="record.ex">{{ record.ex }}</span>
                        </template>
                    </template>
                </a-table>
            </a-collapse-panel>
            <a-collapse-panel key="3" header="Response (ตัวอย่าง)">
                <pre class="bg-gray-900 text-green-300 text-sm p-4 rounded font-mono overflow-auto">{{ prettyJson }}</pre>
            </a-collapse-panel>
        </a-collapse>
    </a-card>
</template>