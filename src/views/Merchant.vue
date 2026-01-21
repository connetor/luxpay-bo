
<script setup lang="ts">
import { createVNode, onMounted, reactive, ref } from "vue";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import api from "@/configs/api";
import type { Bank, GroupAccount, Merchant, User } from "@/interface/Modal";
import { message, Modal } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { setFormatTime } from "@/utils";
import dayjs from "dayjs";
import type { SearchTableParams } from "@/interface/Request";
import { useEvent } from "@/composables/useEvent";
import TwoFactor from '@/components/modals/Twofactor.vue'
import { useTable } from "@/composables/useTable";
import { useInitStore } from "@/stores/init";
import { useAuthStore } from "@/stores/auth";
import { formatNumber } from '@/utils'

interface SearchParams {
    isSuspend: string 
    isApprove: string
    status: string
}

const initStore = useInitStore()
const { user } = useAuthStore()
const permissions = user?.permissions ?? []

const { onCopyText } = useEvent()

const { pagination , sort , onLoadTable , data , handleTableChange , loading } = useTable<Merchant>()

const modals = reactive({
    resetpass: false ,
    reset2fa: false ,
    detail: false ,
    settlement: false ,
    telegram: false
})
const isEdit = ref(false)
const userMerchant = ref<User | null>(null)
const merchant = ref<Merchant>()
const groups = ref<GroupAccount[]>([])
const qrCode = ref<string>('')

const defualtFormStatePass = {
    password: ''
}

const defualtFormStateSearch = {
    searchBy: null ,
    criteria: '' ,
    isApprove: '' ,
    isSuspend: '' ,
    status: '' ,
    date: [ null , null ]
}

const defualtFormStateSettlement = {
    isSettleAuto: false ,
    settleBalance: 0 ,
    bankName: null ,
    bankNumber: null ,
    bankId: null
}

const defualtFormStateTelegram = {
    telegramRoomId: null ,
}

const formStatePass = reactive({ ...defualtFormStatePass })
const formStateSearch = reactive({ ...defualtFormStateSearch })
const formStateSettlement = reactive({ ...defualtFormStateSettlement })
const formStateTelegram = reactive({ ...defualtFormStateTelegram })

onMounted(async () => {
    await onLoadGroup()
    await onLoadTable.value()
    await initStore.init()
})

onLoadTable.value = async () => {
    loading.value = true
    try {
        const params: SearchTableParams & SearchParams = {
            searchBy: formStateSearch.searchBy,
            criteria: formStateSearch.criteria ,
            startDate: formStateSearch.date[0] ? dayjs(formStateSearch.date[0]).format('YYYY-MM-DD') : '',
            endDate: formStateSearch.date[1] ? dayjs(formStateSearch.date[1]).format('YYYY-MM-DD') : '',
            page: pagination.current ,
            pageSize: pagination.pageSize ,
            sortBy: sort.sortBy ,
            sortOrder: sort.sortOrder ,
            isApprove: formStateSearch.isApprove ,
            isSuspend: formStateSearch.isSuspend ,
            status:  formStateSearch.status
        }

        const res = await api.get('api/v1/bo/merchant/list/all' , { params }).then(res => res.data)
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

const columns = reactive([
    ...(permissions?.includes('merchant.update') ? [
        { title: 'จัดการ', key: 'more' },
    ] : []),
    { title: 'รหัสร้านค้า' , sorter: true , dataIndex: 'prefix' , key: 'prefix' },
    { title: 'กลุ่มบัญชี' , dataIndex: 'group' , key: 'group' },
    { title: 'ยอดเงินคงเหลือ' , sorter: true , dataIndex: 'balance' , key: 'balance' },
    { title: 'ยอดฝากทั้งหมด' , sorter: true , dataIndex: 'totalPayin' , key: 'totalPayin' },
    { title: 'ยอดถอนทั้งหมด' , sorter: true , dataIndex: 'totalPayout' , key: 'totalPayout' },
    { title: 'สถานะ' , dataIndex: 'status' , key: 'status' },
    { title: 'ตรวจสอบ' , dataIndex: 'isApprove' , key: 'isApprove' },
    { title: 'ระงับใช้งาน' , dataIndex: 'isSuspend' , key: 'isSuspend' },
    { title: 'วันที่', sorter: true , dataIndex: 'createdAt' , key: 'createdAt' },
])

const resetForm = async () => {
    isEdit.value = false
    qrCode.value = ''
    Object.keys(modals).forEach((k) => {
        modals[k as keyof typeof modals] = false
    });
    Object.assign(formStatePass , defualtFormStatePass)
    Object.assign(formStateSearch , defualtFormStateSearch)
    Object.assign(formStateTelegram , defualtFormStateTelegram)
    Object.assign(formStateSettlement , defualtFormStateSettlement)
    await onLoadTable.value()
}

const onResetGoogleAuth = async (record: User) => {
    userMerchant.value = record
    Modal.confirm({
        title: 'ยืนยันการทำรายการ' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, 'ต้องการรีเซ็ท 2Fa ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true
            try {
                const res = await api.post(`api/v1/bo/user/reset-2fa/${record.id}`).then(res => res.data)
                qrCode.value = res.data.qrCode
                modals.reset2fa = true
                message.success('ทำรายการสำเร็จ')
            } catch(e) {}
            loading.value = false
        }
    })
}

const onResetPassword = (data: typeof formStatePass) => {
    Modal.confirm({
        title: 'ยืนยันการทำรายการ' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, 'ต้องการรีเซ็ตรหัสผ่าน ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true
            try {
                await api.post(`api/v1/bo/user/reset-pass/${userMerchant.value?.id}` , data)
                message.success('ทำรายการสำเร็จ')
                resetForm()
            } catch(e) {}
            loading.value = false
        }
    })
}

