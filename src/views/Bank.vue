
<script setup lang="ts">
import { onMounted, reactive , ref } from "vue";
import api from "@/configs/api";
import type { Bank } from "@/interface/Modal";
import { message } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { useTable } from "@/composables/useTable";
import { useAuthStore } from "@/stores/auth";

const { onLoadTable , data , loading } = useTable<Bank>()

const { user } = useAuthStore()

const modal = ref(false)
const isEdit = ref(false)
const bank = ref<Bank | null>(null)
const banks = ref<Bank[]>([])
const imageUrl = ref<string | null>(null)

const defualtFormState = {
    nameTh: '' ,
    short: '' ,
    code: '' ,
    img: ''
}

const formState = reactive({ ...defualtFormState })
const permissions = user?.permissions ?? []

onMounted(async () => {
    await onLoadTable.value()
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
    formState.img = file
  }

  if (file) {
    reader.readAsDataURL(file)
  }
}

onLoadTable.value = async () => {
    loading.value = true
    try {
        const res = await api.get('api/v1/bo/bank').then(res => res.data)
        data.value = res.data
    } catch(e) {}
    loading.value = false
}

const columns = reactive([
    ...(permissions?.includes('bank.update') ? [
        { title: 'จัดการ', key: 'more' },
    ] : []),
    { title: 'ธนาคาร' , width: '10%' , dataIndex: 'img' , key: 'img' , align: 'center' },
    { title: 'ชื่อ' , dataIndex: 'nameTh' , key: 'nameTh' },
    { title: 'รหัส' , dataIndex: 'code' , key: 'code' },
    { title: 'ตัวย่อ' , dataIndex: 'short' , key: 'short' },
])

const resetForm = async () => {
    bank.value = null
    isEdit.value = false
    modal.value = false
    imageUrl.value = ''
    Object.assign(formState , defualtFormState)

    await onLoadTable.value()
}

const onEdit = async (data: Bank) => {
    loading.value = true
    try {
        const res = await api.get(`api/v1/bo/bank/${data.id}`).then(res => res.data)
        bank.value = res.data
        Object.assign(formState , res.data)
        imageUrl.value = res.data.img
        isEdit.value = true
        modal.value = true
    } catch(e) {}
    loading.value = false
}

const onFinish = async (data: typeof formState) => {
    loading.value = true
    const payload = {
        ...data ,
        image: formState.img
    }
    try {
        if(isEdit.value) {
            await api.post(`api/v1/bo/bank/${bank.value?.id}` , payload , {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        }
        else {
            await api.post('api/v1/bo/bank' , payload , {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
        }
        message.success('ทำรายการสำเร็จ')
        await resetForm();
    } catch(e) {}
    loading.value = false
}

</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">ธนาคาร</h1>
                    </div>
                </div>
                <div class="float-right">
                    <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="modal = true" v-if="permissions.includes('bank.create')">
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
                    <template #bodyCell="{ column , index , record }">
                        <template v-if="column.key === 'id'">
                            {{ index + 1 }}
                        </template>
                        <template v-if="column.key === 'img'">
                            <img :src="record.img" :alt="record.nameTh" class="h-[30px] block mx-auto" style="width: 35px;"/>
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-button class="px-0" @click="onEdit(record)">
                                <div class="flex gap-1 items-center text-xs">
                                    <Icon icon="ep:edit-pen" width="14" height="14"></Icon> แก้ไข
                                </div>
                            </a-button>
                        </template>
                    </template>
                </a-table>
            </a-card>
        </a-col>
    </a-row>

    <!-- CRUD  -->
    <a-modal 
        :open="modal" 
        :title="isEdit ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูล'" 
        @cancel="resetForm"
        :footer="null"
        width="400px"
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
                label="ชื่อธนาคาร" 
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                name="nameTh"
            >
                <a-input v-model:value="formState.nameTh" placeholder="กรุณากรออกชื่อธนาคาร" />
            </a-form-item>
            <a-form-item 
                label="รหัสธนาคาร" 
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                name="code"
            >
                <a-input v-model:value="formState.code" placeholder="กรุณากรอกรหัสธนาคาร" />
            </a-form-item>
            <a-form-item 
                label="อักษรย่อธนาคาร" 
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                name="short"
            >
                <a-input v-model:value="formState.short" placeholder="กรุณากรอกอักษรย่อธนาคาร" />
            </a-form-item>

            <a-divider orientation="left">อัพโหลดรูป</a-divider>

            <a-form-item 
                name="img" 
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
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
                    <div v-else >
                        <div class="flex items-center gap-2 flex-col opacity-[0.75] hover:opacity-[.90]">
                            <Icon icon="mdi-light:image" width="24" height="24" />
                            <div class="mt-[8px] font-bold text-xs">คลิกอัพโหลด หรือ ลากไฟล์มาวางที่นี่</div>
                            <div class="mt-[8px] font-bold text-xs">* ไฟล์รูปภาพมีขนาดไม่เกิน 3 MB *</div>
                        </div>
                    </div>
                </a-upload>
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
  padding: 20px;
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
</style>