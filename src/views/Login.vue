<script setup lang="ts">
import { reactive, ref, nextTick } from 'vue';
import { useAuthStore } from '@/stores/auth'
import pkg from '../../package.json'
import { useInitStore } from '@/stores/init'
import { message } from 'ant-design-vue';
import Lange from '@/components/Lange.vue';

const { login } = useAuthStore()

const loading = ref(false)

const version = (() => {
  // Extract version numbers
  const [major, minor, patch] = pkg.version.split('.').map(Number);
  // Decrease patch by 2, but not below 0
  const newPatch = Math.max(0, patch - 2);
  const newMinor = Math.max(0, minor + 2);
  const newMajor = Math.max(0, major + 1);
  return [newMajor, newMinor, newPatch].join('.');
})();

const isStg = import.meta.env.MODE === 'development'

const formState = reactive({
  username: '',
  password: '',
  secret: ''
})

const modals = reactive({
  secret: false
})

const length = 6
const inputs = ref<any[]>([])
const digits = ref(Array(length).fill(""))

function focusInput(index: number) {
  nextTick(() => {
    const input = inputs.value[index]
    if (input) {
      // Ant Design Vue input component - ลองเข้าถึง input element ในหลายวิธี
      let inputEl: HTMLInputElement | null = null
      
      if (input.$el) {
        // Vue 3 component instance
        inputEl = input.$el.querySelector?.('input') || input.$el
      } else if (input.input) {
        // Ant Design component's input ref
        inputEl = input.input
      } else if (input instanceof HTMLInputElement) {
        // Direct HTMLInputElement
        inputEl = input
      } else if (input.querySelector) {
        // Element with querySelector
        inputEl = input.querySelector('input')
      }
      
      if (inputEl && typeof inputEl.focus === 'function') {
        inputEl.focus()
      }
    }
  })
}

function onInput(index: number, e: Event) {
  const input = e.target as HTMLInputElement
  const value = input.value.replace(/\D/g, "") // รับแค่ตัวเลข

  digits.value[index] = value.slice(-1) // เก็บแค่ 1 หลัก

  if (value && index < length - 1) {
    focusInput(index + 1) // focus ช่องถัดไป
  }
}

function onKeyPress(e: KeyboardEvent) {
  // ป้องกันการกดตัวอักษรและอักขระพิเศษ
  const char = String.fromCharCode(e.which || e.keyCode)
  if (!/[0-9]/.test(char)) {
    e.preventDefault()
  }
}

async function onPaste(e: ClipboardEvent, startIndex: number) {
  e.preventDefault()
  const pastedData = e.clipboardData?.getData('text') || ''
  const numbers = pastedData.replace(/\D/g, '').slice(0, length)
  
  // เติมตัวเลขในแต่ละช่อง
  for (let i = 0; i < numbers.length && (startIndex + i) < length; i++) {
    digits.value[startIndex + i] = numbers[i]
  }
  
  // focus ไปที่ช่องถัดไป
  const nextIndex = Math.min(startIndex + numbers.length, length - 1)
  focusInput(nextIndex)
}

function onBackspace(index: number, e: KeyboardEvent) {
  if (!digits.value[index] && index > 0) {
    focusInput(index - 1)
  }
}

const initStore = useInitStore()

const onFinish = async () => {
  // เปิด modal สำหรับ version 1 และ 2
  modals.secret = true
  // focus ช่องแรกหลังจาก modal เปิด
  await nextTick()
  focusInput(0)
}

const onLogin = async () => {
  loading.value = true

  const secretValue = digits.value.join('')
  if (secretValue.length == 6) {
    const loginData = { ...formState, secret: secretValue }
    await login(loginData)
  } else {
    message.warning('กรุณากรอกตัวเลข 6 หลัก')
    loading.value = false
    return
  }

  loading.value = false
}

const appTitle = import.meta.env.VITE_APP_TITLE
const getLogoPath = () => {
  const logoMap: Record<string, string> = {
    ZPAY: '/logo/logo_zpay_main.png',
    MPAY: '/logo/logo_mpay_main.png',
    PAYDIWA: '/logo/logo_paydiwa_main.png',
  }
  return logoMap[appTitle] || '/logo/logo_fp_main.png'
}

const resetSecret = () => {
  digits.value = Array(length).fill("")
  modals.secret = false
}

</script>

