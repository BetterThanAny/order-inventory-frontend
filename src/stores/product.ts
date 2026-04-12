import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  listProducts as apiList,
  createProduct as apiCreate,
  updateProduct as apiUpdate,
  deleteProduct as apiDelete,
} from '@/api/products'
import type { Product, ProductCreate, ProductUpdate } from '@/types/product'

export const useProductStore = defineStore('product', () => {
  const items = ref<Product[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const nameFilter = ref('')
  const loading = ref(false)

  async function fetchProducts() {
    loading.value = true
    try {
      const res = await apiList({
        page: page.value,
        page_size: pageSize.value,
        name: nameFilter.value || undefined,
      })
      items.value = res.items
      total.value = res.total
    } finally {
      loading.value = false
    }
  }

  async function createProduct(data: ProductCreate) {
    await apiCreate(data)
    await fetchProducts()
  }

  async function updateProduct(id: number, data: ProductUpdate) {
    await apiUpdate(id, data)
    await fetchProducts()
  }

  async function deleteProduct(id: number) {
    await apiDelete(id)
    await fetchProducts()
  }

  function setPage(p: number) {
    page.value = p
    fetchProducts()
  }

  function setNameFilter(name: string) {
    nameFilter.value = name
    page.value = 1
    fetchProducts()
  }

  return {
    items,
    total,
    page,
    pageSize,
    nameFilter,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    setPage,
    setNameFilter,
  }
})