const onLoadGroup = async () => {
    try {
        const response = await api.get('api/v1/bo/bank-group').then(res => res.data)
        groups.value = response.data
    } catch(e) {}
}

const onUpdateSettlement = async (data: typeof formStateSettlement) => {
    loading.value = true
    try {
        await api.post(`api/v1/bo/merchant/set/settle-balance/${merchant.value?.id}` , data)
        message.success('ทำรายการสำเร็จ')
        await resetForm()
        await onLoadTable.value()
    } catch(e) {}
    loading.value = false
}

const onEditSettlement = async (record: Merchant) => {
    merchant.value = record
    Object.assign(formStateSettlement , record)
    modals.settlement = true
}

const onUpdateTelegram = async (data: typeof formStateTelegram) => {
    loading.value = true
    try {
        await api.post(`api/v1/bo/merchant/set/telegram/${merchant.value?.id}` , data)
        message.success('ทำรายการสำเร็จ')
        await resetForm()
        await onLoadTable.value()
    } catch(e) {}
    loading.value = false
}

const onEditTelegram = async (record: Merchant) => {
    merchant.value = record
    Object.assign(formStateTelegram , record)
    modals.telegram = true
}

const onUpdateStatus = async (type: 'suspend' | 'approve' , id: number , status: boolean) => {
    let actionMessage: string
    let textColor: string
    
    if (type === 'suspend') {
        // suspend: แก้ไขารใช้งาน
        status = !status
        actionMessage = status ? 'เปิดการใช้งาน' : 'ระงับการใช้งาน'
        textColor = status ? 'color:#52c41a;' : 'color:#ff4d4f;'
    } else {
        // approve: อนุมัติการใช้งาน
        actionMessage = 'อนุมัติการใช้งาน'
        textColor = 'color:#52c41a;'
    }
    
    Modal.confirm({
        title: 'ยืนยันการทำรายการ' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: textColor }, `ต้องการ ${actionMessage} ใช่หรือไม่ ?`),
        async onOk() {
            loading.value = true
            try {
                const url = `api/v1/bo/merchant/${type == 'suspend' ? 'suspend' : 'approve' }/${id}`
                await api.post(url , { status })
                await onLoadTable.value()
            } catch(e) {}
            loading.value = false
        }
    })
}

const onPickGroup = async (id: number , groupId: number) => {   
    try {
        await api.post(`api/v1/bo/merchant/group/${id}` , { groupId })
        message.success('ทำรายการสำเร็จ')
        await onLoadTable.value()
    } catch(e) {}
}

</script>