<template>
  <div class="login-container">
    <div class="login-background">
      <div class="login-card">
        <!-- Logo Section -->
        <div class="logo-section">
          <div v-if="initStore.version == 2" class="logo-container">
            <img :src="getLogoPath()" alt="OrderPay Logo" class="logo-image">
          </div>
          <div class="welcome-text">
            <h1 class="welcome-title">เข้าสู่ระบบ</h1>
            <p class="welcome-subtitle">กรุณากรอกข้อมูลของคุณเพื่อดำเนินการต่อ</p>
          </div>
        </div>

        <!-- Form Section -->
        <div class="form-section">
          <a-form :required-mark="false" layout="vertical" name="basic" autocomplete="off" :model="formState"
            @finish="onFinish" class="login-form">
            <a-form-item label="ชื่อผู้ใช้" :rules="[
              { required: true, message: 'กรุณากรอกข้อมูล' },
              {
                pattern: /^[a-zA-Z0-9_@]+$/,
                message: 'มีได้แค่ตัวอักษร a-z, A-Z, 0-9 และ _ เท่านั้น',
                trigger: 'blur'
              },
            ]" name="username">
              <a-input v-model:value="formState.username" placeholder="กรอกชื่อผู้ใช้" class="form-input"
                size="large" />
            </a-form-item>

            <a-form-item label="รหัสผ่าน" :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]" name="password">
              <a-input-password v-model:value="formState.password" placeholder="กรออกรหัสผ่าน" class="form-input"
                size="large" />
            </a-form-item>

            <a-form-item class="submit-section">
              <div style="text-align: center;">
                <a-button :loading="loading" html-type="submit" type="primary" class="login-button" size="large">
                  เข้าสู่ระบบ
                </a-button>
              </div>
            </a-form-item>
            
          </a-form>
        </div>
      </div>
    </div>
  </div>

  <!-- Two-Factor Authentication Modal -->
  <a-modal title="ยืนยันตัวตนด้วยรหัส 2FA" width="400px" centered @cancel="resetSecret" v-model:open="modals.secret"
    :footer="null" class="twofa-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">ยืนยันตัวตนด้วยรหัส 2FA</h3>
        <p class="modal-subtitle">กรอกตัวเลข 6 หลักที่ได้รับจากแอปพลิเคชัน</p>
      </div>

      <a-form :required-mark="false" layout="vertical" name="twofa" autocomplete="off" :model="formState"
        @finish="onLogin" class="twofa-form">
        <a-form-item class="otp-section">
          <div class="otp-inputs">
            <a-input 
              v-for="(digit, idx) in 6" 
              :key="idx" 
              :maxlength="1" 
              class="otp-input" 
              type="tel"
              inputmode="numeric" 
              pattern="[0-9]*" 
              :ref="(el: any) => { if (el) inputs[idx] = el }" 
              v-model:value="digits[idx]"
              @input="onInput(idx, $event)" 
              @keydown.backspace="onBackspace(idx, $event)"
              @keypress="onKeyPress"
              @paste="onPaste($event, idx)"
              required 
            />
          </div>
        </a-form-item>

        <a-form-item class="modal-submit-section">
          <a-button class="modal-button" :loading="loading" type="primary" html-type="submit" size="large">
            ยืนยัน
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>

<style scoped>
/* Login Container with Teal Gradient Background */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 50%, #0F766E 100%);
  position: relative;
  overflow: hidden;
}

/* Pulse Animation Background */
.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.login-background {
  width: 100%;
  max-width: 450px;
  position: relative;
  z-index: 1;
}

/* Glassmorphism Card */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3) inset;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;
  color: #1f2937;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #14B8A6 0%, #0D9488 100%);
}

/* Logo Section */
.logo-section { 
  text-align: center; 
  margin-bottom: 32px; 
}

.logo-container { 
  margin-bottom: 24px; 
}

.logo-image { 
  width: 120px; 
  height: auto; 
  border-radius: 12px; 
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25); 
}

.welcome-text { 
  margin-bottom: 8px; 
}

.welcome-title { 
  font-size: 28px; 
  font-weight: 700; 
  margin: 0 0 8px 0; 
  color: #0D9488; 
}

.welcome-subtitle { 
  font-size: 16px; 
  color: #6b7280; 
  margin: 0; 
  font-weight: 500; 
}

/* Form Section */
.form-section { 
  margin-top: 8px; 
}

.login-form { 
  width: 100%; 
}

.form-input {
  border-radius: 12px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
  font-size: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
}

