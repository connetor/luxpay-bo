
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import api from "@/configs/api";
import type { Bank, Transaction } from "@/interface/Modal";
import { Icon } from "@iconify/vue";
import { setFormatTime , formatThaiBankAccount, formatNumber } from "@/utils";
import dayjs from "dayjs";
import type { SearchTableParams } from "@/interface/Request";
import { useEvent } from "@/composables/useEvent";
import { useTable } from "@/composables/useTable";
import DetailTransaction from "@/components/modals/DetailTransaction.vue";
import SlipPayout from "@/components/modals/SlipPayout.vue";
import { useInitStore } from "@/stores/init";

interface SearchParams {
    action: string
    amount: number | null
    reference: string | null
    transactionId: string | null
}

const { onCopyTransaction } = useEvent()

const initStore = useInitStore()

const { data , pagination , handleTableChange , sort , loading , onLoadTable , startInterval , stopInterval , resetTable } = useTable<Transaction>()

const modals = reactive({
    detail: false ,
    slipPayout: false ,
    crud: false
})
const transaction = ref<Transaction>()

const defualtFormStateSearch = {
    amount: null ,
    reference: null ,
    transactionId: null ,
    date: [
        dayjs(dayjs() , 'YYYY-MM-DD'), 
        dayjs(dayjs() , 'YYYY-MM-DD')
    ]
}

const defualtFormState = {
    amount: null ,
    bankNumber: null ,
    bankCode: null ,
    name: null ,
    remark: null
}

const formStateSearch = reactive({ ...defualtFormStateSearch })
const formState = reactive({ ...defualtFormState })

onMounted(async () => {
    await onLoadTable.value()
    startInterval()
})

