import api from './index'
import type { Order, OrderPage, OrderCreate } from '@/types/order'

export function listOrders(params: {
  page: number
  page_size: number
}): Promise<OrderPage> {
  return api.get('/api/v1/orders', { params }).then((res) => res.data)
}

export function getOrder(id: number): Promise<Order> {
  return api.get(`/api/v1/orders/${id}`).then((res) => res.data)
}

export function createOrder(data: OrderCreate): Promise<Order> {
  return api.post('/api/v1/orders', data).then((res) => res.data)
}

export function cancelOrder(id: number): Promise<Order> {
  return api.post(`/api/v1/orders/${id}/cancel`).then((res) => res.data)
}
