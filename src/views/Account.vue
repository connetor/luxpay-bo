
<script setup lang="ts">
import { createVNode, onMounted, reactive , ref } from "vue";
import api from "@/configs/api";
import type { Account, AccountUser } from "@/interface/Modal";
import { message, Modal } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { accountConfig } from "@/configs/account";
import { capitalize } from '@/utils'
import { useInitStore } from "@/stores/init";
import { useAuthStore } from "@/stores/auth";
import { formatNumber } from "@/utils";
import { useEvent } from "@/composables/useEvent";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";

const loading = ref(false)
const modals = reactive({
    crud: false ,
    key: false ,
    connect: false,
    users: false,
    userCrud: false
})
const isEdit = ref(false)
const isEditAccountUser = ref(false)

const initStore = useInitStore()
const { user } = useAuthStore()
const { onCopyText } = useEvent()

const account = ref<Account | null>(null)
const accounts = ref<Account[]>([])
const accountUsers = ref<AccountUser[]>([])
const accountUser = ref<AccountUser | null>(null)

const step = ref(0)
const url = ref('')
const permissions = user?.permissions ?? []
const defualtFormState = {
    name: '' ,
    bankNumber: '' ,
    bankId: null ,
    promptpay: '' ,
    service: 'scraping' ,
    limitPayin: 0 ,
    limitPayout: 0 ,
    status: false ,
    remark: '' ,
    maxTransfer: 0 ,
    minTransfer: 0 ,
    type: 'deposit' ,
    groupId: null ,
    tags: [] ,
    amountLock: 0
}

const defualtFormStateGoogleCode = {
    code: ''
}

const defaultAccountUserFormState = {
    name: '',
    businessId: '',
    businessUsername: '',
    businessPassword: '',
    googleCredentials: '',
    action: ''
}

const formState = reactive({ ...defualtFormState })
const formStateGoogleCode = reactive({ ...defualtFormStateGoogleCode })
const accountUserFormState = reactive({ ...defaultAccountUserFormState })

onMounted(async () => {
    await loadData()
    await initStore.reloadInit()
})

const loadData = async () => {
    loading.value = true
    try {
        const resAccount = await api.get('api/v1/bo/account' ).then(res => res.data)
        accounts.value = resAccount.data
    } catch(e) {}
    loading.value = false
}

const columns = reactive([
    ...(permissions?.includes('account.update') ? [
        { title: 'จัดการ', key: 'more' },
    ] : []),
    { title: 'ช่องทาง' , dataIndex: 'service' , key: 'service' },
    { title: 'ธนาคาร' , dataIndex: 'img' , key: 'img' },
    { title: 'สถานะ' , dataIndex: 'status' , key: 'status' },
    { title: 'กลุ่มบัญชี' , dataIndex: 'group' , key: 'group' },
    { title: 'ประเภท' , dataIndex: 'type' , key: 'type' },
    { title: 'ชื่อบัญชี' , dataIndex: 'name' , key: 'name' },
    { title: 'เลขบัญชี' , dataIndex: 'bankNumber' , key: 'bankNumber' },
    { title: 'ยอดสูงสุดต่อวัน' , children: [
        { title: 'ฝากเงิน' , dataIndex: 'limitPayin' , key: 'limitPayin' },
        { title: 'ถอนเงิน' , dataIndex: 'limitPayout' , key: 'limitPayout' },
    ]},
    { title: 'ยอดคงเหลือ' , dataIndex: 'balance' , key: 'balance' },
    { title: 'ยอดเงินล็อค.' , dataIndex: 'amountLock' , key: 'amountLock' },
])

const userColumns = reactive([
    { title: 'จัดการ', key: 'more' },
    { title: 'ชื่อ', dataIndex: 'name', key: 'name' },
    { title: 'ตำแหน่ง', dataIndex: 'action', key: 'action' }
])

const resetForm = async () => {
    account.value = null
    isEdit.value = false
    step.value = 0
    Object.keys(modals).forEach((k) => {
        modals[k as keyof typeof modals] = false
    });
    Object.assign(formState , defualtFormState)
}

const resetAccountUserForm = async () => {
    if(account.value) {
        await onLoadAccountUser(account.value.id)
        accountUser.value = null
        isEditAccountUser.value = false
        modals.userCrud = false
        modals.connect = false
        Object.assign(accountUserFormState, defaultAccountUserFormState)
        Object.assign(formStateGoogleCode, defualtFormStateGoogleCode)
    }
}

