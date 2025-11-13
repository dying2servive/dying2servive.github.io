import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

// PWA 注册
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      registration => {
        console.log('SW registered: ', registration)
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 发现新版本，提示用户刷新
                if (confirm('发现新版本，是否刷新页面？')) {
                  window.location.reload()
                }
              }
            })
          }
        })
      },
      registrationError => {
        console.log('SW registration failed: ', registrationError)
      }
    )
  })
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
