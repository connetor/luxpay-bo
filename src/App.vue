<script setup lang="ts">
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import { RouterView } from 'vue-router'
import thTh from 'ant-design-vue/es/locale/th_TH';
import Loading from './components/Loading.vue';
import { useInitStore } from './stores/init';
import { computed } from 'vue';

dayjs.locale('th')

const initStore = useInitStore()

const locale = computed(() => {
  if(initStore.version == 2) {
    return thTh
  }
  else {
    return null
  }
})

const tokenTheme = computed(() => {
  if(initStore.version == 2) {
    return {
      colorPrimary: '#f3d58b',
      colorSuccess: '#cfa850',
      colorWarning: '#f3d58b',
      colorInfo: '#e9c778',
      borderRadius: 8,
      boxShadow: '0 4px 20px rgba(243, 213, 139, 0.3)',
      boxShadowSecondary: '0 2px 10px rgba(243, 213, 139, 0.2)',
    }
  }
  else {
    return {
      colorPrimary: '#f3d58b',
      colorSuccess: '#cfa850',
      colorWarning: '#f3d58b',
      colorInfo: '#e9c778',
      borderRadius: 8,
      boxShadow: '0 4px 20px rgba(243, 213, 139, 0.3)',
      boxShadowSecondary: '0 2px 10px rgba(243, 213, 139, 0.2)',
    }
  }
})

</script>

<template>
  <a-config-provider :locale="locale" :theme="{
    token: tokenTheme
  }">
    <Loading />
    <RouterView />
  </a-config-provider>
</template>

<style scoped>
  
</style>
