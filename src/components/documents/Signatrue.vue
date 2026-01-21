<script setup lang="ts">
import { reactive, ref } from 'vue'

const activeKey = ref('')

const payload = reactive({
    amount: 10 ,
    bankNumber: "0123456789" ,
    bankName: "Firstname Lastname", 
    bankCode: "014" ,
    callbackUrl: "https://yourdomain.com/callback" ,
    reference: "xxxx" ,
})

</script>

<template>
    <a-card class="shadow-sm">
        <template #extra>
            <a target="_blank" href="https://documenter.getpostman.com/view/45735306/2sB3HtFce3#8593af45-ce82-4c80-b126-e3359d946859">คู่มือ</a>
        </template>
        <a-typography-title :level="4" style="margin-bottom: 6px;">Create Signatrue</a-typography-title>
        <p>สร้างรายการเข้ารหัส</p>

        <a-collapse v-model:activeKey="activeKey" ghost>
            <a-collapse-panel key="2" header="Node js">
                <pre class="bg-gray-900 text-green-300 text-sm p-4 rounded font-mono overflow-auto h-full mb-4">
import jwt from 'jsonwebtoken'

const payload = {
    amount: 10,
    bankNumber: "0123456789",
    bankName: "Firstname Lastname",
    bankCode: "014",
    callbackUrl: "https://yourdomain.com/callback",
    reference: "xxxx"
}

payload['signatrue'] = jwt.sign(payload, 'your-secret-key')
                </pre>
            </a-collapse-panel>
            <a-collapse-panel key="1" header="PHP">
                <pre class="bg-gray-900 text-blue-200 text-sm p-4 rounded font-mono overflow-auto mb-4">
require 'vendor/autoload.php';
use Firebase\JWT\JWT;

$payload = [
    'amount' => 10,
    'bankNumber' => '0123456789',
    'bankName' => 'Firstname Lastname',
    'bankCode' => '014',
    'callbackUrl' => 'https://yourdomain.com/callback',
    'reference' => 'xxxx'
];

$secretKey = 'your-secret-key';
$payload['signatrue'] = JWT::encode($payload, $secretKey, 'HS256');
                </pre>
            </a-collapse-panel>
            <a-collapse-panel key="3" header="Go">
                <pre class="bg-gray-900 text-cyan-200 text-sm p-4 rounded font-mono overflow-auto">
import (
    "github.com/golang-jwt/jwt/v4"
)

payload := map[string]interface{}{
    "amount":      10,
    "bankNumber":  "0123456789",
    "bankName":    "Firstname Lastname",
    "bankCode":    "014",
    "callbackUrl": "https://yourdomain.com/callback",
    "reference":   "xxxx"
}

token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims(payload))
signatrue, err := token.SignedString([]byte("your-secret-key"))
if err != nil {
    // handle error
}
payload["signatrue"] = signatrue
                </pre>
            </a-collapse-panel>
        </a-collapse>
    </a-card>
</template>