# OrderPay UI Components

ชุด UI Components ที่ออกแบบมาเฉพาะสำหรับ OrderPay ด้วยธีมสีเหลืองที่สวยงามและทันสมัย

## Components

### ThunderCard
การ์ดที่สวยงามพร้อมธีม OrderPay
```vue
<ThunderCard title="หัวข้อ" icon="mdi:icon" variant="primary">
  เนื้อหา
</ThunderCard>
```

### ThunderButton
ปุ่มที่ออกแบบมาเฉพาะสำหรับ OrderPay
```vue
<ThunderButton variant="primary" size="md" icon="mdi:icon">
  คลิกที่นี่
</ThunderButton>
```

### ThunderInput
Input field ที่สวยงามพร้อมธีม OrderPay
```vue
<ThunderInput 
  v-model="value" 
  label="ป้ายกำกับ" 
  icon="mdi:icon"
  placeholder="กรอกข้อมูล"
/>
```

### ThunderBadge
Badge สำหรับแสดงสถานะ
```vue
<ThunderBadge variant="success" icon="mdi:check">
  สำเร็จ
</ThunderBadge>
```

### ThunderStats
การ์ดแสดงสถิติ
```vue
<ThunderStats 
  title="ยอดเงิน" 
  value="฿1,000" 
  icon="mdi:currency-usd"
  :change="5.2"
/>
```

### ThunderTable
ตารางข้อมูลที่สวยงาม
```vue
<ThunderTable 
  :data="data" 
  :columns="columns"
  title="รายการข้อมูล"
/>
```

### ThunderModal
Modal dialog ที่สวยงาม
```vue
<ThunderModal 
  :visible="showModal" 
  title="หัวข้อ"
  @close="showModal = false"
>
  เนื้อหา Modal
</ThunderModal>
```

### ThunderAlert
Alert notification
```vue
<ThunderAlert 
  variant="success" 
  title="สำเร็จ"
  message="ดำเนินการเสร็จสิ้น"
/>
```

### ThunderProgress
Progress bar
```vue
<ThunderProgress 
  :percentage="75" 
  label="ความคืบหน้า"
/>
```

### ThunderSpinner
Loading spinner
```vue
<ThunderSpinner size="lg" text="กำลังโหลด..." />
```

## สีธีม OrderPay

- **Primary**: #FFD700 (สีเหลืองทอง)
- **Secondary**: #FFA500 (สีส้มทอง)
- **Accent**: #FFE55C (สีเหลืองอ่อน)
- **Orange**: #FF8C00 (สีส้ม)
- **Light**: #FFF8DC (สีเหลืองอ่อนมาก)

## การใช้งาน

```typescript
import { ThunderCard, ThunderButton, ThunderInput } from '@/components/thunder'
```

## Features

- 🎨 ธีมสีเหลือง OrderPay ที่สวยงาม
- 📱 Responsive Design
- ⚡ Animation และ Transition ที่ลื่นไหล
- 🎯 Accessibility ที่ดี
- 🔧 Customizable และ Flexible
- 💫 Modern UI/UX Design

