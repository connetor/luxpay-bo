
<script setup lang="ts">
import LineCute from '@/components/LineCute.vue';
import api from '@/configs/api';
import { message } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import { onMounted, reactive, ref } from 'vue';
import { useAuthStore } from "@/stores/auth";

const { user } = useAuthStore()

const loading = ref(false)

interface Maintenance {
    name: string 
    open: string | Dayjs
    close: string | Dayjs
}

interface FormState {
    maintenance: Maintenance[],
    botTelegramId: string,
    statusDeposit: boolean | string,
    maximumDeposit: string,
    minimumDeposit: string,
    statusDepositSystem: boolean | string,
    statusWithdraw: boolean | string,
    maximumWithdraw: string,
    minimumWithdraw: string,
    statusWithdrawSystem: boolean | string,
    statusCommission: boolean | string,
}

const defualtFormState: FormState = {
    maintenance: [],
    botTelegramId: '',
    // ทั่วไป
    statusDeposit: false,
    maximumDeposit: '',
    minimumDeposit: '',
    statusDepositSystem: false,
    statusWithdraw: false,
    maximumWithdraw: '',
    minimumWithdraw: '',
    statusWithdrawSystem: false,
    statusCommission: false,
}

const tabs = ref([
    {
        key: 'info' ,
        tab: 'ทั่วไป'
    }, 
    // {
    //     key: 'system' ,
    //     tab: 'การใช้งานระบบ'
    // },
    {
        key: 'bot' ,
        tab: 'บอทแจ้งเตือน'
    },
    {
        key: 'maintenance' ,
        tab: 'ช่วงเวลาให้บริการ'
    },  
    {
        key: 'commission' ,
        tab: 'ค่าคอมมิชชั่น'
    },  
])

const days = [
    'วันจันทร์',
    'วันอังคาร',
    'วันพุธ',
    'วันพฤหัสบดี',
    'วันศุกร์',
    'วันเสาร์',
    'วันอาทิตย์'
]

const active = ref('info')

const formState = reactive({ ...defualtFormState })
const permissions = user?.permissions ?? []

onMounted(async () => { 
    await onLoadData() 
})

const onLoadData = async () => {
    loading.value = true
    try {
        const data = await api.get('api/v1/bo/system').then(res => res.data.data)

        Object.keys(formState).forEach(k => {
            const key = k as keyof typeof formState
            if (key === 'statusWithdraw' || key === 'statusDeposit' || key === 'statusCommission' || key === 'statusDepositSystem' || key === 'statusWithdrawSystem') {
                formState[key] = data[key] === 'active'
            }
            else if(key === 'maintenance') {
                const maintenances: Maintenance[] = data[key]
                maintenances.forEach(item => {
                    item.open = dayjs(item.open , 'HH:mm')
                    item.close = dayjs(item.close , 'HH:mm')
                    formState[key].push(item)
                })
            }
            else {
                formState[key] = data[key]
            }
        })
    } catch(e) {}
    loading.value = false
}

const onFinish = async (data: typeof formState) => {
    loading.value = true
    try {
        if(data.maintenance) {
            data.maintenance.map(item => {
                if(dayjs.isDayjs(item.close)) {
                    item.close = item.close.format('HH:mm')
                }
                if(dayjs.isDayjs(item.open)) {
                    item.open = item.open.format('HH:mm')
                }
            })
        }
        if(data.statusDeposit !== undefined) {
            data.statusDeposit = data.statusDeposit ? 'active' : 'inactive'
        }
        if(data.statusDepositSystem !== undefined) {
            data.statusDepositSystem = data.statusDepositSystem ? 'active' : 'inactive'
        }
        if(data.statusWithdraw !== undefined) {
            data.statusWithdraw = data.statusWithdraw ? 'active' : 'inactive'
        }
        if(data.statusWithdrawSystem !== undefined) {
            data.statusWithdrawSystem = data.statusWithdrawSystem ? 'active' : 'inactive'
        }
        if(data.statusCommission !== undefined) {
            data.statusCommission = data.statusCommission ? 'active' : 'inactive'
        }

        await api.post('api/v1/bo/system', data)
        message.success('ทำรายการสำเร็จ')
    } catch(e) {}
    loading.value = false
}

