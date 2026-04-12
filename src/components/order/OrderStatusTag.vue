<script setup lang="ts">
defineProps<{
  status: 'pending' | 'paid' | 'cancelled' | 'expired'
}>()

const statusMap: Record<string, { type: 'warning' | 'success' | 'info' | 'danger'; label: string }> = {
  pending: { type: 'warning', label: '待支付' },
  paid: { type: 'success', label: '已支付' },
  cancelled: { type: 'info', label: '已取消' },
  expired: { type: 'danger', label: '已过期' },
}
</script>

<template>
  <el-tag :type="statusMap[status].type">{{ statusMap[status].label }}</el-tag>
</template>
