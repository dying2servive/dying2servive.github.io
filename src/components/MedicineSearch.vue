<template>
  <div class="relative group">
    <div class="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
      <Search class="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200" />
    </div>
    <input
      v-model="searchQuery"
      type="text"
      placeholder="搜索药品名称、症状或制造商..."
      class="block w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-2.5 bg-transparent text-gray-900 placeholder-gray-400 border-0 border-b border-gray-300 focus:outline-none focus:ring-0 focus:border-indigo-500 transition-colors duration-200 text-sm sm:text-base"
      @input="handleSearch"
    />
    <button
      v-if="searchQuery"
      @click="clearSearch"
      class="absolute inset-y-0 right-2 sm:right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
      aria-label="清除搜索"
    >
      <X class="w-3 h-3 sm:w-4 sm:h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Search, X } from 'lucide-vue-next'
import { useMedicineStore } from '@/stores/medicine'

const medicineStore = useMedicineStore()
const searchQuery = ref('')

const handleSearch = () => {
  medicineStore.searchMedicines(searchQuery.value)
}

const clearSearch = () => {
  searchQuery.value = ''
  handleSearch()
}

watch(() => medicineStore.filter.searchTerm, (newVal) => {
  searchQuery.value = newVal || ''
})
</script>

<style scoped>
</style>