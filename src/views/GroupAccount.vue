
<script setup lang="ts">
import { onMounted, reactive , ref } from "vue";
import api from "@/configs/api";
import type { GroupAccount } from "@/interface/Modal";
import { message } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { useAuthStore } from "@/stores/auth";
import { useTable } from "@/composables/useTable";

const { user } = useAuthStore()

const modal = ref(false)
const isEdit = ref(false)

const group = ref<GroupAccount | null>(null)
const groups = ref<GroupAccount[]>([])

const defualtFormState = {
    name: '' ,
    description: '' ,
    defualt: false
}

const formState = reactive({ ...defualtFormState })
const permissions = user?.permissions ?? []

const { onLoadTable , data , handleTableChange , loading } = useTable<GroupAccount>()

onMounted(async () => {
    await onLoadTable.value()
})

onLoadTable.value = async () => {
    loading.value = true
    try {
        const res = await api.get('api/v1/bo/bank-group' ).then(res => res.data)
        groups.value = res.data
    } catch(e) {}
    loading.value = false
}

const columns = reactive([
    ...(permissions?.includes('account.update') ? [
        { title: 'จัดการ', key: 'more' },
    ] : []),
    { title: 'ชื่อ' , dataIndex: 'name' , key: 'name' },
    { title: 'หมายเหตุ' , dataIndex: 'description' , key: 'description' },
    { title: 'อัตโนมัติ' , dataIndex: 'defualt' , key: 'defualt' },
])

const resetForm = async () => {
    group.value = null
    isEdit.value = false
    modal.value = false
    Object.assign(formState , defualtFormState)
    await onLoadTable.value()
}

const onEdit = async (data: GroupAccount) => {
    loading.value = true
    try {
        group.value = data
        Object.assign(formState , data)
        isEdit.value = true
        modal.value = true
    } catch(e) {}
    loading.value = false
}

const onFinish = async (data: typeof formState) => {
    loading.value = true
    try {
        if(isEdit.value) {
            await api.post(`api/v1/bo/bank-group/${group.value?.id}` , data)
        }
        else {
            await api.post('api/v1/bo/bank-group' , data)
        }
        message.success('ทำรายการสำเร็จ')
        await resetForm();
    } catch(e) {}
    loading.value = false
}

</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">

                <div class="header-content" style="margin-bottom: 16px;">
                    <div class="header-text">
                        <h1 class="header-title">กลุ่มบัญชี</h1>
                    </div>
                </div>

                <div class="float-right">
                    <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="modal = true" v-if="permissions.includes('account.create')">
                        <Icon icon="line-md:plus" class="mr-2"></Icon> สร้างรายการ
                    </a-button>
                </div>
                <a-table 
                    :columns="columns" 
                    :data-source="groups" 
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
                        <template v-if="column.key === 'defualt'">
                            <a-tag color="success" v-if="record.defualt">เปิดใช้งาน</a-tag>
                            <a-tag color="error" v-else>ปิดใช้งาน</a-tag>
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
                label="ชื่อ" 
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                name="name"
            >
                <a-input v-model:value="formState.name" placeholder="กรุณากรออกชื่อธนาคาร" />
            </a-form-item>
            <a-form-item label="หมายเหตุ" name="description">
                <a-textarea v-model:value="formState.description" placeholder="หมายเหตุ" :rows="4" />
            </a-form-item>
            <a-form-item label="อัตโนมัติ" name="defualt">
                <a-switch v-model:checked="formState.defualt" /> 
                <span style="margin-left: 5px;" class="text-xs">{{ formState.defualt ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</span>
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
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}
</style>