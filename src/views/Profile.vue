<script setup lang="ts">
import api from "@/configs/api";
import { message } from "ant-design-vue";
import { reactive, ref } from "vue";

const loading = ref(false)

const tabActive = ref('password')

const defualtFormState = {
  oldPassword: '' ,
  newPassword: '' ,
  confirmPassword: ''
}

const formState = reactive({ ...defualtFormState })

const tabs = reactive([
  { title: 'รหัสผ่าน' , key: 'password' } ,
  // { title: 'ข้อมูลส่วนตัว' , key: 'information' } 
])

const resetForm = () => {
  Object.assign(formState , defualtFormState)
}

const onFinish = async (data: typeof formState) => {
  loading.value = true
  try {
    const response = await api.post('api/v1/bo/user/reset-pass', data)

    if (response?.data?.status) {
      message.success(response.data.msg || 'ทำรายการสำเร็จ')
      resetForm()
    } else {
      message.error(response.data.msg || 'ไม่สามารถเปลี่ยนรหัสผ่านได้')
    }
  } catch (e: any) {
    message.error(e?.response?.data?.msg || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
  } finally {
    loading.value = false
  }
}

const rules = {
  oldPassword: [
    { required: true, message: 'Please input old password', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: 'Please input new password', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        if (!value) return Promise.reject('Please input new password')
        if (value === formState.oldPassword) {
          return Promise.reject('New password must be different from old password')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: 'Please confirm new password', trigger: 'blur' },
    {
      validator: (rule: any, value: string) => {
        if (!value) return Promise.reject('Please confirm new password')
        if (value !== formState.newPassword) {
          return Promise.reject('Passwords do not match')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

</script>

<template>
  <a-row :gutter="[24 , 24]">
    <a-col :span="24">
        <a-card class="shadow-sm">
            <div class="header-content">
                <div class="header-text">
                    <h1 class="header-title">โปรไฟล์</h1>
                    <p class="header-text">จัดการข้อมูลส่วนตัว</p>
                </div>
            </div>
        </a-card>
    </a-col>
    <a-col :lg="6" :xs="24">
      <a-card title="ข้อมูล" class="shadow-sm">
        <ul class="tab-list">
          <li 
            v-for="item , index in tabs" 
            :key="index" 
            :class="{ 'active' : item.key === tabActive }"
            class="tab-item"
            @click="tabActive = item.key"
          >
            <span class="tab-icon">
              <svg v-if="item.key === 'password'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <span class="tab-text">{{ item.title }}</span>
          </li>
        </ul>
      </a-card>
    </a-col>
    <a-col :lg="18" :xs="24">
      <a-card title="ข้อมูลส่วนตัว" v-if="tabActive === 'information'">
        <p class="text-center">GG WP</p>
      </a-card>
      <a-card title="แก้ไขรหัสผ่าน" class="max-w-[500px] shadow-sm" v-else>
        <a-form
          :required-mark="false"
          layout="vertical" 
          name="basic" 
          autocomplete="off" 
          :rules="rules"
          :model="formState"
          @finish="onFinish"
        >
          <a-form-item 
            label="รหัสผ่านเดิม" 
            :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
            name="oldPassword"
          >
            <a-input-password v-model:value="formState.oldPassword" placeholder="กรออกรหัสผ่าน" />
          </a-form-item>
          <a-form-item 
            label="รหัสผ่านใหม่" 
            :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
            name="newPassword"
          >
            <a-input-password v-model:value="formState.newPassword" placeholder="กรออกรหัสผ่าน" />
          </a-form-item>
          <a-form-item 
            label="ยืนยันรหัสผ่าน" 
            :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
            name="confirmPassword"
          >
            <a-input-password v-model:value="formState.confirmPassword" placeholder="กรออกรหัสผ่าน" />
          </a-form-item>
          <a-button 
              :loading="loading"
              html-type="submit" 
              type="primary" 
              class="w-full mb-[0]"
          >
            ยืนยัน
          </a-button>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
</template>

<style scoped>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}

.tab-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.tab-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--gray-400);
    background: transparent;
    border: 1px solid transparent;
    position: relative;
    overflow: hidden;
}

.tab-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 0;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    transition: width 0.3s ease;
    border-radius: 10px 0 0 10px;
}

.tab-item:hover {
    color: var(--primary);
    background: rgba(20, 184, 166, 0.05);
    border-color: rgba(20, 184, 166, 0.2);
    transform: translateX(4px);
}

.tab-item:hover::before {
    width: 4px;
}

.tab-item.active {
    background: rgba(20, 184, 166, 0.1) !important;
    color: var(--primary) !important;
    border-color: var(--primary);
    border-left: 4px solid var(--primary);
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(20, 184, 166, 0.15);
}

.tab-item.active::before {
    width: 4px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
}

.tab-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.3s ease;
}

.tab-item:hover .tab-icon {
    transform: scale(1.1);
    color: var(--primary);
}

.tab-item.active .tab-icon {
    color: var(--primary);
    transform: scale(1.1);
}

.tab-text {
    flex: 1;
    font-size: 14px;
    transition: all 0.3s ease;
}

.tab-item.active .tab-text {
    font-weight: 600;
}
</style>