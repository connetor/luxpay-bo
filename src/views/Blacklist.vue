
<script setup lang="ts">
import { createVNode, onMounted, reactive, ref } from "vue";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import api from "@/configs/api";
import type { Merchant, Role, User } from "@/interface/Modal";
import { message, Modal } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { setFormatTime , formatNumber, formatThaiBankAccount } from "@/utils";
import dayjs from "dayjs";
import { useAuthStore } from "@/stores/auth";
import type { SearchTableParams } from "@/interface/Request";
import { useEvent } from "@/composables/useEvent";
import TwoFactor from '@/components/modals/Twofactor.vue'
import { useTable } from "@/composables/useTable";

interface Blacklist {
    id?: number;
    bankNumber: string;
    bankName: string;
    bankId: number;
    bankCode: string;
    note: string;
    createdAt?: string;
    updatedAt?: string;
}

interface SearchParams {
    bankNumber?: string
    bankName?: string 
    bankId?: number
    note?: string
    subfixId?: number
}

const { user } = useAuthStore()
const { onCopyText } = useEvent()

const { pagination , sort , onLoadTable , data , handleTableChange: defaultHandleTableChange , loading } = useTable<Blacklist>()

const modals = reactive({
    crud: false ,
    resetpass: false ,
    reset2fa: false
})
const isEdit = ref(false)

// Custom handleTableChange to reset current page when pageSize changes
const handleTableChange = (page: any, filters: any, sorter: any, extra: any) => {
    // Check if pageSize is changing
    if (page.pageSize && page.pageSize !== pagination.pageSize) {
        pagination.current = 1 // Reset to first page when pageSize changes
        pagination.pageSize = page.pageSize
    } else {
        if (page.current) pagination.current = page.current
        if (page.pageSize) pagination.pageSize = page.pageSize
    }

    if (sorter) {
        sort.sortBy = sorter.columnKey
        sort.sortOrder = sorter.order === "ascend" ? "asc" : "desc"
    }

    onLoadTable.value()
}
const subfixs = ref<Blacklist[]>([])

const userMerchant = ref<User | null>(null)
const blacklist = ref<Blacklist | null>(null)
const qrCode = ref<string>('')
const banks = ref<any[]>([])
const searchText = ref('')

const permissions = user?.permissions ?? []
const defualtFormState = {
    bankNumber: '' ,
    bankName: '' ,
    bankId: null ,
    bankCode: '' ,
    note: ''
}

const defualtFormStatePass = {
    password: ''
}

const defualtFormStateSearch = {
    bankNumber: '' ,
    bankName: '' ,
    bankId: null ,
    note: '' ,
    date: [ null , null ]
}

const formState = reactive({ ...defualtFormState })
const formStatePass = reactive({ ...defualtFormStatePass })
const formStateSearch = reactive({ ...defualtFormStateSearch })

onMounted(async () => {
    await onLoadTable.value()
    await loadBanks()
})

// โหลดข้อมูลธนาคารสำหรับ dropdown
const loadBanks = async () => {
  try {
    const res = await api.get("api/v1/bo/bank").then((res) => res.data);
    banks.value = res.data;
  } catch (e) {
    console.error(e);
  }
};

