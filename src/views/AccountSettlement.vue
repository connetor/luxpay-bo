<script setup lang="ts">
import { onMounted, reactive, ref, computed, createVNode } from "vue";
import api from "@/configs/api";
import type { Bank, SettlementAccount } from "@/interface/Modal";
import { message, Modal } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { useTable } from "@/composables/useTable";
import { useAuthStore } from "@/stores/auth";
import { useInitStore } from "@/stores/init";
import { formatThaiBankAccount, formatNumber } from "@/utils";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

const { onLoadTable, data, loading, pagination, sort, handleTableChange } = useTable<SettlementAccount>()

const { user } = useAuthStore()
const initStore = useInitStore()

const modal = ref(false)
const isEdit = ref(false)
const settlement = ref<SettlementAccount | null>(null)
const banks = ref<Bank[]>([])
const bankAccounts = ref<any[]>([])

const defaultFormState = {
    amount: null as string | null,
    bankId: null as number | null,
    accountId: null as number | null,
    bankName: null as string | null,
    bankNumber: null as string | null,
    remark: null as string | null,
    nameTh: null as string | null,
    balanceAvailable: null as number | null,
    type: 1 as number, // 1 = ยอดเงิน, 2 = percent
    percent: undefined as number | undefined,
    active: true as boolean,
}

const formState = reactive({ ...defaultFormState })
const permissions = user?.permissions ?? []

onMounted(async () => {
    await initStore.init()
    await loadBanks()
    await loadBankAccounts()
    await onLoadTable.value()
})

const loadBanks = async () => {
    try {
        const res = await api.get('api/v1/bo/bank').then(res => res.data)
        if (res && res.data) {
            banks.value = res.data
        } else if (Array.isArray(res)) {
            banks.value = res
        } else {
            banks.value = []
        }
    } catch (e) {
        console.error('Error loading banks:', e)
        banks.value = []
    }
}

const loadBankAccounts = async () => {
    try {
        const res = await api.get('api/v1/bo/account').then(res => res.data)
        if (res && res.data) {
            bankAccounts.value = res.data
        } else if (Array.isArray(res)) {
            bankAccounts.value = res
        } else {
            bankAccounts.value = []
        }
    } catch (e) {
        console.error('Error loading bank accounts:', e)
        bankAccounts.value = []
    }
}

onLoadTable.value = async () => {
    loading.value = true
    try {
        const res = await api.get('api/v1/bo/settlement').then(res => res.data)
        if (res && res.data) {
            data.value = res.data
        } else if (Array.isArray(res)) {
            data.value = res
        } else {
            data.value = []
        }
        pagination.total = Array.isArray(data.value) ? data.value.length : 0
    } catch (e) {
        console.error('Error loading settlements:', e)
        data.value = []
        pagination.total = 0
    }
    loading.value = false
}

const columns = reactive([
    ...(permissions?.includes('settlement_account.update') ? [
        { title: 'จัดการ', key: 'more' },
    ] : []),
    {
        title: 'บัญชีในระบบ', children: [
            { title: 'ธนาคาร', dataIndex: 'currentBank', key: 'currentBank' },
            { title: 'ชื่อ', dataIndex: 'currentName', key: 'currentName' },
            { title: 'เลขบัญชี', dataIndex: 'currentBankNumber', key: 'currentBankNumber' },
        ]
    },
    {
        title: 'บัญชีปลายทาง', children: [
            { title: 'ธนาคาร', dataIndex: 'toBank', key: 'toBank' },
            { title: 'ชื่อ', dataIndex: 'toName', key: 'toName' },
            { title: 'เลขบัญชี', dataIndex: 'toBankNumber', key: 'toBankNumber' },
        ]
    },
    { title: 'ยอดเงิน', dataIndex: 'amount', key: 'amount' },
    { title: 'ยอดเงินทำรายการ', dataIndex: 'balanceAvailable', key: 'balanceAvailable' },
    { title: 'ประเภท', dataIndex: 'type', key: 'type' },
    { title: 'เปอร์เซ็นต์', dataIndex: 'percent', key: 'percent' },
    { title: 'สถานะ', dataIndex: 'active', key: 'active' },
    { title: 'หมายเหตุ', dataIndex: 'remark', key: 'remark' },
])

