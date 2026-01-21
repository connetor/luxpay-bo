<script setup lang="ts">
import { createVNode, onMounted, reactive, ref } from "vue";
import { useEvent } from '@/composables/useEvent'
import api from '@/configs/api';
import DocPostCreatePayin from '@/components/documents/PostCreatePayin.vue'
import DocPostCreatePayout from '@/components/documents/PostCreatePayout.vue'
import DocGetTransaction from '@/components/documents/GetTransaction.vue'
import DocPostBalance from '@/components/documents/PostBalance.vue'
import DocSignatrue from '@/components/documents/Signatrue.vue'
import DocBank from '@/components/documents/GetBank.vue'

import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { Icon } from "@iconify/vue";
import { useAuthStore } from '@/stores/auth';
import { useInitStore } from "@/stores/init";

const loading = ref(false)
const checked = ref(false)
const isDisabled = ref(true)

const merchant = reactive({
  base_url: '' ,
  api_key: '' ,
  secret_key: ''
})

const options = reactive([
  'สอท' ,
  'ปอท' ,
  'กองปราบ' ,
  'ปอศ' ,
  'ท่องเที่ยว' ,
  'ไม่ได้เคลียร์' ,
  'ภาค 1' ,
  'ภาค 2' ,
  'ภาค 3' ,
  'ภาค 4' ,
  'ภาค 5' ,
  'ภาค 6' ,
  'ภาค 7' ,
  'ภาค 8' ,
  'ภาค 9' ,
  'อื่นๆ' 
])

const { user , me } = useAuthStore() 

const modal = ref(false)

const formStateVerify = reactive({
  website: null ,
  agencyPolice: null ,
  contact: null ,
  other: null
})

const onVerify = async (data: typeof formStateVerify) => {
  loading.value = true 
  try {
    if(data.agencyPolice === 'อื่นๆ') data.agencyPolice = data.other

    await api.post('api/v1/bo/merchant/set/website' , data)
    message.success('ทำรายการสำเร็จ')
    await me()
    modal.value = false
  } catch(e) {}
  loading.value = false
}

const baseUrl = ref(import.meta.env.VITE_API_BASE_URL)

const ips = ref<string[]>([])

const tabActive = ref('information')
const tabs = reactive([
  { title: 'ข้อมูล' , key: 'information' } ,
  // { title: 'เอกสาร' , key: 'document' }
])

const initStore = useInitStore()

const { onCopyText } = useEvent()

const columns = reactive([
  { title: '#' , width: '5%' , dataIndex: 'index' , key: 'index' } ,
  { title: 'ข้อมูล' , dataIndex: 'ip' , key: 'ip' } ,
])

const loadData = async () => {
  loading.value = true
  try {
    const res = await api.get('api/v1/bo/merchant/list/ip').then(res => res.data)
    Object.assign(merchant , res.data)
    ips.value = res.data.ips
  } catch(e) {}
  loading.value = false
}

const onRevoke = async () => {
  Modal.confirm({
    title: 'ยืนยันการทำรายการ' ,
    icon: createVNode(ExclamationCircleOutlined),
    content: createVNode('div', { style: 'color:var(--gray-800);' }, 'ต้องการเปลี่ยน Api Key ใช่หรือไม่ ?'),
    async onOk() {
      loading.value = true
      try {
        const res = await api.post('api/v1/bo/merchant/reset/api-key').then(res => res.data)
        merchant.api_key = res.data.api_key
        message.success('ทำรายการสำเร็จ')
      } catch(e) {}
      loading.value = false
    }
  })
}

const onDelete = async (index: number) => {
  ips.value = ips.value.filter((i , inx) => index !== inx)
  isDisabled.value = false
}

const onSubmit = async () => {
  loading.value = true
  try {
    await api.post('api/v1/bo/merchant/set/ips' , { ips: ips.value })
    message.success('ทำรายการสำเร็จ')
  } catch(e) {}
  loading.value = false
}

onMounted(async () => {
  await loadData()
  if(!user?.merchant.website) {
    modal.value = true
  }
})

</script>

