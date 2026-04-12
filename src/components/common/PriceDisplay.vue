<script setup lang="ts">
import { computed } from 'vue'
import { formatPrice } from '@/composables/usePrice'

const props = defineProps<{ cents: number }>()
const display = computed(() => formatPrice(props.cents))
</script>

<template>
  <span class="price">{{ display }}</span>
</template>

<style scoped>
.price {
  color: #e6a23c;
  font-weight: 600;
}
</style>
