<template>
  <div class="standard-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="header-title">แดชบอร์ด LUKPAY</h1>
          <p class="header-subtitle">ข้อมูลเชิงลึกทางการเงินแบบเรียลไทม์</p>
        </div>
      </div>
      
      <div class="header-controls">
        <div class="date-range">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M8 2v3M16 2v3M3.5 9.09h17M21 8.5V17a2 2 0 01-2 2H5a2 2 0 01-2-2V8.5a2 2 0 012-2h14a2 2 0 012 2z" fill="currentColor"/>
          </svg>
          <span>ช่วงเวลา:</span>
          <input type="date" class="date-input" value="2025-01-30" />
          <span>-</span>
          <input type="date" class="date-input" value="2025-01-30" />
        </div>
        <button class="refresh-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" fill="currentColor"/>
          </svg>
          รีเฟรช
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" fill="currentColor"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">ยอดฝากทั้งหมด</h3>
          <p class="stat-value">฿0</p>
          <div class="stat-change positive">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 14l5-5 5 5" fill="currentColor"/>
            </svg>
            <span>0% จากเมื่อวาน</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon danger">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" fill="currentColor"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">ยอดถอนทั้งหมด</h3>
          <p class="stat-value">฿0</p>
          <div class="stat-change positive">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 14l5-5 5 5" fill="currentColor"/>
            </svg>
            <span>0% จากเมื่อวาน</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" fill="currentColor"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">ค่าธรรมเนียมยอดฝากทั้งหมด</h3>
          <p class="stat-value">฿0</p>
          <div class="stat-change positive">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 14l5-5 5 5" fill="currentColor"/>
            </svg>
            <span>0% จากเมื่อวาน</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" fill="currentColor"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">ค่าธรรมเนียมยอดถอนทั้งหมด</h3>
          <p class="stat-value">฿0</p>
          <div class="stat-change positive">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 14l5-5 5 5" fill="currentColor"/>
            </svg>
            <span>0% จากเมื่อวาน</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" fill="currentColor"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">จำนวนธุรกรรมทั้งหมด</h3>
          <p class="stat-value">0 รายการ</p>
          <div class="stat-change positive">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 14l5-5 5 5" fill="currentColor"/>
            </svg>
            <span>0% จากเมื่อวาน</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" fill="currentColor"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">จำนวนธุรกรรมที่สำเร็จ</h3>
          <p class="stat-value">0 รายการ</p>
          <div class="stat-change positive">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 14l5-5 5 5" fill="currentColor"/>
            </svg>
            <span>0% จากเมื่อวาน</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="chart-section">
      <div class="chart-header">
        <div class="chart-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 3v18h18M9 9h6v6H9z" fill="currentColor"/>
          </svg>
          <h2>กราฟสถิติการฝาก-ถอน</h2>
        </div>
        <div class="chart-controls">
          <select class="chart-select">
            <option value="7">7 วัน</option>
            <option value="30">30 วัน</option>
            <option value="90">90 วัน</option>
          </select>
          <button class="chart-refresh-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" fill="currentColor"/>
            </svg>
            รีเฟรช
          </button>
        </div>
      </div>
      <div class="chart-container">
        <div class="chart-placeholder">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <path d="M3 3v18h18M9 9h6v6H9z" fill="currentColor"/>
          </svg>
          <p>กราฟสถิติจะแสดงที่นี่</p>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="transactions-section">
      <div class="transactions-header">
        <div class="transactions-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" fill="currentColor"/>
          </svg>
          <h2>รายการธุรกรรมล่าสุด</h2>
        </div>
        <div class="transactions-actions">
          <button class="action-btn secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" fill="currentColor"/>
            </svg>
            รีเฟรช
          </button>
          <button class="action-btn primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" fill="currentColor"/>
            </svg>
            ดูทั้งหมด
          </button>
        </div>
      </div>
      
      <div class="transactions-table">
        <div class="table-header">
          <div class="table-cell">รหัสรายการ</div>
          <div class="table-cell">รหัสอ้างอิง</div>
          <div class="table-cell">วันที่ทำรายการ</div>
          <div class="table-cell">ช่องทาง</div>
          <div class="table-cell">ประเภท</div>
          <div class="table-cell">สถานะ</div>
          <div class="table-cell">ยอดเงิน</div>
          <div class="table-cell">ยอดฝากเงิน</div>
          <div class="table-cell">ค่าธรรมเนียม</div>
        </div>
        
        <div class="table-body">
          <div class="table-row">
            <div class="table-cell">
              <span class="transaction-id">TXN001</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" fill="currentColor"/>
              </svg>
            </div>
            <div class="table-cell">
              <span class="reference">REF001</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" fill="currentColor"/>
              </svg>
            </div>
            <div class="table-cell">2025-01-30 10:30</div>
            <div class="table-cell">
              <span class="badge success">ฝากเงิน</span>
            </div>
            <div class="table-cell">
              <span class="badge success">ฝาก</span>
            </div>
            <div class="table-cell">
              <span class="badge success">สำเร็จ</span>
            </div>
            <div class="table-cell">
              <span class="amount">฿1,000.00</span>
            </div>
            <div class="table-cell">
              <span class="deposit-amount">฿1,000.00</span>
            </div>
            <div class="table-cell">
              <span class="fee-amount">฿0.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Standard dashboard logic
