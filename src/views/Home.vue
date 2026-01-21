<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import api from '@/configs/api';
import { formatThaiBankAccount, setFormatTime, formatNumber } from '@/utils'
import { useEvent } from '@/composables/useEvent';
import { ThunderCard, ThunderButton, ThunderStats, ThunderTable, ThunderBadge } from '@/components/thunder';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const dayGraph = ref(7)
const loading = reactive({
    stats: false,
    graph: false,
    transaction: false
})
const transactions = ref([])

const { user } = useAuthStore()
const { onCopyText } = useEvent()

const formStateSearch = reactive({
    date: [
        dayjs(dayjs(), 'YYYY-MM-DD'),
        dayjs(dayjs(), 'YYYY-MM-DD')
    ]
})

const infos = reactive({
    dashboard: [
        { title: 'ยอดฝากทั้งหมด', key: 'total_deposit', value: 0, prefix: '฿', sub_value: '+0.00', color: 'success', icon: 'dashicons:money-alt', bg_icon: 'bg-green-500' },
        { title: 'ยอดถอนทั้งหมด', key: 'total_withdraw', value: 0, prefix: '฿', sub_value: '+0.00', color: 'danger', icon: 'dashicons:money-alt', bg_icon: 'bg-red-500' },
        { title: 'ค่าธรรมเนียมยอดฝากทั้งหมด', key: 'total_mdr_deposit', prefix: '฿', value: 0, sub_value: '+0.00', icon: 'qlementine-icons:money-16', bg_icon: 'bg-red-500' },
        { title: 'ค่าธรรมเนียมยอดถอนทั้งหมด', key: 'total_mdr_withdraw', prefix: '฿', value: 0, sub_value: '+0.00', icon: 'qlementine-icons:money-16', bg_icon: 'bg-red-500' },
        { title: 'จำนวนธุรกรรมทั้งหมด', key: 'total', value: 0, subfix: 'รายการ', sub_value: '+0.00', icon: 'quill:list', bg_icon: 'bg-blue-500' },
        { title: 'จำนวนธุรกรรมที่สำเร็จ', key: 'total_success', value: 0, subfix: 'รายการ', sub_value: '+0.00', icon: 'fluent-mdl2:completed', bg_icon: 'bg-green-500' },
        { title: 'จำนวนธุรกรรมที่รอทำรายการ', key: 'total_pending', value: 0, subfix: 'รายการ', sub_value: '+0.00', icon: 'material-symbols-light:pending-outline', bg_icon: 'bg-yellow-500' },
        { title: 'จำนวนธุรกรรมที่กำลังทำรายการ', key: 'total_process', value: 0, subfix: 'รายการ', sub_value: '+0.00', icon: 'uit:process', bg_icon: 'bg-blue-500' },
        { title: 'จำนวนธุรกรรมที่ผิดพลาด', key: 'total_fail', value: 0, subfix: 'รายการ', sub_value: '+0.00', icon: 'fluent-mdl2:error-badge', bg_icon: 'bg-red-500' }
    ],
    merchant: [
        { title: 'ยอดเงินคงเหลือ', key: 'balance', value: 0, icon: 'qlementine-icons:money-16', bg_icon: 'bg-green-500' },
        { title: 'ยอดเงินในกระเป๋าเอเย่นต์คงเหลือ', key: 'balanceCommission', value: 0, icon: 'streamline-ultimate:money-bag-dollar', bg_icon: 'bg-blue-500' },
        { title: 'รายได้จากเอเย่นต์วันนี้', key: 'commission', value: 0, icon: 'dashicons:money-alt', bg_icon: 'bg-yellow-500' },
        { title: 'ยอดพักเงินร้านค้า', key: 'freeze_balance', value: 0, icon: 'qlementine-icons:money-16', bg_icon: 'bg-blue-500' },
        { title: 'ค่าธรรมเนียมฝาก', key: '', value: user?.merchant.ratePayin, subfix: user?.merchant.typeRatePayin === 'percent' ? '%' : '฿', icon: 'dashicons:money-alt', bg_icon: 'bg-green-500' },
        { title: 'ค่าธรรมเนียมถอน', key: '', value: user?.merchant.ratePayout, subfix: user?.merchant.typeRatePayout === 'percent' ? '%' : '฿', icon: 'dashicons:money-alt', bg_icon: 'bg-red-500' },
    ]
})