<template>

    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">จัดการร้านค้า</h1>
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
                            <a-form-item label="ค้นหาด้วย" name="searchBy">
                                <a-select v-model:value="formStateSearch.searchBy" placeholder="กรุณาเลือกการค้นหา">
                                    <a-select-option value="name">ชื่อร้านค้า</a-select-option>
                                    <a-select-option value="prefix">รหัสร้านค้า</a-select-option>
                                    <a-select-option value="ratePayin">ค่าธรรมเนียม</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ข้อมูลค้นหา" name="criteria">
                                <a-input v-model:value="formStateSearch.criteria" placeholder="กรอกข้อมูลค้นหา" />
                            </a-form-item>
                        </a-col>
                            <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="สถานะ" name="status">
                                <a-select v-model:value="formStateSearch.status" placeholder="กรุณาเลือกสถานะ">
                                    <a-select-option value>ทั้งหมด</a-select-option>
                                    <a-select-option value="1">เปิดใช้งาน</a-select-option>
                                    <a-select-option value="0">ปิดใช้งาน</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="สถานะการอนุมัติ" name="isApprove">
                                <a-select v-model:value="formStateSearch.isApprove" placeholder="กรุณาเลือกสถานะ">
                                    <a-select-option value>ทั้งหมด</a-select-option>
                                    <a-select-option value="0">รออนุมัติ</a-select-option>
                                    <a-select-option value="1">อนุมัติใช้งาน</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                            <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="สถานะการใช้งาน" name="isSuspend">
                                <a-select v-model:value="formStateSearch.isSuspend" placeholder="กรุณาเลือกสถานะ">
                                    <a-select-option value>ทั้งหมด</a-select-option>
                                    <a-select-option value="0">รออนุมัติ</a-select-option>
                                    <a-select-option value="1">อนุมัติใช้งาน</a-select-option>
                                </a-select>
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
                        <template v-if="['balance','totalPayin','totalPayout'].includes(column.key)">
                            {{ formatNumber(text, 2) }}
                        </template>
                        <template v-if="column.key === 'prefix'">
                            <div class="flex items-center gap-2">
                                {{ text }} <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="onCopyText(text)" />
                            </div>
                        </template>
                        <template v-if="column.key === 'status'">
                            <a-tag color="success" v-if="record.status">ใช้งาน</a-tag>
                            <a-tag color="error" v-else>ระงับใช้งาน</a-tag>
                        </template>
                        <template v-if="column.key === 'isApprove'">
                            <a-tag color="success" v-if="record.isApprove">อนุมัติใช้งาน</a-tag>
                            <a-tag color="processing" v-else>รอดำเนินการ</a-tag>
                        </template>
                        <template v-if="column.key === 'group'">
                            <a-select
                                v-if="permissions.includes('merchant.update')"
                                :value="record.groupId === 0 ? null : record.groupId"
                                placeholder="กรุณาเลือกกลุ่มบัญชี"
                                @change="onPickGroup(record.id, $event)"
                            >
                                <a-select-option :value="item.id" v-for="(item, index) in groups" :key="index">
                                    {{ item.name }}
                                </a-select-option>
                            </a-select>
                            <a-select v-else
                                :value="record.groupId === 0 ? null : record.groupId" disabled>
                                <a-select-option :value="item.id" v-for="(item, index) in groups" :key="index">
                                    {{ item.name }}
                                </a-select-option>
                            </a-select>
                        </template>
                        <template v-if="column.key === 'isSuspend'">
                            <a-tag color="error" v-if="record.isSuspend">ระงับใช้งาน</a-tag>
                            <a-tag color="success" v-else>เปิดใช้งาน</a-tag>
                        </template>
                        <template v-if="column.key === 'createdAt'">
                            {{ setFormatTime(text) }}
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-space>
                                <a-button class="px-0" @click="() => { userMerchant = record.user , modals.resetpass = true }">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="teenyicons:password-outline" width="14" height="14"></Icon> รีเซ็ตรหัสผ่าน
                                    </div>
                                </a-button>
                                <a-button class="px-0" @click="onEditTelegram(record)">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="streamline-logos:telegram-logo-1" width="14" height="14"></Icon> ตั่งค่ากลุ่มประสานงาน
                                    </div>
                                </a-button>
                                <a-button class="px-0" @click="onEditSettlement(record)">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="solar:cash-out-line-duotone" width="14" height="14"></Icon> ตั่งค่าโยกเงิน
                                    </div>
                                </a-button>
                                <a-button class="px-0" @click="onResetGoogleAuth(record.user)">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="mdi:security-lock" width="14" height="14"></Icon> รีเซ็ต 2FA
                                    </div>
                                </a-button>
                                <a-button 
                                    :disabled="loading" 
                                    @click="onUpdateStatus('approve' , record.id , !record.isApprove)" 
                                    type="primary" 
                                    class="px-0 btn-variant-solid-success" 
                                    v-if="!record.isApprove"
                                >
                                    <div class="flex gap-1 items-center text-xs">
                                        อนุมัติใช้งาน
                                    </div>
                                </a-button>
                                <a-button 
                                    :disabled="loading" 
                                    @click="onUpdateStatus('suspend' , record.id , !record.isSuspend)" 
                                    class="px-0" 
                                    :danger="!record.isSuspend" 
                                    type="primary"
                                    :class="{ 'btn-variant-solid-success' : record.isSuspend }" 
                                >
                                    <div class="flex gap-1 items-center text-xs">
                                        {{ record.isSuspend ? 'เปิดการใช้งาน' : 'ระงับการใช้งาน' }}
                                    </div>
                                </a-button>
                                <a-button @click="() => { modals.detail = true; merchant = record }">
                                    <Icon icon="mdi-light:clipboard-text" width="18" height="18" ></Icon>
                                </a-button>
                            </a-space>
                        </template>
                    </template>
                </a-table>
            </a-card>
        </a-col>
    </a-row>

    <!-- google auth  -->
    <TwoFactor 
        v-model:show="modals.reset2fa" 
        :name="userMerchant?.name" 
        :code="qrCode" 
    ></TwoFactor>

    <!-- reset password -->
    <a-modal 
        :open="modals.resetpass" 
        title="รีเซ็ตรหัสผ่าน" 
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
                    :model="formStatePass"
                    @finish="onResetPassword"
                >
                    <a-form-item 
                        label="รหัสผ่าน" 
                        :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                        name="password"
                    >
                        <a-input-password v-model:value="formStatePass.password" placeholder="กรุณากรอกรหัสผ่าน" />
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
            </a-col>
        </a-row>
    </a-modal>

     <!-- telegram -->
     <a-modal 
        :open="modals.telegram" 
        title="ตั่งค่ากลุ่มประสานงาน" 
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
                    :model="formStateTelegram"
                    @finish="onUpdateTelegram"
                >
                    <a-form-item 
                        label="รหัสห้องแชท (Chat Room ID)" 
                        :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                        name="telegramRoomId"
                    >
                        <a-input 
                            v-model:value="formStateTelegram.telegramRoomId" 
                            placeholder="กรุณากรอกรหัสห้องแชท" 
                        />
                    </a-form-item>
                    <a-typography-text style="font-size: 12px;" type="warning">
                        ต้องนำรหัสห้องแชทจาก Telegram Group ที่ต้องการใช้งาน สามารถดูวิธีการได้ที่คู่มือการใช้งาน
                    </a-typography-text>
                    <a-form-item style="margin-top: 16px;">
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

    <!-- setting settlement -->
    <a-modal 
        :open="modals.settlement" 
        title="ตั่งค่าโยกเงินร้านค้า" 
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
                    :model="formStateSettlement"
                    @finish="onUpdateSettlement"
                >   
                    <a-form-item label="สถานะ" name="isSettleAuto">
                        <a-switch v-model:checked="formStateSettlement.isSettleAuto" /> 
                        <span class="text-gray-500 ml-[5px] text-xs">{{ formStateSettlement.isSettleAuto ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span>
                    </a-form-item>
                    <template v-if="formStateSettlement.isSettleAuto">
                        <a-form-item 
                            :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                            name="settleBalance"
                        >
                            <template #label>
                                ยอดเงิน <a-typography-text style="font-size: 12px;margin-left: 8px;" type="secondary">(เมื่อยอดเงินที่กำหนดจะทำการโยกไปยังบัญชีที่กำหนด)</a-typography-text>
                            </template>
                            <a-input-number v-model:value="formStateSettlement.settleBalance" :min="0" style="width: 100%;" />
                        </a-form-item>
                        <a-form-item 
                            label="ชื่อบัญชี" 
                            :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                            name="bankName"
                        >
                            <a-input v-model:value="formStateSettlement.bankName" placeholder="กรุณากรอกชื่อบัญชี" />
                        </a-form-item>
                        <a-form-item 
                            label="เลขบัญชี" 
                            :rules="[
                                { required: true, message: 'กรุณากรอกข้อมูล' } ,
                                { pattern: /^[0-9]+$/, message: 'กรุณากรอกตัวเลขเท่านั้น ห้ามมี -' }
                            ]"
                            name="bankNumber"
                        >
                            <a-input v-model:value="formStateSettlement.bankNumber" placeholder="กรุณากรอกเลขบัญชี" />
                        </a-form-item>

                        <a-form-item 
                            label="ธนาคาร" 
                            :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                            name="bankId"
                        >
                            <a-select v-model:value="formStateSettlement.bankId" placeholder="กรุณาเลือกธนาคาร">
                                <a-select-option :value="item.code" v-for="item , index in initStore.banks" :key="index">
                                    <div class="flex gap-2 items-center">
                                        <img :src="item.img" style="height: 18px;"> {{ item.nameTh }}
                                    </div>
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </template>
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

    <!-- detail  -->
    <a-modal
        :open="modals.detail" 
        title="รายละเอียด" 
        @ok="modals.detail = false" 
        width="800px" 
        @cancel="modals.detail = false"
        :footer="null"
    >
        <a-descriptions bordered :column="{ xs: 1 , sm: 1 , md: 2 }">
            <a-descriptions-item label="รหัสร้านค้า">{{ merchant?.prefix }}</a-descriptions-item>
            <a-descriptions-item label="สถานะการใช้งาน">
                <a-badge status="success" text="เปิดใช้งาน" v-if="merchant?.status" />
                <a-badge status="error" text="ปิดใช้งาน" v-else />
            </a-descriptions-item>
            <a-descriptions-item label="ชื่อร้านค้า">{{ merchant?.name }}</a-descriptions-item>
            <a-descriptions-item label="สถานะยืนยัน">
                <a-badge status="success" text="เปิดใช้งาน" v-if="merchant?.isApprove" />
                <a-badge status="processing" text="รอดำเนินการ" v-else />
            </a-descriptions-item>
            <a-descriptions-item label="ยอดเงิน" :span="2">{{ formatNumber(merchant?.balance ?? 0, 2) }}</a-descriptions-item>
            <a-descriptions-item label="ค่าธรรมเนียมฝากเงิน">{{ merchant?.ratePayin }}</a-descriptions-item>
            <a-descriptions-item label="ประเภท">{{ merchant?.typeRatePayin === 'fixed' ? 'คงที่' : 'เปอร์เซ็นต์' }}</a-descriptions-item>
            <a-descriptions-item label="ค่าธรรมเนียมถอนเงิน">{{ merchant?.ratePayout }}</a-descriptions-item>
            <a-descriptions-item label="ประเภท">{{ merchant?.typeRatePayout === 'fixed' ? 'คงที่' : 'เปอร์เซ็นต์' }}</a-descriptions-item>
            <a-descriptions-item label="สร้างเมื่อ" :span="2">{{ setFormatTime(merchant?.createdAt ?? '') }}</a-descriptions-item>
            <a-descriptions-item label="ยอดฝากรวม">{{ formatNumber(merchant?.totalPayin ?? 0, 2) }}</a-descriptions-item>
            <a-descriptions-item label="ยอดถอนรวม">{{ formatNumber(merchant?.totalPayout ?? 0, 2) }}</a-descriptions-item>
            <a-descriptions-item label="เว็บไซค์" :span="2">
                <a :href="merchant?.website" target="_blank" rel="noopener noreferrer">{{ merchant?.website }}</a>
            </a-descriptions-item>
            <a-descriptions-item label="ช่องทางติดต่อ" :span="2">
                {{ merchant?.contact }}
            </a-descriptions-item>
            <a-descriptions-item label="เคลียกับหน่วยงาน" :span="2">
                {{ merchant?.agencyPolice }}
            </a-descriptions-item>  
        </a-descriptions>
    </a-modal>
</template>

<style>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}
</style>