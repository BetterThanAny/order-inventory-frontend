<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import ProductSelect from '@/components/product/ProductSelect.vue'
import { useOrderStore } from '@/stores/order'
import { getProduct } from '@/api/products'
import type { Product } from '@/types/product'
import { formatPrice } from '@/composables/usePrice'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': []
}>()

const orderStore = useOrderStore()

interface FormItem {
  product_id: number | undefined
  quantity: number
}

const formItems = ref<FormItem[]>([{ product_id: undefined, quantity: 1 }])
const submitting = ref(false)
const currentIdempotencyKey = ref(crypto.randomUUID())

// 缓存商品价格信息
const productCache = ref<Map<number, Product>>(new Map())

async function loadProductInfo(id: number) {
  if (!productCache.value.has(id)) {
    try {
      const product = await getProduct(id)
      productCache.value.set(product.id, product)
    } catch {
      // 静默失败
    }
  }
}

function onProductChange(index: number, id: number) {
  formItems.value[index].product_id = id
  loadProductInfo(id)
}

// 已选商品 ID 列表
const selectedIds = computed(() =>
  formItems.value
    .map((item) => item.product_id)
    .filter((id): id is number => id !== undefined)
)

// 合计金额
const totalCents = computed(() => {
  let sum = 0
  for (const item of formItems.value) {
    if (item.product_id !== undefined) {
      const product = productCache.value.get(item.product_id)
      if (product) {
        sum += product.price_cents * item.quantity
      }
    }
  }
  return sum
})

function addRow() {
  formItems.value.push({ product_id: undefined, quantity: 1 })
}

function removeRow(index: number) {
  formItems.value.splice(index, 1)
}

function resetForm() {
  formItems.value = [{ product_id: undefined, quantity: 1 }]
  submitting.value = false
  currentIdempotencyKey.value = crypto.randomUUID()
}

function handleClose() {
  resetForm()
  emit('update:modelValue', false)
}

async function handleSubmit() {
  const validItems = formItems.value.filter(
    (item): item is { product_id: number; quantity: number } =>
      item.product_id !== undefined && item.quantity > 0
  )

  if (validItems.length === 0) {
    ElMessage.warning('请至少添加一个商品')
    return
  }

  submitting.value = true
  try {
    await orderStore.createOrder({
      items: validItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
      idempotency_key: currentIdempotencyKey.value,
    })
    ElMessage.success('订单创建成功')
    handleClose()
    emit('created')
  } catch (err: any) {
    if (err?.response?.status === 409) {
      ElMessage.error(err.response.data?.detail || '库存不足')
    } else {
      ElMessage.error(err?.response?.data?.detail || '创建订单失败')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    title="创建订单"
    width="600px"
    :model-value="modelValue"
    @close="handleClose"
  >
    <el-form label-width="0">
      <div
        v-for="(item, index) in formItems"
        :key="index"
        style="display: flex; gap: 12px; margin-bottom: 12px; align-items: center"
      >
        <div style="flex: 1">
          <ProductSelect
            :model-value="item.product_id"
            :exclude-ids="selectedIds.filter((id) => id !== item.product_id)"
            @update:model-value="onProductChange(index, $event)"
          />
        </div>
        <el-input-number
          v-model="item.quantity"
          :min="1"
          style="width: 140px"
          placeholder="数量"
        />
        <el-button
          type="danger"
          :icon="Delete"
          circle
          :disabled="formItems.length <= 1"
          @click="removeRow(index)"
        />
      </div>

      <el-button type="primary" plain @click="addRow">添加商品</el-button>

      <el-divider />

      <div style="text-align: right; font-size: 16px">
        合计：<span style="color: #e6a23c; font-weight: 600">{{ formatPrice(totalCents) }}</span>
      </div>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">提交订单</el-button>
    </template>
  </el-dialog>
</template>
