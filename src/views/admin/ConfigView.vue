<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StringListEditor from '@/components/admin/StringListEditor.vue'
import { ConfigService } from '@/services/configService'
import { Loader2, Save } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'

interface SystemConfig {
  caveat: string[]
  remark: string[]
  guide: string[]
  delivery: string[]
}

const config = ref<SystemConfig>({
  caveat: [],
  remark: [],
  guide: [],
  delivery: []
})

const loading = ref(false)
const saving = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const data = await ConfigService.getConfig()
    config.value = {
      caveat: data.caveat || [],
      remark: data.remark || [],
      guide: data.guide || [],
      delivery: data.delivery || []
    }
  } catch (e) {
    console.error('Failed to load config', e)
    alert('Failed to load configuration')
  } finally {
    loading.value = false
  }
})

const saveConfig = async () => {
  saving.value = true
  try {
    await ConfigService.updateConfig(config.value)
    alert('Configuration saved successfully')
  } catch (e) {
    console.error('Failed to save config', e)
    alert('Failed to save configuration')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="space-y-8 max-w-7xl mx-auto pb-12">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Configuration</h1>
        <p class="mt-2 text-sm text-gray-600">Manage system-wide settings and labels.</p>
      </div>
      
      <BaseButton 
        @click="saveConfig" 
        :loading="saving"
        class="shadow-lg shadow-blue-500/30"
      >
        <Save class="w-4 h-4 mr-2" />
        {{ saving ? 'Saving...' : 'Save Changes' }}
      </BaseButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 bg-white/30 backdrop-blur-md rounded-2xl border border-white/50">
      <Loader2 class="w-10 h-10 text-blue-600 animate-spin mb-4" />
      <p class="text-gray-500 font-medium">Loading configuration...</p>
    </div>

    <!-- Content Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <StringListEditor 
        v-model="config.caveat" 
        title="Caveats (Warnings)" 
        placeholder="Add warning text..." 
      />
      
      <StringListEditor 
        v-model="config.remark" 
        title="Remarks (Usage)" 
        placeholder="Add remark text..." 
      />
      
      <StringListEditor 
        v-model="config.guide" 
        title="User Guides" 
        placeholder="Add guide text..." 
      />
      
      <StringListEditor 
        v-model="config.delivery" 
        title="Delivery Info" 
        placeholder="Add delivery info..." 
      />
    </div>
  </div>
</template>