onUnmounted(() => { 
    stopInterval()
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
            amount: formStateSearch.amount ,
            reference: formStateSearch.reference,
            transactionId: formStateSearch.transactionId ,
            action: 'transferout'
        }

        const res = await api.get('api/v1/bo/transaction' , { params }).then(res => res.data)
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
        { title: 'จัดการ' , key: 'more' },
        { title: 'สถานะ', sorter: true , dataIndex: 'status' , key: 'status' },
        { title: 'รหัสรายการ' , sorter: true , dataIndex: 'transactionId' , key: 'transactionId' },
        { title: 'รหัสอ้างอิง' , sorter: true , dataIndex: 'reference' , key: 'reference' },
        { title: 'ธนาคาร' , dataIndex: 'from_bank' , key: 'from_bank' },
        { title: 'เลขบัญชี' , dataIndex: 'bankNumber' , key: 'bankNumber' },
        { title: 'ชื่อบัญชี' , dataIndex: 'bankName' , key: 'bankName' },
        { title: 'ยอดเงิน' , dataIndex: 'amount' , key: 'amount' },
        { title: 'ค่าธรรมเนียม' , dataIndex: 'mdrAmount' , key: 'mdrAmount' },
        { title: 'ทำรายการโดย' , dataIndex: 'user' , key: 'user' },
        { title: 'วันที่ทำรายการ', sorter: true , dataIndex: 'createdAt' , key: 'createdAt' },
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

const onFinish = async (data: typeof formState) => {
    loading.value = true;
    try {
        await api.post('api/v1/bo/transaction/transferout' , data)
        await resetForm()
    } catch(e) {}
    loading.value = false
}
 
</script>

<template>

    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="header-content">
                    <div class="header-text">
                        <h1 class="header-title">รายงานธุรกรรมโอนเงิน</h1>
                    </div>
                </div>
                <p class="mb-[16px]">ค้นหา</p>
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
                            <a-form-item label="รหัสรายการ" name="transactionId">
                                <a-input v-model:value="formStateSearch.transactionId" placeholder="กรุณากรอกรหัสรายการ" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="รหัสอ้างอิง" name="reference">
                                <a-input v-model:value="formStateSearch.reference" placeholder="กรุณากรอกรหัสอ้างอิง" />
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
                        <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="modals.crud = true">
                            <Icon icon="line-md:plus" class="mr-2"></Icon> สร้างรายการ
                        </a-button>
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
                        <template v-if="['amount','mdrAmount'].includes(column.key)">
                            {{ formatNumber(text, 2) }}
                        </template>
                        <template v-if="column.key === 'reference'">
                            <div class="flex items-center gap-2">
                                <div class="text-blue-500 cursor-pointer" @click="onCopyTransaction(record)">{{ text }}</div>
                            </div>
                        </template>
                        <template v-if="column.key === 'from_bank'">
                            {{ record.bank.name }}
                        </template>
                        <template v-if="column.key === 'bankNumber'">
                            {{ formatThaiBankAccount(record.bankNumber) }}
                        </template>
                        <template v-if="column.key === 'user'">
                            {{ record?.user?.name ?? '-' }}
                        </template>
                        <template v-if="column.key === 'status'">
                            <a-tag color="blue" v-if="record.status === 'process'">
                                <div class="flex items-center">
                                    <Icon icon="svg-spinners:270-ring" class="mr-2"></Icon> กำลังทำรายการ
                                </div>
                            </a-tag>
                            <div class="flex gap-1" v-else-if="record.status === 'pending'">
                                <a-tag color="warning">รอทำรายการ</a-tag>
                            </div>

                            <div class="flex gap-1" v-else-if="record.status === 'completed'">
                                <a-tag color="green">สำเร็จ</a-tag>
                                <a-button size="small" @click="() => { transaction = record; modals.slipPayout = true }" v-if="record.type === 'payout'">
                                    <Icon icon="solar:bill-outline"></Icon>
                                </a-button>
                            </div>

                            <a-tag color="purple" v-else-if="record.status === 'timeout'">หมดเวลา</a-tag>
                            <a-tag color="error" v-else>ล้มเหลว</a-tag>
                        </template>
                        <template v-if="column.key === 'createdAt'">
                            {{ setFormatTime(text) }}
                        </template>
                        <template v-if="column.key === 'expiredAt'">
                            {{ text ? setFormatTime(text) : '-' }}
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-space>
                                <!-- <a-button class="btn-variant-solid-warning">
                                    <div class="flex items-center gap-2">
                                        <Icon icon="material-symbols:error" width="18" height="18" ></Icon> แจ้งปัญหา
                                    </div>
                                </a-button> -->
                                <a-button @click="() => { transaction = record; modals.detail = true;}">
                                    <div class="flex items-center gap-2">
                                        <Icon icon="mdi-light:clipboard-text" width="14" height="14" ></Icon> รายละเอียด
                                    </div>
                                </a-button>
                            </a-space>
                        </template>
                    </template>
                </a-table>
            </a-card>
        </a-col>
    </a-row>

    <!-- crud -->
    <a-modal 
        :open="modals.crud" 
        title="สร้างรายการโอนเงิน" 
        @cancel="resetForm"
        :footer="null"
    >
        <a-row>
            <a-col :span="24">
                <a-form 
                    :required-mark="false"
                    layout="vertical" 
                    name="basic" 
                    autocomplete="off" 
                    :model="formState"
                    @finish="onFinish"
                >
                    <a-form-item 
                        label="ชื่อบัญชี" 
                        :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                        name="name"
                    >
                        <a-input v-model:value="formState.name" placeholder="กรุณากรอกชื่อบัญชี" />
                    </a-form-item>
                    <a-form-item 
                        label="เลขบัญชี" 
                        :rules="[
                            { required: true, message: 'กรุณากรอกข้อมูล' } ,
                            { pattern: /^[0-9]+$/, message: 'กรุณากรอกตัวเลขเท่านั้น ห้ามมี -' }
                        ]"
                        name="bankNumber"
                    >
                        <a-input v-model:value="formState.bankNumber" placeholder="กรุณากรอกเลขบัญชี" />
                    </a-form-item>

                    <a-form-item 
                        label="ธนาคาร" 
                        :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                        name="bankCode"
                    >
                        <a-select v-model:value="formState.bankCode" placeholder="กรุณาเลือกธนาคาร">
                            <a-select-option :value="item.code" v-for="item , index in initStore.banks" :key="index">
                                <div class="flex gap-2 items-center">
                                    <img :src="item.img" style="height: 18px;"> {{ item.nameTh }}
                                </div>
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item 
                        label="ยอดเงิน" 
                        :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                        name="amount"
                    >
                        <a-input-number style="width: 100%;" :min="0" :max="initStore.balance" v-model:value="formState.amount" placeholder="กรุณากรอกยอดเงิน">
                            <template #addonAfter>
                                <Icon icon="iconoir:coin" ></Icon>
                            </template>
                        </a-input-number>
                    </a-form-item>

                    <a-form-item label="หมายเหตุ" name="remark">
                        <a-textarea v-model:value="formState.remark" placeholder="หมายเหตุ" :rows="4" />
                    </a-form-item>
                    
                    <a-form-item>
                        <div class="flex justify-between items-center">
                            <div>
                                <p style="margin-bottom: 0px;">ยอดเงินคงเหลือ: {{ initStore.balance }}</p>
                            </div>
                            <div>
                                <a-space class="float-right">
                                    <a-button 
                                        :loading="loading" 
                                        type="primary" 
                                        class="mb-[0]"
                                        danger
                                        @click="resetForm"
                                    >
                                        ยกเลิก
                                    </a-button>
                                    <a-button 
                                        :loading="loading"
                                        html-type="submit" 
                                        type="primary" 
                                        class="mb-[0]"
                                    >
                                        ยืนยัน
                                    </a-button>
                                </a-space>
                            </div>
                        </div>
                    </a-form-item>
                </a-form>
            </a-col>
        </a-row>
    </a-modal>

    <template v-if="transaction">
        <SlipPayout 
            v-model:show="modals.slipPayout"
            :transaction="transaction"
        ></SlipPayout>

        <!-- detail  -->
        <DetailTransaction 
            :transaction="transaction"
            v-model:show="modals.detail" 
        ></DetailTransaction>
    </template>
    
</template>

<style scoped>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}
</style>