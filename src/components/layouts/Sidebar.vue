<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useUiStore } from '@/stores/ui'
import { Icon } from '@iconify/vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/configs/api'
import { formatNumber } from '@/utils'
import { usePermission } from '@/composables/usePermission'
import { useInitStore } from '@/stores/init'
import { useRoute } from 'vue-router'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close-sidebar', 'logout'])

// Stores
const ui = useUiStore()
const { user, logout } = useAuthStore()
const initStore = useInitStore()
const { isInvildPermission } = usePermission()

// Router
const route = useRoute()

// State
const isMobile = ref(false)

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// Dynamic sidebar menu
const sidebars = computed(() => {
  if (initStore.version == 2) {
    return [
      { 
        title: 'เมนูหลัก',
        menus: [
          { title: 'แดชบอร์ด', link: '/dashboard', icon: 'solar:chart-2-bold', iconColor: '#3b82f6', permission: 'dashboard.view' },
          { title: 'ข้อมูลระบบ', link: '/system', icon: 'solar:server-bold', iconColor: '#8b5cf6', permission: 'system.view' },
        ]  
      },
      { 
        title: 'การเงิน',
        menus: [
          { title: 'รายงานร้านค้า', link: '/transactions', icon: 'solar:document-text-bold', iconColor: '#f3d58b', permission: 'transactions.view' },
          { title: 'เติมเงิน', link: '/topup', icon: 'solar:wallet-money-bold', iconColor: '#f3d58b', permission: 'topup.view' },
          { title: 'โอนเงิน', link: '/transferout', icon: 'solar:card-send-bold', iconColor: '#ef4444', permission: 'transferout.view' },
          { title: 'กลุ่มลูกค้า', link: '/customers', icon: 'solar:users-group-rounded-bold', iconColor: '#06b6d4', permission: 'customers.view' },
        ]  
      },
      { 
        title: 'ร้านค้า',
        menus: [
          { title: 'จัดการบัญชีร้านค้า', link: '/agent', icon: 'solar:shop-bold', iconColor: '#f3d58b', permission: 'agent.view' },
          { title: 'รายได้' , link: '/profit' , icon: 'ph:graph-thin' , permission: 'agent.view' } ,
          { title: 'ถอนรายได้', link: '/commission-recived', icon: 'solar:money-bag-bold', iconColor: '#f3d58b', permission: 'commission.view' },
        ]  
      },
      { 
        title: 'บริหาร',
        menus: [
          { title: 'จัดการร้านค้า', link: '/merchant', icon: 'solar:buildings-bold', iconColor: '#f3d58b', permission: 'merchant.view' },
          { title: 'ธุรกรรมทั้งหมด', link: '/transactions/all', icon: 'solar:list-bold', iconColor: '#3b82f6', permission: 'all_transaction.view' },
          { title: 'คืนเงินร้านค้า', link: '/refund', icon: 'solar:refresh-bold', iconColor: '#f3d58b', permission: 'refund.view' },
          { title: 'ข้อความอัตโนมัติ', link: '/message', icon: 'solar:chat-round-dots-bold', iconColor: '#8b5cf6', permission: 'telegram_message.view' },
        ]  
      },
      { 
        title: 'บัญชี',
        menus: [
          { title: 'ธนาคาร', link: '/banks', icon: 'mdi:bank', iconColor: '#0ea5e9', permission: 'bank.view' },
          { title: 'บัญชีธนาคาร', link: '/accounts', icon: 'mdi:credit-card', iconColor: '#6366f1', permission: 'account.view' },
          { title: 'โยกเงินบัญชี', link: '/accounts/settlement', icon: 'mdi:swap-horizontal', iconColor: '#f3d58b', permission: 'settlement_account.view' },
          { title: 'กลุ่มบัญชี', link: '/account/groups', icon: 'solar:users-group-two-rounded-bold', iconColor: '#8b5cf6', permission: 'account.view' },
          { title: 'สเตทเม้นท์', link: '/statement', icon: 'solar:file-text-bold', iconColor: '#64748b', permission: 'statement.view' },
          { title: 'อายัดเงินร้านค้า', link: '/freeze-balance-merchant', icon: 'material-symbols-light:money-off-rounded', iconColor: '#f3d58b', permission: 'merchant.view' },
        ]  
      },
      { 
        title: 'พนักงาน',
        menus: [
          { title: 'บัญชีพนักงาน', link: '/employee', icon: 'solar:user-bold', iconColor: '#ec4899', permission: 'user.view' },
          { title: 'ตำแหน่งพนักงาน', link: '/role', icon: 'solar:shield-user-bold', iconColor: '#f97316', permission: 'role.view' },
        ]  
      },
      { 
        title: 'โปรไฟล์',
        menus: [
          { title: 'จัดการโปรไฟล์', link: '/profile', icon: 'solar:settings-bold', iconColor: '#64748b' },
          { title: 'Api Key', link: '/api', icon: 'solar:code-bold', iconColor: '#f3d58b', permission: 'api.view' },
        ]  
      },
      {
        title: 'อื่นๆ',
        menus: [
          { title: 'ตั้งค่าระบบ', link: '/setting', icon: 'solar:settings-minimalistic-bold', iconColor: '#64748b', permission: 'setting.view' },
        ]
      }
    ]
  } else {
    return [
      { 
        title: 'เมนูหลัก',
        menus: [
          { title: 'แดชบอร์ด', link: '/dashboard', icon: 'solar:chart-2-bold', iconColor: '#3b82f6', permission: 'dashboard.view' },
          { title: 'ข้อมูลระบบ', link: '/system', icon: 'solar:server-bold', iconColor: '#8b5cf6', permission: 'system.view' },
        ]  
      },
      { 
        title: 'ธุรกรรม',
        menus: [
          { title: 'รายงานธุรกรรม', link: '/transactions', icon: 'solar:list-bold', iconColor: '#f3d58b', permission: 'transactions.view' },
          { title: 'เติมเงิน', link: '/topup', icon: 'solar:wallet-money-bold', iconColor: '#f3d58b', permission: 'topup.view' },
          { title: 'โอนเงิน', link: '/transferout', icon: 'solar:card-send-bold', iconColor: '#ef4444', permission: 'transferout.view' },
          { title: 'กลุ่มลูกค้า', link: '/customers', icon: 'solar:users-group-rounded-bold', iconColor: '#06b6d4', permission: 'customers.view' },
        ]  
      },
      { 
        title: 'เอเยนต์',
        menus: [
          { title: 'จัดการบัญชีเอเยนต์', link: '/agent', icon: 'solar:shop-bold', iconColor: '#f3d58b', permission: 'agent.view' },
          { title: 'รายได้' , link: '/profit' , icon: 'healthicons:money-bag-outline' , permission: 'agent.view' } ,
          { title: 'ถอนรายได้', link: '/commission-recived', icon: 'solar:money-bag-bold', iconColor: '#f3d58b', permission: 'commission.view' }
        ]  
      },
      { 
        title: 'บริหาร',
        menus: [
          { title: 'จัดการร้านค้า', link: '/merchant', icon: 'solar:buildings-bold', iconColor: '#f3d58b', permission: 'merchant.view' },
          { title: 'ธุรกรรมทั้งหมด', link: '/transactions/all', icon: 'solar:list-bold', iconColor: '#3b82f6', permission: 'all_transaction.view' },
          { title: 'คืนเงินร้านค้า', link: '/refund', icon: 'solar:refresh-bold', iconColor: '#f3d58b', permission: 'refund.view' },
          { title: 'ข้อความอัตโนมัติ', link: '/message', icon: 'solar:chat-round-dots-bold', iconColor: '#8b5cf6', permission: 'telegram_message.view' },
        ]  
      },
      { 
        title: 'บัญชี',
        menus: [
          { title: 'ธนาคาร', link: '/banks', icon: 'mdi:bank', iconColor: '#0ea5e9', permission: 'bank.view' },
          { title: 'บัญชีธนาคาร', link: '/accounts', icon: 'mdi:credit-card', iconColor: '#6366f1', permission: 'account.view' },
          { title: 'โยกเงินบัญชี', link: '/accounts/settlement', icon: 'mdi:swap-horizontal', iconColor: '#f3d58b', permission: 'settlement_account.view' },
          { title: 'กลุ่มบัญชี', link: '/account/groups', icon: 'solar:users-group-two-rounded-bold', iconColor: '#8b5cf6', permission: 'account.view' },
          { title: 'สเตทเม้นท์', link: '/statement', icon: 'solar:file-text-bold', iconColor: '#64748b', permission: 'statement.view' },
          { title: 'อายัดเงินร้านค้า', link: '/freeze-balance-merchant', icon: 'material-symbols-light:money-off-rounded', iconColor: '#f3d58b', permission: 'merchant.view' },
        ]  
      },
      { 
        title: 'พนักงาน',
        menus: [
          { title: 'จัดการบัญชีพนักงาน', link: '/employee', icon: 'solar:user-bold', iconColor: '#ec4899', permission: 'user.view' },
          { title: 'จัดการตำแหน่งพนักงาน', link: '/role', icon: 'solar:shield-user-bold', iconColor: '#f97316', permission: 'role.view' },
        ]  
      },
      { 
        title: 'โปรไฟล์',
        menus: [
          { title: 'จัดการโปรไฟล์', link: '/profile', icon: 'solar:settings-bold', iconColor: '#64748b' },
          { title: 'Api Key', link: '/api', icon: 'solar:code-bold', iconColor: '#f3d58b', permission: 'api.view' },
        ]  
      },
      {
        title: 'อื่นๆ',
        menus: [
          { title: 'ตั้งค่าระบบ', link: '/setting', icon: 'solar:settings-minimalistic-bold', iconColor: '#64748b', permission: 'setting.view' },
          { title: 'คู่มือ', link: '/mannul', icon: 'solar:book-bold', iconColor: '#f3d58b' },
          { title: 'แบล็คลิสต์ลูกค้า' , link: '/blacklist' , icon: 'ph:users-four-thin'} ,
          { title: 'บัญชีที่โดนบล็อค' , link: '/blocked-account' , icon: 'mdi-badge-account-horizontal-outline' , permission: 'blacklist.view'} ,
        ]
      }
    ]
  }
})

