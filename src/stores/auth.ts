import { defineStore } from 'pinia'
import { CONSTANT } from '@/constants'
import api from '@/configs/api'
import router from '@/router'
import { ref } from 'vue'

interface User {
    id: number 
    name: string
    username: string 
    permissions: string[]
    merchant: {
        id: number
        name: string 
        ratePayin: number
        ratePayout: number
        typeRatePayin: 'fixed' | 'percent'
        typeRatePayout: 'fixed' | 'percent'
        prefix: string
        website: string
    }
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const isLogin = ref(false)

    const login = async (data: unknown) => {
        try {
            const res = await api.post('api/v1/login' , data).then(res => res.data)
            localStorage.setItem(CONSTANT.KEY.TOKEN , res.data.token)
            await me()
            router.push('/dashboard')
        } catch(e) {}
    }

    const me = async () => {
        try {
            const res = await api.get('api/v1/bo/me').then(res => res.data)
            user.value = res.data
            isLogin.value = true
        } catch(e) {
            logout()
        }
    }

    const logout = () => {
        localStorage.removeItem(CONSTANT.KEY.TOKEN)
        isLogin.value = false
        user.value = null
        router.push('/login')
    }

    return { user , isLogin , login , me , logout }

}, { persist: true })
