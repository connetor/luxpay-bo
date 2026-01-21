import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
    const collapsed = ref(false)
    const drawerVisible = ref(false)
    const loading = ref(false)
    const lang = ref('th')

    const toggleSidebar = () => {
        collapsed.value = !collapsed.value
    }

    const toggleDrawer = () => {
        drawerVisible.value = !drawerVisible.value
    }

    return { collapsed, drawerVisible, toggleSidebar, toggleDrawer, loading, lang }
})
