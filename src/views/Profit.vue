
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import api from "@/configs/api";
import type { Merchant } from "@/interface/Modal";
import { Icon } from "@iconify/vue";
import { formatNumber } from "@/utils";
import dayjs from "dayjs";
import { useAuthStore } from "@/stores/auth";
import type { SearchTableParams } from "@/interface/Request";
import { useEvent } from "@/composables/useEvent";
import { useTable } from "@/composables/useTable";

interface SearchParams {
    status: string | null 
    prefix: string | null 
    name: string | null 
    rateDeposit: number | null
    subfixId: number | null
}

const { user } = useAuthStore()
const { onCopyText } = useEvent()

const { pagination , sort , onLoadTable , data , handleTableChange , loading } = useTable<Merchant>()

const subfixs = ref<Merchant[]>([])

const defualtFormStateSearch = {
    name: null ,
    prefix: null ,
    rateDeposit: null ,
    status: null ,
    date: [ 
        dayjs() , 
        dayjs()
    ]
}

const formStateSearch = reactive({ ...defualtFormStateSearch })

onMounted(async () => {
    await onLoadTable.value()
})

onLoadTable.value = async () => {
    loading.value = true
    try {
        const params: SearchTableParams & SearchParams = {
            startDate: formStateSearch.date[0] ? dayjs(formStateSearch.date[0]).format('YYYY-MM-DD') : '',
            endDate: formStateSearch.date[1] ? dayjs(formStateSearch.date[1]).format('YYYY-MM-DD') : '',
            page: pagination.current ,
            pageSize: pagination.pageSize ,
            sortBy: sort.sortBy ,
            sortOrder: sort.sortOrder ,
            status: formStateSearch.status ,
            subfixId: subfixs.value[subfixs.value.length - 1]?.id ,
            name: formStateSearch.name ,
            prefix: formStateSearch.prefix ,
            rateDeposit: formStateSearch.rateDeposit
        }

        const res = await api.get('api/v1/bo/commission/stats' , { params }).then(res => res.data)
        data.value = res.data.data
        pagination.total = res.data.meta.total
        const lastPage = Math.ceil(pagination.total / pagination.pageSize) || 1
        if (pagination.current > lastPage) {
            pagination.current = lastPage
        }
    } catch(e) {}
    loading.value = false
}

const columns = reactive([
    { title: 'รหัสร้านค้า' , dataIndex: 'prefix' , key: 'prefix' },
    { title: 'ชื่อร้านค้า' , dataIndex: 'name' , key: 'name' },
    { title: 'ยอดเงินคงเหลือ' , dataIndex: 'balance' , key: 'balance' },
    { title: 'ยอดฝากทั้งหมด' , dataIndex: 'total_deposit' , key: 'total_deposit' },
    { title: 'ยอดถอนทั้งหมด' , dataIndex: 'total_withdraw' , key: 'total_withdraw' },
    { 
      title: 'ค่าธรรมเนียม' , children: [
        { title: 'ฝากเงิน' , dataIndex: 'total_mdr_deposit' , key: 'total_mdr_deposit' },
        { title: 'ถอนเงิน' , dataIndex: 'total_mdr_withdraw' , key: 'total_mdr_withdraw' },
        { title: 'ยอดรวม' , dataIndex: 'total_mdr' , key: 'total_mdr' },
      ]
    },
])

const resetForm = async () => {
    Object.assign(formStateSearch , defualtFormStateSearch)

    await onLoadTable.value()
}

const deleteDataInSubfix = async (index: number) => {
    subfixs.value = subfixs.value.filter((i , inx) => index >= inx)
    await onLoadTable.value()
}

