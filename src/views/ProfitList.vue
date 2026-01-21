
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
// import ButtonDateSelectRange from '@/components/button/DateSelectRange.vue'

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

const amountOfCommissionByType = (record: Merchant , type: string , value: 'total_amount' | 'total_commission') => {
    const data = record.commissions.find(i => {
        return i.type === type
    })

    return data?.[value] ?? 0
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
            await onLoadTable.value()
        }
    } catch(e) {}
    loading.value = false
}

const columns = reactive([
    { title: 'รหัสร้านค้า' , dataIndex: 'prefix' , key: 'prefix' },
    { title: 'ชื่อร้านค้า' , dataIndex: 'name' , key: 'name' },
    {
        title: 'ร้านค้า' , children: [
            { title: 'ยอดฝาก' , dataIndex: 'total_deposit' , key: 'total_deposit' },
            { title: 'ยอดถอน' , dataIndex: 'total_withdraw' , key: 'total_withdraw' },
        ]
    },
    {
        title: 'ค่าธรรมเนียม' , children: [
            { title: 'ฝากเงิน' , dataIndex: 'total_mdr_deposit' , key: 'total_mdr_deposit' },
            { title: 'ถอนเงิน' , dataIndex: 'total_mdr_withdraw' , key: 'total_mdr_withdraw' },
            { title: 'รวม' , dataIndex: 'total_mdr' , key: 'total_mdr' },
        ]
    },
    {
        title: 'เอเย่นต์' , children: [
            { title: 'ยอดฝาก' , dataIndex: 'total_com_deposit' , key: 'total_com_deposit' },
            { title: 'ยอดถอน' , dataIndex: 'total_com_withdraw' , key: 'total_com_withdraw' },
            { title: 'รายได้' , dataIndex: 'total_com_profit' , key: 'total_com_profit' },
        ]
    },
])

const deleteDataInSubfix = async (index: number) => {
    subfixs.value = subfixs.value.filter((i , inx) => index >= inx)
    await onLoadTable.value()
}

</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">

        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">รายได้</h1>
                    </div>
                </div>
                
                <p>ค้นหา</p>
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
                        <a-col :span="3">
                            <a-form-item label=" " style="margin-bottom: 0;">
                                <a-button type="primary" @click="onLoadTable">
                                    <div class="flex items-center gap-2">
                                        <Icon icon="line-md:search" />  ค้นหา
                                    </div>
                                </a-button>
                            </a-form-item>
                        </a-col>
                        <!-- <a-col :span="13">
                            <div class="mt-[30px]">
                                <ButtonDateSelectRange 
                                    v-model:value="formStateSearch.date" 
                                ></ButtonDateSelectRange>   
                            </div>
                        </a-col> -->
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

                        <template v-if="column.key === 'total_com_deposit'">
                            {{ formatNumber(amountOfCommissionByType(record , 'payin' , 'total_amount'), 2) }}
                        </template>
                        <template v-if="column.key === 'total_com_withdraw'">
                            {{ formatNumber(amountOfCommissionByType(record , 'payout' , 'total_amount'), 2) }}
                        </template>
                        <template v-if="column.key === 'total_com_profit'">
                            {{ formatNumber(Number(amountOfCommissionByType(record , 'payin' , 'total_commission')) + Number(amountOfCommissionByType(record , 'payout' , 'total_commission')), 2) }}
                        </template>
                        <template v-if="column.key === 'prefix'">
                            <div class="flex items-center gap-2">
                                <span 
                                    class="cursor-pointer text-blue-500" 
                                    @click="() => { subfixs.push(record) ; onLoadTable() }"
                                    v-if="record.level === 'deseller'"
                                >
                                    {{ text }}
                                </span> 
                                <span v-else>{{ text }}</span>
                                <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="onCopyText(text)" />
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

</style>