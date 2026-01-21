
<script setup lang="ts">
import { computed, createVNode, onMounted, onUnmounted, reactive, ref } from "vue";
import api from "@/configs/api";
import type { Customer, Transaction } from "@/interface/Modal";
import { Icon } from "@iconify/vue";
import { setFormatTime , formatThaiBankAccount } from "@/utils";
import dayjs from "dayjs";
import QrPayin from "@/components/modals/QrPayin.vue";
import type { SearchTableParams } from "@/interface/Request";
import { useTable } from "@/composables/useTable";
import { usePermission } from "@/composables/usePermission";
import { message, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { useInitStore } from "@/stores/init";

interface SearchParams {
    name: string | null
    bankNumber: string | null
    tags: string | null
}

const { isInvildPermission } = usePermission()

const initStore = useInitStore()

const { pagination , sort , onLoadTable , data , handleTableChange , startInterval , stopInterval , loading } = useTable<Customer>()

const modals = reactive({
    qrPayin: false ,
    crud: false ,
    transaction: false
})
const customer = ref<Customer | null>(null)
const transaction = ref<Transaction>()

const isEdit = ref(false)
const isTopup = ref(false)

const defualtFormStateSearch = {
    name: null ,
    tags: null ,
    bankNumber: null ,
    bankId: null ,
    date: [null , null]
}

const defualtFormStateTransaction =  {
    amount: null ,
    bankNumber: null ,
    bankCode: null as string | null,
    name: null ,
    remark: null ,
}

const defualtFormState = {
    amount: null ,
    bankNumber: null ,
    bankId: null ,
    name: null ,
    remark: null ,
    tags: [] as string[]
}

const formStateSearch = reactive({ ...defualtFormStateSearch })
const formState = reactive({ ...defualtFormState })
const formStateTransaction = reactive({ ...defualtFormStateTransaction })

const openTransaction = async (type: 'topup' | 'withdraw' , data: Customer) => {
    customer.value = data
    Object.assign(formStateTransaction , data)
    const isExitBank = initStore.banks.find(b => b.id === data.bankId)
    if (isExitBank) {
        formStateTransaction.bankCode = isExitBank.code
    }
    isTopup.value = type === 'topup'
    modals.transaction = true
}

const onFinishTransaction = async (data: typeof formStateTransaction) => {
    loading.value = true
    try {
        if (isTopup.value) {
            const res = await api.post('api/v1/bo/transaction/topup' , data).then(res => res.data)
            transaction.value = res.data
            modals.qrPayin = true
        } else {
            await api.post('api/v1/bo/transaction/transferout' , data)
            message.success('ทำรายการสำเร็จ')
            await resetForm()
        }
    } catch(e) {}
    loading.value = false
}

const onEdit = (data: Customer) => {
    customer.value = data
    Object.assign(formState , data)
    isEdit.value = true
    modals.crud = true
}

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
        // console.log(formStateSearch);
        
        const params: SearchTableParams & SearchParams = {
            startDate: formStateSearch.date[0] ? dayjs(formStateSearch.date[0]).format('YYYY-MM-DD') : '',
            endDate: formStateSearch.date[1] ? dayjs(formStateSearch.date[1]).format('YYYY-MM-DD') : '',
            page: pagination.current ,
            pageSize: pagination.pageSize ,
            sortBy: sort.sortBy ,
            sortOrder: sort.sortOrder ,
            name: formStateSearch.name ,
            bankNumber: formStateSearch.bankNumber ,
            tags: formStateSearch.tags
        }

        const res = await api.get('api/v1/bo/customer' , { params }).then(res => res.data)
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
        { title: 'กลุ่มลูกค้า' , dataIndex: 'tags' , key: 'tags' },
        { title: 'ธนาคาร' , dataIndex: 'bank' , key: 'bank' },
        { title: 'เลขบัญชี' , dataIndex: 'bankNumber' , key: 'bankNumber' },
        { title: 'ชื่อบัญชี' , dataIndex: 'name' , key: 'name' },
        { title: 'หมายเหตุ' , dataIndex: 'remark' , key: 'remark' },
        { title: 'วันที่ทำรายการ', sorter: true , dataIndex: 'createdAt' , key: 'createdAt' },
    ]
})

