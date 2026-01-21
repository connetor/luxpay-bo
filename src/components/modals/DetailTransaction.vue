<script setup lang="ts">
import { useEvent } from '@/composables/useEvent';
import api from '@/configs/api';
import type { Transaction } from '@/interface/Modal';
import { formatThaiBankAccount, setFormatTime } from '@/utils'
import { message } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { reactive, ref } from 'vue';

// defineProps<{
//     transaction: Transaction,
//     show: boolean
// }>()

const { onCopyText } = useEvent()

const emit = defineEmits(['update:show'])

const modals = reactive({
    json: false
})

const json = ref(null)

const onCallback = async (id: number) => {
    try {
        await api.post(`api/v1/bo/transaction/cb/${id}`)
        message.success('ทำรายการสำเร็จ')
    } catch(e) {} 
}

const props = defineProps<{
    transaction: Transaction,
    show: boolean
}>()

const copyAllData = () => {
    const transaction = props.transaction
    
    // จัดรูปแบบข้อมูลตามที่ต้องการ
    const allData = `รายละเอียดธุรกรรม
        • ร้านค้า : ${transaction.merchant?.name || '-'} (${transaction.merchant?.prefix || '-'})
        • รหัสรายการ : ${transaction.transactionId}
        • รหัสอ้างอิง : ${transaction.reference}
        • ยอด : ${transaction.amount}
        • ประเภท : ${transaction.type === 'payin' ? 'ฝาก' : 'ถอน'}
        • ธนาคาร : ${transaction.bank.name}
        • ชื่อบัญชี : ${transaction.bankName}
        • เลขบัญชี : ${transaction.bankNumber ? formatThaiBankAccount(transaction.bankNumber) : '-'}
        • ระบุปัญหา : `
    
    onCopyText(allData)
}

</script>

<template>
    <a-modal 
        :open="show" 
        :footer="null"
        width="800px"
        @cancel="emit('update:show', false)"
    >
        <template #title>
            <div class="flex items-center gap-2">
                <span class="text-lg font-semibold">รายละเอียด</span>
                <a-tooltip title="คัดลอกรายละเอียด" placement="bottom">
                    <Icon 
                        icon="material-symbols:content-copy" 
                        width="18" 
                        height="18" 
                        class="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors duration-200" 
                        @click="copyAllData"
                    />
                </a-tooltip>
            </div>
        </template>
        <a-descriptions bordered :column="{ xs: 1 , sm: 1 , md: 2 }">
            <a-descriptions-item label="รหัสรายการ">
                <div class="flex items-center gap-2">
                    {{ transaction.transactionId }} 
                    <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="onCopyText(transaction.transactionId)" />
                </div>
            </a-descriptions-item>
            <a-descriptions-item label="รหัสอ้างอิง">
                <div class="flex items-center gap-2">
                    {{ transaction.reference }} 
                    <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="onCopyText(transaction.reference)" />
                </div>
            </a-descriptions-item>
            <a-descriptions-item label="ประเภท">
                <a-tag color="green" v-if="transaction.type === 'payin'">ฝาก</a-tag>
                <a-tag color="red" v-else>ถอน</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="ช่องทาง">
                <a-tag color="green" v-if="transaction.action === 'deposit'">ฝากเงิน</a-tag>
                <a-tag color="red" v-else-if="transaction.action === 'withdraw'">ถอน</a-tag>
                <a-tag color="green" v-else-if="transaction.action === 'topup'">เติมเงิน</a-tag>
                <a-tag color="red" v-else-if="transaction.action === 'transferout'">โอนเงิน</a-tag>
                <a-tag color="green" v-else-if="transaction.action === 'settlement'">โยกเงิน</a-tag>
                <a-tag color="green" v-else-if="transaction.action === 'commission'">ถอนรายได้</a-tag>
                <a-tag color="green" v-else-if="transaction.action === 'refund'">คืนเงิน</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="สถานะ" :span="3">
                <a-badge status="success" text="สำเร็จ" v-if="transaction.status === 'completed'" />
                <a-badge status="error" text="ล้มเหลว" v-else-if="transaction.status === 'fail'" />
                <a-badge status="warning" text="รอทำรายการ" v-else-if="transaction.status === 'pending'" />
                <a-badge color="purple" text="หมดเวลา" v-else-if="transaction.status === 'timeout'" />
                <a-badge status="process" text="กำลังทำรายการ" v-else />
            </a-descriptions-item>
            <a-descriptions-item label="บัญชีร้านค้า" :span="2">
                {{ transaction.bank.name }}
                <br>
                {{ transaction.bankName }}
                <br>
                {{ transaction.bankNumber ? formatThaiBankAccount(transaction.bankNumber) : '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="บัญชีร้านค้า" :span="2">
                {{ transaction.account?.bank.nameTh }}
                <br>
                {{ transaction.account?.name }}
                <br>
                {{ transaction.account?.bankNumber ? formatThaiBankAccount(transaction.account?.bankNumber) : '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="ยอดเงิน">{{ transaction.amount }}</a-descriptions-item>
            <a-descriptions-item label="ยอดฝากเงิน">{{ transaction.depositAmount }}</a-descriptions-item>
            <a-descriptions-item label="Rate">{{ transaction.rate }} {{ transaction.rateType === 'fixed' ? '' : '%' }}</a-descriptions-item>
            <a-descriptions-item label="Fee">{{ transaction.mdrAmount }}</a-descriptions-item>
            <a-descriptions-item label="Callback" :span="3">
                <a-button size="small" @click="onCallback(transaction.id)" v-if="transaction.callbackUrl">
                    <div class="flex items-center gap-1">
                        <Icon icon="material-symbols-light:call-outline" width="12" height="12" ></Icon> คลิก
                    </div>
                </a-button>
            </a-descriptions-item>
            <a-descriptions-item label="วันที่ทำรายการ" :span="2">{{ setFormatTime(transaction.createdAt) }}</a-descriptions-item>
            <a-descriptions-item label="วันที่หมดอายุ" :span="2">{{ transaction.expiredAt ? setFormatTime(transaction.expiredAt) : '-' }}</a-descriptions-item>
            <a-descriptions-item label="สลิปรายการ" :span="3">
                <a-image
                    :width="200"
                    :src="transaction.imgSlip"
                    class="w-full max-w-[200px]"
                    v-if="transaction.imgSlip"
                />
            </a-descriptions-item>
        </a-descriptions>
    </a-modal>
</template>