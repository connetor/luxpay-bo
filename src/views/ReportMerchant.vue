
<script setup lang="ts">
import { onMounted, reactive , ref } from "vue";
import api from "@/configs/api";
import type { Account } from "@/interface/Modal";
import { message } from "ant-design-vue";
import { Icon } from "@iconify/vue";
import { accountConfig } from "@/configs/account";
import { capitalize } from '@/utils'
import { useInitStore } from "@/stores/init";
import { useAuthStore } from "@/stores/auth";
import { formatNumber } from "@/utils";
import { useEvent } from "@/composables/useEvent";

const loading = ref(false)

onMounted(async () => {
    // await loadData()
})

const loadData = async () => {
    // loading.value = true
    // try {
    //     const resAccount = await api.get('api/v1/bo/account' ).then(res => res.data)
    //     accounts.value = resAccount.data
    // } catch(e) {}
    // loading.value = false
}

const columns = reactive([
    // ...(permissions?.includes('account.update') ? [
    //     { title: 'จัดการ', key: 'more' },
    // ] : []),
    // { title: 'ช่องทาง' , dataIndex: 'service' , key: 'service' },
    // { title: 'ธนาคาร' , dataIndex: 'img' , key: 'img' },
    // { title: 'สถานะ' , dataIndex: 'status' , key: 'status' },
    // { title: 'กลุ่มบัญชี' , dataIndex: 'group' , key: 'group' },
    // { title: 'ประเภท' , dataIndex: 'type' , key: 'type' },
    // { title: 'ชื่อบัญชี' , dataIndex: 'name' , key: 'name' },
    // { title: 'เลขบัญชี' , dataIndex: 'bankNumber' , key: 'bankNumber' },
    // { title: 'ยอดสูงสุดต่อวัน' , children: [
    //     { title: 'ฝากเงิน' , dataIndex: 'limitPayin' , key: 'limitPayin' },
    //     { title: 'ถอนเงิน' , dataIndex: 'limitPayout' , key: 'limitPayout' },
    // ]},
    // { title: 'ยอดคงเหลือ' , dataIndex: 'balance' , key: 'balance' },
    // { title: 'ยอดเงินล็อค.' , dataIndex: 'amountLock' , key: 'amountLock' },
])

</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-typography-title :level="2" style="margin-bottom: 6px;">ความเคลื่อนไหวของสมาชิก</a-typography-title>
            <p>ข้อมูลความเคลื่อนไหวของสมาชิก</p>
        </a-col>
        <a-col :span="12">
            <a-card class="shadow-sm">
                dsds
            </a-card>
        </a-col>
        <a-col :span="12">
            <a-card class="shadow-sm">
                dsads
            </a-card>
        </a-col>
    </a-row>

 
</template>

<style>

</style>