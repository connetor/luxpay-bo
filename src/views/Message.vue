
<script setup lang="ts">
import { computed, createVNode, onMounted, reactive, ref } from "vue";
import api from "@/configs/api";
import type { TelegramMessage } from "@/interface/Modal";
import { Icon } from "@iconify/vue";
import { setFormatTime } from "@/utils";
import dayjs, { Dayjs } from "dayjs";
import { useTable } from "@/composables/useTable";
import { message, Modal } from "ant-design-vue";
import { ExclamationCircleOutlined } from "@ant-design/icons-vue";
import { useAuthStore } from "@/stores/auth";

const { onLoadTable , data , loading } = useTable<TelegramMessage>()

const { user } = useAuthStore()

const modals = reactive({
    detail: false ,
    crud: false ,
})

const defualtFormState = {
    name: null ,
    remark: null ,
    message: null ,
    isBroadcast: false ,
    timeBroadcast: dayjs('00:00' , 'HH:mm') ,
    recipients: 'announcement'
}

const formState = reactive({ ...defualtFormState })

const isEdit = ref(false)
const teleMessage = ref<TelegramMessage | null>()
const permissions = user?.permissions ?? []

onMounted(async () => {
    await onLoadTable.value()
})

onLoadTable.value = async () => {
    loading.value = true
    try {
        const res = await api.get('api/v1/bo/telegram').then(res => res.data)
        data.value = res.data
    } catch(e) {}
    loading.value = false
}

const columns = computed(() => {
    return [
        ...(permissions?.includes('telegram_message.update') ? [
            { title: 'จัดการ', key: 'more' },
        ] : []),
        { title: 'ช่องทาง' , dataIndex: 'recipients' , key: 'recipients' },
        { title: 'ชื่อ' , dataIndex: 'name' , key: 'name' },
        { title: 'หมายเหตุ'  , dataIndex: 'remark' , key: 'remark' },
        { title: 'อัตโนมัติ'  , dataIndex: 'isBroadcast' , key: 'isBroadcast' },
        { title: 'เวลา'  , dataIndex: 'timeBroadcast' , key: 'timeBroadcast' },
        { title: 'วันที่ทำรายการ' , dataIndex: 'createdAt' , key: 'createdAt' },
    ]
})

const resetForm = async () => {
    Object.keys(modals).forEach((k) => {
        modals[k as keyof typeof modals] = false
    });
    Object.assign(formState , defualtFormState)
    isEdit.value = false
    teleMessage.value = null
    await onLoadTable.value()
}

const onEdit = (record: TelegramMessage) => {
    teleMessage.value = record
    Object.assign(formState, {
        name: record.name,
        remark: record.remark,
        message: record.message,
        isBroadcast: record.isBroadcast,
        timeBroadcast: dayjs(record.timeBroadcast, 'HH:mm'),
        recipients: record.recipients
    })
    isEdit.value = true
    modals.crud = true
}

const onBroadCast = async (record: TelegramMessage) => {
    Modal.confirm({
        title: 'ยืนยันการทำรายการ' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, 'ต้องการประกาศข้อความนี้ ใช่หรือไม่ ?'),
        async onOk() {
            try {
                await api.post(`api/v1/bo/telegram/broadcast/${record.id}`)
                
                message.success('ทำรายการสำเร็จ')
            } catch(e) {}
        }
    })
}

const onDelete = async (data: TelegramMessage) => {
    Modal.confirm({
        title: 'ยืนยันการทำรายการ' ,
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:red;' }, 'ต้องการลบข้อความประกาศนี้ ใช่หรือไม่ ?'),
        async onOk() {
            loading.value = true
            try {
                await api.delete(`api/v1/bo/telegram/${data.id}`)
                
                message.success('ทำรายการสำเร็จ')
                await resetForm()
            } catch(e) {}
            loading.value = false
        }
    })
}

const onFinish = async (formData: typeof formState) => {
    loading.value = true;
    try {
        const payload: any = {
            name: formState.name,
            remark: formState.remark,
            message: formState.message,
            isBroadcast: formState.isBroadcast,
            recipients: formState.recipients
        }

        if (formState.timeBroadcast) {
            if (dayjs.isDayjs(formState.timeBroadcast)) {
                payload.timeBroadcast = formState.timeBroadcast.format('HH:mm')
            } else {
                payload.timeBroadcast = formState.timeBroadcast
            }
        }

        if(isEdit.value && teleMessage.value?.id) {
            await api.post(`api/v1/bo/telegram/${teleMessage.value.id}`, payload)
            message.success('แก้ไขข้อความสำเร็จ')
        }
        else {
            await api.post(`api/v1/bo/telegram`, payload)
            message.success('สร้างข้อความสำเร็จ')
        }

        await resetForm()
        
    } catch(e) {
        message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
        console.error('Error saving message:', e)
    }
    loading.value = false
}
 
</script>

