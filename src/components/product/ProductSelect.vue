<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { listProducts } from '@/api/products'
import { formatPrice } from '@/composables/usePrice'
import type { Product } from '@/types/product'

const props = defineProps<{
  modelValue: number | undefined
  excludeIds?: number[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const selected = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (val !== undefined) emit('update:modelValue', val)
  },
})

const options = ref<Product[]>([])
const loading = ref(false)

const filteredOptions = computed(() => {
  if (!props.excludeIds?.length) return options.value
  return options.value.filter((o) => !props.excludeIds!.includes(o.id))
})

async function remoteSearch(keyword: string) {
  loading.value = true
  try {
    const res = await listProducts({
      page: 1,
      page_size: 50,
      name: keyword || undefined,
    })
    options.value = res.items
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  remoteSearch('')
})
</script>

<template>
  <el-select
    v-model="selected"
    filterable
    remote
    reserve-keyword
    :remote-method="remoteSearch"
    :loading="loading"
    placeholder="请选择商品"
    style="width: 100%"
  >
    <el-option
      v-for="product in filteredOptions"
      :key="product.id"
      :label="`${product.name} ${formatPrice(product.price_cents)}`"
      :value="product.id"
    />
  </el-select>
</template>
