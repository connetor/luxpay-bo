import api from '@/configs/api'
import type { Account, Bank, GroupAccount } from '@/interface/Modal'
import { formatNumber } from '@/utils'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export const useInitStore = defineStore('init', () => {
    const banks = ref<Bank[]>([])
    const groups = ref<GroupAccount[]>([])
    const isBalance = ref(0)
    const isCommission = ref(0)
    const accounts = ref<Account[]>([])

    const version = ref(import.meta.env.VITE_APP_VERSION ? Number(import.meta.env.VITE_APP_VERSION) : 1)

    const init = async () => {
        try {
            await getBanks()
            await getGroups()
        } catch(e) {}
    }

    const getBanks = async () => {
        const res = await api.get('api/v1/bo/bank').then(res => res.data)
        banks.value = res.data
    }

    const getGroups = async () => {
        const res = await api.get('api/v1/bo/bank-group').then(res => res.data)
        groups.value = res.data
    }

    const getAccounts = async () => {
        const res = await api.get('api/v1/bo/account/options/list').then(res => res.data)
        accounts.value = res.data
    }

    const getBalance = async () => {
        const res = await api.get('api/v1/bo/merchant/credit/balance').then(res => res.data)
        isBalance.value = res.data.balance
        isCommission.value = res.data.commission
    }

    const reloadInit = init

    const balance = computed(() => formatNumber(isBalance.value, 2))
    const commission = computed(() => formatNumber(isCommission.value, 2))

    const isBank = (id: number) => {
        return banks.value.find(item => item.id == id)
    }

    return { banks , groups , init , reloadInit , version , getBalance , balance , isBank , commission , getAccounts , accounts }
})