// Check if menu section should be skipped
const checkSkipMenu = (routes: { title: string, menus: { title: string, link: string, icon: string, permission?: string }[] }) => {
  let skip = true
  routes.menus.forEach(menu => {
    if (menu.permission) {
      if (isInvildPermission(menu.permission)) {
        skip = false
      }
    } else {
      skip = false
    }
  })
  return !skip
}

// Check if user has permission
const permmissionInvalid = (permission: string) => {
  return user?.permissions.includes(permission)
}

// Check if menu item is active
const isActive = (path: string) => {
  if (path === '/dashboard') {
    return route.path === '/' || route.path === '/dashboard'
  }
  // For accounts/settlement, check exact match first to prevent /accounts from being active
  if (path === '/accounts' && route.path.startsWith('/accounts/settlement')) {
    return false
  }
  return route.path.startsWith(path)
}

// Close sidebar
const closeSidebar = () => {
  console.log('🔥 Sidebar - Close sidebar clicked')
  emit('close-sidebar')
}

// Handle menu item click
const handleMenuItemClick = (path: string) => {
  console.log('🔥 Sidebar - Menu item clicked:', path)
  if (isMobile.value) {
    closeSidebar()
  }
}

// App title and logo
const appTitle = import.meta.env.VITE_APP_TITLE
// const appTitle = 'LUXPAY'

