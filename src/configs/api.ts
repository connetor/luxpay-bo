import { CONSTANT } from "@/constants";
import axios from "axios";
import { message } from 'ant-design-vue';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem(CONSTANT.KEY.TOKEN);
    if(token) {
        config.headers['Authorization'] = 'Bearer ' + token
    }

    return config
})

api.interceptors.response.use(
    // 2xx http 
    res => {
        if(res.data.status) {
            return res
        }
        else {
            message.error(res.data.msg)
            throw new Error(res.data.msg)
        }
    },
    error => {
        const res = error.response
        if (!res) {
            // Network error or no response
            message.error('เกิดข้อผิดพลาดในการเชื่อมต่อ')
            return Promise.reject(error)
        }
        
        switch(res.status) {
            case 401:
                const msg = res.data?.msg || 'Unauthorized'
                // Clear token and logout immediately
                const authStore = useAuthStore()
                authStore.logout()
                message.error(msg)
                break
            case 400:
                const badRequestMsg = res.data?.msg || 'Bad Request'
                message.error(badRequestMsg)
                break
            case 403:
                const forbiddenMsg = res.data?.msg || 'Forbidden'
                message.error(forbiddenMsg)
                break
            case 404:
                const notFoundMsg = res.data?.msg || 'Resource Not Found'
                message.error(notFoundMsg)
                break
            case 422:
                const validationMsg = res.data?.msg || 'Validation Error'
                message.error(validationMsg)
                break
            case 500:
                const serverErrorMsg = res.data?.msg || 'Internal Server Error'
                message.error(serverErrorMsg)
                break
            case 502:
                const badGatewayMsg = res.data?.msg || 'Bad Gateway - Service temporarily unavailable'
                message.error(badGatewayMsg)
                break
            case 503:
                const maintenanceMsg = res.data?.msg || 'System is currently under maintenance. Please try again later.'
                message.error(maintenanceMsg)
                // You can add maintenance-specific handling here
                break
            case 504:
                const timeoutMsg = res.data?.msg || 'Gateway Timeout - Service temporarily unavailable'
                message.error(timeoutMsg)
                break
            default:
                const defaultMsg = res.data?.msg || `Error ${res.status}: ${res.statusText}`
                message.error(defaultMsg)
                break
        }
        return Promise.reject(error)
    }
)

export default api