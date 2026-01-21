
<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import api from "@/configs/api";
import type { Transaction } from "@/interface/Modal";
import { Icon } from "@iconify/vue";
import { setFormatTime , formatNumber } from "@/utils";
import dayjs from "dayjs";
import type { SearchTableParams } from "@/interface/Request";
import { useEvent } from "@/composables/useEvent";
import { useTable } from "@/composables/useTable";

interface SearchParams {
    amount: number | null
    prefix: string | null
    name: string | null
}

const { onCopyText } = useEvent()

const { pagination , sort , onLoadTable , data , handleTableChange , loading } = useTable<Transaction>()

const defualtFormStateSearch = {
    amount: null ,
    prefix: null ,
    name: null ,
    date: [
        dayjs(dayjs() , 'YYYY-MM-DD'), 
        dayjs(dayjs() , 'YYYY-MM-DD')
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
            startDate: dayjs(formStateSearch.date[0]).format('YYYY-MM-DD'),
            endDate: dayjs(formStateSearch.date[1]).format('YYYY-MM-DD'),
            page: pagination.current ,
            pageSize: pagination.pageSize ,
            sortBy: sort.sortBy ,
            sortOrder: sort.sortOrder ,
            prefix: formStateSearch.prefix ,
            name: formStateSearch.name ,
            amount: formStateSearch.amount ,
        }

        const res = await api.get('api/v1/bo/commission/recived' , { params }).then(res => res.data)
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

const columns = computed(() => {
    return [
        { title: 'ประเภท' , key: 'type' , dataIndex: 'type' },
        { title: 'รหัสร้านค้า' , dataIndex: 'prefix' , key: 'prefix' },
        { title: 'ชื่อร้านค้า' , dataIndex: 'name' , key: 'name' },
        { title: 'รายได้' , dataIndex: 'amount' , key: 'amount' },
        { title: 'ยอดเงิน' , dataIndex: 'totalAmount' , key: 'totalAmount' },
        { title: 'ค่าธรรมเนียม' , dataIndex: 'rate' , key: 'rate' },
        { title: 'วันที่ทำรายการ' , dataIndex: 'createdAt' , key: 'createdAt' },
    ]
})

const resetForm = async () => {
    Object.assign(formStateSearch , defualtFormStateSearch)
    await onLoadTable.value()
}

</script>

<template>

    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">รายงานรายได้</h1>
                        <p class="header-text">รายงานรายได้จากเอเยนต์</p>
                    </div>
                </div>
                
                <p>ค้นหา</p>
                <a-form :required-mark="false" autocomplete="off" layout="vertical" :model="formStateSearch"> 
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
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="รหัสร้านค้า" name="prefix">
                                <a-input v-model:value="formStateSearch.prefix" placeholder="กรุณากรอกรหัสร้านค้า" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ชื่อร้านค้า" name="name">
                                <a-input v-model:value="formStateSearch.name" placeholder="กรุณากรอกชื่อร้านค้า" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ยอดเงิน" name="amount">
                                <a-input-number v-model:value="formStateSearch.amount" placeholder="กรุณากรอกยอดเงิน" style="width: 100%;"/>
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
                <div class="float-right">
                    <a-space>
                        <a-button 
                            style="margin-bottom: 16px; display: flex;align-items: center;" 
                            @click="onLoadTable"
                            :disabled="loading"
                        >
                            <Icon :icon="loading ? 'svg-spinners:270-ring' : 'famicons:reload'" class="mr-2"></Icon> รีเฟรช
                        </a-button>
                    </a-space>
                </div>
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
                        <template v-if="column.key === 'type'">
                            <a-tag color="green" v-if="record.type === 'payin'">
                                ฝาก
                            </a-tag>
                            <a-tag color="red" v-else>ถอน</a-tag>
                        </template>
                        <template v-if="column.key === 'name'">
                            <div class="flex items-center gap-2">
                                {{ record.current.name }} 
                                <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="onCopyText(record.current.name)" />
                            </div>
                        </template>
                        <template v-if="column.key === 'prefix'">
                            <div class="flex items-center gap-2">
                                {{ record.current.prefix }} 
                                <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="onCopyText(record.current.prefix)" />
                            </div>
                        </template>
                        <template v-if="column.key === 'amount'">
                            {{ formatNumber(text) }}
                        </template>
                        <template v-if="column.key === 'totalAmount'">
                            {{ formatNumber(text) }}
                        </template>
                        <template v-if="column.key === 'rate'">
                            {{ formatNumber(text) }}
                        </template>
                        <template v-if="column.key === 'createdAt'">
                            {{ setFormatTime(text) }}
                        </template>
                    </template>
                </a-table>
            </a-card>
        </a-col>
    </a-row>

</template>

<style scoped>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}
</style>