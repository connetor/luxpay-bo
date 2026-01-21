<script setup lang="ts">
const appTitle = import.meta.env.VITE_APP_TITLE

const year = new Date().getFullYear()
</script>

<template>
    <p class="text-center text-gray-400" style="margin-bottom: 0px">@ {{ appTitle }} {{ year }} @</p>
</template>