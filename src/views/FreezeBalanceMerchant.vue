
<script setup lang="ts">
import { computed, createVNode, onMounted, reactive , ref } from "vue";
import api from "@/configs/api";
import type { Account, FreezeBalance } from "@/interface/Modal";
import { message, Modal } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { useTable } from "@/composables/useTable";
import { setFormatTime , formatNumber } from "@/utils";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { useInitStore } from "@/stores/init";

const loading = ref(false)
const modals = reactive({
    crud: false ,
    refund: false ,
    confirm: false
})
const isEdit = ref(false)
const isRefund = ref(false)

const freeze = ref<FreezeBalance | null>(null)
const confirm = ref(false)

const initStore = useInitStore()

const defualtFormState = {
    amount: null ,
    remark: null ,
    accountId: null ,
    amountRefund: null
}

const formState = reactive({ ...defualtFormState })
const formStateRefund = reactive({ ...defualtFormState })

const { onLoadTable , data } = useTable<FreezeBalance>()

onMounted(async () => {
    await onLoadTable.value()
    await initStore.getAccounts()
})

const account = computed(() => {
    return initStore.accounts.find(a => a.id === formState.accountId)
})

onLoadTable.value = async () => {
    loading.value = true
    try {
        const res = await api.get('api/v1/bo/freeze-balance' ).then(res => res.data)
        data.value = res.data
    } catch(e) {}
    loading.value = false
}

const columns = reactive([
    { title: 'จัดการ', key: 'more' },
    { title: 'บัญชี' , dataIndex: 'account' , key: 'account' },
    {
        title: 'ยอดเงิน' , children: [
            { title: 'ทั้งหมด' , dataIndex: 'amount' , key: 'amount' },
            { title: 'คงเหลือร้านค้า' , dataIndex: 'amountAvailable' , key: 'amountAvailable' },
            { title: 'คืนร้านค้า' , dataIndex: 'amountRefund' , key: 'amountRefund' },
        ]
    },
    { title: 'สถานะ' , dataIndex: 'status' , key: 'status' },
    { title: 'ทำรายการโดย' , dataIndex: 'user' , key: 'user' },
    { title: 'วันที่ทำรายการ' , dataIndex: 'createdAt' , key: 'createdAt' },
])

const resetForm = async () => {
    freeze.value = null
    isEdit.value = false
    isRefund.value = false
    Object.keys(modals).forEach((k) => {
        modals[k as keyof typeof modals] = false
    });
    Object.assign(formState , defualtFormState)
    Object.assign(formStateRefund , defualtFormState)
    await onLoadTable.value()
}

const onEdit = async (data: FreezeBalance , refund = false) => {
    freeze.value = data
    Object.assign(formState , data)
    if(refund) {
        isRefund.value = true
    }
    else {
        isEdit.value = true
    }
    modals.crud = true
}

const onFinish = async (data: typeof formState) => {
    loading.value = true
    try {
        if(isRefund.value) {
            await api.post(`api/v1/bo/freeze-balance/refund/${freeze.value?.id}` , data)
        }
        else {
            if(isEdit.value) {
                await api.post(`api/v1/bo/freeze-balance/${freeze.value?.id}` , data)
            }
            else {
                await api.post('api/v1/bo/freeze-balance' , data)
            }
        }

        message.success('ทำรายการสำเร็จ')
        await resetForm();
    } catch(e) {}
    loading.value = false
}

