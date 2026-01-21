
<script setup lang="ts">
import { computed, createVNode, onMounted, onUnmounted, reactive, ref } from "vue";
import api from "@/configs/api";
import type { Transaction } from "@/interface/Modal";
import { message, Modal } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { setFormatTime , formatThaiBankAccount , formatNumber } from "@/utils";
import dayjs from "dayjs";
import type { SearchTableParams } from "@/interface/Request";
import { useEvent } from "@/composables/useEvent";
import { useTable } from "@/composables/useTable";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import DetailTransaction from "@/components/modals/DetailTransaction.vue";
import { useAuthStore } from "@/stores/auth";
import SlipPayout from "@/components/modals/SlipPayout.vue";
import QrPayin from "@/components/modals/QrPayin.vue";
import ApproveSlip from "@/components/modals/ApproveSlip.vue";

interface SearchParams {
    action: string
    type: string
    amount: number | null
    depositAmount: number | null
    reference: string | null
    transactionId: string | null
    prefix: string | null
    status: string | null
}

const { onCopyTransaction } = useEvent()

const { pagination , sort , onLoadTable , data , handleTableChange , startInterval , stopInterval , loading } = useTable<Transaction>()

const { user } = useAuthStore()

const modals = reactive({
    detail: false ,
    scan: false ,
    qrPayin: false ,
    slipPayout: false ,
    approve: false
})
const transaction = ref<Transaction>()
const imageUrl = ref()
const fileImage = ref()
const permissions = user?.permissions ?? []
const defualtFormStateSearch = {
    amount: null ,
    depositAmount: null ,
    reference: '' ,
    transactionId: '' ,
    prefix: '' ,
    action: 'all' ,
    type: 'all' ,
    status: 'all' ,
    date: [
        dayjs(), 
        dayjs()
    ]
    // date: [
    //     dayjs().startOf('month'), 
    //     dayjs().endOf('month')
    // ]
}

const formStateSearch = reactive({ ...defualtFormStateSearch })

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
            depositAmount: formStateSearch.depositAmount ,
            amount: formStateSearch.amount ,
            reference: formStateSearch.reference,
            transactionId: formStateSearch.transactionId ,
            action: formStateSearch.action ,
            type: formStateSearch.type ,
            prefix: formStateSearch.prefix,
            status: formStateSearch.status
        }

        const res = await api.get('api/v1/bo/transaction/list/all' , { params }).then(res => res.data)
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
        { title: 'รหัสร้านค้า' , key: 'merchant' , dataIndex: 'merchant' },
        { title: 'ประเภท' , key: 'type' , dataIndex: 'type' },
        { title: 'ช่องทาง' , key: 'action' , dataIndex: 'action' },
        { title: 'สถานะ', sorter: true , dataIndex: 'status' , key: 'status' },
        { title: 'รหัสรายการ' , sorter: true , dataIndex: 'transactionId' , key: 'transactionId' },
        { title: 'รหัสอ้างอิง' , sorter: true , dataIndex: 'reference' , key: 'reference' },
        { title: 'ธนาคาร' , dataIndex: 'from_bank' , key: 'from_bank' },
        { title: 'เลขบัญชี' , dataIndex: 'bankNumber' , key: 'bankNumber' },
        { title: 'ชื่อบัญชี' , dataIndex: 'bankName' , key: 'bankName' },
        { title: 'ยอดเงิน' , dataIndex: 'amount' , key: 'amount' },
        { title: 'ยอดฝากเงิน' , dataIndex: 'depositAmount' , key: 'depositAmount' },
        { title: 'ค่าธรรมเนียม' , dataIndex: 'mdrAmount' , key: 'mdrAmount' },
        { title: 'ธนาคาร' , dataIndex: 'account.bank' , key: 'account.bank' },
        { title: 'เลขบัญชี' , dataIndex: 'account.bankNumber' , key: 'account.bankNumber' },
        { title: 'ชื่อบัญชี' , dataIndex: 'account.name' , key: 'account.name' },
        { title: 'วันที่ทำรายการ', sorter: true , dataIndex: 'createdAt' , key: 'createdAt' },
        { title: 'วันที่หมดเวลา', sorter: true , dataIndex: 'expiredAt' , key: 'expiredAt' },
        { title: 'วันที่อัพเดท', sorter: true , dataIndex: 'updatedAt' , key: 'updatedAt' },
    ]
})