const resetForm = async () => {
    Object.keys(modals).forEach((k) => {
        modals[k as keyof typeof modals] = false
    });
    Object.assign(formStateSearch , defualtFormStateSearch)
    Object.assign(formState , defualtFormState)
    Object.assign(formStateTransaction , defualtFormStateTransaction)
    customer.value = null
    isEdit.value = false
    await onLoadTable.value()
}

const onFinish = async (data: typeof formState) => {
    loading.value = true;
    try {
        if (isEdit.value) {
            await api.post(`api/v1/bo/customer/${customer.value?.id}` , data)
        } else {
            await api.post('api/v1/bo/customer' , data)
        }
        await resetForm()
        message.success('ทำรายการสำเร็จ')
    } catch(e) {}
    loading.value = false
}

const onDelete = async (record: Customer) => {
    customer.value = record
    Modal.confirm({
        title: 'ยืนยันการทำรายการ' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:white;' }, 'ต้องการลบข้อมูลลูกค้า ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true
            try {
                await api.delete(`api/v1/bo/customer/${customer.value?.id}`)
                message.success('ทำรายการสำเร็จ')
                await resetForm()
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
                        <h1 class="header-title">ข้อมูลลูกค้า</h1>
                    </div>
                </div>
                <p style="margin-bottom: 16px;">ค้นหา</p>
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
                            <a-form-item label="ชื่อ" name="name">
                                <a-input v-model:value="formStateSearch.name" placeholder="กรุณากรอกข้อมูล" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="เลขบัญชี" name="bankNumber">
                                <a-input v-model:value="formStateSearch.bankNumber" placeholder="กรุณากรอกข้อมูล" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="กลุ่มลูกค้า" name="tags">
                                <a-input v-model:value="formStateSearch.tags" placeholder="กรุณากรอกข้อมูล" style="width: 100%;"/>
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
                            @click="modals.crud = true"
                        >
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
                        <template v-if="column.key === 'bank'">
                            {{ record.bank.nameTh }}
                        </template>
                        <template v-if="column.key === 'tags'">
                            <a-tag v-for="tag , index in record.tags" :key="index">{{ tag }}</a-tag>
                        </template>
                        <template v-if="column.key === 'bankNumber'">
                            {{ formatThaiBankAccount(record.bankNumber) }}
                        </template>
                        <template v-if="column.key === 'createdAt'">
                            {{ setFormatTime(text) }}
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-space>
                                <a-button class="px-0" @click="onEdit(record)">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="ep:edit-pen" width="14" height="14"></Icon> แก้ไข
                                    </div>
                                </a-button>
                                <a-button class="px-0" @click="onDelete(record)">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="mdi:trash" width="14" height="14"></Icon> ลบ
                                    </div>
                                </a-button>
                                <a-button 
                                    v-if="isInvildPermission('topup.create')"
                                    type="primary" 
                                    class="btn-variant-solid-success" 
                                    @click="openTransaction('topup' , record)"
                                >
                                    <div class="flex gap-1 items-center text-xs">
                                        ฝาก
                                    </div>
                                </a-button>
                                <a-button 
                                    v-if="isInvildPermission('transferout.create')"
                                    type="primary" 
                                    class="px-0" 
                                    danger 
                                    @click="openTransaction('withdraw' , record)"
                                >
                                    <div class="flex gap-1 items-center text-xs">
                                       ถอน
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
        title="จัดการลูกค้า" 
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
                        name="bankId"
                    >
                        <a-select v-model:value="formState.bankId" placeholder="กรุณาเลือกธนาคาร">
                            <a-select-option :value="item.id" v-for="item , index in initStore.banks" :key="index">
                                <div class="flex gap-2 items-center">
                                    <img :src="item.img" style="height: 18px;"> {{ item.nameTh }}
                                </div>
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <!-- <div class="border-t-1 my-[24px] border-gray-200"></div> -->

                    <a-button 
                        type="dashed" 
                        class="w-full" 
                        style="margin-bottom: 16px;" 
                        @click="formState.tags.push('')"
                    >
                        <div class="flex gap-[2px] items-center justify-center">
                            <Icon icon="line-md:plus" class="mr-2"></Icon> เพิ่มกลุ่มลูกค้า
                        </div>
                    </a-button>

                    <a-form-item 
                        v-for="(tag, index) in formState.tags" 
                        :key="index"
                        :name="['tags' , index]"
                    >
                        <a-row :gutter="16">
                            <a-col :span="20">
                                <a-input 
                                    v-model:value="formState.tags[index]" 
                                    placeholder="ชื่อกลุ่มลูกค้า" 
                                />
                            </a-col>
                            <a-col :span="4">
                                <a-button 
                                    danger 
                                    type="primary" 
                                    class="w-full" 
                                    @click="formState.tags.splice(index, 1)"
                                >
                                    ลบ
                                </a-button>
                            </a-col>
                        </a-row>
                    </a-form-item>

                    <div class="border-t-1 my-[24px] border-gray-200"></div>

                    <a-form-item label="หมายเหตุ" name="remark">
                        <a-textarea v-model:value="formState.remark" placeholder="หมายเหตุ" :rows="4" />
                    </a-form-item>

                    <div class="border-t-1 my-[24px] border-gray-200"></div>

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
            </a-col>
        </a-row>
    </a-modal>

    <!-- transaction -->
    <a-modal 
        :open="modals.transaction" 
        :title="isTopup ? 'สร้างรายการฝากเงิน' : 'สร้างรายการถอนเงิน'" 
        @cancel="resetForm"
        :footer="null"
    >
        <a-row>
            <a-col :span="24">
                <a-form 
                    layout="vertical" 
                    name="basic" 
                    autocomplete="off" 
                    :required-mark="false"
                    :model="formStateTransaction"
                    @finish="onFinishTransaction"
                >
                    <a-form-item 
                        label="ชื่อบัญชี" 
                        :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                        name="name"
                    >
                        <a-input disabled v-model:value="formStateTransaction.name" placeholder="กรุณากรอกชื่อบัญชี" />
                    </a-form-item>
                    <a-form-item 
                        label="เลขบัญชี" 
                        :rules="[
                            { required: true, message: 'กรุณากรอกข้อมูล' } ,
                            { pattern: /^[0-9]+$/, message: 'กรุณากรอกตัวเลขเท่านั้น ห้ามมี -' }
                        ]"
                        name="bankNumber"
                    >
                        <a-input disabled v-model:value="formStateTransaction.bankNumber" placeholder="กรุณากรอกเลขบัญชี" />
                    </a-form-item>

                    <a-form-item 
                        label="ธนาคาร" 
                        :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                        name="bankCode"
                    >
                        <a-select disabled v-model:value="formStateTransaction.bankCode" placeholder="กรุณาเลือกธนาคาร">
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
                        <a-input-number style="width: 100%;" :min="0" v-model:value="formStateTransaction.amount" placeholder="กรุณากรอกยอดเงิน">
                            <template #addonAfter>
                                <Icon icon="iconoir:coin" ></Icon>
                            </template>
                        </a-input-number>
                    </a-form-item>

                    <a-form-item label="หมายเหตุ" name="remark">
                        <a-textarea v-model:value="formStateTransaction.remark" placeholder="หมายเหตุ" :rows="4" />
                    </a-form-item>

                    <div class="border-t-1 my-[24px] border-gray-200"></div>

                    <p class="text-center text-red-400" v-if="isTopup">โปรดใช้บัญชีที่ได้แจ้งไว้เท่านั้นในการสแกนชำระ หากไม่ตรงตามข้อมูลที่ระบุ เงินจะไม่เข้าระบบ</p>
                    
                    <a-form-item>
                        <template v-if="isTopup">
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
                        </template>
                        <template v-else>
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
                        </template>
                    </a-form-item>
                </a-form>
            </a-col>
        </a-row>
    </a-modal>

    <template v-if="transaction">
        <QrPayin 
            v-model:show="modals.qrPayin"
            :transaction="transaction"
        ></QrPayin>
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