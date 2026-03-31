<script setup lang="ts">
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  loading?: boolean
  disabled?: boolean
}>()

const classes = computed(() => {
  const base = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  switch (props.variant) {
    case 'secondary':
      return `${base} text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-blue-500`
    case 'danger':
      return `${base} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`
    case 'ghost':
      return `${base} text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-none border border-transparent focus:ring-gray-500`
    default: // primary
      return `${base} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`
  }
})
</script>

<template>
  <button 
    :class="classes" 
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
    <slot />
  </button>
</template>
