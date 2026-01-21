<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import dayjs from 'dayjs';
import { Icon } from '@iconify/vue';
import { useAuthStore } from '@/stores/auth';
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import api from '@/configs/api';
import { formatThaiBankAccount , setFormatTime, formatNumber } from '@/utils'
import { useEvent } from '@/composables/useEvent';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const dayGraph = ref(7)
const loading = reactive({
    stats: false ,
    graph: false ,
    transaction: false
})
const transactions = ref([])
const dashboardSystem = ref<any>(null)

const { user } = useAuthStore()
const { onCopyText } = useEvent()

const formStateSearch = reactive({
    date: [
        dayjs(dayjs() , 'YYYY-MM-DD'), 
        dayjs(dayjs() , 'YYYY-MM-DD')
    ]
})

const infos = reactive([
    { title: 'ยอดฝากทั้งหมด' , key: 'total_deposit' , value: 0 , prefix: '฿' , sub_value: '+0.00' , color: 'success' , icon: 'dashicons:money-alt' , bg_icon: 'bg-green-500' } ,
    { title: 'ยอดถอนทั้งหมด' , key: 'total_withdraw' , value: 0 , prefix: '฿' , sub_value: '+0.00' , color: 'danger' , icon: 'dashicons:money-alt' , bg_icon: 'bg-red-500' } ,
    { title: 'รายได้ยอดฝากทั้งหมด' , key: 'total_mdr_deposit' , prefix: '฿' , value: 0 , sub_value: '+0.00' , icon: 'qlementine-icons:money-16' , bg_icon: 'bg-red-500' } ,
    { title: 'รายได้ยอดถอนทั้งหมด' , key: 'total_mdr_withdraw' , prefix: '฿' , value: 0 , sub_value: '+0.00' , icon: 'qlementine-icons:money-16' , bg_icon: 'bg-red-500' } ,
    { title: 'จำนวนธุรกรรมทั้งหมด' , key: 'total' , value: 0, subfix: 'รายการ' , sub_value: '+0.00' , icon: 'quill:list' , bg_icon: 'bg-blue-500' } ,
    { title: 'จำนวนธุรกรรมที่สำเร็จ' , key: 'total_success' , value: 0 , subfix: 'รายการ' , sub_value: '+0.00' , icon: 'fluent-mdl2:completed' , bg_icon: 'bg-green-500' } ,
    { title: 'จำนวนธุรกรรมที่รอทำรายการ' , key: 'total_pending' , value: 0 , subfix: 'รายการ' , sub_value: '+0.00' , icon: 'material-symbols-light:pending-outline' , bg_icon: 'bg-yellow-500' } ,
    { title: 'จำนวนธุรกรรมที่กำลังทำรายการ' , key: 'total_process' , value: 0, subfix: 'รายการ' , sub_value: '+0.00'  , icon: 'uit:process' , bg_icon: 'bg-blue-500'} ,
    { title: 'จำนวนธุรกรรมที่ผิดพลาด' , key: 'total_fail' , value: 0 , subfix: 'รายการ', sub_value: '+0.00' , icon: 'fluent-mdl2:error-badge' , bg_icon: 'bg-red-500' }
])

const chartData = ref<any>({
    labels: [],
    datasets: [],
})

const chartData2 = ref<any>({
    labels: [],
    datasets: [],
})

const chartOptions = reactive({
    responsive: true,
    maintainAspectRatio: false,
    plugin: {
        legend: {
            position: 'top',
        },
    },
    scales: {
        x: {
            grid: {
                display: false, // ✅ เปิดเส้นตารางแกน X
            },
            ticks: {
                color: '#b2b3b6'
            },
        },
        y: {
            grid: {
                display: false, // ✅ เปิดเส้นตารางแกน Y
            },
            ticks: {
                beginAtZero: true ,
                color: '#b2b3b6'
            },
        },
    }
})

