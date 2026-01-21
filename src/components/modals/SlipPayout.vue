<script setup lang="ts">
import type { Transaction } from '@/interface/Modal'
import { onMounted, ref, watch, nextTick } from 'vue'
import Slip from '@/assets/slip.png'
import { formatThaiBankAccount, setFormatTimeThai } from '@/utils';
import { message } from 'ant-design-vue';
import { useEvent } from '@/composables/useEvent';

const props = defineProps<{
  show: boolean
  transaction: Transaction
}>()

const emit = defineEmits(['update:show'])

const { onDownLoadImage } = useEvent()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const slipImage = ref<string | null>(null)

const generateSlip = async () => {
    // console.log('init image payout');
    
    const canvas = canvasRef.value

    // console.log('canvas' , canvas);

    if(canvas) {
        const ctx = canvas.getContext('2d')

        if(ctx) {
            const background = new Image()
            background.src = Slip // <- ใส่ path ที่ถูกต้อง (เช่น public หรือ import)

            background.onload = async () => {
                // วาดภาพพื้นหลัง
                ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

                // ตั้งค่าฟอนต์และสี
                ctx.font = '24px IBM Plex Sans Thai'
                ctx.fillStyle = '#888'
                ctx.textBaseline = 'middle'
                ctx.textAlign = 'center'

                // วาดข้อความลงไป
                ctx.fillText(setFormatTimeThai(props.transaction.createdAt), canvas.width / 2, 280)
                ctx.fillText(`รหัสอ้างอิง: ${props.transaction.transactionId}`, canvas.width / 2, 320)
                
                ctx.font = 'bold 28px IBM Plex Sans Thai'
                ctx.textAlign = 'right'
                ctx.fillStyle = '#000'
                ctx.fillText(props.transaction.merchant.name , canvas.width - 40, 430)

                ctx.font = '24px IBM Plex Sans Thai'
                ctx.fillStyle = '#888'
                ctx.fillText(`รหัสร้านค้า: ${props.transaction.merchant.prefix}`, canvas.width - 40, 465)
                ctx.fillText(`รหัสอ้างอิง: ${props.transaction.reference}`, canvas.width - 40, 500)

                ctx.fillStyle = '#000'
                ctx.fillText(props.transaction.bankName, canvas.width - 40, 665)
                ctx.fillText(props.transaction.bank.name, canvas.width - 40, 700)
                ctx.fillText(formatThaiBankAccount(props.transaction.bankNumber), canvas.width - 40, 735)

                ctx.font = '24px IBM Plex Sans Thai'
                ctx.fillText(`${props.transaction.amount}`, canvas.width - 40, 865)

                ctx.textAlign = 'left'
                ctx.font = 'bold 24px IBM Plex Sans Thai'
                // เว้นที่ด้านขวา 60px สำหรับ QR code
                ctx.fillText('ผู้รับเงินสามารถแสกนคิวอาร์โค้ดนี้เพื่อ', 40, 1000)
                ctx.fillText('ติดต่อสอบถามแอดมิน', 40, 1035)

                // export canvas เป็นรูป
                slipImage.value = canvas.toDataURL('image/png')
                
                // console.log('init finish');
                
            }
        }
    }
}

onMounted(async () => {
    await nextTick()
    if(canvasRef.value && props.transaction) {
        generateSlip()
    }
})

watch(() => props.show , async (current) => {
    if(current) {
        await nextTick()
        generateSlip()
    }
})
</script>

<template>
    <a-modal 
        :title="`ถอนเงิน: ${transaction.bankName}`" 
        :open="show"  
        width="500px" 
        :footer="null" 
        @cancel="emit('update:show', false)"
    >
        <canvas ref="canvasRef" width="720" height="1280" style="display: none;"></canvas>

        <img :src="slipImage" v-if="slipImage" style="width: 350px !important; max-width: 350px !important; height: auto !important; display: block !important; margin: 16px auto !important;" />

        <div class="mt-4 text-center">
            <a-button 
                type="primary" 
                @click="onDownLoadImage(transaction.transactionId , slipImage)"
                class="w-full"
                block
            >
                ดาวน์โหลด
            </a-button>
        </div>

    </a-modal>
</template>