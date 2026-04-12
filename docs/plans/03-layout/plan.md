# 模块 03-layout: 整体布局

## 职责
侧边栏导航、顶栏、主内容区域的布局框架。

## 前置依赖
- 01-core 已完成
- 02-auth 已完成（需要 `useAuthStore` 获取用户信息和登出）

## 可使用的导出
- `src/stores/auth.ts`: `useAuthStore()` — `email`, `logout()`

## 任务清单

### 1. AppLayout (`src/components/layout/AppLayout.vue`)

使用 Element Plus 的 Container 布局:
```html
<el-container style="height: 100vh">
  <el-aside :width="isCollapsed ? '64px' : '200px'">
    <SidebarMenu :collapsed="isCollapsed" />
  </el-aside>
  <el-container>
    <el-header>
      <AppHeader @toggle-sidebar="isCollapsed = !isCollapsed" />
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</el-container>
```

- 响应式: 侧边栏可折叠
- `isCollapsed` 用 `ref(false)` 管理

### 2. SidebarMenu (`src/components/layout/SidebarMenu.vue`)

Props: `collapsed: boolean`

```
el-menu (router mode, default-active 绑定当前路由)
├── 仪表盘  /dashboard  icon: Odometer
├── 商品管理 /products   icon: Goods
├── 订单管理 /orders     icon: List
└── 库存查看 /inventory  icon: Box
```

- 使用 `@element-plus/icons-vue` 的图标
- `router` 模式: 点击菜单项自动导航
- `default-active`: 绑定 `route.path`
- 折叠时只显示图标

### 3. AppHeader (`src/components/layout/AppHeader.vue`)

Emit: `toggle-sidebar`

```
el-header (flex 布局, 两端对齐)
├── 左: 折叠按钮 (el-icon: Fold/Expand) + 页面标题
└── 右: 用户邮箱 + el-dropdown
    ├── 个人信息（暂不实现，disabled）
    └── 退出登录 → authStore.logout()
```

- 折叠按钮 emit `toggle-sidebar`
- 页面标题: 根据当前路由显示中文名（用 route.meta.title 或路由映射表）

### 4. 全局样式 (`src/assets/styles/global.scss`)

```scss
// 重置
* { margin: 0; padding: 0; box-sizing: border-box; }

// 布局
.el-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 20px;
}

.el-aside {
  border-right: 1px solid #e4e7ed;
  transition: width 0.3s;
}

.el-main {
  padding: 20px;
  background: #f5f7fa;
}
```

在 `main.ts` 中引入此文件。

## 交付物
- 完整的侧边栏+顶栏+内容区域布局
- 侧边栏折叠/展开
- 导航菜单点击切换路由
- 顶栏显示用户信息和登出

## 验证
1. 登录后看到完整布局（侧边栏+顶栏+主区域）
2. 点击侧边栏菜单项正确切换路由
3. 折叠按钮正常工作
4. 点击"退出登录"正常登出跳转
5. 浏览器窗口缩放布局不变形