function normalizeDashboardStats(payload: any): Record<string, number> {
    const source: any = payload?.stats ?? payload ?? {}
    const result: Record<string, number> = {}
    Object.keys(source).forEach((key) => {
        const n = Number(source[key])
        result[key] = Number.isNaN(n) ? 0 : n
    })
    return result
}

function calculatePercentChange(current: number, previous: number): string {
    if (previous === 0) {
        if (current === 0) return '0.00'
        return '100.00'
    }
    const pct = ((current - previous) / Math.abs(previous)) * 100
    const fixed = pct.toFixed(2)
    return (pct >= 0 ? `+${fixed}` : fixed)
}

const handleRefresh = async () => {
    // Reset date to today
    formStateSearch.date = [
        dayjs(dayjs(), 'YYYY-MM-DD'), 
        dayjs(dayjs(), 'YYYY-MM-DD')
    ]
    await loadDashboard()
}

const loadDashboard = async () => {
    loading.stats = true
    try {
        const params = {
            startDate: formStateSearch.date[0].format('YYYY-MM-DD'),
            endDate: formStateSearch.date[1].format('YYYY-MM-DD')
        }
        const res = await api.get('api/v1/bo/dashboard-system', { params }).then(res => res.data)
        dashboardSystem.value = res.data
        // ค่าปัจจุบัน
        const currentStats = normalizeDashboardStats(dashboardSystem.value)
        infos.forEach((item) => {
            const key = item.key as keyof typeof currentStats
            const nextValue = currentStats[key] ?? 0
            if (item.value !== nextValue) item.value = nextValue
        })

        // ค่าของเมื่อวาน (เทียบที่ endDate - 1 วัน)
        const prevDate = formStateSearch.date[1].subtract(1, 'day').format('YYYY-MM-DD')
        const prevRes = await api.get('api/v1/bo/dashboard-system', { params: { startDate: prevDate, endDate: prevDate } }).then(r => r.data)
        const previousStats = normalizeDashboardStats(prevRes.data)

        // อัปเดตเปอร์เซ็นต์เปลี่ยนแปลงจากเมื่อวาน
        infos.forEach((item) => {
            const key = item.key as keyof typeof currentStats
            const curr = currentStats[key] ?? 0
            const prev = previousStats[key] ?? 0
            item.sub_value = calculatePercentChange(curr, prev)
        })
    } catch (error) {}
    loading.stats = false
}

const columns = computed(() => {
    return [
        { title: 'รหัสรายการ'  , dataIndex: 'transactionId' , key: 'transactionId' },
        { title: 'รหัสอ้างอิง'  , dataIndex: 'refferend' , key: 'refferend' },
        { title: 'วันที่ทำรายการ' , dataIndex: 'createdAt' , key: 'createdAt' },
        { title: 'ช่องทาง'  , key: 'action' , dataIndex: 'action' },
        { title: 'ประเภท'  , key: 'type' , dataIndex: 'type' },
        { title: 'สถานะ' , dataIndex: 'status' , key: 'status' },
        { title: 'ยอดเงิน'  , dataIndex: 'amount' , key: 'amount' },
        { title: 'ยอดฝากเงิน'  , dataIndex: 'depositAmount' , key: 'depositAmount' },
        { title: 'ค่าธรรมเนียม'  , dataIndex: 'mdrAmount' , key: 'mdrAmount' },
    ]
})

