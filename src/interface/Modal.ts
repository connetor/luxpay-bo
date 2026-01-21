export interface User {
    id: number
    name: string 
    username: string 
    roleId: number
    status: boolean
}

export interface Customer {
    id: number
    name: string 
    bankNumber: string 
    bankId: number
    tags: string[]
    remark: string
    referralCode: string
    createdAt: string
    updatedAt: string
}

export interface Permission {
    id: number
    name: string
    label: string
    group: string
}

export interface Role {
    id: number
    name: string
}

export interface Merchant {
    id: number
    name: string 
    prefix: string 
    typeRatePayin: 'fixed' | 'percent'
    typeRatePayout: 'fixed' | 'percent'
    ratePayin: number
    ratePayout: number
    balance: number
    commissions: {
        type: string 
        total_amount: number
        total_commission: number
    } []
    stats: {
        total: number
        total_deposit: number
        total_fail: number
        total_mdr: number
        total_mdr_deposit: number
        total_mdr_withdraw: number
        total_pending: number
        total_process: number
        total_success: number
        total_withdraw: number
    }
    createdAt: string
    totalPayin: number
    totalPayout: number
    user: User 
    isApprove: boolean
    isSuspend: boolean
    website: string
    status: boolean
    apiKey: string
    secretKey: string
    uplineId: number
    contact: string
    agencyPolice: string
}

export interface Bank {
    id: number
    nameTh: string
    nameEng: string
    code: string
    img: string
    status: boolean
    short: string
}

export interface TransactionStatement {
    id: number 
    remark: string 
    createdAt: string
    dateSlip: string
    amount: number
    accountId: number
}

export interface Account {
    id: number
    name: string
    bankNumber: string
    bankId: number
    promptpay: string
    businessId: string
    businessUsername: string  
    businessPassword: string 
    service: string
    limitPayin: number
    limitPayout: number
    status: boolean
    remark: string
    bank: Bank
    minTransfer: number
    maxTransfer: number
    group: GroupAccount
    type?: 'deposit' | 'withdraw'
}

export interface AccountUser {
    id: number
    name: string
    businessId: string
    businessUsername: string  
    businessPassword: string 
    googleCredentials: string
    action: string
}

export interface GroupAccount {
    id: number
    name: string
    discription: string
    accounts: Account[]
    merchants: Merchant[]
}

export interface Transaction {
    imgSlip: any
    id: number
    type: 'payin' | 'payout'
    rate: number
    amount: number
    depositAmount: number
    transactionId: string
    reference: string
    status: 'pending' | 'process' | 'completed' | 'fail' | 'timeout'
    merchant: Merchant 
    user: User
    account: Account
    bankNumber: string
    bank: {
        name: string 
        shortCode: string
    }
    bankName: string
    qrcode: string
    expiredAt: string
    rateType: 'fixed' | 'percent'
    action: string
    mdrAmount: number
    createdAt: string
    callbackUrl: string
    systemRemark: string
    userRemark: string
    message: string
    updatedAt: string
}

export interface TelegramMessage {
    id: number
    name: string
    remark: string
    message: string
    isBroadcast: boolean
    timeBroadcast: string
    recipients: string[]
    createdAt: string
}

export interface SettlementAccount {
    id: number
    amount: string
    bankId: number
    accountId: number
    bankNumber: string
    bankName: string
    status: boolean
    balanceAvailable: number
    remark: string
    account: Account
}

export interface FreezeBalance {
    id: number
    amount: number
    amountAvailable: number
    amountRefund: number
    remark: string
    accountId: number
    account: Account
    status: 'pending' | 'holding' | 'refunding' | 'refunded'
    user: User
    createdAt: string
}