</script>

<style scoped>
.standard-dashboard {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Header Section */
.dashboard-header {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: var(--primary);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.header-text h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 4px;
}

.header-text p {
  font-size: 16px;
  color: var(--gray-600);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-600);
  font-weight: 600;
}

.date-input {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--gray-800);
  font-weight: 600;
}

.refresh-btn {
  background: var(--primary);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: var(--primary-dark);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.stat-icon.primary {
  background: var(--primary-light);
  color: var(--primary);
}

.stat-icon.success {
  background: rgba(20, 184, 166, 0.1);
  color: var(--success);
}

.stat-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.stat-icon.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.stat-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-600);
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.positive {
  color: var(--success);
}

.stat-change.negative {
  color: var(--danger);
}

/* Chart Section */
.chart-section {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-800);
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-select {
  background: var(--white);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--gray-800);
  font-weight: 600;
}

.chart-refresh-btn {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  border-radius: 6px;
  padding: 6px 10px;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chart-refresh-btn:hover {
  background: var(--gray-200);
}

.chart-container {
  height: 300px;
  background: var(--gray-50);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: var(--gray-500);
}

.chart-placeholder svg {
  margin-bottom: 8px;
}

/* Transactions Section */
.transactions-section {
  background: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.transactions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.transactions-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.transactions-title h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-800);
}

.transactions-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
}

.action-btn.primary {
  background: var(--primary);
  color: white;
}

.action-btn.secondary {
  background: var(--gray-100);
  border: 1px solid var(--gray-300);
  color: var(--gray-600);
}

.action-btn:hover {
  opacity: 0.9;
}

.action-btn.secondary:hover {
  background: var(--gray-200);
}

/* Table Styles */
.transactions-table {
  overflow-x: auto;
}

.table-header {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray-200);
  font-weight: 700;
  color: var(--gray-700);
  font-size: 14px;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--gray-100);
  transition: all 0.2s ease;
}

.table-row:hover {
  background: var(--gray-50);
}

.table-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--gray-700);
}

.transaction-id, .reference {
  font-weight: 600;
  color: var(--gray-800);
}

.badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.badge.success {
  background: rgba(20, 184, 166, 0.1);
  color: var(--success);
}

.badge.warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.badge.danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.amount {
  font-weight: 700;
  color: var(--primary);
}

.deposit-amount {
  font-weight: 700;
  color: var(--success);
}

.fee-amount {
  font-weight: 700;
  color: var(--danger);
}

/* Responsive */
@media (max-width: 768px) {
  .standard-dashboard {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .header-controls {
    justify-content: center;
  }
  
  .chart-header, .transactions-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .table-cell {
    justify-content: space-between;
  }
}
</style>