const onDelete = async (data: FreezeBalance) => {
    Modal.confirm({
        title: 'ยืนยันการทำรายการ' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:white;' }, 'ต้องการลบข้อมูลนี้ ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true
            try {
                await api.delete(`api/v1/bo/freeze-balance/${data.id}`)
                message.success('ทำรายการสำเร็จ')
                await onLoadTable.value()
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
                <div class="header-content">
                    <div class="header-text">
                        <h1 class="header-title">จัดการอายัดเงินร้านค้า</h1>
                        <p class="text-sm" style="color: #ef4444; margin-top: 8px;">ระบบจะทำรายการอัตโนมัติทุกวันหลังเที่ยงคืน สามารถแก้ไขรายการได้ก่อนช่วงเวลาดังกล่าว</p>
                    </div>
                </div>
            </a-card>
        </a-col>
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="float-right">
                    <a-button 
                        style="margin-bottom: 16px; display: flex;align-items: center;" 
                        @click="modals.crud = true"
                    >
                        <Icon icon="line-md:plus" class="mr-2"></Icon> สร้างรายการ
                    </a-button>
                </div>
                <a-table 
                    :columns="columns" 
                    :data-source="data" 
                    :loading="loading" 
                    bordered 
                    :scroll="{ x: 'max-content' }"
                    :pagination="false"
                >
                    <template #bodyCell="{ column , index , record , text}">
                        <template v-if="column.key === 'id'">
                            {{ index + 1 }}
                        </template>

                        <template v-if="column.key === 'account'">
                            {{ record.account.name }}
                        </template>

                        <template v-if="column.key === 'amount'">
                            {{ formatNumber(text, 2) }}
                        </template>

                        <template v-if="column.key === 'amountAvailable'">
                            {{ formatNumber(text, 2) }}
                        </template>

                        <template v-if="column.key === 'amountRefund'">
                            {{ formatNumber(text, 2) }}
                        </template>

                        <template v-if="column.key === 'status'">
                            <a-tag color="warning" v-if="record.status === 'pending'">รอทำรายการ</a-tag>
                            <a-tag color="red" v-if="record.status === 'holding'">อยู่ระหว่างอายัด</a-tag>
                            <a-tag color="purple" v-if="record.status === 'refunding'">รอทำรายการคืนเงิน</a-tag>
                            <a-tag color="green" v-if="record.status === 'refunded'">คืนเงินสำเร็จ</a-tag>
                        </template>

                        <template v-if="column.key === 'createdAt'">
                            {{ setFormatTime(text) }}
                        </template>
                        <template v-if="column.key === 'user'">
                            {{ record.user.name }}
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-space>
                                <a-button @click="onEdit(record)" :disabled="record.status !== 'pending'">
                                    <div class="flex gap-1 items-center text-xs" >
                                        <Icon icon="ep:edit-pen" width="14" height="14"></Icon> แก้ไข
                                    </div>
                                </a-button>
                                <a-button @click="onEdit(record, true)" :disabled="!['holding' , 'refunding'].includes(record.status)" type="primary" >
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="line-md:plus" width="14" height="14"></Icon> คืนเงินร้านค้า
                                    </div>
                                </a-button>
                                <a-button danger type="primary" @click="onDelete(record)" :disabled="record.status !== 'pending'">
                                    <div class="flex gap-1 items-center text-xs" >
                                        <Icon icon="mdi:trash" width="14" height="14"></Icon> ลบ
                                    </div>
                                </a-button>
                            </a-space>
                        </template>
                    </template>
                </a-table>
            </a-card>
        </a-col>
    </a-row>

    <!-- CRUD  -->
    <a-modal 
        :open="modals.crud" 
        :title="isEdit ? 'แก้ไขข้อมูล' : isRefund ? 'คืนเงินร้านค้า' : 'เพิ่มข้อมูล'" 
        @cancel="resetForm"
        :footer="null"
        width="500px"
    >
        <a-form 
            :required-mark="false"
            layout="vertical" 
            name="basic" 
            autocomplete="off" 
            :model="formState"
            @finish="modals.confirm = true"
        >
            <a-alert
                :message="isRefund ? 'ร้านค้าที่อยู่ในกลุ่มบัญชีดังกล่าวจะได้รับเงินคืน' : 'ร้านค้าที่อยู่ในกลุ่มบัญชีดังกล่าวจะถูกอายัดเงิน'"
                description="กรุณาตรวจสอบกลุ่มบัญชีดังกล่าวก่อนทำรายการ"
                :type="isRefund ? 'success' : 'warning'"
                show-icon
                style="margin-bottom: 16px;"
            />

            <a-form-item 
                label="บัญชี" 
                name="accountId"
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
            >
                <a-select v-model:value="formState.accountId" placeholder="กรุณาเลือกบัญชี" :disabled="isRefund" readonly>
                    <a-select-option 
                        :value="item.id" 
                        v-for="item , index in initStore.accounts" 
                        :key="index"
                    >
                        {{ item.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item 
                label="ยอดเงินอายัด" 
                name="amount"
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
            >
                <a-input-number v-model:value="formState.amount" placeholder="กรุณากรอกยอดเงิน" style="width: 100%;" :disabled="isRefund"/>
            </a-form-item>

            <a-form-item 
                label="ยอดเงินคืนร้านค้า" 
                name="amountRefund"
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                v-if="isRefund"
            >
                <a-input-number :min="1" v-model:value="formState.amountRefund" placeholder="กรุณากรอกยอดเงิน" style="width: 100%;"/>
            </a-form-item>

            <a-form-item label="หมายเหตุ" name="description">
                <a-textarea v-model:value="formState.remark" placeholder="หมายเหตุ" :rows="4" />
            </a-form-item>

            <a-form-item>
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
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- confirm refund modal  -->
    <a-modal 
        :open="modals.confirm" 
        :title="isRefund ? 'ยืนยันการทำรายการคืนเงิน' : 'ยืนยันการทำรายการอายัดเงิน'" 
        :footer="null"
        width="500px"
        @cancel="modals.confirm = false"
        :maskClosable="false"
    >
        <div class="mb-4">
            <a-alert
                :message="isRefund ? 'กรุณาตรวจสอบข้อมูลก่อนยืนยันการทำรายการคืนเงิน' : 'กรุณาตรวจสอบข้อมูลก่อนยืนยันการทำรายการอายัดเงิน'"
                description="การทำรายการนี้จะไม่สามารถยกเลิกได้หลังจากยืนยันแล้ว"
                :type="isRefund ? 'success' :'warning'"
                show-icon
                class="mb-4"
            />
            
            <div class="bg-gray-50 p-4 rounded-lg mt-4" style="background: var(--blacks); padding: 16px; border-radius: 8px; margin-top: 16px;">
                <h4 class="font-semibold mb-2" style="font-weight: 600; margin-bottom: 8px;">ข้อมูลรายการ:</h4>
                <div class="space-y-2 text-sm" v-if="account" >
                    <div><strong>ชื่อบัญชี :</strong> {{ account.name }}</div>
                    <div><strong>เลขบัญชี :</strong> {{ account.bankNumber }}</div>
                    <div><strong>ธนาคาร :</strong> {{ initStore.banks.find(b => b.id === account?.bankId)?.nameTh || '-' }}</div>
                    <div><strong>ยอดเงินอายัด :</strong> {{ formatNumber(formState.amount , 2) }} บาท</div>
                    <div v-if="isRefund"><strong>ยอดเงินที่คืนร้านค้า :</strong> {{ formatNumber(formState.amountRefund , 2) }} บาท</div>
                    <div><strong>หมายเหตุ:</strong> {{ formState.remark || '-' }}</div>
                </div>
            </div>
        </div>

        <a-form-item>
            <a-checkbox v-model:checked="confirm">
                ฉันยืนยันว่าข้อมูลข้างต้นถูกต้องและต้องการทำรายการอายัดเงินนี้
            </a-checkbox>
        </a-form-item>

        <a-form-item>
            <a-space class="float-right">
                <a-button 
                    :loading="loading" 
                    type="primary" 
                    class="mb-[0]"
                    danger
                    @click="modals.confirm = false"
                >
                    ยกเลิก
                </a-button>
                <a-button 
                    :disabled="!confirm"
                    :loading="loading"
                    html-type="submit" 
                    type="primary" 
                    class="mb-[0]"
                     @click="onFinish(formState)"
                >
                    ยืนยัน
                </a-button>
            </a-space>
        </a-form-item>
    </a-modal>
</template>

<style scoped>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}
</style>
