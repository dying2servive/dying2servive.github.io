<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { 
  LayoutDashboard, 
  Package,
  ShoppingCart, 
  Settings, 
  Menu, 
  X, 
  ArrowLeft 
} from 'lucide-vue-next'

const sidebarOpen = ref(false)

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Configuration', href: '/admin/config', icon: Settings },
]
</script>

<template>
  <div class="flex h-screen bg-linear-to-b from-blue-50 to-indigo-50 font-sans">
    <!-- Mobile sidebar backdrop -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside 
      class="fixed inset-y-0 left-0 z-50 w-64 bg-white/80 backdrop-blur-md border-r border-white/50 shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0"
      :class="[sidebarOpen ? 'translate-x-0' : '-translate-x-full']"
    >
      <div class="flex h-16 items-center justify-between px-6 border-b border-gray-200/50">
        <span class="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">WQQH Admin</span>
        <button @click="sidebarOpen = false" class="lg:hidden text-gray-500 hover:text-gray-700">
          <X class="w-6 h-6" />
        </button>
      </div>

      <nav class="flex-1 space-y-1 px-4 py-6">
        <RouterLink 
          v-for="item in navigation" 
          :key="item.name"
          :to="item.href"
          custom
          v-slot="{ href, navigate, isActive, isExactActive }"
        >
          <a 
            :href="href"
            @click="navigate"
            class="group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200"
            :class="[
              (item.href === '/admin' ? isExactActive : isActive)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                : 'text-gray-700 hover:bg-white/60 hover:text-gray-900 hover:shadow-sm'
            ]"
          >
            <component 
              :is="item.icon" 
              class="mr-3 h-5 w-5 flex-shrink-0 transition-colors"
              :class="[(item.href === '/admin' ? isExactActive : isActive) ? 'text-blue-100' : 'text-gray-400 group-hover:text-gray-500']"
            />
            {{ item.name }}
          </a>
        </RouterLink>

        <div class="mt-8 pt-8 border-t border-gray-200/50">
          <RouterLink 
            to="/"
            class="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-xl hover:bg-white/60 hover:text-gray-900 hover:shadow-sm transition-all"
          >
            <ArrowLeft class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Back to Store
          </RouterLink>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Mobile Header -->
      <header class="flex h-16 items-center justify-between bg-white/80 backdrop-blur-md px-4 border-b border-white/50 lg:hidden shadow-sm">
        <button @click="sidebarOpen = true" class="text-gray-500 hover:text-gray-700">
          <Menu class="w-6 h-6" />
        </button>
        <span class="text-lg font-semibold text-gray-900">Admin Panel</span>
        <div class="w-6"></div> <!-- Spacer -->
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>
