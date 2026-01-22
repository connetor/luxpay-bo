
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import api from "@/configs/api";
import type { Account, Bank, Merchant, Transaction } from "@/interface/Modal";
import { message, type TableProps } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { setFormatTime , formatThaiBankAccount , formatNumber } from "@/utils";
import dayjs from "dayjs";
import type { SearchTableParams } from "@/interface/Request";
import { useEvent } from "@/composables/useEvent";
import { useTable } from "@/composables/useTable";
import DetailTransaction from "@/components/modals/DetailTransaction.vue";
import { useInitStore } from "@/stores/init";
import { useAuthStore } from "@/stores/auth";
import SlipPayout from "@/components/modals/SlipPayout.vue";

interface SearchParams {
    action: string
    amount: number | null
    reference: string | null
    transactionId: string | null
}

const { onCopyText } = useEvent()

const initStore = useInitStore()
const { user } = useAuthStore()

const { pagination , sort , onLoadTable , data , handleTableChange , loading } = useTable<Transaction>()

const isLoading = reactive({
    account: false ,
    merchant: false
})

const isSearch = reactive({
    account: '' ,
    merchant: ''
})

const modals = reactive({
    detail: false ,
    slipPayout: false ,
    crud: false ,
    confirm: false
})
const transaction = ref<Transaction>()
const accounts = ref<Account[]>([])
const merchants = ref<Merchant[]>([])
const imageUrl = ref()
const permissions = user?.permissions ?? []
const defualtFormStateSearch = {
    amount: null ,
    reference: null ,
    transactionId: null ,
    date: [ 
        dayjs() ,
        dayjs()
    ]
}

const defualtFormState = {
    image: null ,
    merchantId: null ,
    accountId: null ,
    bankNumber: null ,
    bankCode: null ,
    name: null ,
    remark: null ,
    amount: null
}

const formStateSearch = reactive({ ...defualtFormStateSearch })
const formState = reactive({ ...defualtFormState })

// Form state สำหรับการยืนยัน
const confirmFormState = reactive({
    reference: '',
    isConfirmed: false
})

const defaultConfirmFormState = { ...confirmFormState }

const onLoadAccount = async () => {
    isLoading.account = true 
    try {
        accounts.value = await api.get('api/v1/bo/account/list/options' , { params: { search: isSearch.account }}).then(res => res.data.data)
    } catch(e) {}
    isLoading.account = false 
}

const onSearchAccount = (input: string) => {
  isSearch.account = input
  onLoadAccount()
};

const onLoadMerchant = async () => {
    isLoading.merchant = true 
    try {
        merchants.value = await api.get('api/v1/bo/merchant/list/options' , { params: { search: isSearch.merchant }}).then(res => res.data.data)
    } catch(e) {}
    isLoading.merchant = false 
}

const isAccount = (id: number) => {
    return accounts.value.find(item => item.id == id)
}

const isMerchant = (id: number) => {
    return merchants.value.find(item => item.id == id)
}

const onSearchMerchant = (input: string) => {
  isSearch.merchant = input
  onLoadMerchant()
};

onMounted(async () => {
    await onLoadTable.value()
    await onLoadAccount()
    await onLoadMerchant()
})

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  return isImage && isLt2M
}

// เปลี่ยนรูปและ preview
const handleChange = (info: any) => {
  const file = info.file.originFileObj
  const reader = new FileReader()

  reader.onload = () => {
    imageUrl.value = reader.result as string
    formState.image = file
  }

  if (file) {
    reader.readAsDataURL(file)
  }
}

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
            action: 'refund'
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
        ...(permissions?.includes('refund.update') ? [
            { title: 'จัดการ', key: 'more' },
        ] : []),
        { title: 'สถานะ', sorter: true , dataIndex: 'status' , key: 'status' },
        { title: 'รหัสรายการ' , sorter: true , dataIndex: 'transactionId' , key: 'transactionId' },
        { title: 'รหัสรายการร้านค้า' , sorter: true , dataIndex: 'reference' , key: 'reference' },
        { title: 'ธนาคาร' , dataIndex: 'from_bank' , key: 'from_bank' },
        { title: 'เลขบัญชี' , dataIndex: 'bankNumber' , key: 'bankNumber' },
        { title: 'ชื่อบัญชี' , dataIndex: 'bankName' , key: 'bankName' },
        { title: 'ยอดเงิน' , dataIndex: 'amount' , key: 'amount' },
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
    imageUrl.value = null
    await onLoadTable.value()
}

