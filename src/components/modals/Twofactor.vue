<script setup lang="ts">
import { message } from 'ant-design-vue';
import { ref, computed, onMounted } from 'vue';

defineProps({
    code: String ,
    show: Boolean ,
    name: String
})

const qrcodeCanvasRef = ref()

const emit = defineEmits(['update:show'])

const qrSize = ref(300);

onMounted(() => {
  const updateQrSize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 400) {
      qrSize.value = 200;
    } else if (screenWidth < 600) {
      qrSize.value = 250;
    } else {
      qrSize.value = 300;
    }
  };

  updateQrSize();

  window.addEventListener('resize', updateQrSize);

});

const dowloadChange = async () => {
    try {
        const url = await qrcodeCanvasRef.value.toDataURL();
        const a = document.createElement('a');
        a.download = 'QRCode.png';
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        message.success('ดาวน์โหลดสำเร็จ')
    } catch(e) {
        message.error('ดาวน์โหลดไม่สำเร็จ')
    }
}
</script>

<template>
    <a-modal 
        :open="show" 
        title="Google two factor" 
        :footer="null"
        @cancel="emit('update:show', false)"
    >
        <a-card class="shadow-sm mb-5">

            <div class="flex justify-center">
                <div class="qr-code-wrapper">
                    <a-qrcode ref="qrcodeCanvasRef" :value="code" :size="qrSize" />
                </div>
            </div>

            <a-typography-title class="text-center" :level="4" style="margin: 24px 0px;">{{ name }}</a-typography-title>
            
            <p class="text-center text-red-500" style="margin-top: 20px;">กรุณาบันทึกและเก็บรักษา QR Code นี้ไว้ เพื่อใช้ในการเปิดใช้งานการยืนยันตัวตนสองขั้นตอน (2FA) ในภายหลัง</p>
        </a-card>

        <a-button type="primary" class="w-full" style="margin-top: 20px;" @click="dowloadChange">
            ดาวน์โหลด
        </a-button>
        
    </a-modal>
</template>

<style scoped>
.qr-code-wrapper {
    background: #ffffff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>