
<script setup lang="ts">
import { createVNode, onMounted, reactive, ref } from "vue";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import api from "@/configs/api";
import type { Role, User } from "@/interface/Modal";
import { message, Modal } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { setFormatTime } from "@/utils";
import { useAuthStore } from "@/stores/auth";
import TwoFactor from '@/components/modals/Twofactor.vue'
import { useTable } from "@/composables/useTable";
 

const { data , loading , onLoadTable } = useTable<User>()

const modals = reactive({
    crud: false ,
    resetpass: false ,
    reset2fa: false
})
const isEdit = ref(false)
const authStore = useAuthStore()
const user = ref<User | null>(null)
const roles = ref<Role[]>([])
const qrCode = ref<string>('')

const defualtFormState = {
    name: '' ,
    username: '' ,
    roleId: null ,
    password: '' ,
    status: true 
}

const defualtFormStatePass = {
    password: ''
}

const formState = reactive({ ...defualtFormState })
const formStatePass = reactive({ ...defualtFormStatePass })
const permissions = authStore.user?.permissions ?? []

onMounted(async () => {
    await onLoadTable.value()
})

onLoadTable.value = async () => {
    loading.value = true
    try {
        const resUser = await api.get('api/v1/bo/user' ).then(res => res.data)
        const resRole = await api.get('api/v1/bo/role').then(res => res.data)
        data.value = resUser.data
        roles.value = resRole.data
    } catch(e) {}
    loading.value = false
}

const columns = reactive([
    ...(permissions?.includes('user.update') ? [
        { title: 'จัดการ', key: 'more' },
    ] : []),
    { title: 'ชื่อ' , dataIndex: 'name' , key: 'name' },
    { title: 'ชื่อผู้ใช้' , dataIndex: 'username' , key: 'username' },
    { title: 'สถานะ' , dataIndex: 'status' , key: 'status' , align: 'center' },
    { title: 'สร้างเมื่อ' , dataIndex: 'createdAt' , key: 'createdAt' },
])

const resetForm = async () => {
    user.value = null
    isEdit.value = false
    qrCode.value = ''
    Object.keys(modals).forEach((k) => {
        modals[k as keyof typeof modals] = false
    });
    Object.assign(formState , defualtFormState)
    Object.assign(formStatePass , defualtFormStatePass)
    await onLoadTable.value()
}

const onEdit = async (data: User) => {
    try {
        Object.assign(formState , data)
        user.value = data
        isEdit.value = true
        modals.crud = true
    } catch(e) {}
}

const onFinish = async (data: User) => {
    loading.value = true
    try {
        if(isEdit.value) {
            await api.post(`api/v1/bo/user/${user.value?.id}` , data)
            resetForm();
        }
        else {
            const res = await api.post('api/v1/bo/user' , data).then(res => res.data)
            user.value = data
            qrCode.value = res.data.qrCode
            modals.crud = false
            modals.reset2fa = true
        }
        message.success('ทำรายการสำเร็จ')
        await onLoadTable.value()
    } catch(e) {}
    loading.value = false
}

const onResetGoogleAuth = async (record: User) => {
    user.value = record
    Modal.confirm({
        title: 'ยืนยันการทำรายการ' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:white;' }, 'ต้องการรีเซ็ท 2Fa ใช่หรือไม่ ?'),
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
        content: createVNode('div', { style: 'color:white;' }, 'ต้องการรีเซ็ตรหัสผ่าน ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true
            try {
                await api.post(`api/v1/bo/user/reset-pass/${user.value?.id}` , data)
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
                        <h1 class="header-title">จัดการพนักงาน</h1>
                        <p class="header-text">ข้อมูลพนักงานในระบบ</p>
                    </div>
                </div>
            </a-card>
        </a-col>
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="float-right">
                    <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="modals.crud = true" v-if="permissions.includes('user.create')">
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
                    <template #bodyCell="{ column , index , text , record }">
                        <template v-if="column.key === 'id'">
                            {{ index + 1 }}
                        </template>
                        <template v-if="column.key === 'status'">
                            <a-tag color="success" v-if="record.status">เปิดใช้งาน</a-tag>
                            <a-tag color="error" v-else>ปิดใช้งาน</a-tag>
                        </template>
                        <template v-if="column.key === 'createdAt'">
                            {{ setFormatTime(text) }}
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-space>
                                <a-button class="px-0" @click="() => { user = record , modals.resetpass = true }">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="teenyicons:password-outline" width="14" height="14"></Icon> รีเซ็ตรหัสผ่าน
                                    </div>
                                </a-button>
                                 <a-button class="px-0" @click="onResetGoogleAuth(record)">
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
            :required-mark="false"
            layout="vertical" 
            name="basic" 
            autocomplete="off" 
            :model="formState"
            @finish="onFinish"
        >

            <a-form-item 
                label="ชื่อผู้ใช้งาน" 
                :rules="[
                    { required: true, message: 'กรุณากรอกข้อมูล' }
                ]"
                name="username"
                :disabled="isEdit"
            >
                <a-input v-model:value="formState.username" :disabled="isEdit" placeholder="กรุณากรอกชื่อผู้ใช้งาน">
                    <template #addonBefore v-if="!isEdit">
                        {{ authStore.user?.merchant.prefix }}@
                    </template>
                </a-input>
            </a-form-item>

            <a-form-item 
                label="ชื่อ" 
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                name="name"
            >
                <a-input v-model:value="formState.name" placeholder="กรุณากรอกชื่อ" />
            </a-form-item>

            <a-form-item 
                label="รหัสผ่าน" 
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                name="password"
                v-if="!isEdit"
            >
                <a-input-password v-model:value="formState.password" placeholder="กรุณากรอกรหัสผ่าน" />
            </a-form-item>
            <a-form-item 
                label="ตำแหน่ง" 
                name="roleId"
            >
                <a-select v-model:value="formState.roleId" placeholder="กรุณาเลือกตำแหน่ง">
                    <a-select-option :value="item.id" v-for="item , index in roles" :key="index">{{ item.name }}</a-select-option>
                </a-select>
            </a-form-item>
            <a-form-item label="สถานะ" name="status">
                <a-switch v-model:checked="formState.status" /> 
                <span class="ml-[5px] text-xs" style="margin-left: 10px;">{{ formState.status ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span>
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

    <!-- google auth  -->
    <TwoFactor 
        v-model:show="modals.reset2fa" 
        :name="user?.name" 
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
</template>

<style scoped>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}
</style>