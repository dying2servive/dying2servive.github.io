<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { MedicineService } from '@/services/medicineService'

const productCount = ref(0)
const categoryCount = ref(0)

onMounted(async () => {
  const response = await MedicineService.getMedicines(1, 1)
  productCount.value = response.total || 0
  
  const allMedicines = await MedicineService.getAllMedicines()
  const categories = new Set(allMedicines.flatMap(m => Array.isArray(m.category) ? m.category : [m.category]))
  categoryCount.value = categories.size
})
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h1>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/50 transition-all hover:scale-105 hover:shadow-2xl">
        <h3 class="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Total Products</h3>
        <p class="text-4xl font-extrabold text-gray-900 mt-2">{{ productCount }}</p>
      </div>
      
      <div class="bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/50 transition-all hover:scale-105 hover:shadow-2xl">
        <h3 class="text-indigo-600 text-sm font-semibold uppercase tracking-wider">Categories</h3>
        <p class="text-4xl font-extrabold text-gray-900 mt-2">{{ categoryCount }}</p>
      </div>
    </div>
  </div>
</template>
