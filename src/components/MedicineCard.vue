<template>
  <div 
    @click="openDetail"
    class="backdrop-blur-lg bg-white/60 rounded-2xl p-3 sm:p-4 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
  >
    <!-- 药品图片 -->
    <div class="relative mb-3 sm:mb-4" ref="imageWrapper">
      <div
        class="aspect-square rounded-xl overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 relative"
      >
        <img
          v-if="hasImage"
          :src="realSrc"
          :alt="medicine.name"
          class="w-full h-full object-cover transition-opacity duration-300"
          :class="isLoaded ? 'opacity-100' : 'opacity-0'"
          @load="onImageLoad"
          @error="handleImageError"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          :sizes="sizes"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <div class="w-16 h-16 sm:w-24 sm:h-24 bg-linear-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
            <Pill class="w-8 h-8 sm:w-12 sm:h-12 text-blue-400" />
          </div>
        </div>

        <!-- 加载占位遮罩（渐进式） -->
        <div v-if="hasImage && !isLoaded" class="absolute inset-0 animate-pulse bg-linear-to-r from-gray-100/60 via-gray-200/60 to-gray-100/60"></div>
      </div>
      
      <!-- 分类标签 -->
      <div class="absolute top-1 sm:top-2 left-1 sm:left-2">
        <span class="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-white/90 backdrop-blur-sm rounded-md sm:rounded-lg text-xs font-medium text-gray-700 shadow-sm">
          {{ Array.isArray(medicine.category) ? medicine.category.join('/') : medicine.category }}
        </span>
      </div>

      <!-- 评分 -->
      <div class="absolute top-1 sm:top-2 right-1 sm:right-2 flex items-center space-x-0.5 sm:space-x-1 bg-white/90 backdrop-blur-sm px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
        <Star class="h-2 w-2 sm:h-3 sm:w-3 text-yellow-400 fill-current" />
        <span class="text-xs font-medium text-gray-700">{{ medicine.star }}</span>
      </div>
    </div>

    <!-- 药品信息 -->
    <div class="space-y-2 sm:space-y-3">
      <div>
        <h3 class="font-semibold text-gray-900 text-sm sm:text-lg mb-0.5 sm:mb-1 group-hover:text-blue-600 transition-colors leading-tight">
          {{ medicine.name }}
        </h3>
        <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 leading-tight">{{ medicine.manufacturer }}</p>
        <p class="text-xs text-gray-500 line-clamp-2 leading-tight">{{ medicine.description }}</p>
      </div>

      <!-- 规格 -->
      <div class="flex items-center justify-between text-xs sm:text-sm">
        <span class="text-gray-600">{{ medicine.spec }}</span>
      </div>

      <!-- 标签 -->
      <div v-if="medicine.tags && medicine.tags.length > 0" class="flex flex-wrap gap-0.5 sm:gap-1">
        <span
          v-for="tag in medicine.tags.slice(0, 3)"
          :key="tag"
          class="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium leading-tight"
        >
          {{ tag }}
        </span>
      </div>

      <!-- 价格和操作 -->
      <div class="flex items-center justify-between pt-1 sm:pt-2 border-t border-white/20">
        <div class="flex items-center space-x-1 sm:space-x-2">
          <span class="text-base sm:text-lg font-bold text-red-500">¥{{ medicine.price }}</span>
        </div>
        <button
          @click.stop="addToCart()"
          class="px-2 sm:px-4 py-1.5 sm:py-2 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-md sm:rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl text-xs sm:text-sm font-medium"
        >
          <ShoppingCart class="h-3 w-3 sm:h-4 sm:w-4" />
          <span class="hidden xs:inline">加入购物车</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShoppingCart, Star, Pill } from 'lucide-vue-next'
import type { Medicine } from '@/types/medicine'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  medicine: Medicine
}

const props = defineProps<Props>()
const emit = defineEmits<{
  addToCart: [medicine: Medicine]
  viewDetail: [medicine: Medicine]
}>()

// 懒加载与渐进式加载状态
const imageWrapper = ref<HTMLElement | null>(null)
const isLoaded = ref(false)
const realSrc = ref('')
const hasImage = computed(() => !!(props.medicine.images && props.medicine.images.length > 0))
const sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'

// 获取占位图片（支持中文字符，避免 btoa Latin1 限制）
const getPlaceholderImage = () => {
  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <text x="150" y="100" font-family="Arial, sans-serif" font-size="14" fill="#4f46e5" text-anchor="middle" font-weight="500">
        ${props.medicine.name.substring(0, 10)}
      </text>
    </svg>
  `
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
}

const placeholder = getPlaceholderImage()

// 处理图片加载
const onImageLoad = () => {
  isLoaded.value = true
}

// 处理图片加载错误
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = placeholder
  target.alt = props.medicine.name
  isLoaded.value = true
}

// 懒加载：仅在可视区域才设置真实 src
let observer: IntersectionObserver | null = null
onMounted(() => {
  if (!hasImage.value) return
  const el = imageWrapper.value
  if (!el) return
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!realSrc.value) {
          realSrc.value = props.medicine.images![0] as string
        }
        observer && observer.unobserve(entry.target)
      }
    })
  }, { root: null, rootMargin: '100px', threshold: 0.1 })
  observer.observe(el)
})

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// 打开详情弹窗
const openDetail = () => {
  emit('viewDetail', props.medicine)
}

// 添加到购物车
const addToCart = () => {
  emit('addToCart', props.medicine)
  // 震动反馈
  if ('vibrate' in navigator) {
    navigator.vibrate(100)
  }
  // 播放音效
  const audio = new Audio('/cart-add.mp3')
  audio.volume = 0.3
  audio.play().catch(() => {})
}
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>