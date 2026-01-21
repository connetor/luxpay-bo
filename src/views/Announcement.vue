
<script setup lang="ts">
import { onMounted, reactive , ref } from "vue";
import api from "@/configs/api";
import type { Bank } from "@/interface/Modal";
import { message } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { PlusOutlined } from '@ant-design/icons-vue'

const loading = ref(false)
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

onMounted(async () => {
    await loadData()
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

const loadData = async () => {
    loading.value = true
    try {
        const res = await api.get('api/v1/bo/bank' ).then(res => res.data)
        banks.value = res.data
    } catch(e) {}
    loading.value = false
}

const columns = reactive([
    { title: '#' , width: '5%' , dataIndex: 'id' , key: 'id' , align: 'center'},
    { title: 'ธนาคาร' , width: '10%' , dataIndex: 'img' , key: 'img' , align: 'center' },
    { title: 'ชื่อ' , dataIndex: 'nameTh' , key: 'nameTh' },
    { title: 'รหัส' , dataIndex: 'code' , key: 'code' },
    { title: 'ตัวย่อ' , dataIndex: 'short' , key: 'short' },
    { title: 'จัดการ' , key: 'more' }
])

const resetForm = async () => {
    bank.value = null
    isEdit.value = false
    modal.value = false
    imageUrl.value = ''
    Object.assign(formState , defualtFormState)
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
        await loadData()
        message.success('ทำรายการสำเร็จ')
        resetForm();
    } catch(e) {}
    loading.value = false
}

</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-typography-title :level="2" style="margin-bottom: 6px;">ธนาคาร</a-typography-title>
            <p>ข้อมูลธนาคารทั้งหมด</p>
        </a-col>
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="float-right">
                    <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="modal = true">
                        <Icon icon="line-md:plus" class="mr-2"></Icon> สร้างรายการ
                    </a-button>
                </div>
                <a-table 
                    :columns="columns" 
                    :data-source="banks" 
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
                            <img :src="record.img" :alt="record.nameTh" class="h-[30px] block mx-auto" />
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
                    name="avatar"
                    list-type="picture-card"
                    :show-upload-list="false"
                    :before-upload="beforeUpload"
                    @change="handleChange"
                    class="upload-img"
                >
                    <img
                        v-if="imageUrl"
                        :src="imageUrl"
                        alt="avatar"
                        class="uploaded-image"
                    />
                    <div v-else>
                        <PlusOutlined />
                        <div class="mt-[8px] font-bold">Upload</div>
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
/* จำกัดขนาดของ upload container */
.upload-img :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
  border-radius: 8px !important;
}

.upload-img :deep(.ant-upload-select) {
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
  .upload-img :deep(.ant-upload),
  .upload-img :deep(.ant-upload-select) {
    height: 250px !important;
  }
}

@media (max-width: 480px) {
  .upload-img :deep(.ant-upload),
  .upload-img :deep(.ant-upload-select) {
    height: 200px !important;
  }
}
</style>