onLoadTable.value = async () => {
    loading.value = true
    try {
        const params: any = {
            page: pagination.current ,
            limit: pagination.pageSize , // API uses 'limit' parameter
            sortBy: sort.sortBy ,
            sortOrder: sort.sortOrder ,
        }

        // เพิ่ม search parameter ถ้ามี
        if (searchText.value && searchText.value.trim()) {
            params.search = searchText.value
        }

        const res = await api.get('api/v1/bo/blacklist' , { params }).then(res => res.data)
        
        // Check response structure and assign data
        if (res && res.data) {
            // Handle paginated response structure: { status, message, data: { data: [...], meta: {...} } }
            const responseData = res.data.data
            const responseMeta = res.data.meta
            
            // Assign data array
            if (responseData && Array.isArray(responseData)) {
                data.value = responseData
            } else if (Array.isArray(res.data)) {
                // Fallback: if data is directly an array
                data.value = res.data
            } else {
                console.error('Unexpected response structure:', res)
                data.value = []
            }
            
            // Assign pagination meta and validate current page
            if (responseMeta) {
                pagination.total = responseMeta.total || 0
                
                // Use lastPage from API response for accurate pagination
                const lastPage = responseMeta.lastPage || Math.ceil(pagination.total / pagination.pageSize) || 1
                
                // Validate current page and reset if it exceeds lastPage (before recursive call)
                if (pagination.current > lastPage && lastPage > 0) {
                    pagination.current = lastPage
                    loading.value = false // Reset loading before recursive call
                    // Recursively call to load the correct page data
                    await onLoadTable.value()
                    return
                }
            }
        } else {
            console.error('Invalid response structure:', res)
            data.value = []
        }
        
        // Ensure current page is at least 1
        if (pagination.current < 1) {
            pagination.current = 1
        }
    } catch(e: any) {
        console.error('Error loading blacklist data:', e)
        message.error(e?.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
        data.value = []
    } finally {
        loading.value = false
    }
}

// ฟังก์ชันค้นหา
const onSearch = async () => {
    pagination.current = 1; // Reset to first page when searching
    await onLoadTable.value();
};

// ฟังก์ชัน reset search
const onResetSearch = async () => {
    searchText.value = "";
    pagination.current = 1;
    await onLoadTable.value();
};

const columns = reactive([
    { title: 'จัดการ', key: 'more' },
    { title: 'เลขบัญชี' , sorter: true , dataIndex: 'bankNumber' , key: 'bankNumber' },
    { title: 'ชื่อบัญชี' , sorter: true , dataIndex: 'bankName' , key: 'bankName' },
    { title: 'ธนาคาร' , dataIndex: 'bankCode' , key: 'bankCode' },
    { title: 'หมายเหตุ' , dataIndex: 'note' , key: 'note' },
    { title: 'วันที่', sorter: true , dataIndex: 'createdAt' , key: 'createdAt' },
])

const resetForm = async () => {
    isEdit.value = false
    qrCode.value = ''
    blacklist.value = null
    searchText.value = ''
    Object.keys(modals).forEach((k) => {
        modals[k as keyof typeof modals] = false
    });
    Object.assign(formState , defualtFormState)
    Object.assign(formStatePass , defualtFormStatePass)
    Object.assign(formStateSearch , defualtFormStateSearch)

    await onLoadTable.value()
}

const openCreateModal = () => {
    // เคลียร์ข้อมูลก่อนเปิด modal
    isEdit.value = false
    qrCode.value = ''
    blacklist.value = null
    Object.assign(formState , defualtFormState)
    Object.assign(formStatePass , defualtFormStatePass)
    modals.crud = true
}

const onEdit = async (data: Blacklist) => {
    loading.value = true
    try {
        const res = await api.get(`api/v1/bo/blacklist/${data.id}`).then(res => res.data)
        Object.assign(formState , res.data)
        blacklist.value = res.data
        isEdit.value = true
        modals.crud = true
    } catch(e) {}
    loading.value = false
}

const onFinish = async (data: typeof formState) => {
    loading.value = true
    try {
        
        if(isEdit.value) {
            await api.post(`api/v1/bo/blacklist/${blacklist.value?.id}` , data)
            message.success('แก้ไขข้อมูลสำเร็จ')
        }
        else {
            await api.post('api/v1/bo/blacklist' , data)
            message.success('สร้างข้อมูลสำเร็จ')
        }
        await onLoadTable.value()
        resetForm()
    } catch(e: any) {
        console.error(e)
        // แสดง error message ที่ได้จาก API
        const errorMessage = e?.response?.data?.message || e?.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'
        message.error(errorMessage)
    }
    loading.value = false
}

const onDelete = async (data: Blacklist) => {
    loading.value = true;
    try {
        await api.delete(`api/v1/bo/blacklist/${data.id}`);
        message.success("ลบรายการสำเร็จ");
        await onLoadTable.value();
    } catch (e: any) {
        console.error(e);
        const errorMessage = e?.response?.data?.message || e?.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'
        message.error(errorMessage)
    }
    loading.value = false;
};

const onResetGoogleAuth = async (record: User) => {
    userMerchant.value = record
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
                await api.post(`api/v1/bo/user/reset-pass/${userMerchant.value?.id}` , data)
                message.success('ทำรายการสำเร็จ')
                resetForm()
            } catch(e) {}
            loading.value = false
        }
    })
}

const deleteDataInSubfix = async (index: number) => {
    subfixs.value = subfixs.value.filter((i , inx) => index >= inx)
    await onLoadTable.value()
}

// เมื่อเลือกธนาคาร ให้อัพเดท bankCode
const onBankChange = (bankId: number) => {
  const selectedBank = banks.value.find((b) => b.id === bankId);
  if (selectedBank) {
    formState.bankCode = selectedBank.code;
  }
};

const getBankName = (bankCode: string) => {
  const bank = banks.value.find((b) => b.code === bankCode);
  return bank ? bank.nameTh : bankCode;
};