const chartData = ref<any>({
    labels: [],
    datasets: [],
})

const chartOptions = reactive({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
            labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                    family: 'IBM Plex Sans Thai',
                    size: 14,
                    weight: 'normal' as const
                },
                color: '#FF8C00'
            }
        },
    },
    scales: {
        x: {
            grid: {
                display: false,
                color: '#FFF8DC'
            },
            ticks: {
                color: '#FF8C00',
                font: {
                    family: 'IBM Plex Sans Thai',
                    size: 12
                }
            },
        },
        y: {
            grid: {
                display: true,
                color: '#FFF8DC'
            },
            ticks: {
                beginAtZero: true,
                color: '#FF8C00',
                font: {
                    family: 'IBM Plex Sans Thai',
                    size: 12
                }
            },
        },
    }
})

const handleRefresh = async () => {
    // Reset date to today
    formStateSearch.date = [
        dayjs(dayjs(), 'YYYY-MM-DD'),
        dayjs(dayjs(), 'YYYY-MM-DD')
    ]
    await loadStats()
    await loadGraph()
}

const loadStats = async () => {
    loading.stats = true
    try {
        const params = {
            startDate: formStateSearch.date[0].format('YYYY-MM-DD'),
            endDate: formStateSearch.date[1].format('YYYY-MM-DD')
        }

        const res = await api.get('api/v1/bo/stats', { params }).then(res => res.data)
        const { stats, merchant } = res.data

        infos.dashboard.map(i => {
            if (stats[i.key]) i.value = stats[i.key]
            return i
        })

        infos.merchant.map(i => {
            if (merchant[i.key]) i.value = merchant[i.key]
            return i
        })

    } catch (e) {
        console.error('❌ Error loading stats:', e)
    }
    loading.stats = false
}

const loadTransaction = async () => {
    loading.transaction = true
    try {
        const res = await api.get('api/v1/bo/trx').then(res => res.data)
        transactions.value = res.data
    } catch (e) { }
    loading.transaction = false
}

const loadGraph = async () => {
    loading.graph = true
    try {
        const res = await api.get('api/v1/bo/graph', { params: { day: dayGraph.value } }).then(res => res.data)
        const responseData: { date: string, total_payin: number, total_payout: number }[] = res.data

        if (dayGraph.value > 7) {
            const grouped: Record<string, { payin: number; payout: number }> = {}

            responseData.forEach(item => {
                const weekStart = dayjs(item.date).startOf('week').format('DD/MM')
                const weekEnd = dayjs(item.date).endOf('week').format('DD/MM')
                const label = `${weekStart} - ${weekEnd}`

                if (!grouped[label]) {
                    grouped[label] = { payin: 0, payout: 0 }
                }

                grouped[label].payin += item.total_payin
                grouped[label].payout += item.total_payout
            });

            const labels = Object.keys(grouped)
            const depositData = labels.map(label => grouped[label].payin)
            const withdrawData = labels.map(label => grouped[label].payout)

            chartData.value = {
                labels,
                datasets: [
                    {
                        label: 'ฝาก',
                        data: depositData,
                        backgroundColor: '#14b8a6',
                        borderColor: '#0d9488',
                        borderWidth: 2,
                    },
                    {
                        label: 'ถอน',
                        data: withdrawData,
                        backgroundColor: '#ef4444',
                        borderColor: '#dc2626',
                        borderWidth: 2,
                    },
                ]
            }
        }
        else {
            const lables: string[] = []
            const deposit: number[] = []
            const withdraw: number[] = []
            responseData.forEach(item => {
                lables.push(item.date)
                deposit.push(item.total_payin)
                withdraw.push(item.total_payout)
            });

            chartData.value = {
                labels: lables,
                datasets: [
                    {
                        label: 'ฝาก',
                        data: deposit,
                        backgroundColor: '#14b8a6',
                        borderColor: '#0d9488',
                        borderWidth: 2,
                    },
                    {
                        label: 'ถอน',
                        data: withdraw,
                        backgroundColor: '#ef4444',
                        borderColor: '#dc2626',
                        borderWidth: 2,
                    },
                ]
            }
        }

    } catch (e) {
        console.error('❌ Error loading graph:', e)
    }
    loading.graph = false
}