</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-typography-title :level="2" style="margin-bottom: 6px;" class="header-title">รายได้</a-typography-title>
            <p class="header-text">ข้อมูลรายได้ของร้านค้าภายใต้</p>
        </a-col>
        <a-col :span="24">
            <a-card title="ค้นหา" class="shadow-sm">
                <a-form :required-mark="false" autocomplete="off" layout="vertical" :model="formStateSearch"> 
                    <a-row :gutter="24">
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item name="date" label="วันที่ทำรายการ">
                                <a-range-picker 
                                    v-model:value="formStateSearch.date" 
                                    format="YYYY-MM-DD" 
                                    class="w-full" 
                                />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="รหัสร้านค้า" name="prefix">
                                <a-input v-model:value="formStateSearch.prefix" placeholder="กรอกข้อมูลค้นหา" />
                            </a-form-item>
                        </a-col>
                            <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ชื่อร้านค้า" name="name">
                                <a-input v-model:value="formStateSearch.name" placeholder="กรอกข้อมูลค้นหา" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ค่าธรรมเนียม (ฝากเงิน)" name="rateDeposit">
                                <a-input-number style="width: 100%;" v-model:value="formStateSearch.rateDeposit" placeholder="กรอกข้อมูลค้นหา" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="สถานะ" name="status">
                                <a-select v-model:value="formStateSearch.status" placeholder="กรุณาเลือกสถานะ">
                                    <a-select-option value>ทั้งหมด</a-select-option>
                                    <a-select-option value="1">ใช้งาน</a-select-option>
                                    <a-select-option value="0">ปิดใช้งาน</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :span="24">
                            <a-space>
                                <a-button type="primary" @click="onLoadTable">
                                    <div class="flex items-center gap-2">
                                        <Icon icon="line-md:search" />  ค้นหา
                                    </div>
                                </a-button>
                                <a-button 
                                    type="primary" 
                                    danger 
                                    @click="resetForm"
                                >
                                    <div class="flex items-center gap-2">
                                        <Icon icon="mdi:bin" />  รีเซ็ต
                                    </div>
                                </a-button>
                            </a-space>
                        </a-col>
                    </a-row>
                </a-form>
            </a-card>
        </a-col>
        <a-col :span="24">
            <a-card class="shadow-sm">
                <a-breadcrumb separator=">" style="margin-bottom: 16px;">
                    <a-breadcrumb-item 
                        @click="() => { subfixs = []; onLoadTable() }"
                        class="cursor-pointer"
                    >
                        {{ user?.merchant.prefix || 'Company' }}
                    </a-breadcrumb-item>
                    <a-breadcrumb-item 
                        v-for="item , index in subfixs" 
                        :key="index"
                        @click="deleteDataInSubfix(index)"
                        class="cursor-pointer"
                    >
                        {{ item.prefix }}
                    </a-breadcrumb-item>
                </a-breadcrumb>

                <a-table 
                    :columns="columns" 
                    :data-source="data" 
                    :loading="loading" 
                    @change="handleTableChange"
                    bordered 
                    :pagination="pagination"
                    :scroll="{ x: 'max-content' }"
                >
                    <template #bodyCell="{ column , text , record }">
                        <template v-if="column.key === 'total_deposit'">
                            {{ formatNumber(record.stats.total_deposit , 2) }}
                        </template>
                        <template v-if="column.key === 'total_withdraw'">
                            {{ formatNumber(record.stats.total_withdraw , 2) }}
                        </template>
                        <template v-if="column.key === 'total_mdr_deposit'">
                            {{ formatNumber(record.stats.total_mdr_deposit , 2) }}
                        </template>
                        <template v-if="column.key === 'total_mdr_withdraw'">
                            {{ formatNumber(record.stats.total_mdr_withdraw , 2) }}
                        </template>
                        <template v-if="column.key === 'total_mdr'">
                            {{ formatNumber(record.stats.total_mdr , 2) }}
                        </template>
                        <template v-if="column.key === 'prefix'">
                            <div class="flex items-center gap-2" v-if="record.level === 'deseller'">
                                <span class="cursor-pointer text-blue-500" @click="() => { subfixs.push(record) ; onLoadTable() }">{{ text }}</span> 
                                <Icon icon="solar:copy-bold" class="copy-icon" width="16" height="16" @click="onCopyText(text)" />
                            </div>
                        </template>
                        <template v-if="column.key === 'name'">
                            <div class="flex items-center gap-2">
                                {{ text }} <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="onCopyText(text)" />
                            </div>
                        </template>
                        <template v-if="['balance','totalPayin','totalPayout'].includes(column.key)">
                            {{ formatNumber(text, 2) }}
                        </template>
                    </template>
                </a-table>
            </a-card>
        </a-col>
    </a-row>

</template>

<style>
.header-title{
    color: var(--accent) !important;
}
.header-text{
    color: var(--accent-dark) !important;
}
</style>