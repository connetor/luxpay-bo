<script setup lang="ts">
import { createVNode, onMounted, reactive, ref } from "vue";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import api from "@/configs/api";
import type { Merchant, Role, User } from "@/interface/Modal";
import { message, Modal } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { setFormatTime, formatNumber } from "@/utils";
import dayjs from "dayjs";
import { useAuthStore } from "@/stores/auth";
import type { SearchTableParams } from "@/interface/Request";
import { useEvent } from "@/composables/useEvent";
import TwoFactor from '@/components/modals/Twofactor.vue'
import { useTable } from "@/composables/useTable";

interface SearchParams {
    status: string | null
    prefix: string | null
    name: string | null
    rateDeposit: number | null
    subfixId: number | null
}

const { user } = useAuthStore()
const { onCopyText } = useEvent()

const { pagination, sort, onLoadTable, data, handleTableChange, loading } = useTable<Merchant>()

const modals = reactive({
    crud: false,
    resetpass: false,
    reset2fa: false
})
const isEdit = ref(false)
const subfixs = ref<Merchant[]>([])

const userMerchant = ref<User | null>(null)
const merchant = ref<Merchant | null>(null)
const qrCode = ref<string>('')

const permissions = user?.permissions ?? []
const defualtFormState = {
    prefix: '',
    name: '',
    password: '',
    contact: '',
    phone: '',
    ratePayin: user?.merchant.ratePayin,
    ratePayout: user?.merchant.ratePayout,
    typeratePayin: 'percent',
    typeRatePayout: 'fixed',
    status: true,
    remark: '',
    level: 'agent'
}

const defualtFormStatePass = {
    password: ''
}

const defualtFormStateSearch = {
    name: null,
    prefix: null,
    rateDeposit: null,
    status: null,
    date: [null, null]
}

const formState = reactive({ ...defualtFormState })
const formStatePass = reactive({ ...defualtFormStatePass })
const formStateSearch = reactive({ ...defualtFormStateSearch })

onMounted(async () => {
    await onLoadTable.value()
})

onLoadTable.value = async () => {
    loading.value = true
    try {
        const params: SearchTableParams & SearchParams = {
            startDate: formStateSearch.date[0] ? dayjs(formStateSearch.date[0]).format('YYYY-MM-DD') : '',
            endDate: formStateSearch.date[1] ? dayjs(formStateSearch.date[1]).format('YYYY-MM-DD') : '',
            page: pagination.current,
            pageSize: pagination.pageSize,
            sortBy: sort.sortBy,
            sortOrder: sort.sortOrder,
            status: formStateSearch.status,
            subfixId: subfixs.value[subfixs.value.length - 1]?.id,
            name: formStateSearch.name,
            prefix: formStateSearch.prefix,
            rateDeposit: formStateSearch.rateDeposit
        }

        const res = await api.get('api/v1/bo/merchant', { params }).then(res => res.data)
        data.value = res.data.data
        pagination.total = res.data.meta.total
        const lastPage = Math.ceil(pagination.total / pagination.pageSize) || 1
        if (pagination.current > lastPage) {
            pagination.current = lastPage
        }
    } catch (e) { }
    loading.value = false
}

const columns = reactive([
    ...(permissions?.includes('agent.update') ? [
        { title: 'จัดการ', key: 'more' },
    ] : []),
    { title: 'รหัสร้านค้า', sorter: true, dataIndex: 'prefix', key: 'prefix' },
    { title: 'ชื่อร้านค้า', sorter: true, dataIndex: 'name', key: 'name' },
    {
        title: 'ฝากเงิน', children: [
            { title: 'ค่าธรรมเนียม', dataIndex: 'ratePayin', key: 'ratePayin' },
            { title: 'ประเภท', dataIndex: 'typeRatePayin', key: 'typeRatePayin' },
        ]
    },
    {
        title: 'ถอนเงิน', children: [
            { title: 'ค่าธรรมเนียม', dataIndex: 'ratePayout', key: 'ratePayout' },
            { title: 'ประเภท', dataIndex: 'typeRatePayout', key: 'typeRatePayout' },
        ]
    },
    { title: 'ยอดเงินคงเหลือ', sorter: true, dataIndex: 'balance', key: 'balance' },
    { title: 'ยอดฝากทั้งหมด', sorter: true, dataIndex: 'totalPayin', key: 'totalPayin' },
    { title: 'ยอดถอนทั้งหมด', sorter: true, dataIndex: 'totalPayout', key: 'totalPayout' },
    { title: 'สถานะ', dataIndex: 'status', key: 'status' },
    { title: 'วันที่', sorter: true, dataIndex: 'createdAt', key: 'createdAt' },
])

