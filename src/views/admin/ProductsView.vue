<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { MedicineService } from '@/services/medicineService'
import type { Medicine } from '@/types/medicine'
import { RouterLink } from 'vue-router'
import { Plus, Search, Edit, Trash2 } from 'lucide-vue-next'
import Pagination from '@/components/ui/Pagination.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const products = ref<Medicine[]>([])
const loading = ref(false)
const searchQuery = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)

const getProductImageSrc = (image: string) => {
  return `${import.meta.env.VITE_API_BASE_URL}${image}`
}

const loadProducts = async () => {
  loading.value = true
  try {
    const response = await MedicineService.getMedicines(page.value, limit.value, searchQuery.value)
    products.value = response.items || []
    total.value = response.total || 0
  } catch (error) {
    console.error('Failed to load products', error)
  } finally {
    loading.value = false
  }
}

// Debounce search
let searchTimeout: any
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadProducts()
  }, 300)
})

watch(page, loadProducts)

const deleteProduct = async (id: string) => {
  if (!confirm('Are you sure you want to delete this product?')) return
  
  try {
    await MedicineService.deleteMedicine(id)
    await loadProducts()
  } catch (e) {
    alert('Failed to delete product')
  }
}

onMounted(loadProducts)
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Products</h1>
        <p class="mt-2 text-sm text-gray-600">Manage your store inventory.</p>
      </div>
      <div class="flex-none">
        <RouterLink 
          to="/admin/products/new" 
          custom
          v-slot="{ navigate }"
        >
          <BaseButton @click="navigate" class="shadow-lg shadow-blue-500/30">
            <Plus class="w-4 h-4 mr-2" />
            Add Product
          </BaseButton>
        </RouterLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50">
      <div class="max-w-md">
        <div class="relative rounded-xl shadow-sm">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            class="block w-full rounded-xl border-gray-200 pl-10 bg-white/50 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 py-2.5 shadow-sm" 
            placeholder="Search products..." 
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white/60 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white/50">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200/50">
          <thead class="bg-gray-50/50">
            <tr>
              <th scope="col" class="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th scope="col" class="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th scope="col" class="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</th>
              <th scope="col" class="px-3 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tags</th>
              <th scope="col" class="relative py-4 pl-3 pr-6">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200/50 bg-transparent">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="py-12 text-center text-sm text-gray-500">Loading products...</td>
            </tr>
            <tr v-else-if="products.length === 0">
              <td colspan="5" class="py-12 text-center text-sm text-gray-500">No products found.</td>
            </tr>
            <tr v-for="product in products" :key="product.id" class="hover:bg-white/40 transition-colors group">
              <td class="whitespace-nowrap py-4 pl-6 pr-3">
                <div class="flex items-center">
                  <div class="h-12 w-12 flex-shrink-0">
                    <img class="h-12 w-12 rounded-lg object-cover bg-gray-100 shadow-sm" :src="getProductImageSrc(product.images[0] || '/placeholder.png')" :alt="product.name" />
                  </div>
                  <div class="ml-4">
                    <div class="font-semibold text-gray-900">{{ product.name }}</div>
                    <div class="text-gray-500 truncate max-w-xs text-xs mt-0.5">{{ product.description }}</div>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div class="font-medium text-gray-900">¥{{ product.price }}</div>
              </td>
              <td class="px-3 py-4 text-sm text-gray-500">
                <div class="flex flex-wrap gap-1">
                  <span v-for="cat in product.category" :key="cat" class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {{ cat }}
                  </span>
                </div>
              </td>
              <td class="px-3 py-4 text-sm text-gray-500">
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in product.tags" :key="tag" class="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                    {{ tag }}
                  </span>
                </div>
              </td>
              <td class="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <RouterLink :to="`/admin/products/${product.id}/edit`" class="text-blue-600 hover:text-blue-900 inline-flex items-center p-1.5 rounded-full hover:bg-blue-50 transition-colors">
                    <Edit class="w-4 h-4" />
                  </RouterLink>
                  <button @click="product.id && deleteProduct(product.id)" class="text-red-600 hover:text-red-900 inline-flex items-center p-1.5 rounded-full hover:bg-red-50 transition-colors">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="border-t border-gray-200/50 bg-gray-50/30 p-4">
        <Pagination 
          v-if="total > 0"
          v-model:page="page"
          :limit="limit"
          :total="total"
        />
      </div>
    </div>
  </div>
</template>
