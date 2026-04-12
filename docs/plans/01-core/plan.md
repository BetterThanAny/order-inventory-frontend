# 模块 01-core: 基础搭建

## 职责
项目脚手架、Vite 配置、TypeScript 类型、API 层、通用 composables 和组件。

## 前置依赖
无（第一个执行的模块）

## 任务清单

### 1. 项目脚手架
```bash
cd /Users/xushuo/Desktop/Work/frontend
npm create vite@latest . -- --template vue-ts
npm install vue-router@4 pinia axios element-plus @element-plus/icons-vue
npm install -D unplugin-vue-components unplugin-auto-import sass
```
> 注意: 在已有目录中初始化，确保不覆盖 docs/ 文件夹

### 2. vite.config.ts
- Element Plus 自动导入（unplugin-vue-components + unplugin-auto-import）
- 开发代理: `/api` → `http://localhost:8000`
- 路径别名: `@` → `./src`

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ resolvers: [ElementPlusResolver()] }),
    Components({ resolvers: [ElementPlusResolver()] }),
  ],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### 3. 环境变量
- `.env`: `VITE_API_BASE_URL=http://localhost:8000`
- `.env.production`: `VITE_API_BASE_URL=`（生产环境通过 nginx 同源代理，留空即可）

### 4. TypeScript 类型定义

创建 `src/types/auth.ts`:
```typescript
export interface LoginRequest { email: string; password: string }
export interface RegisterRequest { email: string; password: string }
export interface TokenResponse { access_token: string; token_type: string }
```

创建 `src/types/product.ts`:
```typescript
export interface Product {
  id: number; sku: string; name: string; description: string | null
  price_cents: number; is_active: boolean
}
export interface ProductPage {
  items: Product[]; total: number; page: number; page_size: number
}
export interface ProductCreate {
  sku: string; name: string; description?: string; price_cents: number
}
export interface ProductUpdate {
  name?: string; description?: string; price_cents?: number; is_active?: boolean
}
export interface ProductInventory {
  product_id: number; sku: string; name: string
  available: number; reserved: number
}
export interface ProductInventoryPage {
  items: ProductInventory[]; total: number; page: number; page_size: number
}
```

创建 `src/types/order.ts`:
```typescript
export interface OrderItem {
  id: number; product_id: number; quantity: number
  unit_price_cents: number; line_total_cents: number
}
export interface Order {
  id: number; order_no: string; user_id: number
  status: 'pending' | 'paid' | 'cancelled' | 'expired'
  total_price_cents: number; idempotency_key: string | null
  items: OrderItem[]; created_at: string; updated_at: string
}
export interface OrderPage {
  items: Order[]; total: number; page: number; page_size: number
}
export interface OrderItemIn { product_id: number; quantity: number }
export interface OrderCreate { items: OrderItemIn[]; idempotency_key?: string }
```

### 5. API 层

`src/api/index.ts` — Axios 实例:
- baseURL: `import.meta.env.VITE_API_BASE_URL || ''`
- 请求拦截器: 从 localStorage 读 token，设 `Authorization: Bearer <token>`
- 响应拦截器: 401 时清 token + 跳转 `/login`

`src/api/auth.ts`:
- `register(data: RegisterRequest): Promise<TokenResponse>`
- `login(data: LoginRequest): Promise<TokenResponse>`

`src/api/products.ts`:
- `listProducts(params: {page: number, page_size: number, name?: string}): Promise<ProductPage>`
- `getProduct(id: number): Promise<Product>`
- `createProduct(data: ProductCreate): Promise<Product>`
- `updateProduct(id: number, data: ProductUpdate): Promise<Product>`
- `deleteProduct(id: number): Promise<void>`

`src/api/orders.ts`:
- `listOrders(params: {page: number, page_size: number}): Promise<OrderPage>`
- `getOrder(id: number): Promise<Order>`
- `createOrder(data: OrderCreate): Promise<Order>`
- `cancelOrder(id: number): Promise<Order>`

### 6. Composables

`src/composables/usePrice.ts`:
```typescript
export function formatPrice(cents: number): string {
  return '¥' + (cents / 100).toFixed(2)
}
```

`src/composables/usePagination.ts`:
- 管理 `page`, `pageSize`, `total` 的响应式状态
- 提供 `onPageChange`, `onSizeChange` 回调
- 返回 Element Plus `el-pagination` 需要的 props

### 7. 通用组件

`src/components/common/PriceDisplay.vue`:
- Props: `cents: number`
- 显示格式化后的价格字符串

### 8. 入口文件

`src/main.ts`:
- 创建 Vue app
- 安装 Pinia
- 安装 Router（从 `@/router` 导入）
- 从 localStorage 恢复 auth 状态
- mount

`src/App.vue`:
- 只有 `<router-view />`

### 9. 后端 CORS 改动

在 `/Users/xushuo/Desktop/Work/backend_week1_day1_scaffold_2026-03-08/app/main.py` 的 `create_app()` 中添加:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 交付物
- 可运行的空 Vue 项目 (`npm run dev` 正常启动)
- 完整的 types、api、composables 模块
- 后端 CORS 已添加

## 验证
1. `npm run dev` 启动无报错
2. `npm run build` 构建成功
3. 浏览器访问 `http://localhost:5173` 看到页面
4. 在浏览器控制台手动调 `fetch('/api/health')` 能成功（验证代理/CORS）