const columns = computed(() => {
    return [
        { title: 'รหัสรายการ', dataIndex: 'transactionId', key: 'transactionId' },
        { title: 'รหัสอ้างอิง', dataIndex: 'reference', key: 'reference' },
        { title: 'วันที่ทำรายการ', dataIndex: 'createdAt', key: 'createdAt' },
        { title: 'ช่องทาง', key: 'action', dataIndex: 'action' },
        { title: 'ประเภท', key: 'type', dataIndex: 'type' },
        { title: 'สถานะ', dataIndex: 'status', key: 'status' },
        { title: 'ยอดเงิน', dataIndex: 'amount', key: 'amount' },
        { title: 'ยอดฝากเงิน', dataIndex: 'depositAmount', key: 'depositAmount' },
        { title: 'ค่าธรรมเนียม', dataIndex: 'mdrAmount', key: 'mdrAmount' },
    ]
})

const tableColumns = computed(() => {
    return [
        { title: 'รหัสรายการ', key: 'transactionId' },
        { title: 'รหัสอ้างอิง', key: 'reference' },
        { title: 'วันที่ทำรายการ', key: 'createdAt' },
        { title: 'ช่องทาง', key: 'action' },
        { title: 'ประเภท', key: 'type' },
        { title: 'สถานะ', key: 'status' },
        { title: 'ยอดเงิน', key: 'amount' },
        { title: 'ยอดฝากเงิน', key: 'depositAmount' },
        { title: 'ค่าธรรมเนียม', key: 'mdrAmount' },
    ]
})

onMounted(async () => {
    await loadStats()
    await loadTransaction()
    await loadGraph()
})

</script>

