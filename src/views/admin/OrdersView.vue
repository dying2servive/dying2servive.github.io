<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Search, Truck, X, Eye, PackageX, PackageCheck, Copy } from 'lucide-vue-next'
import Pagination from '@/components/ui/Pagination.vue'
import { OrderService } from '@/services/orderService'

const orders = ref<any[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('PAID')
const startDateFilter = ref('')
const endDateFilter = ref('')
const page = ref(1)
const limit = ref(10)
const total = ref(0)

onMounted(() => {
  loadOrders()
})

const loadOrders = async () => {
  loading.value = true
  try {
    const response = await OrderService.adminGetOrders({
      page: page.value,
      limit: limit.value,
      search: searchQuery.value,
      status: statusFilter.value,
      start_date: startDateFilter.value,
      end_date: endDateFilter.value
    })
    orders.value = response.data.items || []
    total.value = response.data.total || 0
  } catch (error) {
    console.error('Failed to load orders', error)
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
    loadOrders()
  }, 300)
})

watch([statusFilter, startDateFilter, endDateFilter], () => {
  page.value = 1
  loadOrders()
})

watch(page, loadOrders)

// Ship Order logic
const showShipModal = ref(false)
const currentOrder = ref<any>(null)
const trackingNumber = ref('')

const openShipModal = (order: any) => {
  currentOrder.value = order
  trackingNumber.value = order.tracking_number || ''
  showShipModal.value = true
}

const closeShipModal = () => {
  showShipModal.value = false
  currentOrder.value = null
  trackingNumber.value = ''
}

const submitShip = async () => {
  if (!trackingNumber.value.trim()) {
    alert('请输入物流单号')
    return
  }
  try {
    await OrderService.adminShipOrder(currentOrder.value.order_id, trackingNumber.value)
    closeShipModal()
    loadOrders()
  } catch (e) {
    alert('发货失败')
  }
}

const cancelShip = async (orderId: string) => {
  if (!confirm('确定要取消发货吗？这将清空物流单号并将订单状态回退为已支付。')) return
  try {
    await OrderService.adminCancelShipOrder(orderId)
    loadOrders()
  } catch (e) {
    alert('取消发货失败')
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800'
    case 'PAID': return 'bg-blue-100 text-blue-800'
    case 'SHIPPED': return 'bg-green-100 text-green-800'
    case 'FAILED': return 'bg-red-100 text-red-800'
    case 'REFUNDED': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING': return '待支付'
    case 'PAID': return '待发货'
    case 'SHIPPED': return '已发货'
    case 'FAILED': return '失败'
    case 'REFUNDED': return '已退款'
    default: return status
  }
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    console.error('Failed to copy text: ', err)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Orders</h1>
        <p class="mt-2 text-sm text-gray-600">Manage orders and shipments.</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white/60 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50 flex flex-wrap gap-4">
      <div class="max-w-md flex-1">
        <div class="relative rounded-xl shadow-sm">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            class="block w-full rounded-xl border-gray-200 pl-10 bg-white/50 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 py-2.5 shadow-sm" 
            placeholder="Search phone number or order ID..." 
          />
        </div>
      </div>
      <div class="w-48">
        <select 
          v-model="statusFilter"
          class="block w-full rounded-xl border-gray-200 bg-white/50 focus:bg-white transition-all text-gray-900 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 py-2.5 shadow-sm"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">待支付</option>
          <option value="PAID">待发货 (已支付)</option>
          <option value="SHIPPED">已发货</option>
        </select>
      </div>
      <div class="flex items-center space-x-2">
        <input 
          v-model="startDateFilter"
          type="date" 
          class="block rounded-xl border-gray-200 bg-white/50 focus:bg-white transition-all text-gray-900 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 py-2.5 shadow-sm"
        />
        <span class="text-gray-500">-</span>
        <input 
          v-model="endDateFilter"
          type="date" 
          class="block rounded-xl border-gray-200 bg-white/50 focus:bg-white transition-all text-gray-900 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 py-2.5 shadow-sm"
        />
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white/60 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden border border-white/50">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200/50">
          <thead class="bg-gray-50/50">
            <tr>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Info</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount/Qty</th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200/50 bg-white/30">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">Loading orders...</td>
            </tr>
            <tr v-else-if="orders.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">No orders found.</td>
            </tr>
            <tr v-else v-for="order in orders" :key="order.order_id" class="hover:bg-white/50 transition-colors">
              <td class="px-6 py-4">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{{ order.description }}</span>
                  <span class="text-xs text-gray-500 mt-1 flex items-center group cursor-pointer" @click="copyToClipboard(order.app_order_id)">
                    ID: {{ order.app_order_id }}
                    <Copy class="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span class="text-xs text-gray-400 mt-1">{{ new Date(order.created_at).toLocaleString() }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div v-if="order.shipping_info?.recipient_name" class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900">{{ order.shipping_info.recipient_name }}</span>
                  <span class="text-sm text-gray-600">{{ order.shipping_info.phone_number }}</span>
                  <span class="text-xs text-gray-500 mt-1 max-w-[200px] truncate" :title="order.shipping_info.address">
                    {{ order.shipping_info.address }}
                  </span>
                </div>
                <span v-else class="text-sm text-gray-400">N/A</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-red-600">总计 ¥{{ (order.amount / 100).toFixed(2) }}</span>
                  <span class="text-xs text-gray-500 mt-1">单价 ¥{{ order.price ? (order.price / 100).toFixed(2) : (order.amount / 100 / (order.quantity || 1)).toFixed(2) }} x {{ order.quantity }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col items-start gap-2">
                  <span :class="['px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusBadgeClass(order.status)]">
                    {{ getStatusText(order.status) }}
                  </span>
                  <span v-if="order.tracking_number" class="text-xs text-blue-600 flex items-center bg-blue-50 px-2 py-0.5 rounded">
                    <Truck class="w-3 h-3 mr-1" />
                    {{ order.tracking_number }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-3">
                  <button 
                    v-if="order.status === 'PAID'"
                    @click="openShipModal(order)"
                    class="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors flex items-center"
                    title="发货"
                  >
                    <PackageCheck class="w-4 h-4 mr-1" />
                    发货
                  </button>
                  <button 
                    v-if="order.status === 'SHIPPED'"
                    @click="cancelShip(order.order_id)"
                    class="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 p-2 rounded-lg transition-colors flex items-center"
                    title="取消发货"
                  >
                    <PackageX class="w-4 h-4 mr-1" />
                    取消发货
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="total > 0" class="px-6 py-4 border-t border-gray-200/50 bg-gray-50/30">
        <Pagination
          :page="page"
          :total="total"
          :limit="limit"
          @update:page="page = $event"
        />
      </div>
    </div>

    <!-- Ship Modal -->
    <div v-if="showShipModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <Truck class="w-5 h-5 mr-2 text-blue-600" />
            订单发货
          </h3>
          <button @click="closeShipModal" class="text-gray-400 hover:text-gray-600">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            正在为订单 <strong>{{ currentOrder?.app_order_id }}</strong> 发货
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">物流单号</label>
            <input 
              v-model="trackingNumber" 
              type="text" 
              class="block w-full rounded-xl border-gray-300 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2" 
              placeholder="请输入快递物流单号"
            >
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
          <button @click="closeShipModal" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            取消
          </button>
          <button @click="submitShip" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            确认发货
          </button>
        </div>
      </div>
    </div>
  </div>
</template>