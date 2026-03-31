<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MedicineService } from '@/services/medicineService'
import type { Medicine } from '@/types/medicine'
import { Plus, X, UploadCloud, Save, ArrowLeft, Loader2 } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const route = useRoute()
const router = useRouter()
const isEdit = route.params.id !== undefined

// Use any type temporarily to allow string inputs for numbers (to fix typing issues)
const form = ref<any>({
  name: '',
  price: 0,
  description: '',
  spec: '',
  star: 5,
  category: [],
  tags: [],
  images: [],
})

const categoriesInput = ref('')
const tagsInput = ref('')
const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)

onMounted(async () => {
  if (isEdit) {
    loading.value = true
    try {
      const product = await MedicineService.getMedicineById(route.params.id as string)
      if (product) {
        form.value = { ...product }
        categoriesInput.value = product.category.join(', ')
        tagsInput.value = product.tags.join(', ')
      }
    } catch (e) {
      alert('Failed to load product')
    } finally {
      loading.value = false
    }
  }
})

const saveProduct = async () => {
  saving.value = true
  // Process inputs
  const productData = { ...form.value }
  
  // Convert inputs to correct types
  productData.price = Number(productData.price)
  productData.star = Number(productData.star)
  
  productData.category = categoriesInput.value.split(',').map(s => s.trim()).filter(Boolean)
  productData.tags = tagsInput.value.split(',').map(s => s.trim()).filter(Boolean)
  
  try {
    if (isEdit) {
        await MedicineService.updateMedicine(route.params.id as string, productData)
    } else {
        await MedicineService.createMedicine(productData as Medicine)
    }
    router.push('/admin/products')
  } catch (e) {
    alert('Failed to save product')
  } finally {
    saving.value = false
  }
}

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  uploading.value = true
  const formData = new FormData()
  formData.append('file', file)

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    const response = await fetch(`${apiBase}/upload`, {
      method: 'POST',
      body: formData
    })
    const res = await response.json()
    const url = res.code === 0 && res.data ? res.data.url : res.url
    if (url) {
      form.value.images = [...(form.value.images || []), url]
    }
  } catch (e) {
    alert('Upload failed')
  } finally {
    uploading.value = false
  }
}

const removeImage = (idx: number) => {
  if (form.value.images) {
    form.value.images.splice(idx, 1)
  }
}
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button 
          @click="router.back()" 
          class="p-2 rounded-full hover:bg-white/50 text-gray-600 transition-colors backdrop-blur-sm"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div>
          <h1 class="text-2xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {{ isEdit ? 'Edit Product' : 'New Product' }}
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ isEdit ? 'Update existing product details' : 'Add a new product to your inventory' }}
          </p>
        </div>
      </div>
    </div>

    <form @submit.prevent="saveProduct" class="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div class="p-8 space-y-8">
        <!-- Basic Info Section -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span class="w-1 h-6 bg-blue-500 rounded-full mr-2"></span>
            Basic Information
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseInput
              label="Product Name"
              v-model="form.name"
              placeholder="e.g. Vitamin C"
              required
            />

            <BaseInput
              label="Price"
              v-model="form.price"
              type="number"
              placeholder="0.00"
              required
            >
              <template #prefix>
                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span class="text-gray-500 sm:text-sm">¥</span>
                </div>
              </template>
            </BaseInput>
            
            <BaseInput
              label="Specification"
              v-model="form.spec"
              placeholder="e.g. 100 tablets/bottle"
            />

            <BaseInput
              label="Rating (0-5)"
              v-model="form.star"
              type="number"
              step="0.1"
              min="0"
              max="5"
            />
          </div>
        </div>

        <div class="border-t border-gray-200/50 pt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span class="w-1 h-6 bg-indigo-500 rounded-full mr-2"></span>
            Classification
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <BaseInput
              label="Categories"
              v-model="categoriesInput"
              placeholder="Health, Vitamins, Daily"
            >
              <template #help>
                <p class="text-xs text-gray-500 mt-1">Comma separated</p>
              </template>
            </BaseInput>
            
            <BaseInput
              label="Tags"
              v-model="tagsInput"
              placeholder="Best Seller, New Arrival"
            >
              <template #help>
                <p class="text-xs text-gray-500 mt-1">Comma separated</p>
              </template>
            </BaseInput>
          </div>
        </div>

        <div class="border-t border-gray-200/50 pt-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
             <span class="w-1 h-6 bg-purple-500 rounded-full mr-2"></span>
            Details & Images
          </h3>
          
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea 
                v-model="form.description" 
                rows="4" 
                class="block w-full rounded-xl border-gray-200 bg-white/80 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm p-3 text-sm placeholder-gray-400"
                placeholder=" detailed description..."
              ></textarea>
            </div>

            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">Product Images</label>
              
              <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                <div 
                  v-for="(img, idx) in form.images" 
                  :key="idx" 
                  class="group relative aspect-square bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <img :src="img" class="h-full w-full object-cover" />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  <button 
                    @click.prevent="removeImage(Number(idx))" 
                    class="absolute top-2 right-2 bg-white/90 backdrop-blur text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-white"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
                
                <label class="cursor-pointer flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-blue-50/50 hover:border-blue-400 transition-all group">
                  <div v-if="uploading" class="animate-spin text-blue-500">
                    <Loader2 class="w-8 h-8" />
                  </div>
                  <div v-else class="flex flex-col items-center">
                    <UploadCloud class="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
                    <span class="text-xs font-medium text-gray-500 group-hover:text-blue-600">Upload</span>
                  </div>
                  <input type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-8 py-5 bg-gray-50/50 border-t border-gray-200/50 flex justify-end space-x-3 backdrop-blur-sm">
        <BaseButton 
          type="button" 
          variant="secondary"
          @click="router.back()"
          class="bg-white hover:bg-gray-50"
        >
          Cancel
        </BaseButton>
        <BaseButton 
          type="submit" 
          :loading="saving"
          class="shadow-lg shadow-blue-500/30"
        >
          {{ saving ? 'Saving...' : 'Save Product' }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>