const resetForm = async () => {
    isEdit.value = false
    qrCode.value = ''
    Object.keys(modals).forEach((k) => {
        modals[k as keyof typeof modals] = false
    });
    Object.assign(formState, defualtFormState)
    Object.assign(formStatePass, defualtFormStatePass)
    Object.assign(formStateSearch, defualtFormStateSearch)

    await onLoadTable.value()
}

const openCreateModal = () => {
    // เคลียร์ข้อมูลก่อนเปิด modal
    isEdit.value = false
    qrCode.value = ''
    Object.assign(formState, defualtFormState)
    Object.assign(formStatePass, defualtFormStatePass)
    modals.crud = true
}

const onEdit = async (data: Role) => {
    loading.value = true
    try {
        const res = await api.get(`api/v1/bo/merchant/${data.id}`).then(res => res.data)
        Object.assign(formState, res.data)
        merchant.value = res.data
        isEdit.value = true
        modals.crud = true
    } catch (e) { }
    loading.value = false
}

const onFinish = async (data: typeof formState) => {
    loading.value = true
    try {
        if (isEdit.value) {
            await api.post(`api/v1/bo/merchant/${merchant.value?.id}`, data)
            resetForm();
        }
        else {
            const res = await api.post('api/v1/bo/merchant', data).then(res => res.data)
            qrCode.value = res.data.qrCode
            userMerchant.value = res.data.user
            modals.reset2fa = true
            modals.crud = false
        }
        await onLoadTable.value()
        message.success('ทำรายการสำเร็จ')
    } catch (e) { }
    loading.value = false
}

const onResetGoogleAuth = async (record: User) => {
    userMerchant.value = record
    Modal.confirm({
        title: 'รีเซ็ท 2Fa',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, 'ต้องการรีเซ็ท 2Fa ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true
            try {
                const res = await api.post(`api/v1/bo/user/reset-2fa/${record.id}`).then(res => res.data)
                qrCode.value = res.data.qrCode
                modals.reset2fa = true
                message.success('ทำรายการสำเร็จ')
            } catch (e) { }
            loading.value = false
        }
    })
}

const onResetPassword = (data: typeof formStatePass) => {
    Modal.confirm({
        title: 'รีเซ็ตรหัสผ่าน',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, 'ต้องการรีเซ็ตรหัสผ่าน ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true
            try {
                await api.post(`api/v1/bo/user/reset-pass/${userMerchant.value?.id}`, data)
                message.success('ทำรายการสำเร็จ')
                resetForm()
            } catch (e) { }
            loading.value = false
        }
    })
}

const deleteDataInSubfix = async (index: number) => {
    subfixs.value = subfixs.value.filter((i, inx) => index >= inx)
    await onLoadTable.value()
}

</script>

