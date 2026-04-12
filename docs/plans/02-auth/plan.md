# 模块 02-auth: 认证模块

## 职责
登录/注册页面、auth store、路由定义与导航守卫。

## 前置依赖
- 01-core 已完成（api 层、类型、main.ts）

## 可使用的 01-core 导出
- `src/api/auth.ts`: `register()`, `login()`
- `src/types/auth.ts`: `LoginRequest`, `RegisterRequest`, `TokenResponse`
- `src/api/index.ts`: 已配置的 Axios 实例

## 任务清单

### 1. Auth Store (`src/stores/auth.ts`)
```typescript
// State
token: string | null        // JWT token
email: string | null         // 当前用户邮箱

// Getters
isLoggedIn: boolean          // !!token

// Actions
login(email, password)       // 调 API → 存 token 到 state + localStorage
register(email, password)    // 调 API → 存 token 到 state + localStorage
logout()                     // 清 state + localStorage → router.push('/login')
initFromStorage()            // 从 localStorage 恢复 token（main.ts 中调用）
```

- token 和 email 存入 `localStorage`
- `initFromStorage()` 在 app 启动时调用（main.ts 中添加）

### 2. 路由定义 (`src/router/index.ts`)

```typescript
const routes = [
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { guest: true } },
  { path: '/register', component: () => import('@/views/RegisterView.vue'), meta: { guest: true } },
  {
    path: '/',
    component: () => import('@/components/layout/AppLayout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', component: () => import('@/views/DashboardView.vue') },
      { path: 'products', component: () => import('@/views/ProductListView.vue') },
      { path: 'orders', component: () => import('@/views/OrderListView.vue') },
      { path: 'inventory', component: () => import('@/views/InventoryView.vue') },
    ],
  },
]
```

**导航守卫 (beforeEach)**:
- `requiresAuth` + 未登录 → redirect `/login?redirect=原路径`
- `guest` + 已登录 → redirect `/dashboard`

> 注意: 子路由对应的 view 组件此时可能还不存在。创建占位 view 文件:
> `DashboardView.vue`, `ProductListView.vue`, `OrderListView.vue`, `InventoryView.vue`
> 内容仅为 `<template><div>页面名称（开发中）</div></template>`

### 3. 登录页 (`src/views/LoginView.vue`)

- 居中卡片布局
- `el-form` 包含: 邮箱(`el-input`)、密码(`el-input type="password"`)
- 校验规则: 邮箱必填+格式校验、密码必填+最少6位
- 提交: 调 `authStore.login()` → 成功跳转 `redirect` 参数或 `/dashboard`
- 失败: `ElMessage.error()` 显示错误
- 底部链接: "没有账号？去注册" → `/register`
- 中文标签

### 4. 注册页 (`src/views/RegisterView.vue`)

- 与登录页结构类似
- 额外字段: 确认密码（前端校验两次输入一致）
- 提交: 调 `authStore.register()` → 成功跳转 `/dashboard`
- 底部链接: "已有账号？去登录" → `/login`

### 5. 更新 main.ts
- 在 mount 之前调用 `authStore.initFromStorage()`

## 交付物
- auth store 可正常 login/register/logout
- 路由守卫正常工作
- 登录/注册页面功能完整
- 所有子路由有占位 view

## 验证
1. 访问 `/dashboard` 未登录 → 跳转 `/login`
2. 注册新用户 → 自动跳转 dashboard
3. 刷新页面 → 保持登录状态
4. 登出 → 跳转登录页，再次访问 `/dashboard` 被拦截
5. 登录已有用户 → 正常进入
