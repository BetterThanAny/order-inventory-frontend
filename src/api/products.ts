import api from './index'
import type {
  Product,
  ProductPage,
  ProductCreate,
  ProductUpdate,
  ProductInventoryPage,
} from '@/types/product'

export function listProducts(params: {
  page: number
  page_size: number
  name?: string
}): Promise<ProductPage> {
  return api.get('/api/v1/products', { params }).then((res) => res.data)
}

export function getProduct(id: number): Promise<Product> {
  return api.get(`/api/v1/products/${id}`).then((res) => res.data)
}

export function createProduct(data: ProductCreate): Promise<Product> {
  return api.post('/api/v1/products', data).then((res) => res.data)
}

export function updateProduct(id: number, data: ProductUpdate): Promise<Product> {
  return api.put(`/api/v1/products/${id}`, data).then((res) => res.data)
}

export function deleteProduct(id: number): Promise<void> {
  return api.delete(`/api/v1/products/${id}`).then(() => undefined)
}

export function listInventory(params: {
  page: number
  page_size: number
}): Promise<ProductInventoryPage> {
  return api.get('/api/v1/products/inventory', { params }).then((res) => res.data)
}