<template>
    <a-row align="middle" :gutter="[24, 24]">

        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">เอเย่นต์</h1>
                    </div>
                </div>

                <p>ค้นหา</p>
                <a-form :required-mark="false" autocomplete="off" layout="vertical" :model="formStateSearch">
                    <a-row :gutter="24">
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item name="date" label="วันที่ทำรายการ">
                                <a-range-picker v-model:value="formStateSearch.date" format="YYYY-MM-DD"
                                    class="w-full" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="รหัสร้านค้า" name="prefix">
                                <a-input v-model:value="formStateSearch.prefix" placeholder="กรอกข้อมูลค้นหา" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ชื่อร้านค้า" name="name">
                                <a-input v-model:value="formStateSearch.name" placeholder="กรอกข้อมูลค้นหา" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="ค่าธรรมเนียม (ฝากเงิน)" name="rateDeposit">
                                <a-input-number style="width: 100%; color: white;"
                                    v-model:value="formStateSearch.rateDeposit" placeholder="กรอกข้อมูลค้นหา" />
                            </a-form-item>
                        </a-col>
                        <a-col :lg="4" :md="12" :xs="24">
                            <a-form-item label="สถานะ" name="status">
                                <a-select v-model:value="formStateSearch.status" placeholder="กรุณาเลือกสถานะ">
                                    <a-select-option value>ทั้งหมด</a-select-option>
                                    <a-select-option value="1">ใช้งาน</a-select-option>
                                    <a-select-option value="0">ปิดใช้งาน</a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                        <a-col :span="24">
                            <a-space>
                                <a-button type="primary" @click="onLoadTable">
                                    <div class="flex items-center gap-2">
                                        <Icon icon="line-md:search" /> ค้นหา
                                    </div>
                                </a-button>
                                <a-button type="primary" danger @click="resetForm">
                                    <div class="flex items-center gap-2">
                                        <Icon icon="mdi:bin" /> รีเซ็ต
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
                <a-breadcrumb separator=">">
                    <a-breadcrumb-item @click="() => { subfixs = []; onLoadTable() }" class="cursor-pointer" >
                        {{ user?.merchant.prefix || 'Company' }}
                    </a-breadcrumb-item>
                    <a-breadcrumb-item v-for="item, index in subfixs" :key="index" @click="deleteDataInSubfix(index)"
                        class="cursor-pointer">
                        {{ item.prefix }}
                    </a-breadcrumb-item>
                </a-breadcrumb>
                <div class="float-right">
                    <a-space>
                        <a-button style="margin-bottom: 16px; display: flex;align-items: center;"
                            @click="openCreateModal" v-if="permissions.includes('agent.create')">
                            <Icon icon="line-md:plus" class="mr-2"></Icon> สร้างรายการ
                        </a-button>
                        <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="onLoadTable"
                            :disabled="loading">
                            <Icon :icon="loading ? 'svg-spinners:270-ring' : 'famicons:reload'" class="mr-2"></Icon>
                            รีเฟรช
                        </a-button>
                    </a-space>
                </div>
                <a-table :columns="columns" :data-source="data" :loading="loading" @change="handleTableChange" bordered
                    :pagination="pagination" :scroll="{ x: 'max-content' }">
                    <template #bodyCell="{ column, index, text, record }">
                        <template v-if="column.key === 'id'">
                            {{ index + 1 }}
                        </template>
                        <template v-if="column.key === 'prefix'">
                            <div class="flex items-center gap-2">
                                <span class="cursor-pointer text-blue-500"
                                    @click="() => { subfixs.push(record); onLoadTable() }"
                                    v-if="record.level === 'deseller'">
                                    {{ text }}
                                </span>
                                <span v-else>{{ text }}</span>
                                <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16"
                                    @click="onCopyText(text)" />
                            </div>
                        </template>
                        <template v-if="column.key === 'name'">
                            <div class="flex items-center gap-2">
                                {{ text }}
                                <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16"
                                    @click="onCopyText(text)" />
                            </div>
                        </template>
                        <template v-if="['typeRatePayin', 'typeRatePayout'].includes(column.key)">
                            <a-tag v-if="record[column.key] === 'fixed'" color="warning">คงที่</a-tag>
                            <a-tag color="success" v-else>เปอร์เซ็นต์</a-tag>
                        </template>
                        <template v-if="column.key === 'ratePayin'">
                            {{ record.prefix.startsWith('bibbyfg17') ? (Number(text) < 1.6 ? '1.60' :
                                Number(text).toFixed(2)) : Number(text).toFixed(2) }} </template>
                                <template v-if="['balance', 'totalPayin', 'totalPayout'].includes(column.key)">
                                    {{ formatNumber(text, 2) }}
                                </template>
                                <template v-if="column.key === 'status'">
                                    <a-tag color="success" v-if="record.status">ใช้งาน</a-tag>
                                    <a-tag color="error" v-else>ระงับใช้งาน</a-tag>
                                </template>
                                <template v-if="column.key === 'createdAt'">
                                    {{ setFormatTime(text) }}
                                </template>
                                <template v-if="column.key === 'more'">
                                    <a-space v-if="user?.id === record.uplineId">
                                        <a-button class="px-0"
                                            @click="() => { userMerchant = record.user, modals.resetpass = true }">
                                            <div class="flex gap-1 items-center text-xs">
                                                <Icon icon="teenyicons:password-outline" width="14" height="14"></Icon>
                                                รีเซ็ตรหัสผ่าน
                                            </div>
                                        </a-button>
                                        <a-button class="px-0" @click="onResetGoogleAuth(record.user)">
                                            <div class="flex gap-1 items-center text-xs">
                                                <Icon icon="mdi:security-lock" width="14" height="14"></Icon> รีเซ็ต 2FA
                                            </div>
                                        </a-button>
                                        <a-button class="px-0" @click="onEdit(record)">
                                            <div class="flex gap-1 items-center text-xs">
                                                <Icon icon="ep:edit-pen" width="14" height="14"></Icon> แก้ไข
                                            </div>
                                        </a-button>
                                    </a-space>
                                    <span class="text-red-400 text-xs" v-else>ไม่สามารถจัดการได้</span>
                                </template>
                        </template>
                </a-table>
            </a-card>
        </a-col>
    </a-row>

    <!-- CRUD  -->
    <a-modal :open="modals.crud" :title="isEdit ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูล'" @cancel="resetForm" :footer="null">
        <a-form layout="vertical" name="basic" autocomplete="off" :model="formState" @finish="onFinish"
            :required-mark="false">
            <a-form-item label="รหัสร้านค้า" :rules="[
                { required: true, message: 'กรุณากรอกข้อมูล' },
                {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: 'มีได้แค่ตัวอักษร a-z, A-Z, 0-9 และ _ เท่านั้น',
                    trigger: 'blur'
                },
            ]" name="prefix" :disabled="isEdit">
                <a-input v-model:value="formState.prefix" :disabled="isEdit" placeholder="กรุณากรอกรหัสร้านค้า">
                    <template #addonBefore v-if="!isEdit">
                        {{ user?.merchant.prefix }}
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item label="รหัสผ่าน" :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]" name="password"
                v-if="!isEdit">
                <a-input-password v-model:value="formState.password" placeholder="กรุณากรอกรหัสผ่าน" />
            </a-form-item>

            <a-form-item label="ชื่อร้านค้า" :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]" name="name">
                <a-input v-model:value="formState.name" placeholder="กรุณากรอกชื่อ" />
            </a-form-item>

            <a-form-item label="ระดับ" name="level" :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                :disabled="isEdit">
                <a-select v-model:value="formState.level" :disabled="isEdit" placeholder="กรุณาเลือกสถานะ">
                    <a-select-option value="agent">เอเย่นต์</a-select-option>
                    <a-select-option value="deseller">ตัวแทน</a-select-option>
                </a-select>
            </a-form-item>

            <!-- ฝากเงิน  -->
            <a-form-item label="ค่าธรรมเนียม (ฝากเงิน)" :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                name="ratePayin">
                <a-input-number v-model:value="formState.ratePayin" :min="user?.merchant.ratePayin" class="w-full">
                    <template #addonAfter>
                        <Icon icon="material-symbols:percent"></Icon>
                    </template>
                </a-input-number>
            </a-form-item>

            <a-form-item label="ประเภทค่าธรรมเนียม (ฝากเงิน)" name="typeRatePayin">
                <a-select disabled value="percent" placeholder="กรุณาเลือกสถานะ">
                    <a-select-option value="fixed">คงที่</a-select-option>
                    <a-select-option value="percent">เปอร์เซ็นต์</a-select-option>
                </a-select>
            </a-form-item>

            <!-- ถอนเงิน  -->
            <a-form-item label="ค่าธรรมเนียม (ถอนเงิน)" name="ratePayout">
                <a-input-number disabled v-model:value="formState.ratePayout" :min="user?.merchant.ratePayout"
                    class="w-full">
                    <template #addonAfter>
                        <Icon icon="iconoir:coin"></Icon>
                    </template>
                </a-input-number>
            </a-form-item>

            <a-form-item label="ประเภทค่าธรรมเนียม (ถอนเงิน)" name="typeRatePayout">
                <a-select disabled value="fixed" placeholder="กรุณาเลือกสถานะ">
                    <a-select-option value="fixed">คงที่</a-select-option>
                    <a-select-option value="percent">เปอร์เซ็นต์</a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item label="หมายเหตุ" name="remark">
                <a-textarea v-model:value="formState.remark" placeholder="หมายเหตุ" :rows="4" />
            </a-form-item>

            <a-form-item label="สถานะ" name="status">
                <a-switch v-model:checked="formState.status" />
                <span class="ml-[5px] text-xs" style="margin-left: 10px;">{{ formState.status ? 'เปิดใช้งาน'
                    :
                    'ปิดใช้งาน' }}</span>
            </a-form-item>

            <a-form-item>
                <a-space class="float-right">
                    <a-button :loading="loading" type="primary" class="mb-[0]" danger @click="resetForm">
                        ยกเลิก
                    </a-button>
                    <a-button :loading="loading" html-type="submit" type="primary" class="mb-[0]">
                        ยืนยัน
                    </a-button>
                </a-space>
            </a-form-item>
        </a-form>
    </a-modal>

    <!-- google auth  -->
    <TwoFactor v-model:show="modals.reset2fa" :name="userMerchant?.name" :code="qrCode"></TwoFactor>

    <!-- reset password -->
    <a-modal :open="modals.resetpass" title="รีเซ็ตรหัสผ่าน" @cancel="resetForm" :footer="null">
        <a-row>
            <a-col :span="24">
                <a-form :required-mark="false" layout="vertical" name="basic" autocomplete="off" :model="formStatePass"
                    @finish="onResetPassword">
                    <a-form-item label="รหัสผ่าน" :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                        name="password">
                        <a-input-password v-model:value="formStatePass.password" placeholder="กรุณากรอกรหัสผ่าน" />
                    </a-form-item>
                    <a-form-item>
                        <a-space class="float-right">
                            <a-button :loading="loading" type="primary" class="mb-[0]" danger @click="resetForm">
                                ยกเลิก
                            </a-button>
                            <a-button :loading="loading" html-type="submit" type="primary" class="mb-[0]">
                                ยืนยัน
                            </a-button>
                        </a-space>
                    </a-form-item>
                </a-form>
            </a-col>
        </a-row>
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