<template>
  <div v-if="showPrompt" class="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm">
    <div class="backdrop-blur-lg bg-white/90 border border-white/30 rounded-2xl p-4 shadow-xl">
      <div class="flex items-start space-x-3">
        <div class="shrink-0">
          <img src="/pwa-192x192.png" alt="App Icon" class="w-12 h-12 rounded-xl" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-semibold text-gray-900">安装应用</h3>
          <p class="text-xs text-gray-600 mt-1">添加到主屏幕，获得更好的体验</p>
          <div class="flex space-x-2 mt-3">
            <button
              @click="installApp"
              class="flex-1 bg-linear-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium py-2 px-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
            >
              安装
            </button>
            <button
              @click="dismissPrompt"
              class="flex-1 bg-gray-100 text-gray-700 text-xs font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              稍后
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const showPrompt = ref(false)
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)

// 监听 PWA 安装事件
onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // 防止默认的浏览器安装提示
    e.preventDefault()
    deferredPrompt.value = e as BeforeInstallPromptEvent
    
    // 检查是否已经安装或用户是否已经拒绝
    if (!localStorage.getItem('pwa-install-dismissed')) {
      showPrompt.value = true
    }
  })

  // 监听应用是否已经安装
  window.addEventListener('appinstalled', () => {
    console.log('PWA 已安装')
    showPrompt.value = false
    localStorage.removeItem('pwa-install-dismissed')
  })
})

// 安装应用
const installApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    
    if (outcome === 'accepted') {
      console.log('用户接受了安装')
    } else {
      console.log('用户拒绝了安装')
    }
    
    deferredPrompt.value = null
    showPrompt.value = false
  }
}

// 忽略安装提示
const dismissPrompt = () => {
  showPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', 'true')
}
</script>