const onFinish = async (data: typeof formState) => {
    // loading.value = true; // old
    // try {
    //     await api.post('api/v1/bo/transaction/refund' , data , {
    //         headers: { 'Content-Type': 'multipart/form-data' }
    //     }).then(res => res.data)
    //     message.success('ทำรายการสำเร็จ')
    //     await resetForm()
    // } catch(e) {}
    // loading.value = false

    // เปิด modal ยืนยันการทำรายการ // new
    modals.confirm = true
}

// ฟังก์ชันสำหรับยืนยันการทำรายการ
const handleConfirmRefund = async () => {
    if (!confirmFormState.isConfirmed) {
        message.error('กรุณายืนยันการทำรายการนี้')
        return
    }
    if (!confirmFormState.reference){
        message.error('กรุณากรอกข้อมูลยืนยัน')
        return
    }
    loading.value = true
    try {
        // รวมข้อมูลจาก formState และ confirmFormState
        const finalData = {
            ...formState,
            reference: confirmFormState.reference
        }
        await api.post('api/v1/bo/transaction/refund', finalData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(res => res.data)
        
        message.success('ทำรายการสำเร็จ')
        modals.confirm = false
        Object.assign(confirmFormState, defaultConfirmFormState)
        await resetForm()
    } catch (e) {
        message.error('เกิดข้อผิดพลาดในการทำรายการ')
    } finally {
        loading.value = false
    }
}

// ฟังก์ชันสำหรับยกเลิกการยืนยัน
const handleCancelConfirm = () => {
    modals.confirm = false
    Object.assign(confirmFormState, defaultConfirmFormState)
}
 
</script>

<template>

    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">รายงานธุรกรรมคืนเงินร้านค้า</h1>
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
                            <a-form-item label="รหัสรายการ" name="transactionId">
                                <a-input v-model:value="formStateSearch.transactionId" placeholder="กรุณากรอกรหัสรายการ" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="รหัสรายการร้านค้า" name="reference">
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
                        <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="modals.crud = true" v-if="permissions.includes('refund.create')">
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
                        <template v-if="column.key === 'type'">
                            <a-tag color="green" v-if="record.type === 'payin'">
                                ฝาก
                            </a-tag>
                            <a-tag color="red" v-else>ถอน</a-tag>
                        </template>
                        <template v-if="column.key === 'transactionId'">
                            <div class="flex items-center gap-2">
                                {{ text }} <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="onCopyText(text)" />
                            </div>
                        </template>
                        <template v-if="column.key === 'reference'">
                            <div class="flex items-center gap-2">
                                {{ text }} <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="onCopyText(text)" />
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
                        <template v-if="['amount'].includes(column.key)">
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
        title="สร้างรายการคืนเงิน" 
        @cancel="resetForm"
        :footer="null"
        width="600px"
    >
        <a-form 
            :required-mark="false"
            layout="vertical" 
            name="basic" 
            autocomplete="off" 
            :model="formState"
            @finish="onFinish"
        >
            <a-row :gutter="24">
                <a-col :span="24">
                        <a-row :gutter="24">
                            <a-col :span="24">
                                <a-form-item 
                                    label="บัญชี"
                                    name="accountId" 
                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                                >
                                    <a-select 
                                        v-model:value="formState.accountId" 
                                        placeholder="กรุณาเลือกบัญชี"
                                        :not-found-content="isLoading.account ? undefined : null"
                                        show-search
                                        :filter-option="false"
                                        @search="onSearchAccount"
                                    >

                                        <a-select-option :value="item.id" v-for="item , index in accounts" :key="index">
                                            <div class="flex gap-2 items-center">
                                                <img :src="item.bank.img" style="height: 24px;"> {{ item.name }}
                                            </div>
                                        </a-select-option>

                                        <template v-if="isLoading.account" #notFoundContent>
                                            <a-spin size="small" />
                                        </template>

                                        <template #option="{ value }">
                                            <div class="flex gap-2 items-center">
                                                <template v-if="isAccount(value)">
                                                    <img :src="isAccount(value)?.bank.img" style="height: 24px;">
                                                    <div class="flex flex-col">
                                                        <span class="font-semibold">{{ isAccount(value)?.name }}</span>
                                                        <span class="text-xs text-gray-500">
                                                            {{ formatThaiBankAccount(isAccount(value)?.bankNumber) }}
                                                        </span>
                                                    </div>
                                                    <a-tag color="success" style="margin-left: auto;" v-if="isAccount(value)?.status">เปิดใช้งาน</a-tag>
                                                    <a-tag color="error" style="margin-left: auto;" v-else>ปิดใช้งาน</a-tag>
                                                </template>
                                                <template v-else>
                                                    <span>ไม่พบข้อมูลบัญชี</span>
                                                </template>
                                            </div>
                                        </template>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                            <a-col :span="24">
                                <a-form-item 
                                    label="ร้านค้า" 
                                    name="merchantId" 
                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                                >
                                <a-select 
                                        v-model:value="formState.merchantId" 
                                        placeholder="กรุณาเลือกร้านค้า"
                                        :not-found-content="isLoading.merchant ? undefined : null"
                                        show-search
                                        :filter-option="false"
                                        @search="onSearchMerchant"
                                    >

                                        <a-select-option :value="item.id" v-for="item , index in merchants" :key="index">
                                            {{ item.prefix }}
                                        </a-select-option>

                                        <template v-if="isLoading.merchant" #notFoundContent>
                                            <a-spin size="small" />
                                        </template>

                                        <template #option="{ value }">
                                            <div class="flex gap-2 items-center">
                                                <div class="flex flex-col">
                                                    <span class="font-semibold">{{ isMerchant(value)?.prefix }}</span>
                                                    <span class="text-xs text-gray-500">{{ isMerchant(value)?.name }}</span>
                                                </div>
                                            </div>
                                        </template>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                            <a-col :lg="12" :md="12" :xs="24">
                                <a-form-item 
                                    label="สลิปรายการ" 
                                    name="image"
                                >
                                    <a-upload
                                        list-type="picture-card"
                                        :show-upload-list="false"
                                        :before-upload="beforeUpload"
                                        @change="handleChange"
                                        class="upload-img-bank"
                                    >
                                        <img
                                            v-if="imageUrl"
                                            :src="imageUrl"
                                            alt="avatar"
                                            class="uploaded-image"
                                        />
                                        <div v-else>
                                            <div class="flex items-center justify-center h-[320px] gap-2 flex-col opacity-[0.75] hover:opacity-[.90]">
                                                <Icon icon="mdi-light:image" width="24" height="24" />
                                                <div class="mt-[8px] font-bold text-xs">คลิกอัพโหลด หรือ ลากไฟล์มาวางที่นี่</div>
                                                <div class="mt-[8px] font-bold text-xs">* ไฟล์รูปภาพมีขนาดไม่เกิน 3 MB *</div>
                                            </div>
                                        </div>
                                    </a-upload>
                                </a-form-item>
                            </a-col>
                            <a-col :lg="12" :md="12" :xs="24">
                                <a-form-item 
                                    label="ชื่อบัญชี" 
                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' } ,]"
                                    name="name"
                                >
                                    <a-input v-model:value="formState.name" placeholder="กรุณากรอกข้อมูล" />
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
                                    <a-input-number v-model:value="formState.amount" :min="0" class="w-full" placeholder="กรุณากรอกข้อมูล">
                                        <template #addonBefore>
                                            <Icon icon="iconoir:coin" ></Icon>
                                        </template>
                                    </a-input-number>
                                </a-form-item>
                            </a-col>
                            <a-col :span="24">
                                <a-form-item label="หมายเหตุ" name="remark">
                                    <a-textarea v-model:value="formState.remark" placeholder="หมายเหตุ" :rows="4" />
                                </a-form-item>
                            </a-col>
                        </a-row>
                </a-col>
                <a-col :span="24">
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
                </a-col>
            </a-row>
        </a-form>
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

    <!-- confirm refund modal  -->
    <a-modal 
        :open="modals.confirm" 
        title="ยืนยันการทำรายการคืนเงิน" 
        :footer="null"
        width="500px"
        @cancel="handleCancelConfirm"
        :maskClosable="false"
    >
        <div class="mb-4">
            <a-alert
                message="กรุณาตรวจสอบข้อมูลก่อนยืนยันการทำรายการ"
                description="การทำรายการนี้จะไม่สามารถยกเลิกได้หลังจากยืนยันแล้ว"
                type="warning"
                show-icon
                class="mb-4"
            />
            
            <div class="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 class="font-semibold mb-2">ข้อมูลรายการ:</h4>
                <div class="space-y-2 text-sm">
                    <div><strong>ร้านค้า:</strong> {{ merchants.find(m => m.id === formState.merchantId)?.prefix || '-' }}</div>
                    <div><strong>บัญชี:</strong> {{ accounts.find(a => a.id === formState.accountId)?.name || '-' }}</div>
                    <div><strong>ชื่อบัญชี:</strong> {{ formState.name || '-' }}</div>
                    <div><strong>เลขบัญชี:</strong> {{ formState.bankNumber || '-' }}</div>
                    <div><strong>ธนาคาร:</strong> {{ initStore.banks.find(b => b.code === formState.bankCode)?.nameTh || '-' }}</div>
                    <div><strong>ยอดเงิน:</strong> {{ formatNumber(formState.amount || 0, 2) }} บาท</div>
                    <div><strong>หมายเหตุ:</strong> {{ formState.remark || '-' }}</div>
                </div>
            </div>
        </div>

        <a-form 
            :required-mark="false"
            :model="confirmFormState" 
            layout="vertical"
        >
            <a-form-item label="ข้อมูลยืนยัน รหัสรายการ" name="reference">
                <a-input 
                    v-model:value="confirmFormState.reference" 
                    placeholder="กรอกข้อมูลยืนยัน รหัสรายการ"
                />
            </a-form-item>

            <a-form-item name="isConfirmed" :rules="[{ required: true, message: 'กรุณายืนยันการทำรายการนี้' }]">
                <a-checkbox v-model:checked="confirmFormState.isConfirmed">
                    ฉันยืนยันว่าข้อมูลข้างต้นถูกต้องและต้องการทำรายการคืนเงินนี้
                </a-checkbox>
            </a-form-item>

            <div class="flex justify-end gap-2 mt-6">
                <a-button @click="handleCancelConfirm">
                    ยกเลิก
                </a-button>
                <a-button 
                    type="primary" 
                    danger
                    :loading="loading"
                    @click="handleConfirmRefund"
                >
                    <div class="flex items-center gap-2">
                        <Icon icon="mdi:check-circle" width="14" height="14" />
                        ยืนยันการทำรายการ
                    </div>
                </a-button>
            </div>
        </a-form>
    </a-modal>
    
</template>

<style>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}

/* จำกัดขนาดของ upload container */
.upload-img-bank :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
  border-radius: 8px !important;
}

.upload-img-bank :deep(.ant-upload-select) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
}

/* จำกัดขนาดของรูปที่อัพโหลด */
.uploaded-image {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain !important;
  object-position: center !important;
  display: block !important;
}

/* Responsive สำหรับมือถือ */
@media (max-width: 768px) {
  .upload-img-bank :deep(.ant-upload),
  .upload-img-bank :deep(.ant-upload-select) {
    height: 250px !important;
  }
}

@media (max-width: 480px) {
  .upload-img-bank :deep(.ant-upload),
  .upload-img-bank :deep(.ant-upload-select) {
    height: 200px !important;
  }
}

/* Force upload card to fill the column width on this page */
.upload-img-bank,
.upload-img-bank .ant-upload-wrapper,
.upload-img-bank .ant-upload,
.upload-img-bank .ant-upload-select,
.upload-img-bank .ant-upload-select-picture-card {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    display: block !important;
}
</style>