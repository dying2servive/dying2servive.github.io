<template>
  <!-- 详情弹窗 -->
  <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100" leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
    <div v-if="visible" ref="backdropEl" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="close">
      <!-- 弹窗主体 -->
      <div
        class="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <!-- 关闭按钮 -->
        <button @click="close"
          class="absolute top-0 right-0 z-10 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200">
          <X class="w-5 h-5 text-gray-600" />
        </button>

        <div class="flex flex-col lg:flex-row lg:h-full overflow-y-auto">
          <!-- 左侧图片区域 -->
          <div class="lg:w-1/2 bg-gray-50 relative">
            <!-- 图片滑动容器 -->
            <div class="relative h-64 lg:h-full overflow-hidden" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
              <!-- 图片列表 -->
              <div class="flex h-full transition-transform duration-300 ease-out"
                :style="{ transform: `translateX(-${currentImageIndex * 100}%)` }">
                <div v-for="(image, index) in displayImages" :key="index"
                  class="w-full h-full border-2 shrink-0 relative cursor-pointer" @click="openImagePreview(index)">
                  <img :src="image" :alt="`${medicine.name} - 图片 ${index + 1}`"
                    class="w-full h-full object-cover transition-opacity duration-300"
                    :class="isImageLoaded(index) ? 'opacity-100' : 'opacity-0'"
                    :loading="index === currentImageIndex ? 'eager' : 'lazy'" decoding="async"
                    @load="markImageLoaded(index)" />
                  <!-- 加载占位（纯色，无动画，避免闪烁） -->
                  <div v-if="!isImageLoaded(index)" class="absolute inset-0 bg-gray-200"></div>
                </div>
              </div>

              <!-- 图片指示器 -->
              <div v-if="displayImages.length > 1"
                class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <button v-for="(image, index) in displayImages" :key="index" @click="currentImageIndex = index"
                  class="w-2 h-2 rounded-full transition-all duration-200"
                  :class="index === currentImageIndex ? 'bg-white shadow-lg' : 'bg-white/50'"></button>
              </div>

              <!-- 左右切换按钮 -->
              <div v-if="displayImages.length > 1"
                class="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                <button @click="previousImage"
                  class="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 pointer-events-auto">
                  <ChevronLeft class="w-4 h-4 text-gray-600" />
                </button>
                <button @click="nextImage"
                  class="w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-200 pointer-events-auto">
                  <ChevronRight class="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <!-- 右侧详情区域 -->
          <div class="lg:w-1/2 p-6 lg:p-8 overflow-y-auto">
            <!-- 基本信息 -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <span class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {{ Array.isArray(medicine.category) ? medicine.category.join('/') : medicine.category }}
                </span>
                <div class="flex items-center space-x-1">
                  <Star class="w-4 h-4 text-yellow-400 fill-current" />
                  <span class="text-sm font-medium text-gray-700">{{ medicine.star }}</span>
                </div>
              </div>
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{{ medicine.name }}</h2>
              <p class="text-gray-600 mb-4">{{ medicine.description }}</p>
            </div>

            <!-- 规格信息 -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">规格信息</h3>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-gray-600">规格</span>
                  <span class="font-medium">{{ medicine.spec }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">价格</span>
                  <span class="text-xl font-bold text-red-500">¥{{ medicine.price }}</span>
                </div>
              </div>
            </div>

            <!-- 功能标签 -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">主要功效</h3>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in medicine.tags" :key="tag"
                  class="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- 使用说明（改为从 details 中读取） -->
            <div class="mb-6" v-if="medicine.details?.usage">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">使用说明</h3>
              <p class="text-gray-600 leading-relaxed">{{ medicine.details?.usage }}</p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex space-x-4">
              <button @click="addToCart"
                class="flex-1 bg-linear-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium">
                <ShoppingCart class="w-4 h-4 inline mr-2" />
                加入购物车
              </button>
              <button @click="close"
                class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                关闭
              </button>
            </div>

            <!-- 安全信息展示 -->
            <div v-if="medicineStore.safetyInfo.caveat.length > 0 || medicineStore.safetyInfo.remark.length > 0"
              class="mt-6 backdrop-blur-lg bg-white/60 rounded-2xl p-4 border border-white/30 shadow-xl">
              <div class="flex items-center mb-3">
                <Shield class="h-5 w-5 text-amber-500 mr-2" />
                <h3 class="text-base font-semibold text-gray-900">安全提醒</h3>
              </div>

              <div v-if="medicineStore.safetyInfo.caveat.length > 0" class="mb-3">
                <h4 class="font-medium text-amber-700 mb-1">注意事项：</h4>
                <ul class="space-y-1">
                  <li v-for="(item, index) in medicineStore.safetyInfo.caveat" :key="index"
                    class="text-sm text-gray-700 flex items-start">
                    <span class="text-amber-500 mr-2">•</span>
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div v-if="medicineStore.safetyInfo.remark.length > 0">
                <h4 class="font-medium text-blue-700 mb-1">备注说明：</h4>
                <ul class="space-y-1">
                  <li v-for="(item, index) in medicineStore.safetyInfo.remark" :key="index"
                    class="text-sm text-gray-700 flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>

            <!-- 购买指南与发货说明 -->
            <div v-if="medicineStore.safetyInfo.guide.length > 0 || medicineStore.safetyInfo.delivery.length > 0"
              class="mt-4 backdrop-blur-lg bg-white/60 rounded-2xl p-4 border border-white/30 shadow-xl">
              <div class="flex items-center mb-3">
                <ClipboardList class="h-5 w-5 text-blue-500 mr-2" />
                <h3 class="text-base font-semibold text-gray-900">购买指南与发货说明</h3>
              </div>

              <div v-if="medicineStore.safetyInfo.guide.length > 0" class="mb-3">
                <h4 class="font-medium text-blue-700 mb-1">购买流程：</h4>
                <ul class="space-y-1">
                  <li v-for="(item, index) in medicineStore.safetyInfo.guide" :key="index"
                    class="text-sm text-gray-700 flex items-start">
                    <span class="text-blue-500 mr-2">•</span>
                    {{ item }}
                  </li>
                </ul>
              </div>

              <div v-if="medicineStore.safetyInfo.delivery.length > 0">
                <h4 class="font-medium text-indigo-700 mb-1 flex items-center"><Truck class="h-4 w-4 mr-2" />发货说明：</h4>
                <ul class="space-y-1">
                  <li v-for="(item, index) in medicineStore.safetyInfo.delivery" :key="index"
                    class="text-sm text-gray-700 flex items-start">
                    <span class="text-indigo-500 mr-2">•</span>
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- 图片预览模态框 -->
  <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0"
    enter-to-class="opacity-100" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100"
    leave-to-class="opacity-0">
    <div v-if="imagePreviewVisible"
      class="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      @click.self="closeImagePreview">
      <!-- 关闭按钮 -->
      <button @click="closeImagePreview"
        class="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200">
        <X class="w-5 h-5 text-white" />
      </button>

      <!-- 图片容器 -->
      <div class="relative w-full h-full flex items-center justify-center p-4">
        <img v-if="displayImages[previewImageIndex]" :src="displayImages[previewImageIndex]"
          :alt="`${medicine.name} - 预览 ${previewImageIndex + 1}`"
          class="max-w-full max-h-full object-contain rounded-lg" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue'
  import { X, ChevronLeft, ChevronRight, ShoppingCart, Star, Shield, ClipboardList, Truck } from 'lucide-vue-next'
  import type { Medicine } from '@/types/medicine'
  import { useMedicineStore } from '@/stores/medicine'

  // Props
  interface Props {
    visible: boolean
    medicine: Medicine
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false
  })

  // Emits
  const emit = defineEmits<{
    close: []
    addToCart: [medicine: Medicine]
  }>()

  const backdropEl = ref<HTMLElement | null>(null)
  const currentImageIndex = ref(0)
  const imagePreviewVisible = ref(false)
  const previewImageIndex = ref(0)
  const loadedMap = ref<Record<number, boolean>>({})
  const isImageLoaded = (i: number) => !!loadedMap.value[i]
  const markImageLoaded = (i: number) => { loadedMap.value[i] = true }

  const displayImages = computed(() => {
    return props.medicine.images && props.medicine.images.length > 0 ? props.medicine.images : []
  })
  const medicineStore = useMedicineStore()

  let touchStartX = 0
  let touchEndX = 0

  const handleTouchStart = (event: TouchEvent) => {
    const t0 = event.changedTouches.item(0)
    if (!t0) return
    touchStartX = t0.clientX
  }

  const handleTouchEnd = (event: TouchEvent) => {
    const t0 = event.changedTouches.item(0)
    if (!t0) return
    touchEndX = t0.clientX
    handleSwipe()
  }

  const close = () => {
    emit('close')
  }

  const addToCart = () => {
    emit('addToCart', props.medicine)
    close()
  }

  const previousImage = () => {
    currentImageIndex.value = currentImageIndex.value > 0
      ? currentImageIndex.value - 1
      : displayImages.value.length - 1
  }

  const nextImage = () => {
    currentImageIndex.value = currentImageIndex.value < displayImages.value.length - 1
      ? currentImageIndex.value + 1
      : 0
  }

  const openImagePreview = (index: number) => {
    previewImageIndex.value = index
    imagePreviewVisible.value = true
  }

  const closeImagePreview = () => {
    imagePreviewVisible.value = false
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (!props.visible) return

    if (imagePreviewVisible.value) {
      if (event.key === 'Escape') {
        closeImagePreview()
      }
    } else {
      switch (event.key) {
        case 'ArrowLeft':
          previousImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        case 'Escape':
          close()
          break
      }
    }
  }

  watch(
    () => props.visible,
    (visible) => {
      console.log('visible', visible)
      if (visible) {
        document.addEventListener('keydown', handleKeydown)
        currentImageIndex.value = 0
        loadedMap.value = {}
        nextTick(() => {
          if (backdropEl.value) {
            backdropEl.value.addEventListener('touchmove', handleBackdropScroll, { passive: false })
            backdropEl.value.addEventListener('wheel', handleBackdropScroll, { passive: false })
          }
        })
      } else {
        document.removeEventListener('keydown', handleKeydown)
        imagePreviewVisible.value = false
        if (backdropEl.value) {
          backdropEl.value.removeEventListener('touchmove', handleBackdropScroll)
          backdropEl.value.removeEventListener('wheel', handleBackdropScroll)
        }
      }
    }
  )

  const handleSwipe = () => {
    if (touchEndX < touchStartX - 50) {
      nextImage()
    }
    if (touchEndX > touchStartX + 50) {
      previousImage()
    }
  }

  const handleBackdropScroll = (event: Event) => {
    if (event.target === backdropEl.value) {
      event.preventDefault()
    }
  }
</script>

<style scoped>

  /* 自定义滚动条 */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* 图片滑动动画 */
  .transition-transform {
    will-change: transform;
  }

  /* 触摸滑动优化 */
  @media (max-width: 1024px) {
    .relative.h-64.lg\:h-full {
      touch-action: pan-y;
    }
  }
</style>