<template>
    <div class="standard-dashboard">
        <!-- Header Section -->
        <div class="dashboard-header">
            <div class="header-content">
                <div class="header-text">
                    <h1 class="header-title">แดชบอร์ด</h1>
                    <!-- <p class="header-subtitle">ข้อมูลเชิงลึกทางการเงินแบบเรียลไทม์</p> -->
                </div>
            </div>

            <div class="header-controls">
                <div class="date-range">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17a2 2 0 01-2 2H5a2 2 0 01-2-2V8.5a2 2 0 012-2h14a2 2 0 012 2z"
                            fill="currentColor" />
                    </svg>
                    <span>ช่วงเวลา:</span>
                    <a-range-picker v-model:value="formStateSearch.date" format="YYYY-MM-DD"
                        @change="() => { loadStats(); loadGraph(); }" class="date-input" />
                </div>
                <button class="refresh-btn" @click="handleRefresh" :disabled="loading.stats">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            fill="currentColor" />
                    </svg>
                    รีเฟรช
                </button>
            </div>
        </div>

        <!-- Key Stats Cards -->
        <div class="key-stats-grid">
            <!-- Total Deposits -->
            <div class="key-stat-card">
                <div class="stat-icon light-success">
                    <Icon icon="solar:dollar-minimalistic-bold" width="24" height="24" />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">ยอดฝากทั้งหมด</h3>
                    <p class="stat-value">฿{{ formatNumber(infos.dashboard[0].value, 2) }}</p>
                    <div class="stat-change positive">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M7 14l5-5 5 5" fill="currentColor" />
                        </svg>
                        <span>{{ infos.dashboard[0].sub_value }}% จากเมื่อวาน</span>
                    </div>
                </div>
            </div>

            <!-- Total Withdrawals -->
            <div class="key-stat-card">
                <div class="stat-icon light-danger">
                    <Icon icon="solar:dollar-minimalistic-bold" width="24" height="24" />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">ยอดถอนทั้งหมด</h3>
                    <p class="stat-value">฿{{ formatNumber(infos.dashboard[1].value, 2) }}</p>
                    <div class="stat-change positive">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M7 14l5-5 5 5" fill="currentColor" />
                        </svg>
                        <span>{{ infos.dashboard[1].sub_value }}% จากเมื่อวาน</span>
                    </div>
                </div>
            </div>

            <!-- Total Deposit Fees -->
            <div class="key-stat-card">
                <div class="stat-icon light-warning">
                    <Icon icon="solar:wallet-money-bold" width="24" height="24" />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">ค่าธรรมเนียมยอดฝากทั้งหมด</h3>
                    <p class="stat-value">฿{{ formatNumber(infos.dashboard[2].value, 2) }}</p>
                    <div class="stat-change positive">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M7 14l5-5 5 5" fill="currentColor" />
                        </svg>
                        <span>{{ infos.dashboard[2].sub_value }}% จากเมื่อวาน</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Additional Stats Grid -->
        <div class="additional-stats-grid">
            <div v-for="(item, index) in infos.dashboard.slice(3)" :key="index" class="stat-card">
                <div class="stat-icon"
                    :class="item.color === 'success' ? 'success' : item.color === 'danger' ? 'danger' : item.color === 'warning' ? 'warning' : 'primary'">
                    <Icon :icon="item.icon" width="20" height="20" />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">{{ item.title }}</h3>
                    <p class="stat-value">{{ item.prefix || '' }}{{ formatNumber(item.value, 2) }}{{ item.subfix || ''
                        }}</p>
                    <div class="stat-change" :class="parseFloat(item.sub_value) >= 0 ? 'positive' : 'negative'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M7 14l5-5 5 5" fill="currentColor" />
                        </svg>
                        <span>{{ item.sub_value }}% จากเมื่อวาน</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Merchant Info Section -->
        <div class="merchant-section">
            <div class="merchant-header">
                <div class="merchant-title">
                    <h2>ข้อมูลร้านค้า</h2>
                </div>
            </div>
            <div class="merchant-grid">
                <div v-for="(item, index) in infos.merchant" :key="index" class="merchant-card">
                    <div class="merchant-icon">
                        <Icon :icon="item.icon" width="20" height="20" />
                    </div>
                    <div class="merchant-content">
                        <h4 class="merchant-title">{{ item.title }}</h4>
                        <p class="merchant-value">{{ formatNumber(item.value, 2) }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Transactions -->
        <div class="transactions-section">
            <div class="chart-header">
                <div class="chart-title">
                    <h2>รายการธุรกรรมล่าสุด</h2>
                </div>
                <div class="float-right">
                    <a-space>
                        <a-button style="margin-bottom: 16px; display: flex; align-items: center;"
                            @click="loadTransaction" :disabled="loading.transaction">
                            <Icon :icon="loading.transaction ? 'svg-spinners:270-ring' : 'famicons:reload'"
                                class="mr-2"></Icon>
                            รีเฟรช
                        </a-button>
                        <a-button type="primary" style="margin-bottom: 16px; display: flex; align-items: center;"
                            @click="() => { $router.push({ path: '/transactions' }) }">
                            <Icon icon="mdi:eye" class="mr-2"></Icon> ดูทั้งหมด
                        </a-button>
                    </a-space>
                </div>
            </div>
            <a-table :columns="columns" :data-source="transactions" :loading="loading.transaction" bordered
                :pagination="{ pageSize: 10 }" :scroll="{ x: 'max-content' }">
                <template #bodyCell="{ column, text, record }">
                    <template v-if="column.key === 'transactionId'">
                        <div class="flex items-center gap-2">
                            {{ text }}
                            <Icon icon="solar:copy-bold" class="copy-icon" width="16" height="16"
                                @click="onCopyText(text)" />
                        </div>
                    </template>
                    <template v-if="column.key === 'reference'">
                        <div class="flex items-center gap-2">
                            {{ text }}
                            <Icon icon="solar:copy-bold" class="copy-icon" width="16" height="16"
                                @click="onCopyText(text)" />
                        </div>
                    </template>
                    <template v-if="column.key === 'createdAt'">
                        {{ setFormatTime(text) }}
                    </template>
                    <template v-if="column.key === 'type'">
                        <a-tag color="green" v-if="record.type === 'payin'">ฝาก</a-tag>
                        <a-tag color="red" v-else>ถอน</a-tag>
                    </template>
                    <template v-if="column.key === 'status'">
                        <a-tag color="blue" v-if="record.status === 'process'">
                            <div class="flex items-center">
                                <Icon icon="svg-spinners:270-ring" class="mr-2"></Icon> กำลังทำรายการ
                            </div>
                        </a-tag>
                        <a-tag color="warning" v-else-if="record.status === 'pending'">รอทำรายการ</a-tag>
                        <a-tag color="green" v-else-if="record.status === 'completed'">สำเร็จ</a-tag>
                        <a-tag color="purple" v-else-if="record.status === 'timeout'">หมดเวลา</a-tag>
                        <a-tag color="error" v-else>ล้มเหลว</a-tag>
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-tag color="green" v-if="record.action === 'deposit'">ฝากเงิน</a-tag>
                        <a-tag color="red" v-else-if="record.action === 'withdraw'">ถอนเงิน</a-tag>
                        <a-tag color="success" v-else-if="record.action === 'topup'">เติมเงิน</a-tag>
                        <a-tag color="red" v-else-if="record.action === 'transferout'">โอนเงิน</a-tag>
                        <a-tag color="magenta" v-else-if="record.action === 'settlement'">โยกเงิน</a-tag>
                        <a-tag color="yellow" v-else-if="record.action === 'commission'">ถอนรายได้</a-tag>
                        <a-tag color="cyan" v-else-if="record.action === 'refund'">คืนเงิน</a-tag>
                        <a-tag color="purple" v-else-if="record.action === 'settlement_account'">โยกเงินบัญชี</a-tag>
                    </template>
                    <template v-if="column.key === 'amount'">
                        <span>{{ formatNumber(text, 2) }}</span>
                    </template>
                    <template v-if="column.key === 'depositAmount'">
                        <span>{{ formatNumber(text, 2) }}</span>
                    </template>
                    <template v-if="column.key === 'mdrAmount'">
                        <span>{{ formatNumber(text, 2) }}</span>
                    </template>
                </template>
            </a-table>
        </div>

        <!-- Chart Section -->
        <div class="chart-section">
            <div class="chart-header">
                <div class="chart-title">
                    <h2>กราฟสถิติการฝาก-ถอน</h2>
                </div>
                <div class="chart-controls">
                    <a-select :disabled="loading.graph" v-model:value="dayGraph" style="width: 100px;"
                        @change="loadGraph" class="chart-select">
                        <a-select-option :value="7">7 วัน</a-select-option>
                        <a-select-option :value="30">30 วัน</a-select-option>
                        <a-select-option :value="90">90 วัน</a-select-option>
                    </a-select>
                    <button class="chart-refresh-btn" @click="loadGraph" :disabled="loading.graph">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                fill="currentColor" />
                        </svg>
                        รีเฟรช
                    </button>
                </div>
            </div>

            <div class="chart-container">
                <Bar :options="chartOptions" :data="chartData"></Bar>
            </div>
        </div>
    </div>
</template>

<style scoped>
.standard-dashboard {
    padding: 24px;
    max-width: 100%;
    margin: 0 auto;
}

/* Header Section */
.dashboard-header {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
}

.header-icon {
    width: 48px;
    height: 48px;
    background: var(--primary);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.header-text h1 {
    font-size: 24px;
    font-weight: 700;
    color: var(--accent);
    margin-bottom: 4px;
}

.header-text p {
    font-size: 16px;
    color: var(--gray-600);
}

.header-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
}

.date-range {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--accent);
    font-weight: 600;
}

