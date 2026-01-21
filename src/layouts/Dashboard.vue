<template>
  <div class="dashboard">
    <!-- Header -->
    <AppHeader 
      :sidebar-open="sidebarOpen" 
      @toggle-sidebar="toggleSidebar" 
    />

    <!-- Sidebar -->
    <AppSidebar 
      :is-open="sidebarOpen" 
      @close-sidebar="closeSidebar"
      @logout="handleLogout"
    />

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="content-wrapper">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppHeader from '../components/layouts/Header.vue'
import AppSidebar from '../components/layouts/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { useInitStore } from '@/stores/init'

// State
const sidebarOpen = ref(false)
const isMobile = ref(false)

const { me } = useAuthStore()
const initStore = useInitStore()

// Check if mobile
const checkMobile = () => {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 768
  
  // Auto-open sidebar on desktop, auto-close on mobile
  if (!isMobile.value && wasMobile) {
    // Switching from mobile to desktop - open sidebar
    sidebarOpen.value = true
  } else if (isMobile.value && !wasMobile) {
    // Switching from desktop to mobile - close sidebar
    sidebarOpen.value = false
  } else if (!isMobile.value && !sidebarOpen.value) {
    // On desktop and sidebar is closed - open it
    sidebarOpen.value = true
  }
}

// Toggle sidebar
const toggleSidebar = () => {
  console.log('🔥 Dashboard - Toggle sidebar')
  sidebarOpen.value = !sidebarOpen.value
}

// Close sidebar
const closeSidebar = () => {
  console.log('🔥 Dashboard - Close sidebar')
  sidebarOpen.value = false
}

// Handle logout
const handleLogout = () => {
  console.log('🔥 Dashboard - Logout')
  // Add logout logic here
  alert('ออกจากระบบ')
}

// Lifecycle
onMounted(async () => {
  await me()
  await initStore.init()
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  
  // Initialize sidebar state based on screen size
  if (!isMobile.value) {
    sidebarOpen.value = true
  } else {
    sidebarOpen.value = false
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f9fafb;
}

.main-content {
  margin-top: 0;
  margin-left: 0;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  background-color:#f9fafb;
}

.main-content.sidebar-open {
  margin-left: 280px;
}

.content-wrapper {
  padding: 84px 24px 24px 24px;
  max-width: 100%;
  margin: 0 auto;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
  }
  
  .content-wrapper {
    padding: 76px 16px 16px 16px;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .main-content.sidebar-open {
    margin-left: 280px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .main-content.sidebar-open {
    margin-left: 280px;
  }
}
</style>