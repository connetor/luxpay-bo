
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'

export function usePermission() {

    const { user } = useAuthStore()

    function isInvildPermission(permName: string , showMsg = false) {
        const status = user?.permissions.includes(permName)
        if(showMsg) {
            message.warning('สิทธิ์การใช้งานไม่ถูกต้อง')
        }

        return status
    }

    return { isInvildPermission }

}