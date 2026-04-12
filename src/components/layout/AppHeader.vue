<template>
  <div class="header-left">
    <el-icon class="toggle-btn" @click="$emit('toggle-sidebar')">
      <Fold v-if="!collapsed" />
      <Expand v-else />
    </el-icon>
    <span class="page-title">{{ pageTitle }}</span>
  </div>
  <div class="header-right">
    <el-dropdown @command="handleCommand">
      <span class="user-info">
        <el-icon><UserFilled /></el-icon>
        <span class="user-email">{{ userEmail }}</span>
        <el-icon class="el-icon--right"><ArrowDown /></el-icon>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item disabled>个人信息</el-dropdown-item>
          <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Fold, Expand, UserFilled, ArrowDown } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  return (route.meta.title as string) || '首页'
})

const userEmail = computed(() => {
  return authStore.email || '未登录'
})

function handleCommand(command: string) {
  if (command === 'logout') {
    authStore.logout()
  }
}
</script>

<style scoped>
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: #409eff;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #606266;
  font-size: 14px;
}

.user-email {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
