export const genBarChart = (day: number) => {
  // สร้าง mockup label เป็นวันย้อนหลังตามจำนวน 'day'
  const labels: string[] = []
  const today = new Date()
  for (let i = day - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const dayString = date.getDate().toString().padStart(2, '0')
    labels.push(`${date.getFullYear()}-${month}-${dayString}`)
  }

  // mockup รายละเอียดข้อมูลในแต่ละวัน (random)
  const depositData = labels.map(() => Math.floor(Math.random() * 10000) + 1000)
  const withdrawData = labels.map(() => Math.floor(Math.random() * 8000) + 500)

  return {
    labels,
    datasets: [
      {
        label: 'ยอดฝาก',
        backgroundColor: '#22c55e',
        data: depositData
      },
      {
        label: 'ยอดถอน',
        backgroundColor: '#ef4444',
        data: withdrawData
      }
    ]
  }
}

export const chartOptionsMock = () => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugin: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            x: {
                grid: {
                    display: false, // ✅ เปิดเส้นตารางแกน X
                },
                ticks: {
                    color: '#b2b3b6'
                },
            },
            y: {
                grid: {
                    display: false, // ✅ เปิดเส้นตารางแกน Y
                },
                ticks: {
                    beginAtZero: true ,
                    color: '#b2b3b6'
                },
            },
        }
    }
}

export const genPieChart = (day: number) => {
  // สร้าง mockup ข้อมูลยอดฝากและยอดถอนรวมของช่วงวันย้อนหลังตามจำนวน 'day'
  let depositTotal = 0
  let withdrawTotal = 0

  for (let i = 0; i < day; i++) {
    depositTotal += Math.floor(Math.random() * 10000) + 1000
    withdrawTotal += Math.floor(Math.random() * 8000) + 500
  }

  return {
    labels: ['ยอดฝาก', 'ยอดถอน'],
    datasets: [
      {
        data: [depositTotal, withdrawTotal],
        backgroundColor: ['#22c55e', '#ef4444']
      }
    ]
  }
}