const resetForm = async () => {
    Object.keys(modals).forEach((k) => {
        modals[k as keyof typeof modals] = false
    });
    imageUrl.value = null
    fileImage.value = null
    Object.assign(formStateSearch , defualtFormStateSearch)
    await onLoadTable.value()
}

const onReject = async (id: number) => {
    Modal.confirm({
        title: 'ยืนยันการทำรายการ' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, 'ต้องยกเลิกรายการนี้ ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true
            try {
                await api.post(`api/v1/bo/transaction/reject/${id}`)
                message.success('ทำรายการสำเร็จ')
                await onLoadTable.value()
                // await resetForm()
            } catch(e) {} 
            loading.value = false
        }
    })
}

</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">รายงานธุรกรรมทั้งหมด</h1>
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
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ประเภท" name="type">
                                <a-select v-model:value="formStateSearch.type" placeholder="กรุณาเลือกประเภท">
                                    <a-select-option value="all">ทั้งหมด</a-select-option>
                                    <a-select-option value="payin">ฝากเงิน</a-select-option>
                                    <a-select-option value="payout">ถอนเงิน</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ช่องทาง" name="action">
                                <a-select v-model:value="formStateSearch.action" placeholder="กรุณาเลือกประเภท">
                                    <a-select-option value="all">ทั้งหมด</a-select-option>
                                    <a-select-option value="deposit">ฝากเงิน</a-select-option>
                                    <a-select-option value="withdraw">ถอนเงิน</a-select-option>
                                    <a-select-option value="settlement">โยกเงิน</a-select-option>
                                    <a-select-option value="transferout">โอนเงิน</a-select-option>
                                    <a-select-option value="topup">เติมเงิน</a-select-option>
                                    <a-select-option value="settlement_account">โยกเงินบัญชี</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="รหัสร้านค้า" name="prefix">
                                <a-input v-model:value="formStateSearch.prefix" placeholder="กรุณากรอกรหัสรายการ" />
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
                            <a-form-item label="สถานะ" name="status">
                                <a-select v-model:value="formStateSearch.status" placeholder="กรุณาเลือกสถานะ">
                                    <a-select-option value="all">ทั้งหมด</a-select-option>
                                    <a-select-option value="pending">รอทำรายการ</a-select-option>
                                    <a-select-option value="process">กำลังทำรายการ</a-select-option>
                                    <a-select-option value="completed">สำเร็จ</a-select-option>
                                    <a-select-option value="fail">ล้มเหลว</a-select-option>
                                    <a-select-option value="timeout">หมดเวลา</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ยอดเงิน" name="amount">
                                <a-input-number v-model:value="formStateSearch.amount" placeholder="กรุณากรอกยอดเงิน" style="width: 100%;"/>
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ยอดฝากเงิน" name="depositAmount">
                                <a-input-number v-model:value="formStateSearch.depositAmount" placeholder="กรุณากรอกยอดฝากเงิน" style="width: 100%;"/>
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
                        <template v-if="column.key === 'reference'">
                            <div class="flex items-center gap-2">
                                <div class="text-blue-500 cursor-pointer" @click="onCopyTransaction(record)">{{ text }}</div>
                            </div>
                        </template>
                        <template v-if="column.key === 'action'">
                            <a-tag color="green" v-if="record.action === 'deposit'">ฝากเงิน</a-tag>
                            <a-tag color="red" v-else-if="record.action === 'withdraw'">ถอนเงิน</a-tag>
                            <a-tag color="success" v-else-if="record.action === 'topup'">เติมเงิน</a-tag>
                            <a-tag color="red" v-else-if="record.action === 'transferout'">โอนเงิน</a-tag>
                            <a-tag color="magenta" v-else-if="record.action === 'settlement'">โยกเงิน</a-tag>
                            <a-tag color="yellow" v-else-if="record.action === 'commission'">ถอนรายได้</a-tag>
                            <a-tag color="cyan" v-else-if="record.action === 'refund'">คืนเงิน</a-tag>
                            <a-tag color="purple" v-else-if="record.action === 'settlement_account'">โยกเงินบัญชี</a-tag>
                        </template>
                        <template v-if="column.key === 'from_bank'">
                            {{ record.bank.name }}
                        </template>
                        <template v-if="column.key === 'merchant'">
                            {{ record.merchant.prefix }}
                        </template>
                        <template v-if="column.key === 'account.bank'">
                            {{ record.account?.bank.nameTh }}
                        </template>
                        <template v-if="column.key === 'account.bankNumber'">
                            {{ record.account?.bankNumber }}
                        </template>
                        <template v-if="column.key === 'account.name'">
                            {{ record.account?.name }}
                        </template>
                        <template v-if="column.key === 'bankNumber'">
                            {{ formatThaiBankAccount(record.bankNumber) }}
                        </template>
                        <template v-if="['amount','depositAmount','mdrAmount'].includes(column.key)">
                            {{ formatNumber(text, 2) }}
                        </template>
                        <template v-if="column.key === 'status'">
                            <a-tag color="blue" v-if="record.status === 'process'">
                                <div class="flex items-center">
                                    <Icon icon="svg-spinners:270-ring" class="mr-2"></Icon> กำลังทำรายการ
                                </div>
                            </a-tag>
                            <div class="flex gap-1" v-else-if="record.status === 'pending'">
                                <a-tag color="warning">รอทำรายการ</a-tag>
                                <a-button size="small" @click="() => { transaction = record; modals.qrPayin = true }" v-if="record.type === 'payin'">
                                    <Icon icon="ic:baseline-qrcode"></Icon>
                                </a-button>
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
                            {{ text ? setFormatTime(text, 'YYYY-MM-DD HH:mm:ss') : '-' }}
                        </template>
                        <template v-if="column.key === 'expiredAt'">
                            {{ text ? setFormatTime(text, 'YYYY-MM-DD HH:mm:ss') : '-' }}
                        </template>
                        <template v-if="column.key === 'updatedAt'">
                            {{ text ? setFormatTime(text, 'YYYY-MM-DD HH:mm:ss') : '-' }}
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-space>
                                <a-button 
                                    type="primary" 
                                    class="btn-variant-solid-success" 
                                    :disabled="['completed'].includes(record.status) || record.type !== 'payin'" 
                                    @click="() => { transaction = record; modals.approve = true }"
                                    v-if="permissions.includes('all_transaction.update')"
                                >
                                    <div class="flex items-center gap-2" >
                                        <Icon icon="mdi:approve" width="14" height="14" ></Icon> 
                                        <span :style="record.status === 'completed' && record.imgSlip ? 'color: #52c41a;' : ''">อนุมัติรายการ</span>
                                    </div>
                                </a-button>

                                <a-button 
                                    type="primary" 
                                    danger
                                    :disabled="['completed' , 'fail'].includes(record.status) || record.type == 'payin'" 
                                    @click="onReject(record.id)"
                                    v-if="permissions.includes('all_transaction.update')"
                                >
                                    <div class="flex items-center gap-2" >
                                        <Icon icon="material-symbols:cancel" width="14" height="14" ></Icon> ยกเลิกรายการ
                                    </div>
                                </a-button>

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

    <template v-if="transaction">
        <!-- scan qrcode  -->
        <QrPayin 
            v-model:show="modals.qrPayin" 
            :transaction="transaction"
        ></QrPayin>

        <!-- slip payout  -->
        <SlipPayout 
            v-model:show="modals.slipPayout" 
            :transaction="transaction"
        ></SlipPayout>

        <!-- detail  -->
        <DetailTransaction 
            :transaction="transaction"
            v-model:show="modals.detail" 
        ></DetailTransaction>

        <!-- approve slip  -->
        <ApproveSlip
            v-model:show="modals.approve"
            :transaction="transaction"
            @finish="onLoadTable"
        ></ApproveSlip>

    </template>
    
</template>

<style>
.header-title{
    color: var(--accent) !important;
}
.header-text{
    color: var(--accent-dark) !important;
}
</style>