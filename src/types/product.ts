export interface Product {
  id: number
  sku: string
  name: string
  description: string | null
  price_cents: number
  is_active: boolean
}

export interface ProductPage {
  items: Product[]
  total: number
  page: number
  page_size: number
}

export interface ProductCreate {
  sku: string
  name: string
  description?: string
  price_cents: number
  initial_stock?: number
}

export interface ProductUpdate {
  name?: string
  description?: string
  price_cents?: number
  is_active?: boolean
}

export interface ProductInventory {
  product_id: number
  sku: string
  name: string
  available: number
  reserved: number
}

export interface ProductInventoryPage {
  items: ProductInventory[]
  total: number
  page: number
  page_size: number
}
