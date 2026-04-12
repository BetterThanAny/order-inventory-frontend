# 前端总计划 — 订单与库存管理系统

## 技术栈

- Vue 3 (Composition API + `<script setup>`) + TypeScript
- Vite 6 + Element Plus + Vue Router 4 + Pinia + Axios

## 后端 API 概览

Base URL: `http://localhost:8000`（通过 Vite dev proxy 或 nginx 反向代理）

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/v1/auth/register` | 否 | 注册 → `{access_token, token_type}` |
| POST | `/api/v1/auth/login` | 否 | 登录 → `{access_token, token_type}` |
| POST | `/api/v1/products` | 是 | 创建商品 |
| GET | `/api/v1/products?page=&page_size=&name=` | 否 | 商品列表(分页+搜索) |
| GET | `/api/v1/products/{id}` | 否 | 商品详情 |
| PUT | `/api/v1/products/{id}` | 是 | 更新商品 |
| DELETE | `/api/v1/products/{id}` | 是 | 删除商品(软删除) → 204 |
| POST | `/api/v1/orders` | 是 | 创建订单 |
| GET | `/api/v1/orders?page=&page_size=` | 是 | 订单列表(分页) |
| GET | `/api/v1/orders/{id}` | 是 | 订单详情 |
| POST | `/api/v1/orders/{id}/cancel` | 是 | 取消订单 |
| GET | `/api/v1/products/inventory?page=&page_size=` | 是 | 库存列表(**需新增**) |
| GET | `/health` | 否 | 健康检查 |

### 认证方式
JWT Bearer Token，`Authorization: Bearer <token>`，30分钟过期。

### 数据结构约定

```typescript
// 商品
interface Product {
  id: number; sku: string; name: string; description: string | null;
  price_cents: number; is_active: boolean;
}
interface ProductPage { items: Product[]; total: number; page: number; page_size: number; }

// 订单
interface OrderItem {
  id: number; product_id: number; quantity: number;
  unit_price_cents: number; line_total_cents: number;
}
interface Order {
  id: number; order_no: string; user_id: number;
  status: 'pending' | 'paid' | 'cancelled' | 'expired';
  total_price_cents: number; idempotency_key: string | null;
  items: OrderItem[]; created_at: string; updated_at: string;
}
interface OrderPage { items: Order[]; total: number; page: number; page_size: number; }

// 库存
interface ProductInventory {
  product_id: number; sku: string; name: string;
  available: number; reserved: number;
}

// 认证
interface TokenResponse { access_token: string; token_type: string; }
```

### 价格约定
- 后端传输: `price_cents` 整数（分）
- 前端显示: `formatPrice(1234)` → `"¥12.34"`
- 用户输入: 元为单位，提交时 `Math.round(parseFloat(v) * 100)`

### 错误响应格式
```json
{"code": 40001, "message": "错误描述", "detail": "详细信息"}
```
- 401 → 跳转登录页
- 409 → 显示冲突详情（SKU重复/库存不足等）
- 422 → 显示字段校验错误

## 前端目录结构（最终）

```
src/
├── api/                    # 模块 01-core
│   ├── index.ts            # Axios 实例 + 拦截器
│   ├── auth.ts
│   ├── products.ts
│   └── orders.ts
├── types/                  # 模块 01-core
│   ├── auth.ts
│   ├── product.ts
│   └── order.ts
├── composables/            # 模块 01-core
│   ├── usePrice.ts
│   └── usePagination.ts
├── stores/                 
│   ├── auth.ts             # 模块 02-auth
│   ├── product.ts          # 模块 04-products
│   └── order.ts            # 模块 05-orders
├── router/index.ts         # 模块 02-auth 创建骨架，其他模块追加路由
├── components/
│   ├── layout/             # 模块 03-layout
│   │   ├── AppLayout.vue
│   │   ├── SidebarMenu.vue
│   │   └── AppHeader.vue
│   ├── product/            # 模块 04-products
│   │   ├── ProductFormDialog.vue
│   │   └── ProductSelect.vue
│   ├── order/              # 模块 05-orders
│   │   ├── OrderCreateDialog.vue
│   │   └── OrderStatusTag.vue
│   └── common/             # 模块 01-core
│       └── PriceDisplay.vue
├── views/
│   ├── LoginView.vue       # 模块 02-auth
│   ├── RegisterView.vue    # 模块 02-auth
│   ├── DashboardView.vue   # 模块 06-dashboard
│   ├── ProductListView.vue # 模块 04-products
│   ├── OrderListView.vue   # 模块 05-orders
│   └── InventoryView.vue   # 模块 07-inventory
├── App.vue                 # 模块 01-core
└── main.ts                 # 模块 01-core
```

## 路由表

| 路由 | 组件 | 需认证 | 所属模块 |
|------|------|--------|----------|
| `/login` | LoginView | 否 | 02-auth |
| `/register` | RegisterView | 否 | 02-auth |
| `/` → redirect `/dashboard` | - | 是 | 02-auth |
| `/dashboard` | DashboardView | 是 | 06-dashboard |
| `/products` | ProductListView | 是 | 04-products |
| `/orders` | OrderListView | 是 | 05-orders |
| `/inventory` | InventoryView | 是 | 07-inventory |

## 模块依赖与执行顺序

```
Phase 1:  [01-core]           ← 必须先完成
Phase 2:  [02-auth] || [03-layout]    ← 可并行
Phase 3:  [04-products] || [05-orders] ← 可并行
Phase 4:  [06-dashboard] || [07-inventory] ← 可并行
Phase 5:  [08-deploy]         ← 最后
```

## 模块间接口约定

### 01-core 对外提供
- `src/api/index.ts`: 导出 `api` (AxiosInstance)，已配置 baseURL、JWT 拦截器、401 处理
- `src/types/*.ts`: 所有 TypeScript 类型定义
- `src/composables/usePrice.ts`: 导出 `formatPrice(cents: number): string`
- `src/composables/usePagination.ts`: 导出分页逻辑组合函数
- `src/components/common/PriceDisplay.vue`: 价格展示组件，prop `cents: number`

### 02-auth 对外提供
- `src/stores/auth.ts`: 导出 `useAuthStore()`，包含 `token`, `email`, `isLoggedIn`, `login()`, `register()`, `logout()`
- `src/router/index.ts`: 路由实例，其他模块的路由通过在此文件中 import 并添加

### 03-layout 对外提供
- `src/components/layout/AppLayout.vue`: 主布局组件，使用 `<router-view>` 渲染子页面
- 侧边栏菜单项在 `SidebarMenu.vue` 中维护，路由 path 对应已定义路由

### 04-products 对外提供
- `src/stores/product.ts`: 导出 `useProductStore()`
- `src/components/product/ProductSelect.vue`: 商品选择器，供 05-orders 使用，emit `update:modelValue` 事件

### 各模块可使用
- Element Plus 全局注册的组件（通过 auto-import 插件）
- `ElMessage`, `ElMessageBox` 用于反馈和确认

## 后端需改动的文件

| 文件 | 改动 | 所属模块 |
|------|------|----------|
| `app/main.py` | 添加 CORS 中间件 | 01-core |
| `app/schemas/product.py` | 新增 `ProductInventoryOut` | 07-inventory |
| `app/api/v1/products.py` | 新增 `GET /products/inventory` | 07-inventory |
| `app/repositories/inventory_repo.py` | 新增库存查询方法 | 07-inventory |
| `nginx/nginx.conf` | 前端静态文件 + API 代理 | 08-deploy |
| `docker-compose.yml` | 新增 frontend 服务 | 08-deploy |
