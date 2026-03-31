<template>
  <div class="min-h-screen bg-gray-50/50 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">订单状态查询</h1>
        <p class="text-gray-500 text-sm">请输入您的手机号或订单号查询发货状态</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-400" />
            </div>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900" 
              placeholder="请输入下单手机号 或 订单号"
              @keyup.enter="handleSearch"
            >
          </div>
          <button 
            @click="handleSearch" 
            :disabled="loading || !searchQuery.trim()"
            class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Loader2 v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5" />
            查询
          </button>
        </div>
        <p v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</p>
      </div>

      <!-- 结果列表 -->
      <div v-if="orders.length > 0" class="space-y-4">
        <div v-for="order in orders" :key="order.order_id" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden relative">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-sm text-gray-500 mb-1">订单号: {{ order.app_order_id }}</p>
              <h3 class="text-lg font-semibold text-gray-900">{{ order.description }}</h3>
            </div>
            <span 
              class="px-3 py-1 text-xs font-medium rounded-full"
              :class="{
                'bg-yellow-100 text-yellow-800': order.status === 'PENDING',
                'bg-green-100 text-green-800': order.status === 'PAID',
                'bg-blue-100 text-blue-800': order.status === 'SHIPPED',
                'bg-red-100 text-red-800': order.status === 'FAILED'
              }"
            >
              {{ getStatusText(order.status) }}
            </span>
          </div>
          
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500">支付金额</p>
              <p class="font-medium text-gray-900">¥{{ (order.amount / 100).toFixed(2) }}</p>
            </div>
            <div v-if="order.paid_at">
              <p class="text-gray-500">支付时间</p>
              <p class="font-medium text-gray-900">{{ new Date(order.paid_at).toLocaleString() }}</p>
            </div>
            <div v-if="order.status === 'PENDING'" class="col-span-2 flex justify-end mt-2">
              <button 
                @click="openRepayModal(order)"
                class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                继续支付
              </button>
            </div>
          </div>

          <div v-if="order.tracking_number" class="mt-4 pt-4 border-t border-gray-100 bg-blue-50/50 -mx-6 -mb-6 p-6">
            <div class="flex items-center text-blue-800">
              <Truck class="h-5 w-5 mr-2" />
              <span class="font-medium">物流单号：</span>
              <span class="ml-2 font-mono tracking-wider">{{ order.tracking_number }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="hasSearched && !loading" class="text-center py-12">
        <Package class="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 class="text-lg font-medium text-gray-900">暂无订单记录</h3>
        <p class="mt-1 text-sm text-gray-500">请检查输入的手机号或订单号是否正确</p>
      </div>

    </div>

    <!-- 支付弹窗（用于二次支付） -->
    <OrderModal 
      :visible="showRepayModal" 
      :medicine="selectedOrder" 
      :is-repay="true"
      @close="showRepayModal = false" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Search, Loader2, Package, Truck } from 'lucide-vue-next'
import { OrderService, type OrderStatusResponse } from '@/services/orderService'
import OrderModal from '@/components/OrderModal.vue'

const route = useRoute()
const searchQuery = ref('')
const loading = ref(false)
const error = ref('')
const orders = ref<OrderStatusResponse[]>([])
const hasSearched = ref(false)

const showRepayModal = ref(false)
const selectedOrder = ref<any>(null)

onMounted(() => {
  // 如果是从支付成功页带过来的参数，自动查询
  const phone = route.query.phone as string
  
  if (phone) {
    searchQuery.value = phone
  } else {
    // 尝试从本地存储读取最近的手机号
    const saved = localStorage.getItem('shipping_info')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.phone) {
          searchQuery.value = parsed.phone
        }
      } catch (e) {}
    }
  }
  handleSearch()
})

const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  loading.value = true
  error.value = ''
  hasSearched.value = true
  orders.value = []

  try {
    const isPhone = /^1[3-9]\d{9}$/.test(query)
    const params = isPhone ? { phone_number: query } : { app_order_id: query }
    
    const res = await OrderService.queryOrder(params)
    orders.value = res || []
  } catch (e: any) {
    if (e.message === 'Order not found') {
      orders.value = []
    } else {
      error.value = e.message || '查询失败，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}

const openRepayModal = (order: any) => {
  // 伪造一个 medicine 对象传入 OrderModal 以便复用
  selectedOrder.value = {
    id: 'repay',
    name: order.description.replace('购买 ', '').split(' x')[0] || order.description,
    price: order.price ? order.price / 100 : (order.amount / 100 / (order.quantity || 1)), // 优先使用真实单价，向下兼容反推单价
    image: '',
    description: order.description,
    category: [],
    tags: [],
    sales: 0,
    star: 5,
    spec: '',
    original_app_order_id: order.app_order_id, // 传递原订单号
    original_quantity: order.quantity || 1
  }
  showRepayModal.value = true
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'PENDING': '待支付',
    'PAID': '已支付，待发货',
    'SHIPPED': '已发货',
    'FAILED': '支付失败',
    'REFUNDED': '已退款'
  }
  return map[status] || status
}
</script>