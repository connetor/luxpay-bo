<script setup lang="ts">
import { createVNode, onMounted, reactive, ref } from "vue";
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import api from "@/configs/api";
import { message, Modal } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { setFormatTime, formatThaiBankAccount } from "@/utils";
import { useAuthStore } from "@/stores/auth";
import { useEvent } from "@/composables/useEvent";
import { useTable } from "@/composables/useTable";

interface BlockedAccount {
    bank_number: string;
    bank_name: string;
    total?: string;
    bank?: {
        code: string;
        name: string;
        shortCode: string;
    };
    last_updated?: string;
}

const { user } = useAuthStore()
const { onCopyText } = useEvent()

const { pagination, sort, onLoadTable, data, handleTableChange: defaultHandleTableChange, loading } = useTable<BlockedAccount>()

const searchText = ref('')
const banks = ref<any[]>([])

const permissions = user?.permissions ?? []

// Custom handleTableChange to reset current page when pageSize changes
const handleTableChange = (page: any, filters: any, sorter: any, extra: any) => {
    if (page.pageSize && page.pageSize !== pagination.pageSize) {
        pagination.current = 1 // Reset to first page when pageSize changes
        pagination.pageSize = page.pageSize
    } else {
        if (page.current) pagination.current = page.current
        if (page.pageSize) pagination.pageSize = page.pageSize
    }

    if (sorter) {
        sort.sortBy = sorter.columnKey
        sort.sortOrder = sorter.order === "ascend" ? "asc" : "desc"
    }

    onLoadTable.value()
}

onMounted(async () => {
    await onLoadTable.value()
    await loadBanks()
})

// โหลดข้อมูลธนาคารสำหรับ dropdown
const loadBanks = async () => {
    try {
        const res = await api.get("api/v1/bo/bank").then((res) => res.data);
        banks.value = res.data;
    } catch (e) {
        console.error(e);
    }
};