const getLogoPath = () => {
  const logoMap: Record<string, string> = {
    LUXPAY: '/logo/luxpay-2.png'
  }
  return logoMap[appTitle] || '/favicon.ico'
}

// Balance update interval
let interval: number | undefined

// Lifecycle
onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  await initStore.getBalance()
  interval = setInterval(async () => {
    await initStore.getBalance()
  }, 20000)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  clearInterval(interval)
})
</script>

<template>
  <aside class="sidebar" :class="{ 'open': isOpen, 'mobile': isMobile }">
    <!-- Mobile Close Button -->
    <div class="mobile-close" v-if="isMobile">
      <button @click="closeSidebar" class="close-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <div class="header-logo">
        <div class="logo-icon">
          <!-- <img :src="getLogoPath()" alt="Logo" class="logo-image"> -->
          <img src="/logo/luxpay-2.png" alt="Logo" class="logo-image">
        </div>
        <!-- <div class="logo-text" v-if="!ui.collapsed">
          <h2>{{ appTitle }}</h2>
          <small>Payment Gateway</small>
        </div> -->
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <template v-for="(item, index) in sidebars" :key="index">
        <div v-if="checkSkipMenu(item)" class="nav-section">
          <h3 class="section-title" v-if="!ui.collapsed">{{ item.title }}</h3>
          <ul class="nav-list">
            <template v-for="(menu, index2) in item.menus" :key="index2">
              <li v-if="(menu.permission && permmissionInvalid(menu.permission)) || !menu.permission">
                <router-link 
                  :to="menu.link" 
                  class="nav-link" 
                  :class="{ 'active': isActive(menu.link) }" 
                  @click="handleMenuItemClick(menu.link)"
                >
                  <div class="nav-icon" :style="{ color: menu.iconColor || '#94a3b8' }">
                    <Icon :icon="menu.icon" width="20" height="20" />
                  </div>
                  <span class="nav-text" v-if="!ui.collapsed">{{ menu.title }}</span>
                </router-link>
              </li>
            </template>
          </ul>
        </div>
      </template>
    </nav>

    <!-- Sidebar Footer -->
    <!-- <div class="sidebar-footer">
      <div class="user-profile">
        <div class="user-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
          </svg>
        </div>
        <div class="user-info" v-if="!ui.collapsed">
          <span class="user-name">{{ user?.name?.toUpperCase() || 'User' }}</span>
          <span class="user-balance">฿{{ formatNumber(initStore.balance, 2) }}</span>
        </div>
      </div>
      <div class="footer-actions">
        <button class="logout-btn" @click="logout" :title="ui.collapsed ? 'ออกจากระบบ' : ''">
          <Icon icon="mdi:shutdown" width="16" height="16" />
          <span v-if="!ui.collapsed">ออกจากระบบ</span>
        </button>
      </div>
    </div> -->
  </aside>

  <!-- Mobile Overlay -->
  <div 
    v-if="isMobile && isOpen" 
    class="mobile-overlay" 
    @click="closeSidebar"
  ></div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: var(--white);
  /* border-right: 1px solid #fabb22; */
  border-right: 1px solid #d9b35b;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar.mobile {
  width: 100%;
  max-width: 320px;
}

