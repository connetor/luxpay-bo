<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useInitStore } from '../../stores/init'
import { formatNumber } from '../../utils'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['toggle-sidebar', 'logout'])

// Stores
const { user, logout } = useAuthStore()
const initStore = useInitStore()

// Router
const router = useRouter()

// State
const showUserMenu = ref(false)
const userMenuRef = ref<HTMLElement>()
const isMobile = ref(false)

// Toggle sidebar
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

// Check if mobile
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 480
}

// Toggle user menu
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// Close user menu when clicking outside
const handleClickOutside = (event: Event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
}

// Navigation functions
const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const goToSettings = () => {
  showUserMenu.value = false
  router.push('/setting')
}

// Handle logout
const handleLogout = () => {
  showUserMenu.value = false
  emit('logout')
  logout()
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', checkMobile)
  checkMobile()
  // Load balance on mount
  initStore.getBalance()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <header class="header" :class="{ 'sidebar-open': sidebarOpen }">
    <!-- Mobile Menu Toggle -->
    <button 
      @click="toggleSidebar" 
      class="menu-toggle"
      :class="{ 'active': sidebarOpen }"
    >
      <span class="hamburger">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>

    <!-- Logo -->
    <!-- <div class="logo">
      <div class="logo-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
        </svg>
      </div>
      <div class="logo-text">
        <h1>LUKPAY</h1>
        <span>Payment Gateway</span>
      </div>
    </div> -->

    <!-- Right Side -->
    <div class="header-right">

      <!-- User Menu -->
      <div class="user-menu" ref="userMenuRef">
        <button class="user-btn" @click="toggleUserMenu">
          <div class="user-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
            </svg>
          </div>
          <div class="user-info">
            <span class="user-name">{{ user?.name || 'User' }}</span>
            <span class="user-balance" style="margin-top: 5px;">฿{{ formatNumber(initStore.balance, 2) }}</span>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :class="{ 'rotated': showUserMenu }">
            <path d="M7 10l5 5 5-5z" fill="currentColor"/>
          </svg>
        </button>
        
        <!-- User Dropdown Menu -->
        <div v-if="showUserMenu" class="user-dropdown" :class="{ 'mobile': isMobile }">
          <div class="dropdown-header">
            <div class="dropdown-user-info">
              <div class="dropdown-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                </svg>
              </div>
              <div class="dropdown-details">
                <span class="dropdown-name">{{ user?.name || 'User' }}</span>
                <span class="dropdown-email">{{ user?.username || 'user@example.com' }}</span>
              </div>
            </div>
          </div>
          
          <div class="dropdown-balance">
            <span class="balance-label">ยอดเงิน</span>
            <span class="balance-amount">฿{{ formatNumber(initStore.balance, 2) }}</span>
          </div>
          
          <div class="dropdown-actions">
            <button class="dropdown-item" @click="goToProfile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
              </svg>
              <span>โปรไฟล์</span>
            </button>
            
            <button class="dropdown-item" @click="goToSettings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill="currentColor"/>
              </svg>
              <span>ตั้งค่า</span>
            </button>
            
            <div class="dropdown-divider"></div>
            
            <button class="dropdown-item logout-item" @click="handleLogout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
              </svg>
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--white);
  /* border-bottom: 1px solid #f7aa14; */
  border-bottom: 1px solid #d9b35b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
}

.header.sidebar-open {
  left: 280px;
}

/* Menu Toggle Button */
.menu-toggle {
  width: 40px;
  height: 40px;
  background: var(--gray-100);
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--gray-800);
}

.menu-toggle:hover {
  background: var(--gray-200);
  transform: scale(1.05);
}

.menu-toggle:active {
  transform: scale(0.95);
}

/* Hamburger Icon */
.hamburger {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 16px;
}

.hamburger span {
  width: 100%;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transition: all 0.3s ease;
}

.menu-toggle.active .hamburger span:nth-child(1) {
  transform: rotate(45deg) translate(4px, 4px);
}

.menu-toggle.active .hamburger span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active .hamburger span:nth-child(3) {
  transform: rotate(-45deg) translate(4px, -4px);
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-text h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.logo-text span {
  font-size: 12px;
  color: #6b7280;
  line-height: 1;
}

/* Header Right */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Notification Button */
.notification-btn {
  position: relative;
  width: 40px;
  height: 40px;
  background: #f3f4f6;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.notification-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--gray-100);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-btn:hover {
  background: var(--gray-200);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #f3d58b, #d9b35b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800);
  line-height: 1;
}

.user-balance {
  font-size: 12px;
  color: #d9b35b;
  font-weight: 600;
  line-height: 1;
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--gray-200);
  z-index: 1000;
  margin-top: 8px;
  overflow: hidden;
  animation: dropdownFadeIn 0.2s ease-out;
  max-height: calc(100vh - 80px);
  overflow-y: auto;
}

.user-dropdown.mobile {
  position: fixed !important;
  top: 70px !important;
  left: 16px !important;
  right: 16px !important;
  width: auto !important;
  max-height: calc(100vh - 100px) !important;
  margin-top: 0 !important;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 20px;
  background: linear-gradient(135deg, #f3d58b 0%, #d9b35b 100%);
  color: white;
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dropdown-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.dropdown-details {
  flex: 1;
}

.dropdown-name {
  display: block;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
}

.dropdown-email {
  display: block;
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.2;
}

.dropdown-balance {
  padding: 16px 20px;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-label {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 500;
}

.balance-amount {
  font-size: 18px;
  color: #d9b35b;
  font-weight: 700;
}

.dropdown-actions {
  padding: 8px 0;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: none;
  border: none;
  color: var(--gray-800);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--gray-50);
  color: var(--gray-800);
}

.dropdown-item.logout-item {
  color: #f87171;
}

.dropdown-item.logout-item:hover {
  background: var(--gray-50);
  color: #f87171;
}

.dropdown-divider {
  height: 1px;
  background: var(--gray-200);
  margin: 8px 0;
}

.rotated {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 0 16px;
    left: 0 !important;
  }
  
  .logo-text span {
    display: none;
  }
  
  .user-info {
    display: none;
  }
  
  .user-btn {
    padding: 8px;
  }
  
  .user-dropdown {
    width: 280px;
    right: -10px;
    max-height: calc(100vh - 80px);
    max-width: calc(100vw - 32px);
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }
  
  .user-dropdown {
    width: calc(100vw - 32px);
    right: 16px;
    left: 16px;
    max-height: calc(100vh - 100px);
    position: fixed;
    top: 70px;
    margin-top: 0;
  }
  
  .dropdown-header {
    padding: 16px;
  }
  
  .dropdown-balance {
    padding: 12px 16px;
  }
  
  .dropdown-actions {
    padding: 4px 0;
  }
  
  .dropdown-item {
    padding: 10px 16px;
  }
}

@media (max-width: 360px) {
  .user-dropdown {
    width: calc(100vw - 24px);
    right: 12px;
    left: 12px;
    max-height: calc(100vh - 120px);
  }
  
  .dropdown-header {
    padding: 12px;
  }
  
  .dropdown-balance {
    padding: 10px 12px;
  }
  
  .dropdown-item {
    padding: 8px 12px;
    font-size: 13px;
  }
}
</style>