.date-input {
    background: var(--white);
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    padding: 6px 10px;
    color: var(--gray-800);
    font-weight: 600;
}

.refresh-btn {
    background: var(--primary);
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    color: white;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.refresh-btn:hover {
    background: var(--primary-dark);
}

.refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Key Stats Grid */
.key-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    margin-bottom: 32px;
}

.key-stat-card {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.key-stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
}

.key-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.key-stat-card .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    position: relative;
}

.key-stat-card .stat-icon.success {
    background: linear-gradient(135deg, #14b8a6, #0d9488);
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.key-stat-card .stat-icon.danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.key-stat-card .stat-icon.warning {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.key-stat-card .stat-icon.primary {
    background: linear-gradient(135deg, var(--primary), var(--accent));
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
}

.key-stat-card .stat-content {
    flex: 1;
}

.key-stat-card .stat-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--accent);
    margin: 0 0 8px 0;
    line-height: 1.3;
}

.key-stat-card .stat-value {
    font-size: 28px;
    font-weight: 800;
    color: var(--accent-dark);
    margin: 0 0 12px 0;
    line-height: 1.2;
}

.key-stat-card .stat-change {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
}

.key-stat-card .stat-change.positive {
    color: #0d9488;
}

.key-stat-card .stat-change.negative {
    color: #dc2626;
}

/* Additional Stats Grid */
.additional-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
}