</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="header-content">
                    <div class="header-text">
                        <h1 class="header-title">ตั้งค่าระบบ</h1>
                        <p class="header-text">ตั้งค่าการใช้งานระบบ</p>
                    </div>
                </div>
            </a-card>
        </a-col>
        
        <a-col :span="24">
            <a-row :gutter="[24 , 24]">
                <a-col :lg="4" :md="24" :xs="24">
                    <a-card class="shadow-sm">
                        <ul class="tab-list">
                            <li 
                                v-for="item , index in tabs" 
                                :key="index" 
                                :class="{ 'active' : item.key === active }"
                                class="tab-item"
                                @click="active = item.key"
                            >
                                <span class="tab-icon">
                                    <svg v-if="item.key === 'info'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 16v-4M12 8h.01"></path>
                                    </svg>
                                    <svg v-else-if="item.key === 'system'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                        <line x1="8" y1="21" x2="16" y2="21"></line>
                                        <line x1="12" y1="17" x2="12" y2="21"></line>
                                    </svg>
                                    <svg v-else-if="item.key === 'bot'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                    </svg>
                                    <svg v-else-if="item.key === 'maintenance'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    <svg v-else-if="item.key === 'commission'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="1" x2="12" y2="23"></line>
                                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                    </svg>
                                </span>
                                <span class="tab-text">{{ item.tab }}</span>
                            </li>
                        </ul>
                    </a-card >
                </a-col>
                <a-col :lg="20" :md="24" :xs="24">
                    <a-spin :spinning="loading">
                        <a-card class="shadow-sm" v-if="active === 'info'">
                            <template #title>
                                <a-typography-title :level="4" style="margin-bottom: 0px; color: var(--gray-800);">ทั่วไป</a-typography-title>
                            </template>

                            <a-form 
                                :required-mark="false"
                                name="basic" 
                                autocomplete="off" 
                                :model="formState"
                                @finish="onFinish"
                            >
                                <a-row :gutter="24">
                                    <a-col :span="24">
                                        <a-typography-title :level="4" style="color: var(--gray-800);">ระบบฝากเงิน</a-typography-title>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-row align="middle">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p style="color: var(--gray-800);">สถานะ</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item name="statusDeposit">
                                                    <a-switch v-model:checked="formState.statusDeposit" :disabled="!permissions.includes('setting.update')" />
                                                    <span class="ml-[8px] text-xs" style="color: var(--gray-800); margin-left: 10px;">{{ formState.statusDeposit ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span>
                                                </a-form-item>
                                            </a-col>
                                        </a-row>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-row align="middle">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p style="color: var(--gray-800);">เปิดการฝากในระบบ</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item name="statusDepositSystem">
                                                    <a-switch v-model:checked="formState.statusDepositSystem" :disabled="!permissions.includes('setting.update')" />
                                                    <span class="ml-[8px] text-xs" style="color: var(--gray-800); margin-left: 10px;">{{ formState.statusDepositSystem ? 'เปิดการฝากในระบบ' : 'ปิดการฝากในระบบ' }}</span>
                                                </a-form-item>
                                            </a-col>
                                        </a-row>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-row align="middle">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p style="color: var(--gray-800);">ยอดฝากเงินขั้นต่ำ</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item 
                                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                                                    name="minimumDeposit"
                                                >
                                                    <a-input-number 
                                                        v-model:value="formState.minimumDeposit" 
                                                        :min="0" 
                                                        placeholder="กรุณากรอกข้อมูล" 
                                                        style="width: 100%;" 
                                                        :disabled="!permissions.includes('setting.update')"
                                                    />
                                                </a-form-item>
                                            </a-col>
                                        </a-row>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-row align="middle">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p style="color: var(--gray-800);">ยอดฝากเงินสูงสุด</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item 
                                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                                                    name="maximumDeposit"
                                                >
                                                    <a-input-number 
                                                        v-model:value="formState.maximumDeposit" 
                                                        :min="0" 
                                                        placeholder="กรุณากรอกข้อมูล" 
                                                        style="width: 100%;" 
                                                        :disabled="!permissions.includes('setting.update')"
                                                    />
                                                </a-form-item>
                                            </a-col>
                                        </a-row>
                                    </a-col>

                                    <a-col :span="24" class="mb-[20px]">
                                        <LineCute></LineCute>
                                    </a-col>

                                    <a-col :span="24">
                                        <a-typography-title :level="4" style="color: var(--gray-800);">ระบบถอนเงิน</a-typography-title>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-row align="middle">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p style="color: var(--gray-800);">สถานะ</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item name="statusWithdraw">
                                                    <a-switch v-model:checked="formState.statusWithdraw" :disabled="!permissions.includes('setting.update')"/>
                                                    <span class="ml-[8px] text-xs" style="margin-left: 10px;">{{ formState.statusWithdraw ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span>
                                                </a-form-item>
                                            </a-col>
                                        </a-row>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-row align="middle">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p style="color: var(--gray-800);">เปิดการถอนในระบบ</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item name="statusWithdrawSystem">
                                                    <a-switch v-model:checked="formState.statusWithdrawSystem" :disabled="!permissions.includes('setting.update')"/>
                                                    <span class="ml-[8px] text-xs" style="margin-left: 10px;">{{ formState.statusWithdrawSystem ? 'เปิดการถอนในระบบ' : 'ปิดการถอนในระบบ' }}</span>
                                                </a-form-item>
                                            </a-col>
                                        </a-row>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-row align="middle">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p style="color: var(--gray-800);">ยอดถอนเงินขั้นต่ำ</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item 
                                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                                                    name="minimumWithdraw"
                                                >
                                                    <a-input-number 
                                                        v-model:value="formState.minimumWithdraw" 
                                                        :min="0" 
                                                        placeholder="กรุณากรอกข้อมูล" 
                                                        style="width: 100%;" 
                                                        :disabled="!permissions.includes('setting.update')"
                                                    />
                                                </a-form-item>
                                            </a-col>
                                        </a-row>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-row align="middle">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p style="color: var(--gray-800);">ยอดถอนเงินสูงสุด</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item 
                                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                                                    name="maximumWithdraw"
                                                >
                                                    <a-input-number 
                                                        v-model:value="formState.maximumWithdraw" 
                                                        :min="0" 
                                                        placeholder="กรุณากรอกข้อมูล" 
                                                        style="width: 100%;" 
                                                        :disabled="!permissions.includes('setting.update')"
                                                    />
                                                </a-form-item>
                                            </a-col>
                                        </a-row>
                                    </a-col>

                                    <a-col :span="24">
                                        <a-form-item>
                                            <a-space class="float-right">
                                                <a-button 
                                                    html-type="submit" 
                                                    type="primary" 
                                                    class="mb-[0]"
                                                    :disabled="!permissions.includes('setting.update')"
                                                >
                                                    บันทึก
                                                </a-button>
                                            </a-space>
                                        </a-form-item>
                                    </a-col>
                                </a-row>
                            </a-form>
                        </a-card>

                        <a-card class="shadow-sm" v-else-if="active === 'bot'">
                            <template #title>
                                <a-typography-title :level="4" style="margin-bottom: 0px; color: white;">บอทแจ้งเตือน</a-typography-title>
                            </template>

                            <a-form 
                                :required-mark="false"
                                name="basic" 
                                autocomplete="off" 
                                :model="formState"
                                @finish="onFinish"
                                layout="vertical" 
                            >
                                <a-row>
                                    <a-col :span="24">
                                        <a-typography-title :level="4" style="color: var(--gray-800);">เทเลแกรม</a-typography-title>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-row align="middle" :gutter="[24 , 24]">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p style="color: var(--gray-800);">รหัสบอท</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item
                                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                                                    name="botTelegramId"
                                                >
                                                    <a-input v-model:value="formState.botTelegramId" placeholder="กรุณากรอกข้อมูล" :disabled="!permissions.includes('setting.update')"/>
                                                </a-form-item>
                                            </a-col>
                                        </a-row>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-typography-title :level="4" style="color: var(--gray-800);">แจ้งเตือนระบบ</a-typography-title>
                                    </a-col>
                                    <!-- <a-col :span="24">
                                        <a-row align="middle" :gutter="[24 , 24]">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p>ระงับบัญชี</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item
                                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                                                    name="telegramRoomRiskAccount"
                                                >
                                                    <a-input v-model:value="formState.telegramRoomRiskAccount" placeholder="กรุณากรอกข้อมูล" :disabled="!permissions.includes('setting.update')"/>
                                                </a-form-item>
                                            </a-col>
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p>โยกเงินบัญชี</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item
                                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                                                    name="telegramRoomSettlementAccount"
                                                >
                                                    <a-input v-model:value="formState.telegramRoomSettlementAccount" placeholder="กรุณากรอกข้อมูล" :disabled="!permissions.includes('setting.update')"/>
                                                </a-form-item>
                                            </a-col>
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p>สรุปวันรายวัน</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item
                                                    :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                                                    name="telegramRoomDailyReport"
                                                >
                                                    <a-input v-model:value="formState.telegramRoomDailyReport" placeholder="กรุณากรอกข้อมูล" :disabled="!permissions.includes('setting.update')"/>
                                                </a-form-item>
                                            </a-col>
                                            
                                        </a-row>
                                    </a-col> -->

                                    <a-col :span="24">
                                        <a-form-item>
                                            <a-space class="float-right">
                                                <a-button 
                                                    html-type="submit" 
                                                    type="primary" 
                                                    class="mb-[0]"
                                                    :disabled="!permissions.includes('setting.update')"
                                                >
                                                    บันทึก
                                                </a-button>
                                            </a-space>
                                        </a-form-item>
                                    </a-col>
                                </a-row>
                            </a-form>
                        </a-card>

                        <a-card class="shadow-sm" v-else-if="active === 'maintenance'">
                            <template #title>
                                <a-typography-title :level="4" style="margin-bottom: 0px; color: white;">ช่วงเวลาให้บริการ</a-typography-title>
                            </template>

                            <a-form 
                                :required-mark="false"
                                name="basic" 
                                autocomplete="off" 
                                :model="formState"
                                @finish="onFinish"
                            >
                                <a-row :gutter="24">
                                    <template v-for="item , index in formState.maintenance" :key="index">
                                        <a-col :span="24">
                                            <a-typography-title :level="4" style="color: var(--gray-800);">{{ days[index] }}</a-typography-title>
                                        </a-col>
                                        <a-col :span="24">
                                            <a-row>
                                                <a-col :span="24">
                                                    <a-row align="middle">
                                                        <a-col :lg="3" :md="12" :xs="12">
                                                            <p style="color: var(--gray-800);">เวลาเปิด</p>
                                                        </a-col>
                                                        <a-col :lg="6" :md="12" :xs="12">
                                                            <a-form-item
                                                                :name="['maintenance', index, 'open']"
                                                            >
                                                                <a-time-picker v-model:value="formState.maintenance[index].open" format="HH:mm" class="w-full" />
                                                            </a-form-item>
                                                        </a-col>
                                                    </a-row>
                                                </a-col>
                                                <a-col :span="24">
                                                    <a-row align="middle">
                                                        <a-col :lg="3" :md="12" :xs="12">
                                                            <p style="color: var(--gray-800);">เวลาปิด</p>
                                                        </a-col>
                                                        <a-col :lg="6" :md="12" :xs="12">
                                                            <a-form-item
                                                                :name="['maintenance', index, 'close']"
                                                            >
                                                                <a-time-picker v-model:value="formState.maintenance[index].close" format="HH:mm" class="w-full" />
                                                            </a-form-item>
                                                        </a-col>
                                                    </a-row>
                                                </a-col>
                                            </a-row>

                                        </a-col>
                                    </template>

                                    <a-col :span="24">
                                        <a-form-item>
                                            <a-space class="float-right">
                                                <a-button 
                                                    html-type="submit" 
                                                    type="primary" 
                                                    class="mb-[0]"
                                                    :disabled="!permissions.includes('setting.update')"
                                                >
                                                    บันทึก
                                                </a-button>
                                            </a-space>
                                        </a-form-item>
                                    </a-col>
                                </a-row>
                            </a-form>
                        </a-card>

                        <a-card class="shadow-sm" v-else-if="active === 'commission'">
                            <template #title>
                                <a-typography-title :level="4" style="margin-bottom: 0px; color: white;">ค่าคอมมิชชั่น</a-typography-title>
                            </template>

                            <a-form 
                                :required-mark="false"
                                name="basic" 
                                autocomplete="off" 
                                :model="formState"
                                @finish="onFinish"
                            >
                                <a-row :gutter="24">
                                    <a-col :span="24">
                                        <a-typography-title :level="4" style="color: var(--gray-800);">ระบบค่าคอมมิชชั่น</a-typography-title>
                                    </a-col>
                                    <a-col :span="24">
                                        <a-row align="middle">
                                            <a-col :lg="3" :md="12" :xs="12">
                                                <p style="color: var(--gray-800);">สถานะ</p>
                                            </a-col>
                                            <a-col :lg="21" :md="12" :xs="12">
                                                <a-form-item name="statusCommission">
                                                    <a-switch v-model:checked="formState.statusCommission" :disabled="!permissions.includes('setting.update')" />
                                                    <span class="ml-[8px] text-xs" style="margin-left: 10px;">{{ formState.statusCommission ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span>
                                                </a-form-item>
                                            </a-col>
                                        </a-row>
                                    </a-col>

                                    <a-col :span="24">
                                        <a-form-item>
                                            <a-space class="float-right">
                                                <a-button 
                                                    html-type="submit" 
                                                    type="primary" 
                                                    class="mb-[0]"
                                                    :disabled="!permissions.includes('setting.update')"
                                                >
                                                    บันทึก
                                                </a-button>
                                            </a-space>
                                        </a-form-item>
                                    </a-col>
                                </a-row>
                            </a-form>
                        </a-card>

                    </a-spin>

                </a-col>
            </a-row>
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