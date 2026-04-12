<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Goods, List, Money, Warning } from '@element-plus/icons-vue'
import { listProducts } from '@/api/products'
import { listOrders } from '@/api/orders'
import { formatPrice } from '@/composables/usePrice'
import OrderStatusTag from '@/components/order/OrderStatusTag.vue'
import PriceDisplay from '@/components/common/PriceDisplay.vue'
import type { Order } from '@/types/order'

const loading = ref(true)
const productTotal = ref(0)
const orderTotal = ref(0)
const totalRevenue = ref(0)
const pendingCount = ref(0)
const recentOrders = ref<Order[]>([])

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

onMounted(async () => {
  try {
    const [productRes, recentRes, allOrdersRes] = await Promise.all([
      listProducts({ page: 1, page_size: 1 }),
      listOrders({ page: 1, page_size: 5 }),
      listOrders({ page: 1, page_size: 100 }),
    ])

    productTotal.value = productRes.total
    orderTotal.value = recentRes.total
    recentOrders.value = recentRes.items

    totalRevenue.value = allOrdersRes.items.reduce(
      (sum, o) => sum + o.total_price_cents,
      0,
    )
    pendingCount.value = allOrdersRes.items.filter(
      (o) => o.status === 'pending',
    ).length
  } catch (err: any) {
    console.error('加载仪表盘数据失败:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-loading="loading" class="dashboard">
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#409eff"><Goods /></el-icon>
            <div>
              <div class="stat-value">{{ productTotal }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#67c23a"><List /></el-icon>
            <div>
              <div class="stat-value">{{ orderTotal }}</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#e6a23c"><Money /></el-icon>
            <div>
              <div class="stat-value">{{ formatPrice(totalRevenue) }}</div>
              <div class="stat-label">总收入</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <el-icon :size="40" color="#f56c6c"><Warning /></el-icon>
            <div>
              <div class="stat-value">{{ pendingCount }}</div>
              <div class="stat-label">待支付订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <h3>最近订单</h3>
    <el-table :data="recentOrders" stripe style="width: 100%">
      <el-table-column prop="order_no" label="订单号" />
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <OrderStatusTag :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="总金额" width="150">
        <template #default="{ row }">
          <PriceDisplay :cents="row.total_price_cents" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="200">
        <template #default="{ row }">
          {{ formatTime(row.created_at) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-row {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

h3 {
  margin-bottom: 16px;
}
</style>