const resetForm = async () => {
    isEdit.value = false
    modal.value = false
    settlement.value = null
    Object.assign(formState, defaultFormState)
    await onLoadTable.value()
}

const onEdit = async (record: SettlementAccount) => {
    try {
        settlement.value = record
        Object.assign(formState, {
            amount: record.amount,
            bankId: Number(record.bankId),
            accountId: record.accountId,
            bankName: record.bankName,
            bankNumber: record.bankNumber,
            remark: record.remark,
            nameTh: (record as any).nameTh,
            balanceAvailable: record.balanceAvailable
        })
        isEdit.value = true
        modal.value = true
    } catch (e) {
        console.error('Error editing settlement:', e)
    }
}

const onDelete = async (record: SettlementAccount) => {
    Modal.confirm({
        title: 'ลบข้อมูล' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, 'ต้องการลบข้อมูลนี้ ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true
            try {
                await api.delete(`api/v1/bo/settlement/${record.id}`)
                message.success('ทำรายการสำเร็จ')
                await onLoadTable.value()
            } catch(e) {}
            loading.value = false
        }
    })
}

const onFinish = async (formData: typeof formState) => {
    loading.value = true
    try {
        const payload = {
            amount: Number(formData.amount),
            bankId: Number(formData.bankId),
            accountId: formData.accountId,
            bankName: formData.bankName,
            bankNumber: formData.bankNumber,
            remark: formData.remark || '',
            balanceAvailable: formData.balanceAvailable ? Number(formData.balanceAvailable) : null,
            type: formData.type,
            percent: formData.percent ?? null,
            active: formData.active,
        }
        if (isEdit.value && settlement.value?.id) {
            await api.post(`api/v1/bo/settlement/${settlement.value!.id}`, payload)
            message.success('แก้ไขรายการสำเร็จ')
        } else {
            await api.post('api/v1/bo/settlement', payload)
            message.success('สร้างรายการสำเร็จ')
        }
        await resetForm()
    } catch (e) {
        console.error('Error saving settlement:', e)
        message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    }
    loading.value = false
}

const handleBankChange = (bankId: number) => {
    const selectedBank = banks.value.find(bank => bank.id === bankId)
    if (selectedBank) {
        formState.bankId = bankId
        formState.nameTh = selectedBank.nameTh
    }
}

const handleAccountChange = (accountId: number) => {
    const selectedAccount = bankAccounts.value.find(account => account.id === accountId)
    if (selectedAccount) {
        formState.accountId = accountId
        // อาจจะต้องอัปเดต field อื่นๆ ตามความต้องการ
    }
}

// ฟังก์ชันสำหรับกรอกเลขบัญชีได้แค่ตัวเลข
const handleBankNumberInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    
    // กรองให้เหลือแค่ตัวเลขเท่านั้น
    const numericValue = value.replace(/[^0-9]/g, '')
    
    // อัปเดตค่าใน formState
    formState.bankNumber = numericValue
    
    // อัปเดตค่าใน input field
    target.value = numericValue
}

// ฟังก์ชันสำหรับกรอกจำนวนเงินได้แค่ตัวเลขและจุดทศนิยม
const handleAmountInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    
    // กรองให้เหลือแค่ตัวเลขและจุดทศนิยม (จุดเดียว)
    const numericValue = value.replace(/[^0-9.]/g, '')
    
    // ตรวจสอบว่ามีจุดทศนิยมมากกว่า 1 จุดหรือไม่
    const dotCount = (numericValue.match(/\./g) || []).length
    if (dotCount > 1) {
        // ถ้ามีจุดมากกว่า 1 จุด ให้เอาแค่จุดแรก
        const parts = numericValue.split('.')
        const firstPart = parts[0]
        const secondPart = parts.slice(1).join('')
        const cleanValue = firstPart + '.' + secondPart.replace(/\./g, '')
        formState.amount = cleanValue
        target.value = cleanValue
        return
    }
    
    // ตรวจสอบว่าจุดทศนิยมมีทศนิยมไม่เกิน 2 ตำแหน่ง
    if (numericValue.includes('.')) {
        const parts = numericValue.split('.')
        if (parts[1] && parts[1].length > 2) {
            const limitedValue = parts[0] + '.' + parts[1].substring(0, 2)
            formState.amount = limitedValue
            target.value = limitedValue
            return
        }
    }
    
    // อัปเดตค่าใน formState
    formState.amount = numericValue
    
    // อัปเดตค่าใน input field
    target.value = numericValue
}

