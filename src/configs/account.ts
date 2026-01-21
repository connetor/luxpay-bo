import type { Bank } from "@/interface/Modal";

export const accountConfig = {
    service: ['scraping' , 'api'] ,
    bank: ['SCB' , 'KTB'],
    api: [],
    scraping: ['SCB' , 'KTB'] ,
    filterBank(bank: Bank[]) {
        return bank.filter(item => this.bank.includes(item.short))
    },
}