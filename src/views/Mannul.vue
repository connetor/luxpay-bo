
<script setup lang="ts">
import { Icon } from '@iconify/vue';
    
</script>

<template>
    <a-row align="middle" :gutter="[24 , 24]">
        <a-col :span="24">
            <a-card class="shadow-sm">
                <div class="header-content">
                    <div class="header-text">
                        <h1 class="header-title">คู่มือใช้งาน</h1>
                    </div>
                </div>
            </a-card>
        </a-col>

        <!-- API Documentation Card -->
        <a-col :lg="12" :md="24" :xs="24">
            <a-card class="manual-card shadow-sm">
                <div class="card-header green-line"></div>
                <div class="card-content">
                    <div class="card-icon blue-bg">
                        <Icon icon="solar:code-bold" width="32" height="32" />
                    </div>
                    <div class="card-body">
                        <h2 class="card-title">API Documentation</h2>
                        <p class="card-subtitle">เอกสาร API สำหรับนักพัฒนา</p>
                        <ul class="feature-list">
                            <li>
                                <Icon icon="solar:check-circle-bold" width="16" height="16" class="check-icon" />
                                <span>API Endpoints</span>
                            </li>
                            <li>
                                <Icon icon="solar:check-circle-bold" width="16" height="16" class="check-icon" />
                                <span>Authentication</span>
                            </li>
                            <li>
                                <Icon icon="solar:check-circle-bold" width="16" height="16" class="check-icon" />
                                <span>Examples</span>
                            </li>
                        </ul>
                        <a-typography-link href="https://documenter.getpostman.com/view/12273327/2sBXVkCA7m" target="_blank">
                            <a-button type="primary" class="read-button api-button" size="large">
                                <Icon icon="solar:document-text-bold" width="20" height="20" class="mr-2" />
                                <span>อ่านเอกสาร API</span>
                                <Icon icon="solar:arrow-right-bold" width="16" height="16" class="ml-2" />
                            </a-button>
                        </a-typography-link>
                    </div>
                </div>
            </a-card>
        </a-col>
    </a-row>

</template>

<style scoped>
.header-title {
    color: var(--accent) !important;
}

.header-text {
    color: var(--accent-dark) !important;
}

.manual-card {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    background: var(--blacks);
    border: 1px solid var(--gray-200);
    transition: all 0.3s ease;
}

.manual-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: var(--primary);
}

.card-header {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: 12px 12px 0 0;
}

.purple-line {
    background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
}

.green-line {
    background: linear-gradient(90deg, var(--primary) 0%, var(--primary-dark) 100%);
}

.card-content {
    display: flex;
    gap: 20px;
    padding: 24px;
    align-items: flex-start;
}

.card-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: white;
}

.blue-bg {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.card-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--gray-800);
    margin: 0;
    line-height: 1.2;
}

.card-subtitle {
    font-size: 14px;
    color: var(--gray-400);
    margin: 0;
}

.feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.feature-list li {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--gray-800);
    font-size: 14px;
}

.check-icon {
    color: var(--primary);
    flex-shrink: 0;
}

.read-button {
    width: 100%;
    height: 48px;
    border-radius: 8px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.3);
    transition: all 0.3s ease;
}

.read-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
    background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
}

.api-button {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.api-button:hover {
    background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.mr-2 {
    margin-right: 8px;
}

.ml-2 {
    margin-left: 8px;
}

@media (max-width: 768px) {
    .card-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .card-body {
        align-items: center;
    }
}
</style>
