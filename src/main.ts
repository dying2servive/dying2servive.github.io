import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'
import { registerSW } from 'virtual:pwa-register'

// 新方案：使用 vite-plugin-pwa 提供的官方更新机制
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('发现新版本，是否立即刷新页面更新？')) {
      updateSW(true) // 这会触发 skipWaiting 并刷新页面
    }
  },
  onOfflineReady() {
    console.log('应用已准备好离线工作')
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
