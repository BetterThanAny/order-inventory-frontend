<template>
  <div class="inventory-view">
    <h2>库存查看</h2>
    <el-table :data="inventoryList" v-loading="loading" border stripe style="width: 100%">
      <el-table-column prop="product_id" label="商品ID" width="100" />
      <el-table-column prop="sku" label="SKU" width="180" />
      <el-table-column prop="name" label="商品名称" />
      <el-table-column label="可用库存" width="140">
        <template #default="{ row }">
          <el-tag v-if="row.available === 0" type="danger">缺货</el-tag>
          <el-tag v-else-if="row.available < 10" type="warning">{{ row.available }}</el-tag>
          <span v-else>{{ row.available }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="reserved" label="锁定库存" width="120" />
      <el-table-column label="总库存" width="120">
        <template #default="{ row }">
          {{ row.available + row.reserved }}
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchData"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { listInventory } from '@/api/products'
import type { ProductInventory } from '@/types/product'

const inventoryList = ref<ProductInventory[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = ref(20)
const total = ref(0)

async function fetchData() {
  loading.value = true
  try {
    const data = await listInventory({ page: page.value, page_size: pageSize.value })
    inventoryList.value = data.items
    total.value = data.total
  } catch (err: any) {
    console.error('加载库存数据失败:', err)
  } finally {
    loading.value = false
  }
}

function handleSizeChange() {
  page.value = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.inventory-view {
  padding: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