.mobile-close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: var(--danger);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--danger);
  transform: scale(1.1);
}

.sidebar-header {
  padding: 24px 20px;
  /* border-bottom: 1px solid #faba20; */
  border-bottom: 1px solid #d9b35b;
  background: var(--white);
  position: relative;
  overflow: hidden;
}

.sidebar-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  /* background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%); */
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.logo-icon {
  /* width: 200px;
  height: 80px; */
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* background: white; */
  /* padding: 10px; */
  /* box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12); */
  transition: all 0.3s ease;
  /* border: 1px solid #e5e7eb; */
}

.logo-icon:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.logo-text h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: var(--gray-800);
  line-height: 1;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  flex: 1;
  padding: 24px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  color: var(--gray-500);
  margin: 0 0 12px 24px;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
}

.section-title::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 50%;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin: 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 24px;
  color: var(--gray-700);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  position: relative;
  margin: 2px 0;
  border-radius: 0 12px 12px 0;
}

.nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  transition: width 0.3s ease;
  border-radius: 0 12px 12px 0;
}

.nav-link:hover {
  background: var(--primary-light);
  color: var(--primary);
  border-left-color: var(--primary);
  transform: translateX(4px);
}

.nav-link:hover::before {
  width: 4px;
}

.nav-link.active {
  background: linear-gradient(135deg, var(--primary-light) 0%, rgba(20, 184, 166, 0.1) 100%);
  color: var(--primary);
  border-left-color: var(--primary);
  font-weight: 600;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
}

.nav-link.active::before {
  width: 4px;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
  filter: brightness(1.1);
}

.nav-link.active .nav-icon {
  transform: scale(1.1);
  color: var(--primary) !important;
  filter: brightness(1.2);
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

.sidebar-footer {
  padding: 24px 20px;
  border-top: 1px solid #e5e7eb;
  background: var(--white);
  position: relative;
}

.sidebar-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.user-profile:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
  transition: all 0.3s ease;
}

.user-profile:hover .user-avatar {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(20, 184, 166, 0.4);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: var(--gray-800);
  line-height: 1.2;
  margin-bottom: 4px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.user-balance {
  display: block;
  font-size: 13px;
  color: var(--gray-600);
  line-height: 1.2;
  font-weight: 600;
}

.footer-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logout-btn {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--danger) 0%, #dc2626 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
  position: relative;
  overflow: hidden;
}

.logout-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.logout-btn:hover::before {
  left: 100%;
}

.logout-btn:active {
  transform: translateY(0);
}

.mobile-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  backdrop-filter: blur(2px);
}

/* Collapsed state styles */
.sidebar.collapsed .nav-text {
  display: none;
}

.sidebar.collapsed .section-title {
  display: none;
}

.sidebar.collapsed .user-info {
  display: none;
}

.sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 12px;
}

.sidebar.collapsed .nav-icon {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    top: 60px;
    width: 100%;
    max-width: 320px;
  }
  
  .sidebar-header {
    padding: 16px;
  }
  
  .sidebar-nav {
    padding: 16px 0;
  }
  
  .sidebar-footer {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    max-width: 100%;
  }
}
</style>