onLoadTable.value = async () => {
    loading.value = true
    try {
        const params: any = {
            page: pagination.current,
            limit: pagination.pageSize,
            sortBy: sort.sortBy,
            sortOrder: sort.sortOrder,
        }

        // เพิ่ม search parameter ถ้ามี
        if (searchText.value && searchText.value.trim()) {
            params.search = searchText.value
        }

        const res = await api.get('api/v1/bo/blacklist/failed-payouts', { params }).then(res => res.data)

        // Check response structure and assign data
        if (res && res.data) {
            // Handle paginated response structure: { status, message, data: { data: [...], meta: {...} } }
            const responseData = res.data.data
            const responseMeta = res.data.meta

            // Assign data array
            if (responseData && Array.isArray(responseData)) {
                data.value = responseData
            } else if (Array.isArray(res.data)) {
                // Fallback: if data is directly an array
                data.value = res.data
            } else {
                console.error('Unexpected response structure:', res)
                data.value = []
            }

            // Assign pagination meta and validate current page
            if (responseMeta) {
                pagination.total = responseMeta.total || 0
                pagination.current = responseMeta.currentPage || pagination.current
                pagination.pageSize = responseMeta.perPage || pagination.pageSize

                // Use lastPage from API response for accurate pagination
                const lastPage = responseMeta.lastPage || Math.ceil(pagination.total / pagination.pageSize) || 1

                // Validate current page and reset if it exceeds lastPage (before recursive call)
                if (pagination.current > lastPage && lastPage > 0) {
                    pagination.current = lastPage
                    loading.value = false // Reset loading before recursive call
                    // Recursively call to load the correct page data
                    await onLoadTable.value()
                    return
                }
            }
        } else {
            console.error('Invalid response structure:', res)
            data.value = []
        }

        // Ensure current page is at least 1
        if (pagination.current < 1) {
            pagination.current = 1
        }
    } catch (e: any) {
        console.error('Error loading blocked account data:', e)
        message.error(e?.response?.data?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล')
        data.value = []
    } finally {
        loading.value = false
    }
}

// ฟังก์ชันค้นหา
const onSearch = async () => {
    pagination.current = 1; // Reset to first page when searching
    await onLoadTable.value();
};

// ฟังก์ชัน reset search
const onResetSearch = async () => {
    searchText.value = "";
    pagination.current = 1;
    await onLoadTable.value();
};

const columns = reactive([
    { title: 'จัดการ', key: 'more' },
    { title: 'ชื่อบัญชี', sorter: true, dataIndex: 'bank_name', key: 'bank_name' },
    { title: 'เลขบัญชี', sorter: true, dataIndex: 'bank_number', key: 'bank_number' },
    { title: 'ธนาคาร', dataIndex: 'bank', key: 'bank' },
])

// ฟังก์ชันปลดบัญชีที่ถูกบล็อก
const onUnblock = async (record: BlockedAccount) => {
    Modal.confirm({
        title: 'ยืนยันการทำรายการ',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', { style: 'color:white;' }, 'คุณแน่ใจหรือไม่ว่าต้องการปลดบัญชีนี้?'),
        async onOk() {
            loading.value = true
            try {
                await api.delete(`api/v1/bo/blacklist/failed-payouts/${record.bank_number}`)
                message.success('ปลดบัญชีสำเร็จ')
                await onLoadTable.value()
            } catch (e: any) {
                console.error(e)
                const errorMessage = e?.response?.data?.message || e?.message || 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ'
                message.error(errorMessage)
            }
            loading.value = false
        }
    })
}

const getBankName = (bankCode?: string) => {
    if (!bankCode) return '-'
    const bank = banks.value.find((b) => b.code === bankCode);
    return bank ? bank.nameTh : bankCode;
};

const getBankImage = (bankCode?: string) => {
    if (!bankCode) return null
    const bank = banks.value.find((b) => b.code === bankCode);
    return bank ? bank.img : null;
};

</script>

<template>
    <a-row align="middle" :gutter="[24, 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="header-content">
                    <div class="header-text">
                        <h1 class="header-title">บัญชีที่ถูกบล็อก</h1>
                    </div>
                </div>
                <p class="mb-[16px]">ค้นหา</p>
                <a-row :gutter="[16, 16]">
                    <a-col :span="24">
                        <a-input
                            v-model:value="searchText"
                            placeholder="ค้นหาเลขบัญชี หรือชื่อบัญชี"
                            @pressEnter="onSearch"
                            :loading="loading"
                            style="max-width: 400px"
                        />
                    </a-col>
                    <a-col :span="24">
                        <a-space size="middle">
                            <a-button 
                                type="primary"
                                @click="onSearch" 
                                :loading="loading"
                                size="middle"
                                style="display: flex; align-items: center;"
                            >
                                <Icon icon="line-md:search" class="mr-1"></Icon>
                                ค้นหา
                            </a-button>
                            <a-button 
                                @click="onResetSearch" 
                                :loading="loading"
                                size="middle"
                                style="display: flex; align-items: center;"
                            >
                                <Icon icon="line-md:rotate-270" class="mr-1"></Icon>
                                รีเซ็ต
                            </a-button>
                        </a-space>
                    </a-col>
                </a-row>
            </a-card>
        </a-col>
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="float-right">
                    <a-button 
                        style="margin-bottom: 16px; display: flex;align-items: center;" 
                        @click="onLoadTable"
                        :disabled="loading"
                    >
                        <Icon :icon="loading ? 'svg-spinners:270-ring' : 'famicons:reload'" class="mr-2"></Icon> รีเฟรช
                    </a-button>
                </div>
                <a-table 
                    :columns="columns" 
                    :data-source="data" 
                    :loading="loading" 
                    @change="handleTableChange"
                    bordered 
                    :pagination="pagination"
                    :scroll="{ x: 'max-content' }"
                >
                    <template #bodyCell="{ column, index, text, record }">
                        <template v-if="column.key === 'bank_name'">
                            <div class="flex items-center gap-2">
                                {{ record.bank_name || '-' }}
                                <Icon 
                                    v-if="record.bank_name" 
                                    icon="si:copy-duotone" 
                                    class="cursor-pointer" 
                                    width="16" 
                                    height="16" 
                                    @click="onCopyText(record.bank_name)" 
                                />
                            </div>
                        </template>
                        <template v-if="column.key === 'bank_number'">
                            <div class="flex items-center gap-2">
                                {{ formatThaiBankAccount(record.bank_number) }}
                                <Icon 
                                    icon="si:copy-duotone" 
                                    class="cursor-pointer" 
                                    width="16" 
                                    height="16" 
                                    @click="onCopyText(record.bank_number)" 
                                />
                            </div>
                        </template>
                        <template v-if="column.key === 'bank'">
                            <div class="flex items-center gap-2">
                                <img 
                                    v-if="getBankImage(record.bank?.code)" 
                                    :src="getBankImage(record.bank?.code)" 
                                    :alt="record.bank?.name" 
                                    class="h-[20px]" 
                                    width="35" 
                                    height="35"
                                />
                                <a-tag color="blue" style="margin-left: 15px;">
                                    {{ record.bank?.name || getBankName(record.bank?.code) || '-' }}
                                </a-tag>
                            </div>
                        </template>
                        <template v-if="column.key === 'more'">
                            <a-space>
                                <a-button 
                                    type="primary"
                                    danger
                                    class="px-0" 
                                    @click="onUnblock(record)"
                                    :loading="loading"
                                >
                                    <div class="flex gap-1 items-center text-xs">
                                        <Icon icon="mdi:lock-open" width="14" height="14"></Icon> ปลด
                                    </div>
                                </a-button>
                            </a-space>
                        </template>
                    </template>
                </a-table>
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
</style>
