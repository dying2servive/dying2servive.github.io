<script setup lang="ts">
import { ref } from 'vue'
import { Plus, X, Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string[]
  title: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const newItem = ref('')

const addItem = () => {
  if (newItem.value.trim()) {
    emit('update:modelValue', [...props.modelValue, newItem.value.trim()])
    newItem.value = ''
  }
}

const removeItem = (index: number) => {
  const newList = [...props.modelValue]
  newList.splice(index, 1)
  emit('update:modelValue', newList)
}
</script>

<template>
  <div class="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 flex flex-col h-full">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
      <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {{ modelValue.length }} items
      </span>
    </div>
    
    <div class="space-y-2 flex-1 overflow-y-auto max-h-60 mb-4 pr-1 custom-scrollbar">
      <transition-group name="list" tag="div" class="space-y-2">
        <div 
          v-for="(item, idx) in modelValue" 
          :key="item + idx" 
          class="group flex items-center justify-between p-3 bg-white/50 hover:bg-white/80 rounded-xl border border-gray-100 shadow-sm transition-all"
        >
          <span class="text-sm text-gray-700 font-medium break-all mr-2">{{ item }}</span>
          <button 
            @click="removeItem(idx)" 
            class="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Remove item"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </transition-group>
      
      <div v-if="modelValue.length === 0" class="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
        <div class="bg-gray-50 p-3 rounded-full mb-2">
          <Plus class="w-5 h-5 text-gray-400" />
        </div>
        <p class="text-sm text-gray-500">No items yet</p>
      </div>
    </div>

    <div class="relative mt-auto pt-4 border-t border-gray-100">
      <div class="flex gap-2">
        <input 
          v-model="newItem" 
          @keyup.enter="addItem"
          type="text" 
          class="flex-1 rounded-xl border-gray-200 bg-white/50 focus:bg-white pl-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400" 
          :placeholder="placeholder || 'Add new item...'"
        />
        <button 
          @click="addItem"
          :disabled="!newItem.trim()"
          class="inline-flex items-center justify-center p-2.5 border border-transparent rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
        >
          <Plus class="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 20px;
}
</style>
