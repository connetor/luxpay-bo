import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
// @ts-ignore
import JsonViewer from 'vue-json-viewer'

import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './assets/professional-theme.css'
import 'vue-json-viewer/style.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(JsonViewer)
app.use(Antd)
app.component('QuillEditor', QuillEditor)

app.mount('#app')

const appTitle = (import.meta as any).env?.VITE_APP_TITLE || 'LUKPAY'

const faviconMap: Record<string, string> = {
  LUKPAY: '/logo/luk-1.png'
};

// Set favicon dynamically
const setFavicon = () => {
  // Remove existing favicon links
  const existingFavicons = document.querySelectorAll("link[rel~='icon']");
  existingFavicons.forEach(link => link.remove());
  
  // Create new favicon link
  const favicon = document.createElement('link');
  favicon.rel = 'icon';
  favicon.type = 'image/png';
  favicon.href = faviconMap[appTitle] || '/logo/luk-1.png';
  document.head.appendChild(favicon);
  
  // Also set apple-touch-icon for better mobile support
  const appleIcon = document.createElement('link');
  appleIcon.rel = 'apple-touch-icon';
  appleIcon.href = faviconMap[appTitle] || '/logo/lux-1.png';
  document.head.appendChild(appleIcon);
};

// Set favicon immediately
setFavicon();