const onEdit = async (data: Account) => {
    loading.value = true
    try {
        const res = await api.get(`api/v1/bo/account/${data.id}`).then(res => res.data)
        account.value = res.data
        Object.assign(formState , res.data)
        isEdit.value = true
        modals.crud = true
    } catch(e) {}
    loading.value = false
}

const onConnect = async () => {
    loading.value = true
    try {
        const res = await api.get(`api/v1/bo/account/url-gamil/${account.value?.id}`).then(res => res.data)
        url.value = res.data.url
        modals.connect = true
    } catch(e) {
        message.error('เกิดข้อผิดพลาด')
    }
    loading.value = false
}

const onFinish = async (data: typeof formState) => {
    loading.value = true
    try {
        if(isEdit.value) {
            await api.post(`api/v1/bo/account/${account.value?.id}` , data , {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        }
        else {
            await api.post('api/v1/bo/account' , data , {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        }
        await loadData()
        message.success('ทำรายการสำเร็จ')
        resetForm();
    } catch(e) {}
    loading.value = false
}

const onConfirmGoogleCode = async(data: typeof formStateGoogleCode) => {
    loading.value = true
    try {
        await api.post(`api/v1/bo/account/confirm-gamil/${account.value?.id}` , data).then(res => res.data)
        
        message.success('ทำรายการสำเร็จ')

        await resetAccountUserForm()
    } catch(e) {
        message.error('เกิดข้อผิดพลาด')
    }
    loading.value = false
}

const updateSelect = async (type: 'group' | 'type' , id: number , value: string | number) => {   
    try {
        await api.post(`api/v1/bo/account/change/${id}` , { change: type , value })
        message.success('ทำรายการสำเร็จ')
    } catch(e) {}
}

const updateStatus = async (id: number , status: boolean) => {   
    try {
        await api.post(`api/v1/bo/account/status/${id}` , { status })
        message.success('ทำรายการสำเร็จ')
    } catch(e) {}
}

const onLoadAccountUser = async (id: number) => {
    loading.value = true
    try {
        const res = await api.get(`api/v1/bo/account/user/list/${id}`).then(res => res.data)
        accountUsers.value = res.data
    } catch {}
    loading.value = false
}

const openListUser = async (data: Account) => {
    await onLoadAccountUser(data.id)
    account.value = data
    modals.users = true
}

const onEditAccountUser = (record: AccountUser) => {
    accountUser.value = record
    isEditAccountUser.value = true
    Object.assign(accountUserFormState, record)
    modals.userCrud = true
}

const onDeleteAccountUser = async (record: AccountUser) => {
    Modal.confirm({
        title: 'ยืนยันการทำรายการ' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, 'ต้องการลบข้อมูลนี้ ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true 
            try {
                await api.delete(`api/v1/bo/account/user/${record.id}`).then(res => res.data)
                message.success('ทำรายการสำเร็จ')
                resetAccountUserForm()
            } catch {}
            loading.value = false
        }
    })
}

const onFinishAccountUser = async (data: typeof accountUserFormState) => {
    loading.value = true
    try {
        if (isEditAccountUser.value) {
            await api.post(`api/v1/bo/account/user/update/${accountUser.value?.id}` , data).then(res => res.data)
        } else {
            await api.post(`api/v1/bo/account/user/${account.value?.id}` , data).then(res => res.data)
        }
        message.success('ทำรายการสำเร็จ')
        resetAccountUserForm()
    } catch {}
    loading.value = false
}

</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">บัญชีธนาคาร</h1>
                    </div>
                </div>

                <div class="float-right">
                    <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="modals.crud = true" v-if="permissions.includes('account.create')">
                        <Icon icon="line-md:plus" class="mr-2"></Icon> สร้างรายการ
                    </a-button>
                </div>
                <a-table 
                    :columns="columns" 
                    :data-source="accounts" 
                    :loading="loading" 
                    bordered 
                    :scroll="{ x: 'max-content' }"
                    :pagination="false"
                >
                    <template #bodyCell="{ column , text , record }">
                        <template v-if="column.key === 'service'">
                            <a-tag color="green" class="uppercase">{{ text }}</a-tag>
                        </template>
                        <template v-if="column.key === 'type'">
                            <a-select
                                :value="record.type"
                                @change="(value: string) => { updateSelect('type' , record.id, value); record.type = value}"
                                :disabled="!permissions.includes('account.update')"
                            >
                                <a-select-option value="deposit">ฝากเงิน</a-select-option>
                                <a-select-option value="withdraw">ถอนเงิน</a-select-option>
                            </a-select>
                        </template>
                        <template v-if="column.key === 'group'">
                            <a-select
                                :value="record.groupId"
                                @change="(value: number) => { updateSelect('group' , record.id, value); record.groupId = value }"
                                :disabled="!permissions.includes('account.update')"
                            >
                                <a-select-option :value="item.id" v-for="(item, index) in initStore.groups" :key="index">
                                    {{ item.name }}
                                </a-select-option>
                            </a-select>
                        </template>
                        <template v-if="['limitPayin','limitPayout','balance','amountLock'].includes(column.key)">
                            {{ formatNumber(text, 2) }}
                        </template>
                        <template v-if="column.key === 'img'">
                            <img :src="record.bank.img" :alt="record.bank.nameTh" class="h-[30px] block mx-auto" width="30px"/>
                        </template>
                        <template v-if="column.key === 'status'">
                            <a-switch v-model:checked="record.status" @change="(value: boolean) => updateStatus(record.id, value)" :disabled="!permissions.includes('account.update')"/>
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-space>
                                <a-button @click="openListUser(record)">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="mdi:connection" width="14" height="14"></Icon> เชื่อมต่อระบบ
                                    </div>
                                </a-button>
                                <a-button class="px-0" @click="onEdit(record)">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="ep:edit-pen" width="14" height="14"></Icon> แก้ไข
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
        :title="isEdit ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูล'" 
        @cancel="resetForm"
        :footer="null"
    >
        <a-form 
            layout="vertical" 
            name="basic" 
            autocomplete="off" 
            :model="formState"
            :required-mark="false"
            @finish="onFinish"
        >   
            <!-- <a-steps :current="step"  size="small" :items="steps"></a-steps> -->

            <div :class="{ 'hidden' : step !== 0 }" class="mt-[24px]">
                <a-form-item 
                    label="ประเภทบัญชี" 
                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                    name="type"
                >
                    <a-select v-model:value="formState.type" placeholder="กรุณาเลือกประเภทบัญชี">
                        <a-select-option value="deposit">ฝากเงิน</a-select-option>
                        <a-select-option value="withdraw">ถอนเงิน</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item 
                    label="กลุ่มบัญชี" 
                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                    name="groupId"
                >
                    <a-select v-model:value="formState.groupId" placeholder="กรุณาเลือกกลุ่มบัญชี">
                        <a-select-option :value="item.id" v-for="item , index in initStore.groups" :key="index">
                            {{ item.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item 
                    label="การเชื่อมต่อ" 
                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                    name="service"
                >
                    <a-select v-model:value="formState.service" placeholder="กรุณาเลือกการเชื่อมต่อ">
                        <a-select-option :value="item" v-for="item , index in accountConfig.service" :key="index">
                            {{ capitalize(item) }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item 
                    label="ธนาคาร" 
                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                    name="bankId"
                >
                    <a-select v-model:value="formState.bankId" placeholder="กรุณาเลือกธนาคาร">
                        <a-select-option :value="item.id" v-for="item , index in accountConfig.filterBank(initStore.banks)" :key="index">
                            <div class="flex gap-2 items-center">
                                <img :src="item.img" style="height: 18px;"> {{ item.nameTh }}
                            </div>
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item 
                    label="ชื่อบัญชี" 
                    :rules="[
                        { required: true, message: 'กรุณากรอกข้อมูล' } ,
                    ]"
                    name="name"
                >
                    <a-input v-model:value="formState.name" placeholder="กรุณากรออกชื่อบัญชี" />
                </a-form-item>

                <a-form-item 
                    label="เลขบัญชี" 
                    :rules="[
                        { required: true, message: 'กรุณากรอกข้อมูล' } ,
                        { pattern: /^[0-9]/, message: 'กรุณากรอกตัวเลข' }
                    ]"
                    name="bankNumber"
                >
                    <a-input v-model:value="formState.bankNumber" placeholder="กรุณากรอกเลขบัญชี" />
                </a-form-item>
                
                <a-form-item 
                    label="PromptPay" 
                    :rules="[
                        { required: true, message: 'กรุณากรอกข้อมูล' } ,
                        { pattern: /^[0-9]/, message: 'กรุณากรอกตัวเลข' }
                    ]"
                    name="promptpay"
                >
                    <a-input v-model:value="formState.promptpay" placeholder="กรุณากรอกพร้อมเพย์">
                        <template #addonBefore>
                            <Icon icon="ic:baseline-qrcode" ></Icon>
                        </template>
                    </a-input>
                </a-form-item>

                <a-row :gutter="24">
                    <a-col :span="12">
                        <a-form-item 
                            label="ฝากสูงสุดต่อวัน" 
                            :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                            name="limitPayin"
                        >
                            <a-input-number :min="0" style="width: 100%;" v-model:value="formState.limitPayin" placeholder="กรุณากรอกฝากสูงสุดต่อวัน">
                                <template #addonBefore>
                                    <Icon icon="ph:hand-deposit-thin" ></Icon>
                                </template>
                            </a-input-number>
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item 
                            label="ถอนสูงสุดต่อวัน" 
                            :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                            name="limitPayout"
                        >
                            <a-input-number :min="0" style="width: 100%;" v-model:value="formState.limitPayout" placeholder="กรุณากรอกถอนสูงสุดต่อวัน">
                                <template #addonBefore>
                                    <Icon icon="ph:hand-withdraw-thin" ></Icon>
                                </template>
                            </a-input-number>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="24">
                    <a-col :span="12">
                        <a-form-item 
                            label="ถอนสูงสุดต่อครั้ง" 
                            :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                            name="maxTransfer"
                        >
                            <a-input-number :min="0" style="width: 100%;" v-model:value="formState.maxTransfer" placeholder="กรุณากรอกถอนสูงสุดต่อครั้ง">
                                <template #addonBefore>
                                    <Icon icon="iconoir:coin" ></Icon>
                                </template>
                            </a-input-number>
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item 
                            label="ถอนขั้นต่ำต่อครั้ง" 
                            :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                            name="minTransfer"
                        >
                            <a-input-number :min="0" style="width: 100%;" v-model:value="formState.minTransfer" placeholder="กรุณากรอกถอนต่ำต่อครั้ง">
                                <template #addonBefore>
                                    <Icon icon="iconoir:coin" ></Icon>
                                </template>
                            </a-input-number>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-form-item 
                    label="ยอดเงินล็อค" 
                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                    name="amountLock"
                >
                    <a-input-number 
                        :min="0" 
                        :precision="0"
                        style="width: 100%;" 
                        v-model:value="formState.amountLock" 
                        placeholder="กรุณากรอกยอดเงินล็อค"
                        @keypress="(e: KeyboardEvent) => {
                            if (!/[0-9]/.test(e.key)) {
                                e.preventDefault();
                            }
                        }"
                    >
                        <template #addonBefore>
                            <Icon icon="material-symbols:lock" ></Icon>
                        </template>
                    </a-input-number>
                </a-form-item>

                <a-form-item label="สถานะ" name="status">
                    <a-switch v-model:checked="formState.status" /> 
                    <span style="margin-left: 5px;" class="text-xs">{{ formState.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span>
                </a-form-item>

                <a-form-item label="หมายเหตุ" name="remark">
                    <a-textarea v-model:value="formState.remark" placeholder="หมายเหตุ" :rows="4" />
                </a-form-item>

                <a-form-item :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }">
                    <div style="display: flex; justify-content: flex-end; width: 100%;">
                        <a-button 
                            :loading="loading"
                            html-type="submit" 
                            type="primary" 
                            class="mb-[0]"
                        >
                            ยืนยัน
                        </a-button>
                    </div>
                </a-form-item>
            </div>
        </a-form>
    </a-modal>

    <!-- CONNECT  -->
    <a-modal 
        :open="modals.connect" 
        :title="`เชื่อมต่อ ${account?.name}`" 
        @cancel="modals.connect = false"
        :footer="null"
    >
        <a-form 
            layout="vertical" 
            name="basic" 
            autocomplete="off" 
            :required-mark="false"
            :model="formStateGoogleCode"
            @finish="onConfirmGoogleCode"
        >  
            <a-form-item
                label="ลิ้งยืนยันบัญชี Google Console Api"
            >
                <a-input-group compact>
                    <a-input :value="url" readonly>
                        <template #suffix>
                            <a-button @click="onCopyText(url)" size="small">
                                <Icon icon="solar:clipboard-broken" width="18" height="18"></Icon>
                            </a-button>
                        </template>
                    </a-input>
                </a-input-group>
                <span class="block text-gray-500 text-xs mt-[4px]">เปิดลิ้งด้วยบัญชี Gmail ที่ตั้งค่าไว้ในบัญชีธุรกิจ</span>
            </a-form-item>
            <a-form-item 
                label="รหัสยืนยัน google code" 
                :rules="[
                    { required: true, message: 'กรุณากรอกข้อมูล' } ,
                ]"
                name="code"
            >
                <a-input v-model:value="formStateGoogleCode.code" placeholder="กรุณากรออกชื่อบัญชี" />
            </a-form-item>

            <a-button 
                :loading="loading"
                html-type="submit" 
                type="primary" 
                class="mb-[0]"
            >
                ยืนยัน
            </a-button>
        </a-form>
    </a-modal>

    <!-- CONNECT DATA MODAL -->
    <a-modal 
        :open="modals.users" 
        title="จัดการข้อมูลการเชื่อมต่อ" 
        @cancel="modals.users = false"
        :footer="null"
        width="1000px"
    >
        <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
            <a-space>
                <a-button @click="onConnect" style="display: flex; align-items: center;" v-if="accountUsers.length > 0">
                    <Icon icon="line-md:plus" class="mr-2"></Icon> เชื่อมต่อบัญชี
                </a-button>
                <a-button @click="modals.userCrud = true" style="display: flex; align-items: center;">
                    <Icon icon="line-md:plus" class="mr-2"></Icon> เพิ่มข้อมูล
                </a-button>
            </a-space>
        </div>
        <a-table 
            :columns="userColumns" 
            :data-source="accountUsers" 
            bordered 
            :pagination="false"
            :scroll="{ x: 'max-content' }"
        >
            <template #bodyCell="{ column , text , record }">
                <template v-if="column.key === 'action'">
                    <a-tag>
                        {{ text === 'leader' ? 'สร้างรายการ' : text === 'maker' ? 'อนุมัติรายการ' : 'ผู้จัดการ' }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'more'">
                    <a-space>
                        <a-button class="px-0" @click="onEditAccountUser(record)">
                            <div class="flex gap-1 items-center text-xs">
                                <Icon icon="ep:edit-pen" width="14" height="14"></Icon> แก้ไข
                            </div>
                        </a-button>
                        <a-popconfirm
                            title="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
                            ok-text="ใช่"
                            cancel-text="ไม่"
                            @confirm="onDeleteAccountUser(record)"
                        >
                            <a-button class="px-0">
                                <div class="flex gap-1 items-center text-xs">
                                    <Icon icon="ep:delete" width="14" height="14"></Icon> ลบ
                                </div>
                            </a-button>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>
        </a-table>
    </a-modal>

    <!-- CONNECT DATA FORM MODAL -->
    <a-modal 
        :open="modals.userCrud" 
        :title="isEditAccountUser ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูล'" 
        @cancel="resetAccountUserForm(); modals.userCrud = false"
        :footer="null"
        width="500px"
    >
        <a-form 
            layout="vertical" 
            name="connectDataForm" 
            autocomplete="off" 
            :model="accountUserFormState"
            :required-mark="false"
            @finish="onFinishAccountUser"
        >
            <a-form-item 
                label="ชื่อ" 
                name="name"
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
            >
                <a-input v-model:value="accountUserFormState.name" placeholder="กรุณากรอกข้อมูล" />
            </a-form-item>
            
            <a-form-item 
                label="รหัส (บัญชีธุรกิจ)" 
                name="businessId"
            >
                <a-input v-model:value="accountUserFormState.businessId" placeholder="กรุณากรอกข้อมูล" />
            </a-form-item>

            <a-form-item 
                label="ยูสเซอร์เนม (บัญชีธุรกิจ)" 
                name="businessUsername"
            >
                <a-input v-model:value="accountUserFormState.businessUsername" placeholder="กรุณากรอกข้อมูล" />
            </a-form-item>

            <a-form-item 
                label="รหัสผ่าน (บัญชีธุรกิจ)" 
                name="businessPassword"
            >
                <a-input-password v-model:value="accountUserFormState.businessPassword" placeholder="กรุณากรอกข้อมูล" />
            </a-form-item>

            <a-form-item 
                label="ระดับการอนุมัติ" 
                name="action"
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
            >
                <a-select v-model:value="accountUserFormState.action" placeholder="กรุณาเลือกระดับการอนุมัติ">
                    <a-select-option value="leader">ผู้จัดการ</a-select-option>
                    <a-select-option value="maker">อนุมัติรายการ</a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item label="Google Credentials" name="googleCredentials">
                <a-textarea v-model:value="accountUserFormState.googleCredentials" placeholder="googleCredentials" :rows="4" />
            </a-form-item>

            <div style="display: flex; justify-content: flex-end; width: 100%; gap: 8px;">
                <a-button @click="resetAccountUserForm(); modals.userCrud = false">
                    ยกเลิก
                </a-button>
                <a-button 
                    html-type="submit" 
                    type="primary"
                >
                    {{ isEditAccountUser ? 'แก้ไข' : 'เพิ่ม' }}
                </a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<style>
.header-title{
    color: var(--accent) !important;
}
.header-text{
    color: var(--accent-dark) !important;
}
</style>