<template>

    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">รายงานข้อความประกาศ</h1>
                    </div>
                </div>
                <div class="float-right">
                    <a-space>
                        <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="modals.crud = true" v-if="permissions.includes('telegram_message.create')">
                            <Icon icon="line-md:plus" class="mr-2"></Icon> สร้างรายการ
                        </a-button>
                        <a-button 
                            style="margin-bottom: 16px; display: flex;align-items: center;" 
                            @click="onLoadTable"
                            :disabled="loading"
                        >
                            <Icon :icon="loading ? 'svg-spinners:270-ring' : 'famicons:reload'" class="mr-2"></Icon> รีเฟรช
                        </a-button>
                    </a-space>
                </div>
                <a-table 
                    :columns="columns" 
                    :data-source="data" 
                    :loading="loading" 
                    bordered
                    :scroll="{ x: 'max-content' }"
                >
                    <template #bodyCell="{ column , text , record }">
                        <template v-if="column.key === 'createdAt'">
                            {{ setFormatTime(text) }}
                        </template>
                        <template v-if="column.key === 'recipients'">
                            <a-tag color="blue" v-if="record.recipients === 'all'">ทั้งหมด</a-tag>
                            <a-tag color="success" v-else-if="record.recipients === 'merchant'">ร้านค้า</a-tag>
                            <a-tag color="warning" v-else>ข่าวสาร</a-tag>
                        </template>
                        <template v-if="column.key === 'isBroadcast'">
                            <a-tag color="success" v-if="record.isBroadcast">เปิดใช้งาน</a-tag>
                            <a-tag color="error" v-else>ปิดใช้งาน</a-tag>
                        </template>
                        <template v-if="column.key === 'timeBroadcast'">
                            <span v-if="record.isBroadcast">{{ text }}</span>
                            <span v-else>-</span>
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-space>
                                <a-button @click="() => { teleMessage = record; modals.detail = true }"> 
                                    <div class="flex items-center gap-2 text-xs">
                                        <Icon icon="mdi-light:clipboard-text" width="14" height="14" ></Icon> ข้อความประกาศ
                                    </div>
                                </a-button>
                                <a-button @click="onBroadCast(record)">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="fluent:alert-on-20-regular" width="14" height="14"></Icon> แจ้งเตือน
                                    </div>
                                </a-button>
                                <a-button @click="onEdit(record)">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="ep:edit-pen" width="14" height="14"></Icon> แก้ไข
                                    </div>
                                </a-button>
                                <a-button @click="onDelete(record)">
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="solar:trash-bin-2-linear" width="14" height="14"></Icon> ลบ
                                    </div>
                                </a-button>
                            </a-space>
                        </template>
                    </template>
                </a-table>
            </a-card>
        </a-col>
    </a-row>

    <!-- crud -->
    <a-modal 
        :open="modals.crud" 
        :title="isEdit ? 'แก้ไขข้อความ' : 'เพิ่มข้อความ'" 
        @cancel="resetForm"
        :footer="null"
    >
        <a-row>
            <a-col :span="24">
                <a-form 
                    :required-mark="false"
                    layout="vertical" 
                    name="basic" 
                    autocomplete="off" 
                    :model="formState"
                    @finish="onFinish"
                >
                    <a-form-item 
                        label="ชื่อ" 
                        :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                        name="name"
                    >
                        <a-input v-model:value="formState.name" placeholder="กรุณากรอกชื่อบัญชี" />
                    </a-form-item>

                    <a-form-item 
                        label="ช่องทาง" 
                        name="recipients" 
                        :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                    >
                        <a-select v-model:value="formState.recipients" placeholder="กรุณาเลือกสถานะ">
                            <a-select-option value="announcement">ข่าวสาร</a-select-option>
                            <a-select-option value="merchant">ร้านค้า</a-select-option>
                            <a-select-option value="all">ทั้งหมด</a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item 
                        label="ข้อความประกาศ" 
                        name="message"
                        :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                    >
                        <a-textarea v-model:value="formState.message" placeholder="ข้อความประกาศ" :rows="4" />
                    </a-form-item>

                    <a-form-item label="หมายเหตุ" name="remark">
                        <a-textarea v-model:value="formState.remark" placeholder="หมายเหตุ" :rows="4" />
                    </a-form-item>

                    <a-row align="middle" :gutter="[24 , 24]" class="mb-[24px]">
                        <a-col :span="16">
                            <a-form-item name="isBroadcast">
                                <div class="flex items-center gap-[28px]">
                                    <span>แจ้งเตือนอัตโนมัติ</span>
                                    <div class="flex items-center gap-2">
                                        <a-switch v-model:checked="formState.isBroadcast" /> 
                                        <span style="margin-left: 5px;" class="text-xs">{{ formState.isBroadcast ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span>
                                    </div>
                                </div>
                            </a-form-item>
                        </a-col>
                        <a-col :span="8">
                            <a-form-item name="timeBroadcast">
                                <a-time-picker v-model:value="formState.timeBroadcast" format="HH:mm" />
                            </a-form-item>
                        </a-col>
                    </a-row>

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
            </a-col>
        </a-row>
    </a-modal>

    <!-- detail -->
    <a-modal 
        :open="modals.detail" 
        title="ข้อความประกาศ" 
        :footer="null"
        @cancel="modals.detail = false"
    >
        <a-textarea :value="teleMessage?.message" readonly placeholder="ข้อความประกาศ" :rows="30" />
    </a-modal>


 
</template>

<style>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}
</style>