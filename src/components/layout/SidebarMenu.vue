<template>
  <div class="sidebar-menu">
    <div class="logo-container">
      <span v-if="!collapsed" class="logo-text">管理系统</span>
      <span v-else class="logo-icon">管</span>
    </div>
    <el-menu
      :default-active="route.path"
      router
      :collapse="collapsed"
      :collapse-transition="false"
    >
      <el-menu-item index="/dashboard">
        <el-icon><Odometer /></el-icon>
        <template #title>仪表盘</template>
      </el-menu-item>
      <el-menu-item index="/products">
        <el-icon><Goods /></el-icon>
        <template #title>商品管理</template>
      </el-menu-item>
      <el-menu-item index="/orders">
        <el-icon><List /></el-icon>
        <template #title>订单管理</template>
      </el-menu-item>
      <el-menu-item index="/inventory">
        <el-icon><Box /></el-icon>
        <template #title>库存查看</template>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Odometer, Goods, List, Box } from '@element-plus/icons-vue'

defineProps<{
  collapsed: boolean
}>()

const route = useRoute()
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e4e7ed;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.logo-icon {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.el-menu {
  border-right: none;
  flex: 1;
}
</style>