</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="header-content">
                    <div class="header-text">
                        <h1 class="header-title">Blacklist</h1>
                    </div>
                </div>
                <p class="mb-[16px]">ค้นหา</p>
                <a-row :gutter="[16, 16]">
                    <a-col :span="24">
                        <a-input
                            v-model:value="searchText"
                            placeholder="ค้นหาเลขบัญชี, ชื่อบัญชี หรือหมายเหตุ"
                            @pressEnter="onSearch"
                            :loading="loading"
                            style="max-width: 400px"
                        />
                    </a-col>
                    <a-col :span="24">
                        <a-space size="middle">
                            <a-button 
                                type="primary"
                                @click="onSearch" 
                                :loading="loading"
                                size="middle"
                                style="display: flex; align-items: center;"
                            >
                                <Icon icon="line-md:search" class="mr-1"></Icon>
                                ค้นหา
                            </a-button>
                            <a-button 
                                @click="onResetSearch" 
                                :loading="loading"
                                size="middle"
                                style="display: flex; align-items: center;"
                            >
                                <Icon icon="line-md:rotate-270" class="mr-1"></Icon>
                                รีเซ็ต
                            </a-button>
                        </a-space>
                    </a-col>
                </a-row>
            </a-card>
        </a-col>
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="float-right">
                    <a-space>
                        <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="openCreateModal" v-if="permissions.includes('blacklist.create')">
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
                    <template #bodyCell="{ column , index , text , record }">
                        <template v-if="column.key === 'id'">
                            {{ index + 1 }}
                        </template>
                        <template v-if="column.key === 'bankNumber'">
                            <div class="flex items-center gap-2">
                                {{ formatThaiBankAccount(text) }}
                                <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="text && onCopyText(text)" />
                            </div>
                        </template>
                        <template v-if="column.key === 'bankName'">
                            <div class="flex items-center gap-2">
                                {{ text }} <Icon icon="si:copy-duotone" class="cursor-pointer" width="16" height="16" @click="text && onCopyText(text)" />
                            </div>
                        </template>
                        <template v-if="column.key === 'bankCode'">
                            <div class="flex items-center gap-2">
                                <img v-if="record.bank?.img" :src="record.bank.img" :alt="record.bank.nameTh" class="h-[20px]" width="35" height="35"/>
                                <a-tag color="blue" style="margin-left: 15px;">{{ record.bank?.nameTh || '-' }}</a-tag>
                            </div>
                        </template>
                        <template v-if="column.key === 'note'">
                            {{ text || '-' }}
                        </template>
                        <template v-if="column.key === 'createdAt'">
                            {{ setFormatTime(text) }}
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-space>
                                <a-button 
                                    v-if="permissions.includes('blacklist.update')"
                                    class="px-0" 
                                    @click="onEdit(record)"
                                >
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="ep:edit-pen" width="14" height="14"></Icon> แก้ไข
                                    </div>
                                </a-button>
                                <a-popconfirm
                                    v-if="permissions.includes('blacklist.delete')"
                                    title="คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?"
                                    ok-text="ใช่"
                                    cancel-text="ไม่"
                                    @confirm="onDelete(record)"
                                >
                                    <a-button class="px-0" danger>
                                        <div class="flex gap-1 items-center text-xs">
                                            <Icon icon="ep:delete" width="14" height="14"></Icon> ลบ
                                        </div>
                                    </a-button>
                                </a-popconfirm>
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
            @finish="onFinish"
            :required-mark="false"
        >
            <a-form-item 
                label="เลขบัญชี" 
                :rules="[
                    { required: true, message: 'กรุณากรอกข้อมูล' } ,
                    { pattern: /^[0-9]{10,13}$/, message: 'กรุณากรอกเลขบัญชี 10-13 หลัก' },
                ]"
                name="bankNumber"
            >
                <a-input v-model:value="formState.bankNumber" placeholder="กรุณากรอกเลขบัญชี" />
            </a-form-item>
            
            <a-form-item 
                label="ชื่อบัญชี" 
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                name="bankName"
            >
                <a-input v-model:value="formState.bankName" placeholder="กรุณากรอกชื่อบัญชี" />
            </a-form-item>

            <a-form-item 
                label="ธนาคาร" 
                :rules="[{ required: true, message: 'กรุณาเลือกธนาคาร' }]"
                name="bankId"
            >
                <a-select
                    v-model:value="formState.bankId"
                    placeholder="กรุณาเลือกธนาคาร"
                    @change="onBankChange"
                >
                    <a-select-option
                        v-for="bank in banks"
                        :key="bank.id"
                        :value="bank.id"
                    >
                        <div class="flex items-center gap-2">
                            <img :src="bank.img" :alt="bank.nameTh" class="h-[20px]" width="30px"/>
                            {{ bank.nameTh }}
                        </div>
                    </a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item 
                label="หมายเหตุ" 
                name="note"
                :rules="[{ required: true, message: 'กรุณากรอกหมายเหตุ' }]"
            >
                <a-textarea v-model:value="formState.note" placeholder="กรุณากรอกหมายเหตุ" :rows="4" />
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
</template>

<style scoped>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}
</style>