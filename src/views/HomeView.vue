<template>
  <div class="min-h-screen bg-linear-to-b from-blue-50 to-indigo-50">
    <!-- 顶部栏 -->
    <header class="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/30 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2 sm:space-x-3">
            💊
            <h1
              class="text-base sm:text-lg font-semibold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              我不是药神（青春版）
            </h1>
          </div>
          <div>
            <a href="/orders" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center">
              <ClipboardList class="w-4 h-4 mr-1" />
              查订单
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 搜索区域：移除背景和边框，仅保留间距（扁平化） -->
      <div class="mb-3 sm:mb-4">
        <MedicineSearch />
      </div>

      <!-- 筛选栏（单行，置于网格上方） -->
      <div class="mb-3 sm:mb-4">
        <FilterBar />
      </div>

      <!-- 加载状态 -->
      <div v-if="medicineStore.loading"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="i in 8" :key="i"
          class="backdrop-blur-md bg-white/60 rounded-2xl p-4 animate-pulse border border-white/30 shadow-lg">
          <div class="bg-white/30 h-48 rounded-xl mb-4"></div>
          <div class="bg-white/30 h-4 rounded mb-2"></div>
          <div class="bg-white/30 h-4 rounded w-2/3"></div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="medicineStore.error" class="text-center py-12">
        <div class="backdrop-blur-lg bg-white/60 rounded-2xl p-8 border border-white/30 shadow-xl">
          <div class="text-red-500 mb-4">
            <AlertTriangle class="h-12 w-12 mx-auto" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">加载失败</h3>
          <p class="text-gray-600 mb-6">{{ medicineStore.error }}</p>
          <button @click="medicineStore.fetchMedicines"
            class="bg-linear-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg">
            <RefreshCw class="h-4 w-4 inline mr-2" />
            重新加载
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="medicineStore.filteredMedicines.length === 0" class="text-center py-12">
        <div class="backdrop-blur-lg bg-white/60 rounded-2xl p-8 border border-white/30 shadow-xl">
          <div class="text-gray-400 mb-4">
            <Search class="h-12 w-12 mx-auto" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">未找到相关药品</h3>
          <p class="text-gray-600 mb-6">请尝试调整搜索条件或筛选器</p>
          <button @click="medicineStore.clearFilter"
            class="bg-linear-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg">
            <RotateCcw class="h-4 w-4 inline mr-2" />
            清除筛选
          </button>
        </div>
      </div>

      <!-- 药品网格 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <MedicineCard v-for="medicine in medicineStore.filteredMedicines" :key="medicine.id" :medicine="medicine"
          @add-to-cart="addToCart" @view-detail="openMedicineDetail" />
      </div>

      <!-- 安全信息展示 -->
      <div v-if="medicineStore.safetyInfo.caveat.length > 0 || medicineStore.safetyInfo.remark.length > 0"
        class="mt-12 backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-white/30 shadow-xl">
        <div class="flex items-center mb-4">
          <Shield class="h-6 w-6 text-amber-500 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">安全提醒</h3>
        </div>

        <div v-if="medicineStore.safetyInfo.caveat.length > 0" class="mb-4">
          <h4 class="font-medium text-amber-700 mb-2">注意事项：</h4>
          <ul class="space-y-1">
            <li v-for="(item, index) in medicineStore.safetyInfo.caveat" :key="index"
              class="text-sm text-gray-700 flex items-start">
              <span class="text-amber-500 mr-2">•</span>
              {{ item }}
            </li>
          </ul>
        </div>

        <div v-if="medicineStore.safetyInfo.remark.length > 0">
          <h4 class="font-medium text-blue-700 mb-2">备注说明：</h4>
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
        class="mt-6 backdrop-blur-lg bg-white/60 rounded-2xl p-6 border border-white/30 shadow-xl">
        <div class="flex items-center mb-4">
          <ClipboardList class="h-6 w-6 text-blue-500 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">购买指南与发货说明</h3>
        </div>

        <div v-if="medicineStore.safetyInfo.guide.length > 0" class="mb-4">
          <h4 class="font-medium text-blue-700 mb-2">购买流程：</h4>
          <ul class="space-y-1">
            <li v-for="(item, index) in medicineStore.safetyInfo.guide" :key="index"
              class="text-sm text-gray-700 flex items-start">
              <span class="text-blue-500 mr-2">•</span>
              {{ item }}
            </li>
          </ul>
        </div>

        <div v-if="medicineStore.safetyInfo.delivery.length > 0">
          <h4 class="font-medium text-indigo-700 mb-2 flex items-center"><Truck class="h-5 w-5 mr-2" />发货说明：</h4>
          <ul class="space-y-1">
            <li v-for="(item, index) in medicineStore.safetyInfo.delivery" :key="index"
              class="text-sm text-gray-700 flex items-start">
              <span class="text-indigo-500 mr-2">•</span>
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>

  <!-- 药品详情弹窗 -->
  <MedicineDetailModal v-if="selectedMedicine" :visible="detailModalVisible" :medicine="selectedMedicine"
    @close="closeMedicineDetail" @add-to-cart="addToCart" />
  <OrderModal :visible="orderModalVisible" :medicine="orderMedicine" @close="closeOrderModal" />
  
  <!-- 悬浮客服按钮 -->
  <button @click="contactDialogVisible = true" class="fixed right-4 bottom-4 md:right-8 md:bottom-8 z-40 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all hover:scale-105 group">
    <div class="relative">
      <MessageCircle class="w-6 h-6 text-blue-500" />
      <span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
    </div>
    <!-- 提示气泡 -->
    <div class="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      联系客服
      <div class="absolute top-1/2 -translate-y-1/2 -right-1 border-4 border-transparent border-l-gray-900"></div>
    </div>
  </button>

  <ContactDialog :visible="contactDialogVisible" @close="closeContactDialog" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Search, AlertTriangle, Download, RefreshCw, RotateCcw, Shield, ClipboardList, Truck, MessageCircle } from 'lucide-vue-next'
import MedicineCard from '@/components/MedicineCard.vue'
import MedicineSearch from '@/components/MedicineSearch.vue'
import FilterBar from '@/components/FilterBar.vue'
import MedicineDetailModal from '@/components/MedicineDetailModal.vue'
import ContactDialog from '@/components/ContactDialog.vue'
import OrderModal from '@/components/OrderModal.vue'
import { useMedicineStore } from '@/stores/medicine'
import type { Medicine } from '@/types/medicine'

const medicineStore = useMedicineStore()

const detailModalVisible = ref(false)
const contactDialogVisible = ref(false)
const orderModalVisible = ref(false)

const selectedMedicine = ref<Medicine | null>(null)
const orderMedicine = ref<Medicine | null>(null)

const addToCart = (medicine: Medicine) => {
  orderMedicine.value = medicine
  orderModalVisible.value = true
  if ('vibrate' in navigator) {
    navigator.vibrate(100)
  }
}

const openMedicineDetail = (medicine: Medicine) => {
  selectedMedicine.value = medicine
  detailModalVisible.value = true
}

const closeContactDialog = () => {
  contactDialogVisible.value = false
}

const closeOrderModal = () => {
  orderModalVisible.value = false
  orderMedicine.value = null
}

const closeMedicineDetail = () => {
  detailModalVisible.value = false
  selectedMedicine.value = null
}

onMounted(() => {
  medicineStore.fetchMedicines()
})
</script>

<style scoped>
main { padding-bottom: env(safe-area-inset-bottom, 0); }
@media (max-width: 640px) {
  main { padding-bottom: calc(4rem + env(safe-area-inset-bottom, 0)); }
}
</style>