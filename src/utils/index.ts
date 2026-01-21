import dayjs from "dayjs";
import 'dayjs/locale/th'

dayjs.locale('th')

export function setFormatTime (dateTime: string , format = 'YYYY-MM-DD HH:mm') {
    return dayjs(dateTime).format(format)
}

export function setFormatTimeThai (dateTime: string) {
  const d = dayjs(dateTime)
  const buddhistYear = d.year() + 543
  const day = d.date()
  const monthShort = d.format('MMM') // เช่น "มิ.ย."
  const time = dayjs(dateTime).format('HH:mm')

  return `${day} ${monthShort} ${buddhistYear} ${time}`
}

export function capitalize(s: string) {
    return String(s[0]).toUpperCase() + String(s).slice(1);
}

export function formatThaiBankAccount(account?: string): string {
  if(account) {
    const cleaned = account.replace(/\D/g, '')

    const len = cleaned.length

    if (len === 9) {
      // 123-4-56789
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4)}`
    }

    if (len === 10) {
      // 816-2-81474-1
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
    }

    if (len === 12) {
      // 123-4-567890-12
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 10)}-${cleaned.slice(10)}`
    }

    if (len === 13) {
      // 123-4-5678901-23
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4, 11)}-${cleaned.slice(11)}`
    }

    // ถ้า format ไม่รู้จัก → คืนเลขเต็ม
    return cleaned
  }
  else {
    return ''
  }
}

export function formatNumber(
  value: number | string | null | undefined,
  maximumFractionDigits: number = 2
): string {
  if (value === null || value === undefined || value === '') return '-'

  const numericValue = typeof value === 'string' ? Number(value) : value
  if (Number.isNaN(numericValue)) return String(value)

  return numericValue.toLocaleString('en-US', {
    maximumFractionDigits,
  })
}

export function calculatePercentChange(current: number, previous: number): string {
  if (previous === 0) {
      if (current === 0) return '0.00'
      return '100.00'
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100
  const fixed = pct.toFixed(2)
  return (pct >= 0 ? `+${fixed}` : fixed)
}

export function normalizeDashboardStats(payload: any): Record<string, number> {
  const source: any = payload?.stats ?? payload ?? {}
  const result: Record<string, number> = {}
  Object.keys(source).forEach((key) => {
      const n = Number(source[key])
      result[key] = Number.isNaN(n) ? 0 : n
  })
  return result
}