<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  page: number
  limit: number
  total: number
}>()

const emit = defineEmits<{
  (e: 'update:page', page: number): void
}>()

const totalPages = computed(() => Math.ceil(props.total / props.limit))

const pages = computed(() => {
  const p = []
  // Simple pagination logic: show all if <= 7, else show simplified
  // For now, let's just show current +/- 2
  for (let i = 1; i <= totalPages.value; i++) {
    if (
      i === 1 ||
      i === totalPages.value ||
      (i >= props.page - 2 && i <= props.page + 2)
    ) {
      p.push(i)
    } else if (
      (i === props.page - 3 && i > 1) ||
      (i === props.page + 3 && i < totalPages.value)
    ) {
      p.push('...')
    }
  }
  // Dedup ...
  return p.filter((item, index, arr) => item !== arr[index - 1] || item !== '...')
})

const changePage = (p: number | string) => {
  if (typeof p === 'number' && p >= 1 && p <= totalPages.value) {
    emit('update:page', p)
  }
}
</script>

<template>
  <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
    <div class="flex flex-1 justify-between sm:hidden">
      <button 
        @click="changePage(page - 1)" 
        :disabled="page <= 1"
        class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Previous
      </button>
      <button 
        @click="changePage(page + 1)" 
        :disabled="page >= totalPages"
        class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        Next
      </button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Showing
          <span class="font-medium">{{ (page - 1) * limit + 1 }}</span>
          to
          <span class="font-medium">{{ Math.min(page * limit, total) }}</span>
          of
          <span class="font-medium">{{ total }}</span>
          results
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button 
            @click="changePage(page - 1)"
            :disabled="page <= 1"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
          >
            <span class="sr-only">Previous</span>
            <ChevronLeft class="h-5 w-5" aria-hidden="true" />
          </button>
          
          <template v-for="(p, index) in pages" :key="index">
            <span 
              v-if="p === '...'"
              class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
            >...</span>
            <button 
              v-else
              @click="changePage(p)"
              :class="[
                p === page 
                  ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0',
                'relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20'
              ]"
            >
              {{ p }}
            </button>
          </template>

          <button 
            @click="changePage(page + 1)"
            :disabled="page >= totalPages"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
          >
            <span class="sr-only">Next</span>
            <ChevronRight class="h-5 w-5" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