<template>
  <a-row :gutter="[24 , 24]">
    <a-col :span="24">
        <a-card class="shadow-sm">
            <div class="header-content">
                <div class="header-text">
                    <h1 class="header-title">API Key</h1>
                    <p class="header-text">ข้อมูลสำหรับนักพัฒนา (API)</p>
                </div>
            </div>
        </a-card>
    </a-col>
    <a-col :lg="6" :xs="24">
      <a-card title="API Key" class="shadow-sm">
        <ul style="margin-bottom: 0px;" class="tab-list">
          <li 
            v-for="item , index in tabs" 
            :key="index" 
            :class="{ 'active' : item.key === tabActive }"
            class="tab-item"
            style="padding: 15px;"
            @click="tabActive = item.key"
          >
            {{ item.title }}
          </li>
        </ul>
      </a-card>
    </a-col>
    <a-col :lg="18" :xs="24">
      <a-card title="ข้อมูลสำหรับใช้ API" v-if="tabActive === 'information'" class="shadow-sm">
        <a-row :gutter="[24 , 24]">
          <a-col span="24">
            <p style="color: var(--gray-800) !important;">API Endpoint</p>
            <a-input-group compact>
              <a-input :value="baseUrl" readonly style="background: #ffffff !important; color: var(--gray-800) !important; border: 1px solid var(--gray-300) !important;">
                <template #suffix>
                    <a-button @click="onCopyText(baseUrl)" size="small" style="background: var(--gray-100) !important; color: var(--gray-800) !important; border: 1px solid var(--gray-300) !important;">
                      <Icon icon="solar:clipboard-broken" width="18" height="18"></Icon>
                    </a-button>
                </template>
              </a-input>
            </a-input-group>
          </a-col>
          <a-col span="24">
            <p style="color: var(--gray-800) !important;">Secret Key</p>
            <a-input-group compact>
              <a-input :value="merchant.secret_key" readonly style="background: #ffffff !important; color: var(--gray-800) !important; border: 1px solid var(--gray-300) !important;">
                <template #suffix>
                    <a-button @click="onCopyText(merchant.secret_key)" size="small" style="background: var(--gray-100) !important; color: var(--gray-800) !important; border: 1px solid var(--gray-300) !important;">
                      <Icon icon="solar:clipboard-broken" width="18" height="18"></Icon>
                    </a-button>
                </template>
              </a-input>
            </a-input-group>
          </a-col>
          <a-col span="24">
            <p style="color: var(--gray-800) !important;">API Key</p>
            <a-input-group compact>
              <a-input :value="merchant.api_key" readonly style="background: #ffffff !important; color: var(--gray-800) !important; border: 1px solid var(--gray-300) !important;">
                <template #suffix>
                    <a-button @click="onCopyText(merchant.api_key)" size="small" style="background: var(--gray-100) !important; color: var(--gray-800) !important; border: 1px solid var(--gray-300) !important;">
                      <Icon icon="solar:clipboard-broken" width="18" height="18"></Icon>
                    </a-button>
                </template>
              </a-input>
            </a-input-group>
            <a-button 
              :loading="loading" 
              size="small" 
              style="margin-top: 5px; display: flex;align-items: center;font-size: 12px; background: var(--gray-100) !important; color: var(--gray-800) !important; border: 1px solid var(--gray-300) !important;"
              @click="onRevoke"
            >
              <Icon :icon="loading ? 'svg-spinners:270-ring' : 'famicons:reload'" class="mr-2"></Icon> Revoke Api Key
            </a-button>
          </a-col>
          <a-col :span="24">
            <a-divider orientation="left">Whitelist IP</a-divider>
          </a-col>
          <a-col :span="24">
            <a-table 
              :columns="columns" 
              :data-source="ips" 
              :loading="loading"             
              :pagination="false"
            >
              <template #bodyCell="{ column , index }">
                <template v-if="column.key === 'index'">
                    {{ index + 1 }}
                  </template>
                  <template v-if="column.key === 'ip'">
                    <div class="flex gap-2">
                      <a-input class="w-full" v-model:value="ips[index]" placeholder="กรอกข้อมูลค้นหา" style="background: #ffffff !important; color: var(--gray-800) !important; border: 1px solid var(--gray-300) !important;" />
                      <a-button danger @click="onDelete(index)" width="50" style="background: #dc2626 !important; color: #ffffff !important; border: 1px solid #dc2626 !important;">
                        ลบ
                      </a-button>
                    </div>
                  </template>
              </template>
            </a-table> 
            <a-typography-text style="font-size: 12px;" type="warning" v-if="ips.length == 0">คุณอนุญาตให้ทุก IP เข้าถึง API ของคุณ</a-typography-text>
          </a-col>
          <a-col :span="24">
            <div class="flex justify-between">
              <a-button @click="() => { ips.push(''); isDisabled = false }">
                เพิ่ม
              </a-button>
              <a-button type="primary" @click="onSubmit" :disabled="isDisabled">
                <div class="flex gap-2 items-center">
                  <Icon icon="fa6-regular:floppy-disk" width="18" height="18"></Icon> บันทึกข้อมูล
                </div>
              </a-button>
            </div>
          </a-col>
        </a-row>
      </a-card>

      <template v-else >
        <a-row :gutter="[24 , 24]" v-if="initStore.version == 2">
          <a-col :span="24">
            <DocSignatrue ></DocSignatrue>
          </a-col>
          <a-col :span="24">
            <DocPostBalance ></DocPostBalance>
          </a-col>
          <a-col :span="24">
            <DocPostCreatePayin ></DocPostCreatePayin>
          </a-col>
          <a-col :span="24">
            <DocPostCreatePayout ></DocPostCreatePayout>
          </a-col>
          <a-col :span="24">
            <DocGetTransaction ></DocGetTransaction>
          </a-col>
          <a-col :span="24">
            <DocBank ></DocBank>
          </a-col>
        </a-row>

        <a-typography-paragraph v-else>
            <a-typography-link href="https://documenter.getpostman.com/view/12273327/2sB34oCxoH" target="_blank">
                <a-button type="primary">อ่านคู่มือ API</a-button>
            </a-typography-link>
        </a-typography-paragraph>
      </template>
    </a-col>
  </a-row>

  <a-modal 
      :open="modal" 
      title="ยืนยันการใช้งาน" 
      :footer="null"
      :closable="false"
    >
        <a-row>
            <a-col :span="24">
                <a-form 
                    :required-mark="false"
                    layout="vertical" 
                    name="basic" 
                    autocomplete="off" 
                    :model="formStateVerify"
                    @finish="onVerify"
                >
                    <a-form-item 
                        label="เว็บไซค์ของท่าน" 
                        :rules="[
                          { required: true, message: 'Please input your webiste!' } ,
                          {
                            type: 'url',
                            message: 'Must be a valid URL (start with http:// or https://)',
                          },
                        ]"
                        name="website"
                    >
                        <a-input v-model:value="formStateVerify.website" placeholder="กรุณากรอกเว็บไซค์ของท่าน" />
                    </a-form-item>

                    <a-form-item 
                        label="ช่องทางติดต่อกลับ" 
                        :rules="[
                          { required: true, message: 'Please input your contact!' } ,
                        ]"
                        name="contact"
                    >
                        <a-input v-model:value="formStateVerify.contact" placeholder="Line id , เบอร์ติดต่อ , Telegram" />
                        <!-- <span class="mt-[2px] text-gray-400 text-xs">Line id , เบอร์ติดต่อ , telegram</span> -->
                    </a-form-item>
                    
                    <a-form-item 
                      label="หน่วยงานที่ท่านเคลีย" 
                      name="agencyPolice" 
                      :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                    >
                        <a-select v-model:value="formStateVerify.agencyPolice" placeholder="กรุณาเลือกหน่วยงาน">
                            <a-select-option :value="item" v-for="item in options" :key="item">{{ item }}</a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item 
                        label="หน่วยงานอื่นๆ" 
                        :rules="[
                          { required: true, message: 'Please input your other!' } ,
                        ]"
                        name="other"
                        v-if="formStateVerify.agencyPolice === 'อื่นๆ'"
                    >
                        <a-input v-model:value="formStateVerify.other" placeholder="กรุณากรอกหน่วยงาน" />
                    </a-form-item>
                   
                    <p class="text-red-400" style="color: var(--gray-800);">ท่านจะสามารถเริ่มใช้งานหลักจากทางทีมงานอนุมัติการใช้งาน กรุณารอทีมงานตรวจสอบและทำการอนุมัติการใช้งาน</p>
                    
                    <a-checkbox v-model:checked="checked">ยอมรับข้อตกลง</a-checkbox>
                    <a-form-item>
                        <a-space class="float-right" >
                            <a-button 
                                :loading="loading"
                                html-type="submit" 
                                type="primary" 
                                class="mb-[0]"
                                :disabled="!checked"
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
li {
  list-style: none;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  font-weight: 500;
  color: #64748b;
}

li:hover {
  background-color: #f1f5f9;
  border-left-color: #3b82f6;
  color: #3b82f6;
}

li.active {
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  border-left-color: #3b82f6;
  color: #2563eb;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}
.header-title{
    color: var(--accent) !important;
}
.header-text{
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