// ฟังก์ชันสำหรับกรอกจำนวนเงินเริ่มทำรายการได้แค่ตัวเลขและจุดทศนิยม
const handleBalanceAvailableInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    
    // กรองให้เหลือแค่ตัวเลขและจุดทศนิยม (จุดเดียว)
    const numericValue = value.replace(/[^0-9.]/g, '')
    
    // ตรวจสอบว่ามีจุดทศนิยมมากกว่า 1 จุดหรือไม่
    const dotCount = (numericValue.match(/\./g) || []).length
    if (dotCount > 1) {
        // ถ้ามีจุดมากกว่า 1 จุด ให้เอาแค่จุดแรก
        const parts = numericValue.split('.')
        const firstPart = parts[0]
        const secondPart = parts.slice(1).join('')
        const cleanValue = firstPart + '.' + secondPart.replace(/\./g, '')
        formState.balanceAvailable = Number(cleanValue)
        target.value = cleanValue
        return
    }
    
    // ตรวจสอบว่าจุดทศนิยมมีทศนิยมไม่เกิน 2 ตำแหน่ง
    if (numericValue.includes('.')) {
        const parts = numericValue.split('.')
        if (parts[1] && parts[1].length > 2) {
            const limitedValue = parts[0] + '.' + parts[1].substring(0, 2)
            formState.balanceAvailable = Number(limitedValue)
            target.value = limitedValue
            return
        }
    }
    
    // อัปเดตค่าใน formState
    formState.balanceAvailable = Number(numericValue)
    
    // อัปเดตค่าใน input field
    target.value = numericValue
}

const handlePercentInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    
    // กรองให้เหลือแค่ตัวเลขและจุดทศนิยม
    const numericValue = value.replace(/[^\d.]/g, '')
    
    // ตรวจสอบว่ามีจุดทศนิยมมากกว่า 1 จุด
    if (numericValue.split('.').length > 2) {
        const parts = numericValue.split('.')
        const firstPart = parts[0]
        const secondPart = parts.slice(1).join('')
        const cleanValue = firstPart + '.' + secondPart.replace(/\./g, '')
        formState.percent = Number(cleanValue)
        target.value = cleanValue
        return
    }
    
    // ตรวจสอบว่าจุดทศนิยมมีทศนิยมไม่เกิน 2 ตำแหน่ง
    if (numericValue.includes('.')) {
        const parts = numericValue.split('.')
        if (parts[1] && parts[1].length > 2) {
            const limitedValue = parts[0] + '.' + parts[1].substring(0, 2)
            formState.percent = Number(limitedValue)
            target.value = limitedValue
            return
        }
    }
    
    // ตรวจสอบค่าไม่เกิน 100
    const numValue = Number(numericValue)
    if (numValue > 100) {
        formState.percent = 100
        target.value = '100'
        return
    }
    
    // อัปเดตค่าใน formState
    formState.percent = numValue
    
    // อัปเดตค่าใน input field
    target.value = numericValue
}

// Computed property to get bank name by ID
const getBankNameById = computed(() => {
    return (bankId: string | number) => {
        const id = typeof bankId === 'string' ? Number(bankId) : bankId
        return banks.value.find(b => b.id === id)?.nameTh ?? '-'
    }
})

</script>

