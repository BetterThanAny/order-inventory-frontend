import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listOrders, createOrder as apiCreateOrder, cancelOrder as apiCancelOrder } from '@/api/orders'
import type { Order, OrderCreate } from '@/types/order'

export const useOrderStore = defineStore('order', () => {
  const items = ref<Order[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)

  async function fetchOrders() {
    loading.value = true
    try {
      const res = await listOrders({ page: page.value, page_size: pageSize.value })
      items.value = res.items
      total.value = res.total
    } finally {
      loading.value = false
    }
  }

  async function createOrder(data: OrderCreate) {
    await apiCreateOrder(data)
    await fetchOrders()
  }

  async function cancelOrder(id: number) {
    await apiCancelOrder(id)
    await fetchOrders()
  }

  function setPage(p: number) {
    page.value = p
    fetchOrders()
  }

  return { items, total, page, pageSize, loading, fetchOrders, createOrder, cancelOrder, setPage }
})
