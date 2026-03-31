<script setup lang="ts">
import { useSlots } from 'vue'

const props = defineProps<{
  label?: string
  modelValue: string | number
  type?: string
  placeholder?: string
  required?: boolean
  error?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const slots = useSlots()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="space-y-1">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative rounded-md shadow-sm">
      <slot name="prefix" />
      <input 
        :value="modelValue"
        @input="handleInput"
        :type="type || 'text'"
        class="block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border disabled:bg-gray-50 disabled:text-gray-500 bg-white/80 text-gray-900 placeholder-gray-400 border-gray-300"
        :class="[
          error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : '',
          slots.prefix ? 'pl-10' : ''
        ]"
        :placeholder="placeholder"
        :required="required"
        v-bind="$attrs"
      />
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <slot name="help" />
  </div>
</template>
