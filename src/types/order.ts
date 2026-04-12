export interface OrderItem {
  id: number
  product_id: number
  quantity: number
  unit_price_cents: number
  line_total_cents: number
}

export interface Order {
  id: number
  order_no: string
  user_id: number
  status: 'pending' | 'paid' | 'cancelled' | 'expired'
  total_price_cents: number
  idempotency_key: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderPage {
  items: Order[]
  total: number
  page: number
  page_size: number
}

export interface OrderItemIn {
  product_id: number
  quantity: number
}

export interface OrderCreate {
  items: OrderItemIn[]
  idempotency_key?: string
}
