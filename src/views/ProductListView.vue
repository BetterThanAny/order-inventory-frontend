<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useProductStore } from '@/stores/product'
import { formatPrice } from '@/composables/usePrice'
import ProductFormDialog from '@/components/product/ProductFormDialog.vue'
import type { Product } from '@/types/product'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const productStore = useProductStore()

const dialogVisible = ref(false)
const editingProduct = ref<Product | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput(value: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    productStore.setNameFilter(value)
  }, 300)
}

function openCreate() {
  editingProduct.value = null
  dialogVisible.value = true
}

function openEdit(product: Product) {
  editingProduct.value = product
  dialogVisible.value = true
}

async function handleDelete(product: Product) {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品「${product.name}」吗？`,
      '删除确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' },
    )
    await productStore.deleteProduct(product.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消，不做处理
  }
}

function onPageChange(p: number) {
  productStore.setPage(p)
}

function onSizeChange(size: number) {
  productStore.pageSize = size
  productStore.page = 1
  productStore.fetchProducts()
}

function onSaved() {
  dialogVisible.value = false
}

onMounted(() => {
  productStore.fetchProducts()
})
</script>

<template>
  <div class="product-list">
    <el-row justify="space-between" align="middle" style="margin-bottom: 16px">
      <el-col :span="8">
        <el-input
          placeholder="搜索商品名称"
          :prefix-icon="Search"
          :model-value="productStore.nameFilter"
          @input="onSearchInput"
          clearable
        />
      </el-col>
      <el-col :span="4" style="text-align: right">
        <el-button type="primary" @click="openCreate">新增商品</el-button>
      </el-col>
    </el-row>

    <el-table :data="productStore.items" v-loading="productStore.loading" border stripe>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="sku" label="SKU" width="160" />
      <el-table-column prop="name" label="名称" />
      <el-table-column label="价格" width="120">
        <template #default="{ row }">
          <span style="color: #e6a23c; font-weight: 600">{{ formatPrice(row.price_cents) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.is_active ? 'success' : 'info'">
            {{ row.is_active ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button link @click="openEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 16px; justify-content: flex-end"
      layout="total, sizes, prev, pager, next"
      :total="productStore.total"
      :current-page="productStore.page"
      :page-size="productStore.pageSize"
      @current-change="onPageChange"
      @size-change="onSizeChange"
    />

    <ProductFormDialog
      v-model="dialogVisible"
      :product="editingProduct"
      @saved="onSaved"
    />
  </div>
</template>

<style scoped>
.product-list {
  padding: 20px;
}
</style>
