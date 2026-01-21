
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import api from "@/configs/api";
import type { Account, TransactionStatement } from "@/interface/Modal";
import { message } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { setFormatTime } from "@/utils";
import dayjs from "dayjs";
import type { SearchTableParams } from "@/interface/Request";
import { useTable } from "@/composables/useTable";
import { useInitStore } from "@/stores/init";

interface SearchParams {
    amount: number | null
}

const { pagination , sort , onLoadTable , data , handleTableChange , loading } = useTable<TransactionStatement>()

const modals = reactive({
    refund: false ,
})

const defualtFormStateSearch = {
    accountId: null , 
    amount: null ,
    date: [
        dayjs(dayjs() , 'YYYY-MM-DD'), 
        dayjs(dayjs() , 'YYYY-MM-DD')
    ]
}

const defualtFormState = {
    
}

const initStore = useInitStore()

const formStateSearch = reactive({ ...defualtFormStateSearch })
const formState = reactive({ ...defualtFormState })

// จัดเรียง accounts โดยให้ status == true อยู่บนสุด
const sortedAccounts = computed(() => {
    return [...initStore.accounts].sort((a, b) => {
        // status == true อยู่บนสุด
        if (a.status && !b.status) return -1
        if (!a.status && b.status) return 1
        return 0
    })
})

onMounted(async () => {
    await initStore.getAccounts()
})

onLoadTable.value = async () => {
    loading.value = true
    try {
        if(formStateSearch.accountId) {
            const params: SearchTableParams & SearchParams = {
                startDate: formStateSearch.date[0] ? dayjs(formStateSearch.date[0]).format('YYYY-MM-DD') : '',
                endDate: formStateSearch.date[1] ? dayjs(formStateSearch.date[1]).format('YYYY-MM-DD') : '',
                page: pagination.current ,
                pageSize: pagination.pageSize ,
                sortBy: sort.sortBy ,
                sortOrder: sort.sortOrder ,
                amount: formStateSearch.amount ,
            }

            const res = await api.get(`api/v1/bo/account/statement/${formStateSearch.accountId}` , { params }).then(res => res.data)
            data.value = res.data.data
            pagination.total = res.data.meta.total
            const lastPage = Math.ceil(pagination.total / pagination.pageSize) || 1
            if (pagination.current > lastPage) {
                pagination.current = lastPage
                await onLoadTable.value()
            }
        }
        else {
            message.warn('กรุณาเลือกบัญชีก่อนค้นหารายการ')
        }
    } catch(e) {}
    loading.value = false
}

const columns = computed(() => {
    return [
        { title: 'รหัสรายการ' , dataIndex: 'ref' , key: 'ref' },
        { title: 'ข้อมูล' , dataIndex: 'remark' , key: 'remark' },
        { title: 'ยอดเงิน' , dataIndex: 'amount' , key: 'amount' },
        { title: 'วันที่สลิป' , dataIndex: 'dateTime' , key: 'dateTime' },
    ]
})

const resetForm = async () => {
    Object.keys(modals).forEach((k) => {
        modals[k as keyof typeof modals] = false
    });
    Object.assign(formStateSearch , defualtFormStateSearch)
    Object.assign(formState , defualtFormState)
    await onLoadTable.value()
}

</script>

<template>

    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">รายงานสเตทเม้นท์</h1>
                    </div>
                </div>

                <p>ค้นหา</p>
                <a-form 
                    autocomplete="off" 
                    name="basic"  
                    layout="vertical" 
                    :model="formStateSearch"
                    @finish="onLoadTable"
                > 
                    <a-row :gutter="24">
                        <a-col :lg="8" :md="12" :xs="24">
                            <a-form-item name="date" label="วันที่ทำรายการ">
                                <a-range-picker 
                                    v-model:value="formStateSearch.date" 
                                    format="YYYY-MM-DD" 
                                    class="w-full" 
                                />
                            </a-form-item>
                        </a-col>

                        <a-col :lg="6" :md="12" :xs="24">
                            <a-form-item 
                                label="บัญชี" 
                                name="accountId"
                                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                            >
                                <a-select v-model:value="formStateSearch.accountId" placeholder="กรุณาเลือกบัญชี">
                                    <a-select-option 
                                        :value="item.id" 
                                        v-for="item in sortedAccounts" 
                                        :key="item.id"
                                    >
                                        <div class="flex items-center gap-2">
                                            <Icon 
                                                :icon="item.status ? 'mdi:check-circle' : 'mdi:close-circle'" 
                                                :style="{ color: item.status ? '#52c41a' : '#ff4d4f' }"
                                            />
                                            {{ item.name }}{{ item.type ? ` (${item.type === 'deposit' ? 'ฝาก' : 'ถอน'})` : '' }}
                                        </div>
                                    </a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>

                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ยอดเงิน" name="amount">
                                <a-input-number style="width: 100%;" v-model:value="formStateSearch.amount" placeholder="กรอกข้อมูลค้นหา" />
                            </a-form-item>
                        </a-col>

                        <a-col :span="24">
                            <a-space>
                                <a-button 
                                    type="primary" 
                                    html-type="submit"
                                >
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
                        <template v-if="column.key === 'createdAt'">
                            {{ setFormatTime(text) }}
                        </template>
                    </template>
                </a-table>
            </a-card>
        </a-col>
    </a-row>
    

    
</template>

<style>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}
</style>