const loadGraph = async () => {
    loading.graph = true
    try {
        const startDate = formStateSearch.date[0]
        const endDate = formStateSearch.date[1]
        const days: string[] = []
        const depositData: number[] = []
        const withdrawData: number[] = []
        
        // สร้าง array ของวันที่ทั้งหมดในช่วงที่เลือก
        let currentDate = startDate.clone()
        const endDateClone = endDate.clone().add(1, 'day')
        while (currentDate.isBefore(endDateClone)) {
            const dateStr = currentDate.format('YYYY-MM-DD')
            days.push(currentDate.format('DD/MM'))
            
            // ดึงข้อมูลสำหรับแต่ละวัน
            try {
                const res = await api.get('api/v1/bo/dashboard-system', { 
                    params: { 
                        startDate: dateStr, 
                        endDate: dateStr 
                    } 
                }).then(res => res.data)
                
                const stats = normalizeDashboardStats(res.data)
                depositData.push(stats.total_deposit || 0)
                withdrawData.push(stats.total_withdraw || 0)
            } catch (error) {
                depositData.push(0)
                withdrawData.push(0)
            }
            
            currentDate = currentDate.add(1, 'day')
        }
        
        chartData2.value = {
            labels: days,
            datasets: [
                {
                    label: 'ยอดฝาก',
                    data: depositData,
                    backgroundColor: '#52c41a',
                },
                {
                    label: 'ยอดถอน',
                    data: withdrawData,
                    backgroundColor: '#f5222d',
                },
            ]
        }
    } catch (error) {}
    loading.graph = false
}

onMounted(async () => {
    await loadDashboard()
    await loadGraph()
})

</script>

<template>
    <div class="standard-dashboard">
        <!-- Header Section -->
        <div class="dashboard-header">
            <div class="header-content">
                <div class="header-text">
                    <h1 class="header-title">ข้อมูลระบบ</h1>
                </div>
            </div>
            
            <div class="header-controls">
                <div class="date-range">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17a2 2 0 01-2 2H5a2 2 0 01-2-2V8.5a2 2 0 012-2h14a2 2 0 012 2z" fill="currentColor"/>
                    </svg>
                    <span>ช่วงเวลา:</span>
                    <a-range-picker 
                        v-model:value="formStateSearch.date" 
                        format="YYYY-MM-DD" 
                        @change="() => { loadDashboard(); loadGraph(); }" 
                        class="date-input"
                    />
                </div>
                <button class="refresh-btn" @click="() => { loadDashboard(); loadGraph(); }" :disabled="loading.stats || loading.graph">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" fill="currentColor"/>
                    </svg>
                    รีเฟรช
                </button>
            </div>
        </div>

        <!-- Stats Grid -->
        <div class="stats-grid">
            <div 
                v-for="(item, index) in infos"
                :key="index"
                class="stat-card"
            >
                <div class="stat-icon" :class="item.color === 'success' ? 'success' : item.color === 'danger' ? 'danger' : item.color === 'warning' ? 'warning' : 'primary'">
                    <Icon :icon="item.icon" width="20" height="20" />
                </div>
                <div class="stat-content">
                    <h3 class="stat-title">{{ item.title }}</h3>
                    <p class="stat-value">{{ item.prefix || '' }}{{ formatNumber(item.value, 2) }}{{ item.subfix || '' }}</p>
                    <div class="stat-change" :class="parseFloat(item.sub_value) >= 0 ? 'positive' : 'negative'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M7 14l5-5 5 5" fill="currentColor"/>
                        </svg>
                        <span>{{ item.sub_value }}% จากเมื่อวาน</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Chart Section -->
        <div style="margin-top: 24px;">
            <div class="stat-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h2 style="font-size: 20px; font-weight: 700; color: var(--accent);">กราฟสถิติการฝาก-ถอนรายวัน</h2>
                    <button class="refresh-btn" @click="loadGraph" :disabled="loading.graph">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" fill="currentColor"/>
                        </svg>
                        รีเฟรช
                    </button>
                </div>
                <div style="height: 500px;">
                    <Bar 
                        :options="chartOptions"
                        :data="chartData2"
                    ></Bar>
                </div>
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
  background: var(--blacks);
  /* border: 1px solid var(--gray-200); */
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--blacks);
  /* border: 1px solid var(--gray-200); */
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

.stat-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.stat-icon.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
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

/* Responsive */
@media (max-width: 768px) {
  .standard-dashboard {
    padding: 16px;
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
}
</style>