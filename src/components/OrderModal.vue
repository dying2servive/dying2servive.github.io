<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="close">
      <div class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 overflow-hidden text-center">
        <!-- 关闭按钮 -->
        <button @click="close" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X class="w-5 h-5" />
        </button>

        <h3 class="text-xl font-bold text-gray-900 mb-2">订单支付</h3>

        <!-- 填写邮寄信息及数量 -->
        <div v-if="step === 'form'" class="py-4 text-left">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">购买数量</label>
            <div class="flex items-center space-x-3">
              <button @click="quantity > 1 && quantity--" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">-</button>
              <span class="text-lg font-medium w-8 text-center text-gray-900">{{ quantity }}</span>
              <button @click="quantity++" class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200">+</button>
            </div>
            <p class="text-sm text-gray-500 mt-2">总价: <span class="text-red-600 font-bold">¥{{ ((medicine?.price || 0) * quantity).toFixed(2) }}</span></p>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">收件人姓名 <span class="text-red-500">*</span></label>
              <input v-model="shipping.name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="请输入真实姓名" :class="{'border-red-500 focus:ring-red-500 focus:border-red-500': validationErrors.name}">
              <p v-if="validationErrors.name" class="mt-1 text-xs text-red-500">{{ validationErrors.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">联系电话 <span class="text-red-500">*</span></label>
              <input v-model="shipping.phone" type="tel" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="请输入手机号码" :class="{'border-red-500 focus:ring-red-500 focus:border-red-500': validationErrors.phone}">
              <p v-if="validationErrors.phone" class="mt-1 text-xs text-red-500">{{ validationErrors.phone }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">详细地址 <span class="text-red-500">*</span></label>
              <textarea v-model="shipping.address" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none" placeholder="省市区、街道、门牌号" :class="{'border-red-500 focus:ring-red-500 focus:border-red-500': validationErrors.address}"></textarea>
              <p v-if="validationErrors.address" class="mt-1 text-xs text-red-500">{{ validationErrors.address }}</p>
            </div>
          </div>
          
          <button 
            @click="submitForm" 
            class="w-full mt-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            :disabled="!isFormValid"
            :class="{'opacity-50 cursor-not-allowed': !isFormValid}"
          >
            确认信息并支付
          </button>
        </div>

        <!-- 加载中 -->
        <div v-else-if="step === 'loading'" class="py-12 flex flex-col items-center">
          <Loader2 class="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p class="text-gray-500 text-sm">正在创建订单，请稍候...</p>
        </div>

        <!-- 错误 -->
        <div v-else-if="error" class="py-12 flex flex-col items-center">
          <AlertCircle class="w-10 h-10 text-red-500 mb-4" />
          <p class="text-red-600 text-sm mb-4">{{ error }}</p>
          <button @click="createOrder" class="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
            重试
          </button>
        </div>

        <!-- 成功显示二维码 -->
        <div v-else-if="orderData" class="py-4">
          <div class="mb-4">
            <p class="text-gray-600 text-sm mb-1">支付金额</p>
            <p class="text-3xl font-bold text-red-600">¥{{ (orderData.amount / 100).toFixed(2) }}</p>
          </div>
          
          <div class="bg-gray-50 p-4 rounded-xl inline-block mb-4">
            <qrcode-vue :value="orderData.qrcode_url" :size="200" level="M" />
          </div>
          
          <p class="text-sm text-gray-500 mb-6">请使用微信扫码完成支付</p>

          <div class="space-y-3">
            <button @click="verifyPaymentStatus" class="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex justify-center items-center">
              <Loader2 v-if="verifying" class="w-5 h-5 mr-2 animate-spin" />
              我已经支付完成
            </button>
            <button @click="close" class="w-full py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              稍后支付 / 取消
            </button>
            <div class="text-xs text-gray-400 bg-gray-50 rounded p-2 text-left mt-2">
              <p>订单号: {{ orderData.app_order_id }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { X, Loader2, AlertCircle } from 'lucide-vue-next'
import QrcodeVue from 'qrcode.vue'
import { OrderService, type OrderResponse } from '@/services/orderService'
import type { Medicine } from '@/types/medicine'

const props = defineProps<{
  visible: boolean
  medicine: Medicine | any | null
  isRepay?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()

const step = ref<'form' | 'loading' | 'error' | 'qrcode'>('form')
const error = ref('')
const orderData = ref<OrderResponse | null>(null)
const verifying = ref(false)

const quantity = ref(1)
const shipping = ref({
  name: '',
  phone: '',
  address: ''
})

const validationErrors = computed(() => {
  const errors = { name: '', phone: '', address: '' }
  
  if (shipping.value.name.trim() !== '') {
    if (shipping.value.name.trim().length < 2 || shipping.value.name.trim().length > 20) {
      errors.name = '姓名长度需在 2 到 20 个字符之间'
    }
  }

  if (shipping.value.phone.trim() !== '') {
    // 简单的中国大陆手机号正则
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(shipping.value.phone.trim())) {
      errors.phone = '请输入有效的 11 位手机号码'
    }
  }

  if (shipping.value.address.trim() !== '') {
    if (shipping.value.address.trim().length < 5 || shipping.value.address.trim().length > 100) {
      errors.address = '详细地址长度需在 5 到 100 个字符之间'
    }
  }

  return errors
})

const isFormValid = computed(() => {
  return shipping.value.name.trim() !== '' && 
         shipping.value.phone.trim() !== '' && 
         shipping.value.address.trim() !== '' && 
         quantity.value > 0 &&
         !validationErrors.value.name &&
         !validationErrors.value.phone &&
         !validationErrors.value.address
})

onMounted(() => {
  // Load saved shipping info
  const saved = localStorage.getItem('shipping_info')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      shipping.value = { ...shipping.value, ...parsed }
    } catch (e) {
      // ignore
    }
  }
})

const submitForm = () => {
  if (!isFormValid.value) return
  
  // Save shipping info for next time
  localStorage.setItem('shipping_info', JSON.stringify(shipping.value))
  
  createOrder()
}

const createOrder = async () => {
  if (!props.medicine) return

  step.value = 'loading'
  error.value = ''
  orderData.value = null

  try {
    const res = await OrderService.createOrder({
      app_order_id: props.isRepay ? props.medicine.original_app_order_id : `${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      user_id: shipping.value.phone, // 当前使用手机号作为用户ID
      price: props.medicine.price * 100, // 元转分（单价）
      // description: `${props.medicine.name} x${quantity.value}`,
      description: `模板商品 x${quantity.value}`,  // 固定描述
      payment_type: 'native', // For PC scanning, use native. For mobile, it might be h5. Assuming native for qrcode generation.
      recipient_name: shipping.value.name,
      phone_number: shipping.value.phone,
      address: shipping.value.address,
      quantity: quantity.value
    })
    orderData.value = res
    step.value = 'qrcode'
  } catch (e: any) {
    error.value = e.message || '创建订单失败，请稍后重试'
    step.value = 'error'
  }
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    step.value = 'form'
    quantity.value = props.isRepay && props.medicine ? props.medicine.original_quantity : 1
  } else {
    // Reset state when closed
    step.value = 'form'
    error.value = ''
    orderData.value = null
  }
})

const close = () => {
  emit('close')
}

const goToOrderSearch = () => {
  close()
  router.push({
    path: '/orders',
    query: { phone: shipping.value.phone }
  })
}

const verifyPaymentStatus = async () => {
  if (!orderData.value) return
  
  verifying.value = true
  try {
    const res = await OrderService.queryOrder({ app_order_id: orderData.value.app_order_id })
    if (res && res.length > 0 && res[0]) {
      const order = res[0]
      if (order.status === 'PAID' || order.status === 'SHIPPED') {
        alert('支付成功！感谢您的购买。')
        goToOrderSearch()
      } else if (order.status === 'PENDING') {
        alert('系统尚未收到支付成功的通知，请确认是否已完成支付，或稍后再试。')
      } else {
        alert(`订单当前状态为：${order.status}，请联系客服处理。`)
      }
    } else {
      alert('无法获取订单状态，请稍后再试。')
    }
  } catch (e: any) {
    alert(e.message || '查询订单状态失败，请稍后再试')
  } finally {
    verifying.value = false
  }
}
</script>