<template>
    <a-row align="middle" :gutter="[24, 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">โยกเงินบัญชี</h1>
                    </div>
                </div>

                <div class="float-right">
                    <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="modal = true"
                        v-if="permissions.includes('settlement_account.update')">
                        <Icon icon="line-md:plus" class="mr-2"></Icon> สร้างรายการ
                    </a-button>
                </div>
                <a-table :columns="columns" :data-source="data" :loading="loading" bordered
                    :scroll="{ x: 'max-content' }" :pagination="false" :key="data.length">
                    <template #bodyCell="{ column, index, record }">
                        <template v-if="column.key === 'id'">
                            {{ index + 1 }}
                        </template>

                        <!-- บัญชีในระบบ -->
                        <template v-if="column.key === 'currentBank'">
                            {{ record.account?.bank?.nameTh ?? '-' }}
                        </template>
                        <template v-if="column.key === 'currentName'">
                            {{ record.account?.name ?? '-' }}
                        </template>
                        <template v-if="column.key === 'currentBankNumber'">
                            {{ formatThaiBankAccount(record.account?.bankNumber ?? '') }}
                        </template>

                        <!-- บัญชีปลายทาง -->
                        <template v-if="column.key === 'toBank'">
                            {{getBankNameById(record.bankId)}}
                        </template>
                        <template v-if="column.key === 'toName'">
                            {{ record.bankName ?? '-' }}
                        </template>
                        <template v-if="column.key === 'toBankNumber'">
                            {{ formatThaiBankAccount(record.bankNumber ?? '') }}
                        </template>

                        <!-- จำนวนเงิน -->
                        <template v-if="column.key === 'amount'">
                            {{ formatNumber(record[column.key], 2) }}
                        </template>
                        <template v-if="column.key === 'balanceAvailable'">
                            {{ record[column.key] ? formatNumber(record[column.key], 2) : '-' }}
                        </template>

                        <template v-if="column.key === 'type'">
                            <a-tag color="green" v-if="record.type === 1">ยอดเงิน</a-tag>
                            <a-tag color="red" v-else>เปอร์เซ็นต์</a-tag>
                        </template>

                        <template v-if="column.key === 'percent'">
                            {{ record.percent ? record.percent + '%' : '-' }}
                        </template>

                        <template v-if="column.key === 'active'">
                            <a-tag color="success" v-if="record.active">ใช้งาน</a-tag>
                            <a-tag color="error" v-else>ระงับใช้งาน</a-tag>
                        </template>

                        <!-- หมายเหตุ -->
                        <template v-if="column.key === 'remark'">
                            {{ record.remark ?? '-' }}
                        </template>

                        <template v-if="column.key === 'more'">
                            <a-space>
                                <a-button class="px-0" @click="onEdit(record)"
                                    v-if="permissions.includes('settlement_account.update')">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="ep:edit-pen" width="14" height="14"></Icon> แก้ไข
                                    </div>
                                </a-button>
                                <a-button @click="onDelete(record)"
                                    v-if="permissions.includes('settlement_account.delete')">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="solar:trash-bin-2-linear" width="14" height="14"></Icon> ลบ
                                    </div>
                                </a-button>
                            </a-space>
                        </template>
                    </template>
                </a-table>
            </a-card>
        </a-col>
    </a-row>

    <!-- CRUD Modal -->
    <a-modal :open="modal" :title="isEdit ? 'แก้ไขรายการโยกเงิน' : 'สร้างรายการโยกเงิน'" @cancel="resetForm"
        :footer="null" width="600px">
        <a-form 
            layout="vertical" 
            name="settlementForm" 
            autocomplete="off" 
            :model="formState" 
            @finish="onFinish"
            :required-mark="false"
        >
            
            <a-form-item label="บัญชีในระบบ" :rules="[{ required: true, message: 'กรุณาเลือกบัญชีในระบบ' }]" name="accountId">
                <a-select v-model:value="formState.accountId" placeholder="เลือกบัญชีในระบบ" @change="handleAccountChange"
                    :loading="loading">
                    <a-select-option v-for="account in bankAccounts" :key="account.id" :value="account.id">
                        {{ account.name }} - {{ account.bankNumber }} ({{ account.bank?.nameTh }})
                    </a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item label="ชื่อธนาคารปลายทาง" :rules="[{ required: true, message: 'กรุณาเลือกธนาคาร' }]" name="bankId">
                <a-select v-model:value="formState.bankId" placeholder="เลือกธนาคาร" @change="handleBankChange"
                    :loading="loading">
                    <a-select-option v-for="bank in banks" :key="bank.id" :value="bank.id">
                        <div class="flex gap-2 items-center">
                            <img :src="bank.img" style="height: 18px;"> {{ bank.nameTh }}
                        </div>
                    </a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item name="nameTh" style="display: none;">
                <a-input v-model:value="formState.nameTh" />
            </a-form-item>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="ชื่อบัญชีปลายทาง" :rules="[{ required: true, message: 'กรุณากรอกชื่อบัญชี' }]" name="bankName">
                        <a-input v-model:value="formState.bankName" placeholder="กรุณากรอกชื่อเจ้าของบัญชี" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="เลขบัญชีปลายทาง"
                        :rules="[{ required: true, message: 'กรุณากรอกเลขบัญชีปลายทาง' }]" name="bankNumber">
                        <a-input 
                            v-model:value="formState.bankNumber" 
                            placeholder="กรอกเลขบัญชีปลายทาง" 
                            @input="handleBankNumberInput"
                            maxlength="20"
                        />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="จำนวนเงินทำรายการ" :rules="[{ required: true, message: 'กรุณากรอกจำนวนเงิน' }]" 
                        name="balanceAvailable">
                        <a-input 
                            v-model:value="formState.balanceAvailable" 
                            placeholder="กรอกจำนวนเงิน" 
                            @input="handleBalanceAvailableInput"
                            maxlength="15"
                            addon-after="บาท"
                        />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="จำนวนเงิน" :rules="[{ required: true, message: 'กรุณากรอกจำนวนเงิน' }]"
                        name="amount">
                        <a-input 
                            v-model:value="formState.amount" 
                            placeholder="กรอกจำนวนเงิน" 
                            @input="handleAmountInput"
                            maxlength="15"
                            addon-after="บาท"
                        />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
            <a-form-item label="ประเภท" name="type">
                <a-radio-group v-model:value="formState.type">
                    <a-radio :value="1">ยอดเงิน</a-radio>
                    <a-radio :value="2">เปอร์เซ็นต์</a-radio>
                </a-radio-group>
            </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item 
                        label="เปอร์เซ็นต์ (%)" 
                        name="percent" 
                        v-if="formState.type === 2"
                        :rules="[
                            { required: true, message: 'กรุณากรอกเปอร์เซ็นต์' },
                            { type: 'number', min: 0.01, max: 100, message: 'เปอร์เซ็นต์ต้องอยู่ระหว่าง 0.01-100' }
                        ]"
                    >
                        <a-input 
                            v-model:value="formState.percent" 
                            placeholder="กรอกเปอร์เซ็นต์" 
                            @input="handlePercentInput"
                            style="width: 100%"
                        />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="เปิดใช้งานระบบ" name="active">
                        <a-checkbox v-model:checked="formState.active">
                            เปิดใช้งานระบบ
                        </a-checkbox>
                    </a-form-item>
                </a-col>
            </a-row>

            <a-form-item label="หมายเหตุ" name="remark">
                <a-textarea v-model:value="formState.remark" placeholder="หมายเหตุ (ถ้ามี)" :rows="3" />
            </a-form-item>

            <a-form-item>
                <a-space class="float-right">
                    <a-button :loading="loading" type="default" class="mb-[0]" @click="resetForm">
                        ยกเลิก
                    </a-button>
                    <a-button :loading="loading" html-type="submit" type="primary" class="mb-[0]">
                        {{ isEdit ? 'แก้ไข' : 'สร้าง' }}
                    </a-button>
                </a-space>
            </a-form-item>
        </a-form>
    </a-modal>

</template>

<style scoped>
.ant-form-item {
    margin-bottom: 16px;
}
.header-title{
    color: var(--accent) !important;
}
.header-text{
    color: var(--accent-dark) !important;
}
</style>
