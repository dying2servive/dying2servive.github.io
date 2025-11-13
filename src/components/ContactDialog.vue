<template>
  <Transition 
    enter-active-class="transition-all duration-300 ease-out" 
    enter-from-class="opacity-0 scale-95" 
    enter-to-class="opacity-100 scale-100" 
    leave-active-class="transition-all duration-200 ease-in" 
    leave-from-class="opacity-100 scale-100" 
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="visible" class="fixed inset-0 z-60">
      <!-- 背景遮罩 -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDialog" />

      <!-- 弹窗内容 -->
      <div class="relative z-10 h-full w-full flex items-center justify-center p-4">
        <div class="relative w-full max-w-sm sm:max-w-md rounded-2xl bg-white shadow-xl">
          <!-- 关闭按钮 -->
          <button 
            @click="closeDialog"
            class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow hover:bg-white transition-all"
            aria-label="关闭"
          >
            <X class="w-5 h-5 text-gray-600" />
          </button>

          <!-- 内容区 -->
          <div class="p-6 sm:p-8 text-center">
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{{ title }}</h3>
            <p class="text-sm sm:text-base text-gray-600 mb-4">{{ message }}</p>

            <div class="mt-2">
              <img 
                :src="qrSrc" 
                alt="联系二维码" 
                class="mx-auto w-44 h-44 sm:w-56 sm:h-56 object-cover rounded-lg shadow"
              />
            </div>

            <p class="text-xs sm:text-sm text-gray-500 mt-3">长按或扫码添加</p>

            <div class="mt-6">
              <button 
                @click="closeDialog"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '联系购买 / 咨询' },
  message: { type: String, default: '请扫码添加客服QQ，获取购买链接、优惠信息或药品咨询。' },  // 默认使用 PWA 图标占位，实际项目中可替换为 /assets/contact-qrcode.png
  qrSrc: { type: String, default: '/contact.png' }
})

const emit = defineEmits(['close'])

function closeDialog() {
  emit('close')
}
</script>

<style scoped>
</style>