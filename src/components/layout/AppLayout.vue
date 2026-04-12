<template>
  <el-container class="app-layout">
    <el-aside :width="isCollapsed ? '64px' : '200px'">
      <SidebarMenu :collapsed="isCollapsed" />
    </el-aside>
    <el-container>
      <el-header>
        <AppHeader :collapsed="isCollapsed" @toggle-sidebar="isCollapsed = !isCollapsed" />
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SidebarMenu from './SidebarMenu.vue'
import AppHeader from './AppHeader.vue'

const isCollapsed = ref(false)
</script>

<style scoped>
.app-layout {
  height: 100vh;
}
</style>
