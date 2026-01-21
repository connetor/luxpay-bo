
<script setup lang="ts">
import { onMounted, reactive , ref } from "vue";
import api from "@/configs/api";
import type { Permission, Role } from "@/interface/Modal";
import { message } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { useAuthStore } from "@/stores/auth";

const { user } = useAuthStore()

const loading = ref(false)
const modal = ref(false)
const isEdit = ref(false)

const role = ref<Role | null>(null)
const roles = ref<Role[]>([])
const permissions = ref<Permission[]>([])
const permissionsUser = user?.permissions ?? []

const groupPermissions = reactive<{ [key: string]: { name: string , permissions: Permission[] } }>({})

const defualtFormState = {
    name: '' ,
    permissions: []
}

const formState = reactive({ ...defualtFormState })

onMounted(async () => {
    await loadData()
})

const loadData = async () => {
    loading.value = true
    try {
        const resRole = await api.get('api/v1/bo/role' ).then(res => res.data)
        const resPermission = await api.get('api/v1/bo/permission').then(res => res.data)
        roles.value = resRole.data
        permissions.value = resPermission.data

        const actions = ['แก้ไข', 'ลบ', 'สร้าง'];

        resPermission.data.forEach((item: Permission) => {
            const groupKey = item.group || item.name.split('.')[0];

            if (!groupPermissions[groupKey]) {
                // Find the first permission in this group that doesn't start with an action
                const firstItem = resPermission.data.find((p: Permission) => (p.group || p.name.split('.')[0]) === groupKey && !actions.some(a => p.label.startsWith(a)));
                groupPermissions[groupKey] = {
                    name: firstItem ? firstItem.label : item.label,
                    permissions: []
                };
            }

            groupPermissions[groupKey].permissions.push(item);
        });

        // Sort groupPermissions.permissions so that items not starting with actions come first
        Object.keys(groupPermissions).forEach(key => {
            groupPermissions[key].permissions.sort((a, b) => {
                const aIsAction = actions.some(action => a.label.startsWith(action));
                const bIsAction = actions.some(action => b.label.startsWith(action));
                if (aIsAction === bIsAction) return 0;
                return aIsAction ? 1 : -1; // non-action first
            });
        });

        // console.log(groupPermissions);
    
    } catch(e) {}
    loading.value = false
}

const columns = reactive([
    ...(permissionsUser?.includes('role.update') ? [
        { title: 'จัดการ', key: 'more' },
    ] : []),
    { title: 'ชื่อ' , dataIndex: 'name' , key: 'name' },
])

const resetForm = async () => {
    role.value = null
    isEdit.value = false
    modal.value = false
    Object.assign(formState , defualtFormState)
}

const onEdit = async (data: Role) => {
    if (data.name === 'SUPER_ADMIN') {
        return
    }
    loading.value = true
    try {
        const res = await api.get(`api/v1/bo/role/${data.id}`).then(res => res.data)
        role.value = res.data
        formState.name = res.data.name
        formState.permissions = res.data.permissions.map((i: Permission) => i.id)
        isEdit.value = true
        modal.value = true
    } catch(e) {}
    loading.value = false
}

const onFinish = async (data: typeof formState) => {
    loading.value = true
    try {
        if(isEdit.value) {
            await api.post(`api/v1/bo/role/${role.value?.id}` , data)
        }
        else {
            await api.post('api/v1/bo/role' , data)
        }
        await loadData()
        message.success('ทำรายการสำเร็จ')
        resetForm();
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
                        <h1 class="header-title">จัดการตำแหน่งพนักงาน</h1>
                    </div>
                </div>
            </a-card>
        </a-col>
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="float-right">
                    <a-button style="margin-bottom: 16px; display: flex;align-items: center;" @click="modal = true" v-if="permissionsUser.includes('role.create')">
                        <Icon icon="line-md:plus" class="mr-2"></Icon> สร้างรายการ
                    </a-button>
                </div>
                <a-table 
                    :columns="columns" 
                    :data-source="roles" 
                    :loading="loading" 
                    bordered 
                    :scroll="{ x: 'max-content' }"
                    :pagination="false"
                >
                    <template #bodyCell="{ column , index , record }">
                        <template v-if="column.key === 'id'">
                            {{ index + 1 }}
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-button class="px-0" :disabled="record.name === 'SUPER_ADMIN'" @click="onEdit(record)">
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
                label="ชื่อตำแหน่ง" 
                :rules="[{ required: true, message: 'กรุณากรอกข้อมูล' }]"
                name="name"
            >
                <a-input v-model:value="formState.name" placeholder="กรออกชื่อตำแหน่ง" />
            </a-form-item>
            <a-form-item 
                name="permissions"
            >
                <div class="permissions-container">
                    <a-checkbox-group v-model:value="formState.permissions" class="permissions-group">
                        <template v-for="item in groupPermissions" :key="item.name">
                            <div class="permission-category">
                                <div class="category-title">
                                    <h3>
                                        {{ item.name }}
                                    </h3>
                                </div>
                                <div class="permissions-list">
                                    <a-checkbox 
                                        v-for="item2 in item.permissions" 
                                        :key="item2.id"
                                        :value="item2.id"
                                        class="permission-checkbox"
                                    >
                                        {{ item2.label }}
                                    </a-checkbox>
                                </div>
                            </div>
                        </template>
                    </a-checkbox-group>
                </div>
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

<style scoped>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}

.permissions-container {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 8px;
}

.permissions-container::-webkit-scrollbar {
    width: 6px;
}

.permissions-container::-webkit-scrollbar-track {
    background: var(--white);
    border-radius: 3px;
}

.permissions-container::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 3px;
}

.permissions-container::-webkit-scrollbar-thumb:hover {
    background: var(--primary);
}

.permission-category {
    margin-bottom: 24px;
}

.permission-category:last-child {
    margin-bottom: 0;
}

.category-title {
    color: var(--gray-800);
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--gray-200);
}

.permissions-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.permission-checkbox {
    color: var(--gray-800) !important;
}

.permission-checkbox :deep(.ant-checkbox) {
    margin-right: 8px;
}

.permission-checkbox :deep(.ant-checkbox-checked .ant-checkbox-inner) {
    background-color: var(--primary) !important;
    border-color: var(--primary) !important;
}

.permission-checkbox :deep(.ant-checkbox:hover .ant-checkbox-inner) {
    border-color: var(--primary) !important;
}

.permission-checkbox :deep(.ant-checkbox-checked::after) {
    border-color: var(--primary) !important;
}

.permission-checkbox :deep(span) {
    color: var(--gray-800) !important;
}
</style>