.form-input::placeholder { 
  color: #9ca3af; 
}

.form-input:hover { 
  border-color: #14B8A6; 
}

.form-input:focus { 
  border-color: #14B8A6; 
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15); 
}

/* Labels */
:deep(.ant-form-item-label > label) { 
  font-weight: 600; 
  color: #374151; 
  font-size: 14px; 
}

/* Submit Button */
.submit-section { 
  margin-top: 24px; 
  margin-bottom: 0; 
}

.login-button {
  width: 100%; 
  height: 48px; 
  border-radius: 12px; 
  border: none; 
  font-size: 16px; 
  font-weight: 600;
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
  transition: all 0.3s ease;
}

.login-button:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 8px 20px rgba(20, 184, 166, 0.4); 
  background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
}

.login-button:active { 
  transform: translateY(0); 
}

.version-text {
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  margin-top: 12px;
  margin-bottom: 0;
}

.forgot-password-text {
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  margin-top: 12px;
  margin-bottom: 0;
}

.language-section {
  margin-top: 16px;
  text-align: center;
}

/* Two-Factor Modal */
.twofa-modal :deep(.ant-modal-content) { 
  border-radius: 16px; 
  overflow: hidden; 
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.twofa-modal :deep(.ant-modal-header) { 
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(209, 213, 219, 0.5); 
}

.twofa-modal :deep(.ant-modal-title) { 
  color: #1f2937; 
}

.twofa-modal :deep(.ant-modal-close) { 
  color: #6b7280; 
}

.twofa-modal :deep(.ant-modal-close:hover) { 
  color: #14B8A6; 
}

.modal-content { 
  padding: 8px; 
  color: #1f2937; 
}

.modal-header { 
  text-align: center; 
  margin-bottom: 24px; 
}

.modal-title { 
  font-size: 20px; 
  font-weight: 700; 
  color: #0D9488; 
  margin: 0 0 8px 0; 
}

.modal-subtitle { 
  font-size: 14px; 
  color: #6b7280; 
  margin: 0; 
}

.twofa-form { 
  width: 100%; 
}

.otp-section { 
  margin-bottom: 24px; 
}

.otp-inputs { 
  display: flex; 
  gap: 12px; 
  justify-content: center; 
  margin: 16px 0; 
}

.otp-input { 
  width: 48px; 
  height: 48px; 
  text-align: center; 
  font-size: 18px; 
  font-weight: 600; 
  border-radius: 12px; 
  border: 1px solid #d1d5db; 
  background: rgba(255, 255, 255, 0.9); 
  color: #1f2937; 
  transition: all 0.3s ease; 
}

.otp-input:hover { 
  border-color: #14B8A6; 
}

.otp-input:focus { 
  border-color: #14B8A6; 
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15); 
}

.modal-submit-section { 
  margin-bottom: 0; 
}

.modal-button { 
  width: 100%; 
  height: 44px; 
  border-radius: 12px; 
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%); 
  border: none; 
  font-size: 16px; 
  font-weight: 600; 
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3); 
  color: #ffffff; 
  transition: all 0.3s ease;
}

.modal-button:hover { 
  transform: translateY(-2px); 
  box-shadow: 0 8px 20px rgba(20, 184, 166, 0.4); 
  background: linear-gradient(135deg, #0D9488 0%, #0F766E 100%);
}

/* Responsive */
@media (max-width: 768px) {
  .login-container { 
    padding: 16px; 
  }
  
  .login-card { 
    padding: 24px; 
    border-radius: 20px; 
  }
  
  .welcome-title { 
    font-size: 24px; 
  }
  
  .welcome-subtitle { 
    font-size: 14px; 
  }
  
  .logo-image { 
    width: 100px; 
  }
  
  .otp-inputs { 
    gap: 8px; 
  }
  
  .otp-input { 
    width: 40px; 
    height: 40px; 
    font-size: 16px; 
  }
}

@media (max-width: 480px) {
  .login-card { 
    padding: 20px; 
    border-radius: 16px;
  }
  
  .welcome-title { 
    font-size: 22px; 
  }
  
  .form-input { 
    font-size: 14px; 
    padding: 10px 14px; 
  }
  
  .login-button { 
    height: 44px; 
    font-size: 14px; 
  }
  
  .modal-title {
    font-size: 18px;
  }
  
  .modal-subtitle {
    font-size: 13px;
  }
}
</style>
