<template>
  <!-- 方案B：卡片融合风格，与商品卡片视觉统一 -->
  <div class="backdrop-blur-md bg-white/60 rounded-2xl p-3 sm:p-4 border border-white/30 shadow-lg">
    <div class="flex items-center gap-2 sm:gap-3 overflow-x-auto whitespace-nowrap">
      <!-- 分类下拉（融合文案：默认分类） -->
      <div class="shrink-0">
        <select
          v-model="selectedCategory"
          @change="onCategoryChange"
          class="h-9 px-1.5 sm:px-2 bg-transparent text-gray-800 text-xs sm:text-sm border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-indigo-500"
        >
          <option value="">默认分类</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- 排序下拉（融合文案：默认排序） -->
      <div class="shrink-0">
        <select
          v-model="sortBy"
          @change="onSortChange"
          class="h-9 px-1.5 sm:px-2 bg-transparent text-gray-800 text-xs sm:text-sm border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-indigo-500"
        >
          <option value="default">默认排序</option>
          <option value="price-asc">价格升序</option>
          <option value="price-desc">价格降序</option>
          <option value="rating-desc">评分最高</option>
          <option value="name-asc">名称排序</option>
        </select>
      </div>

      <!-- 占位，自动推送清除按钮到最右侧 -->
      <div class="flex-1"></div>

      <!-- 清除筛选（线条风格按钮，最右侧） -->
      <button
        @click="clearAll"
        class="h-9 px-2 sm:px-3 text-xs sm:text-sm text-gray-700 shrink-0 border-b border-gray-300 hover:border-indigo-500 transition-colors"
      >
        清除筛选
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMedicineStore } from '@/stores/medicine'

const store = useMedicineStore()
const categories = computed(() => store.categories)

// 选中分类（空字符串表示“默认分类”）
const selectedCategory = ref<string>(store.filter.category || '')

// 排序
const sortBy = ref<string>('default')

const onCategoryChange = () => {
  // 直接将空字符串视为清除分类筛选
  store.filterByCategory(selectedCategory.value)
}

const onSortChange = () => {
  if (sortBy.value === 'default') {
    // 恢复默认排序
    store.resetSort()
    return
  }
  switch (sortBy.value) {
    case 'price-asc': store.sortMedicines('price', 'asc'); break
    case 'price-desc': store.sortMedicines('price', 'desc'); break
    case 'rating-desc': store.sortMedicines('star', 'desc'); break
    case 'name-asc': store.sortMedicines('name', 'asc'); break
    default: break
  }
}

const clearAll = () => {
  selectedCategory.value = ''
  sortBy.value = 'default'
  store.clearFilter()
  // 同时恢复默认排序
  store.resetSort()
}

watch(() => store.filter.category, (val) => {
  selectedCategory.value = val || ''
})
</script>

<style scoped>
</style>