.stat-card {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

.stat-card:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
}

.stat-icon.primary {
    background: var(--primary-light);
    color: var(--primary-dark);
}

.stat-icon.success {
    background: rgba(20, 184, 166, 0.1);
    color: var(--success);
}

.stat-icon.light-success {
    background: rgba(20, 184, 166, 0.05);
    color: var(--success);
}

.stat-icon.warning {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning);
}

.stat-icon.light-warning {
    background: rgba(245, 158, 11, 0.05);
    color: var(--warning);
}

.stat-icon.danger {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
}

.stat-icon.light-danger {
    background: rgba(239, 68, 68, 0.05);
    color: var(--danger);
}

.stat-icon.light-primary {
    background: rgba(251, 191, 36, 0.05);
    color: var(--primary);
}

.stat-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--accent);
    margin-bottom: 8px;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--accent-dark);
    margin-bottom: 4px;
}

.stat-change {
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
}

.stat-change.positive {
    color: var(--success);
}

.stat-change.negative {
    color: var(--danger);
}

/* Merchant Section */
.merchant-section {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.merchant-header {
    margin-bottom: 20px;
}

.merchant-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.merchant-title h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--accent);
}

.merchant-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
}

.merchant-card {
    background: var(--primary-light);
    border: 1px solid var(--gray-200);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
}

.merchant-icon {
    width: 40px;
    height: 40px;
    background: var(--primary);
    color: var(--primary-dark);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.merchant-content h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-600);
    margin-bottom: 4px;
}

.merchant-value {
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-800);
}

/* Chart Section */
.chart-section {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.chart-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.chart-title h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--accent);
}

.chart-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.chart-select {
    width: 100px;
}

.chart-refresh-btn {
    background: var(--gray-100);
    border: 1px solid var(--gray-300);
    border-radius: 6px;
    padding: 6px 10px;
    color: var(--gray-600);
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.chart-refresh-btn:hover {
    background: var(--gray-200);
}

.chart-refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.chart-container {
    height: 300px;
    background: var(--white);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Transactions Section */
.transactions-section {
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.copy-icon {
    margin-left: 5px;
    cursor: pointer !important;
    color: var(--gray-400);
    transition: all 0.2s ease;
}

.copy-icon:hover {
    color: #3b82f6;
    transform: scale(1.15);
}

.copy-icon:active {
    transform: scale(0.95);
}

/* Responsive */
@media (max-width: 768px) {
    .standard-dashboard {
        padding: 16px;
    }

    .key-stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .key-stat-card {
        padding: 20px;
    }

    .key-stat-card .stat-icon {
        width: 48px;
        height: 48px;
    }

    .key-stat-card .stat-value {
        font-size: 24px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .header-content {
        flex-direction: column;
        text-align: center;
    }

    .header-controls {
        justify-content: center;
    }

    .chart-header,
    .transactions-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .table-header,
    .table-row {
        grid-template-columns: 1fr;
        gap: 6px;
    }

    .table-cell {
        justify-content: space-between;
    }
}
</style>