import { copyText } from 'vue3-clipboard'
import { message } from 'ant-design-vue'
import type { Transaction } from '@/interface/Modal'
import { formatThaiBankAccount, setFormatTime } from '@/utils'

export function useEvent() {

    function onCopyText(text: string) {
        copyText(text)
        message.success('คัดลอกสำเร็จ')
    }

    function onCopyTransaction(transaction: Transaction , page: string = 'transaction') {
        let text: string[] = []
        if(page === 'transaction') {
            text = [
                'รายละเอียดธุรกรรม' ,
                `• ร้านค้า : ${transaction.merchant.name} (${transaction.merchant.prefix})` ,
                '• รหัสรายการ : ' + transaction.transactionId,
                '• รหัสอ้างอิง : ' + transaction.reference ,
                `• ยอด : ${transaction.type === 'payin' ? transaction.depositAmount : transaction.amount}` ,
                `• ประเภท : ${transaction.type === 'payin' ? 'ฝาก' : 'ถอน'}` ,
                '• ธนาคาร : ' + transaction.bank.name,
                '• ชื่อบัญชี : ' + transaction.bankName,
                '• เลขบัญชี : ' + formatThaiBankAccount(transaction.bankNumber)
            ]

            if(transaction.status === 'completed') {
                text.push('• สถานะอัปเดตเมื่อ : ' + setFormatTime(transaction.updatedAt))
            }

        }
        else if(page === 'all-transaction') {
            text = [

            ]
        }
        
        if(text) {
            onCopyText(text.join('\n'))
        } else {
            message.error('ไม่สามารถคัดลอกได้')
        }
    }

    function onDownLoadImage(name: string , image?: any ) {
        if (image) {
            const link = document.createElement('a')
            link.download = `${name}.png`
            link.href = image
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            message.success('ดาวน์โหลดสำเร็จ')
          } else {
            message.error('ไม่สามารถดาวน์โหลดได้')
          }
    }

    return { onCopyText , onCopyTransaction , onDownLoadImage }

}