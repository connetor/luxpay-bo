<script setup lang="ts">
import api from '@/configs/api';
import type { Transaction } from '@/interface/Modal'
import { message } from 'ant-design-vue';
import { ref } from 'vue'

const props = defineProps<{
  show: boolean
  transaction: Transaction
}>()

const emit = defineEmits(['update:show' , 'finish'])

const imageUrl = ref()
const fileImage = ref()
const loading = ref(false)

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
    fileImage.value = file
  }

  if (file) {
    reader.readAsDataURL(file)
  }
}

const resetForm = async () => {
    imageUrl.value = null
    fileImage.value = null
}

const onApprove = async () => {
    loading.value = true
    try {
        const payload = {
            image: fileImage.value
        }

        await api.post(`api/v1/bo/transaction/approve/${props.transaction?.id}` , payload , {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        message.success('ทำรายการสำเร็จ')
        resetForm()
        emit('finish')
    } catch(e) {}
    loading.value = false
}

</script>

<template>
    <a-modal 
        :title="`ฝากเงิน: ${transaction.bankName}`" 
        :open="show"  
        width="450px" 
        :footer="null" 
        @cancel="() => { emit('update:show', false); resetForm()}"
    >
        <a-upload
            name="slip"
            list-type="picture-card"
            :show-upload-list="false"
            :before-upload="beforeUpload"
            @change="handleChange"
            class="upload-img-bank"
            :disabled="loading"
        >
            <img
                v-if="imageUrl"
                :src="imageUrl"
                alt="avatar"
                class="uploaded-image"
            />
            <div v-else>
                <div class="flex items-center gap-2 flex-col opacity-[0.75] hover:opacity-[.90]">
                    <Icon icon="mdi-light:image" width="24" height="24" />
                    <div class="mt-[8px] font-bold text-xs">คลิกอัพโหลด หรือ ลากไฟล์มาวางที่นี่</div>
                    <div class="mt-[8px] font-bold text-xs">* ไฟล์รูปภาพมีขนาดไม่เกิน 3 MB *</div>
                </div>
            </div>
        </a-upload>
        <a-button type="primary" :loading="loading" class="w-full" style="margin-top: 20px;" @click="onApprove">
            อัพโหลด
        </a-button>

    </a-modal>
</template>

<style scoped>
/* จำกัดขนาดของ upload container */
.upload-img-bank :deep(.ant-upload) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  overflow: hidden !important;
  border-radius: 8px !important;
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