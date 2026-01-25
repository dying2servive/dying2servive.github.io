import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

// PWA 注册 - 优化版本
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('SW registered: ', registration)

      // 只在确实需要更新时提示
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            // 只有当新 worker 安装完成且当前有控制的 worker 时才提示
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // 添加版本检查，避免重复提示
              const currentVersion = localStorage.getItem('sw-version')
              const newVersion = registration.scope + ':' + Date.now()

              if (currentVersion !== newVersion) {
                console.log('发现新版本，准备提示更新')
                if (confirm('发现新版本，是否立即刷新页面？')) {
                  localStorage.setItem('sw-version', newVersion)
                  window.location.reload()
                }
              }
            }
          })
        }
      })

      // 检查是否有等待的 Service Worker
      if (registration.waiting) {
        if (confirm('有新版本可用，是否立即刷新？')) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      }

    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError)
    }
  })
}
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
