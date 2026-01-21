<script setup lang="ts">
import type { Transaction } from '@/interface/Modal'
import { ref } from 'vue'
import { formatThaiBankAccount, setFormatTime } from '@/utils';
import { message } from 'ant-design-vue';
import html2canvas from 'html2canvas';
import { Icon } from '@iconify/vue';

defineProps<{
  show: boolean
  transaction: Transaction
}>()

const emit = defineEmits(['update:show'])

const qrcodeCanvasRef = ref<HTMLCanvasElement | null>(null)

const dowloadChange = async () => {
    try {
        if(qrcodeCanvasRef.value) {
            const canvas = await html2canvas(qrcodeCanvasRef.value)
            const link = document.createElement('a')
            link.download = 'capture.png'
            link.href = canvas.toDataURL('image/png')
            link.click()
            
            message.success('ดาวน์โหลดสำเร็จ')
        }
    } catch(e) {
        message.error('ดาวน์โหลดไม่สำเร็จ')
    }
}
</script>

<template>
    <a-modal 
        :title="`ฝากเงิน: ${transaction.bankName}`" 
        :open="show"  
        :width="520"
        :footer="null" 
        @cancel="emit('update:show', false)"
        class="qr-payin-modal"
        :wrap-class-name="'qr-payin-modal-wrap'"
    >
        <div ref="qrcodeCanvasRef" class="qr-payin-container">
            <!-- Header Banner -->
            <div class="qr-header">
                <div class="qr-logo">
                    <div class="logo-icon">QR</div>
                </div>
                <div class="qr-title">THAI QR PAYMENT</div>
            </div>
            
            <!-- QR Code Section -->
            <div class="qr-content">
                <div class="qr-code-wrapper">
                    <div class="qr-code-container">
                        <a-qrcode v-if="transaction.qrcode" :value="transaction.qrcode" :size="280" class="qr-code" />
                    </div>
                    <div class="qr-overlay-text">
                        ใช้สำหรับเติมเครดิตเท่านั้น
                    </div>
                </div>
                
                <!-- Payment Details -->
                <div class="payment-details">
                    <div class="bank-info">
                        <div class="bank-name">{{ transaction.bank.name }}</div>
                        <div class="account-name">{{ transaction.bankName }}</div>
                        <div class="account-number">{{ transaction.bankNumber ? formatThaiBankAccount(transaction.bankNumber) : '-' }}</div>
                        <div class="amount">{{ transaction.depositAmount }} THB</div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="warning-section">
                        <div class="warning-text">
                            โปรดใช้บัญชีที่ได้แจ้งไว้เท่านั้นในการสแกนชำระ หากไม่ตรงตามข้อมูลที่ระบุ เงินจะไม่เข้าระบบ
                        </div>
                        <div class="deadline-text">
                            โปรดชำระก่อน {{ setFormatTime(transaction.expiredAt) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <a-button 
            type="primary" 
            class="download-btn" 
            @click="dowloadChange"
        >
            <Icon icon="mdi:download" class="mr-2" />
            ดาวน์โหลด
        </a-button>
    </a-modal>
</template>

<style scoped>
.qr-payin-modal {
  background: #ffffff !important;
}

/* Modal responsive */
:deep(.qr-payin-modal-wrap .ant-modal) {
  max-width: 520px;
  width: 100% !important;
}

:deep(.qr-payin-modal-wrap .ant-modal-content) {
  padding: 0;
}

.qr-payin-container {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--gray-200);
}

.qr-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.qr-logo {
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon {
  color: #1e3a8a;
  font-weight: bold;
  font-size: 14px;
}

.qr-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.qr-content {
  padding: 24px;
  background: #ffffff;
}

.qr-code-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  background: #ffffff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
}

.qr-code-container {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.qr-code {
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
  max-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-code :deep(canvas),
.qr-code :deep(img),
.qr-code :deep(svg) {
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.qr-overlay-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.15);
  color: var(--gray-800);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  pointer-events: none;
  user-select: none;
  backdrop-filter: blur(2px);
  opacity: 0.7;
  white-space: nowrap;
}

.payment-details {
  text-align: center;
}

.bank-info {
  margin-bottom: 20px;
}

.bank-name {
  color: var(--gray-800);
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.account-name {
  color: var(--gray-800);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.account-number {
  color: var(--gray-800);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.amount {
  color: #14b8a6;
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 16px;
}

.divider {
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #6b7280 50%, transparent 100%);
  margin: 20px 0;
}

.warning-section {
  color: var(--gray-800);
}

.warning-text {
  color: #f87171;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
  font-weight: 500;
}

.deadline-text {
  color: #14b8a6;
  font-size: 16px;
  font-weight: 700;
}

.download-btn {
  width: 100%;
  margin-top: 20px;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.download-btn:hover {
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4);
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  :deep(.qr-payin-modal-wrap .ant-modal) {
    max-width: 95vw;
    margin: 10px auto;
  }

  .qr-header {
    padding: 12px 16px;
  }

  .qr-title {
    font-size: 16px;
  }

  .qr-content {
    padding: 16px;
  }

  .qr-code-wrapper {
    padding: 16px;
  }

  .qr-code-container {
    max-width: 240px;
  }

  .qr-overlay-text {
    font-size: 12px;
    padding: 6px 12px;
  }

  .bank-name {
    font-size: 18px;
  }

  .account-name,
  .account-number {
    font-size: 14px;
  }

  .amount {
    font-size: 20px;
  }

  .warning-text {
    font-size: 13px;
  }

  .deadline-text {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  :deep(.qr-payin-modal-wrap .ant-modal) {
    max-width: 100vw;
    margin: 0;
    top: 0;
    padding-bottom: 0;
  }

  .qr-header {
    padding: 10px 12px;
  }

  .qr-logo {
    width: 32px;
    height: 32px;
  }

  .logo-icon {
    font-size: 12px;
  }

  .qr-title {
    font-size: 14px;
    letter-spacing: 0.5px;
  }

  .qr-content {
    padding: 12px;
  }

  .qr-code-wrapper {
    padding: 12px;
    margin-bottom: 16px;
  }

  .qr-code-container {
    max-width: 200px;
  }

  .qr-overlay-text {
    font-size: 11px;
    padding: 4px 8px;
  }

  .bank-name {
    font-size: 16px;
  }

  .account-name,
  .account-number {
    font-size: 13px;
  }

  .amount {
    font-size: 18px;
  }

  .warning-text {
    font-size: 12px;
  }

  .deadline-text {
    font-size: 13px;
  }

  .download-btn {
    height: 44px;
    font-size: 14px;
  }
}
</style>