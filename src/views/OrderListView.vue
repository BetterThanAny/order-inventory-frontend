<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import OrderStatusTag from '@/components/order/OrderStatusTag.vue'
import OrderCreateDialog from '@/components/order/OrderCreateDialog.vue'
import PriceDisplay from '@/components/common/PriceDisplay.vue'
import { formatPrice } from '@/composables/usePrice'

const orderStore = useOrderStore()
const showCreateDialog = ref(false)

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function handleCancel(id: number) {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '取消订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await orderStore.cancelOrder(id)
    ElMessage.success('订单已取消')
  } catch {
    // 用户点击了取消按钮，无需处理
  }
}

function handlePageChange(page: number) {
  orderStore.setPage(page)
}

function handleSizeChange(size: number) {
  orderStore.pageSize = size
  orderStore.page = 1
  orderStore.fetchOrders()
}

function handleCreated() {
  orderStore.page = 1
  orderStore.fetchOrders()
}

onMounted(() => {
  orderStore.fetchOrders()
})
</script>

<template>
  <div>
    <el-row justify="end" style="margin-bottom: 16px">
      <el-button type="primary" @click="showCreateDialog = true">创建订单</el-button>
    </el-row>

    <el-table :data="orderStore.items" v-loading="orderStore.loading" stripe>
      <el-table-column type="expand">
        <template #default="{ row }">
          <div style="padding: 0 48px">
            <el-table :data="row.items" size="small" border>
              <el-table-column label="商品ID" prop="product_id" width="100" />
              <el-table-column label="数量" prop="quantity" width="100" />
              <el-table-column label="单价">
                <template #default="{ row: item }">
                  {{ formatPrice(item.unit_price_cents) }}
                </template>
              </el-table-column>
              <el-table-column label="小计">
                <template #default="{ row: item }">
                  {{ formatPrice(item.line_total_cents) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="订单号" prop="order_no" min-width="180" />

      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <OrderStatusTag :status="row.status" />
        </template>
      </el-table-column>

      <el-table-column label="商品数量" width="100">
        <template #default="{ row }">
          {{ row.items.length }}种
        </template>
      </el-table-column>

      <el-table-column label="总金额" width="120">
        <template #default="{ row }">
          <PriceDisplay :cents="row.total_price_cents" />
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.created_at) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'pending'"
            type="danger"
            link
            @click="handleCancel(row.id)"
          >
            取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="margin-top: 16px; justify-content: center"
      background
      layout="total, sizes, prev, pager, next"
      :total="orderStore.total"
      :current-page="orderStore.page"
      :page-size="orderStore.pageSize"
      :page-sizes="[10, 20, 50]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />

    <OrderCreateDialog
      v-model="showCreateDialog"
      @created="handleCreated"
    />
  </div>
</template>
