import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Home from '@/views/Home.vue'
import LayoutDashBoard from '@/layouts/Dashboard.vue'
import Transacion from '@/views/Transaction.vue';
import Employee from '@/views/User.vue'
import Profile from '@/views/Profile.vue'
import Commission from '@/views/Commission.vue'
import Merchant from '@/views/Merchant.vue'
import Api from '@/views/Api.vue'
import Role from '@/views/Role.vue';
import Topup from '@/views/Topup.vue';
import Agent from '@/views/Agent.vue';
import AllTransaction from '@/views/AllTransaction.vue';
import { useAuthStore } from '@/stores/auth';
import Mannul from '@/views/Mannul.vue';
import Bank from '@/views/Bank.vue';
import Account from '@/views/Account.vue';
import Setting from '@/views/Setting.vue';
import System from '@/views/System.vue';
import CommissionRecived from '@/views/CommissionRecived.vue';
import Announcement from '@/views/Announcement.vue'
import GroupAccount from '@/views/GroupAccount.vue';
import Refund from '@/views/Refund.vue';
import Transferout from '@/views/Transferout.vue';
import Statement from '@/views/Statement.vue';
import Message from '@/views/Message.vue';
import AccountSettlement from '@/views/AccountSettlement.vue';
import Customer from '@/views/Customer.vue';
import Profit from '@/views/ProfitList.vue';
import FreezeBalanceMerchant from '@/views/FreezeBalanceMerchant.vue'
import Blacklist from '@/views/Blacklist.vue';
import MerchantActivity from '@/views/MerchantActivity.vue';
import BlockedAccount from '@/views/BlockedAccount.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login' , component: Login } ,
    { 
      path: '/', 
      redirect: 'dashboard' ,
      component: LayoutDashBoard ,
      meta: { requiresAuth: true } ,
      children: [
        { path: 'dashboard' , component: Home , meta: { permission: 'dashboard.view' } } ,
        { path: 'transactions' , component: Transacion , meta: { permission: 'transactions.view' } } ,
        { path: 'transactions/all' , component: AllTransaction , meta: { permission: 'all_transaction.view' } } ,
        { path: 'employee' , component: Employee, meta: { permission: 'user.view' } } ,
        { path: 'profile' , component: Profile } ,
        { path: 'commission' , component: Commission , meta: { permission: 'commission.view' } } ,
        { path: 'commission-recived' , component: CommissionRecived , meta: { permission: 'commission.view' } } ,
        { path: 'agent' , name: 'agent' , component: Agent , meta: { permission: 'agent.view' }} ,
        { path: 'merchant' , component: Merchant , meta: { permission: 'merchant.view' }} ,
        { path: 'api' , component: Api , meta: { permission: 'api.view' } } ,
        { path: 'role' , component: Role , meta: { permission: 'role.view' } } ,
        { path: 'topup' , component: Topup , meta: { permission: 'topup.view' }} ,
        { path: 'transferout' , component: Transferout , meta: { permission: 'transferout.view' }} ,
        { path: 'banks' , component: Bank , meta: { permission: 'bank.view' }} ,
        { path: 'accounts' , component: Account , meta: { permission: 'account.view' }} ,
        { path: 'mannul' , component: Mannul } ,
        { path: 'setting' , component: Setting , meta: { permission: 'setting.view' } } ,
        { path: 'system' , component: System , meta: { permission: 'system.view' } } ,
        { path: 'announcement' , component: Announcement , meta: { permission: 'announcement.view' } } ,
        { path: 'account/groups' , component: GroupAccount , meta: { permission: 'bank.view' } } ,
        { path: 'refund' , component: Refund , meta: { permission: 'refund.view' } } ,
        { path: 'statement' , component: Statement , meta: { permission: 'statement.view' } } ,
        { path: 'message' , component: Message , meta: { permission: 'telegram_message.view' } } ,
        { path: 'accounts/settlement' , component: AccountSettlement , meta: { permission: 'settlement_account.view' } } ,
        { path: 'customers' , component: Customer , meta: { permission: 'customers.view' } } ,
        { path: 'profit' , component: Profit , meta: { permission: 'agent.view' } } ,
        { path: 'freeze-balance-merchant' , component: FreezeBalanceMerchant , meta: { permission: 'merchant.view' } } ,
        { path: 'blacklist' , component: Blacklist , meta: { permission: 'blacklist.view' } } ,
        { path: 'merchant-activity' , component: MerchantActivity , meta: { permission: 'agent.view' } } ,
        { path: 'blocked-account' , component: BlockedAccount , meta: { permission: 'blacklist.view' } } ,
      ]
    } ,
  ],
})

router.beforeEach((to, from, next) => {
  const { isLogin , user } = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!isLogin) {
      return next('/login')
    }

    // ถ้ากำหนด permission → ตรวจสอบสิทธิ์
    if (to.meta.permission) {
      const perm = to.meta.permission as string
      if(!user?.permissions.includes(perm)) {
        return next('/profile')
      } 
    }
  }

  return next()
})


export default router
