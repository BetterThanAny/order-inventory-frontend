# 模块 06-dashboard: 概览看板

## 职责
展示系统概览统计数据和最近订单。

## 前置依赖
- 01-core（api 层、types、composables）
- 02-auth + 03-layout（路由和布局就位）
- 04-products + 05-orders（复用 store 和组件，至少需要 API 可用）

## 可使用的导出
- `src/api/products.ts`: `listProducts()`
- `src/api/orders.ts`: `listOrders()`
- `src/types/*`: Product, Order 等类型
- `src/composables/usePrice.ts`: `formatPrice()`
- `src/components/order/OrderStatusTag.vue`
- `src/components/common/PriceDisplay.vue`

## 任务清单

### 1. DashboardView (`src/views/DashboardView.vue`)

**统计卡片区（el-row + el-col）:**

4个 `el-card` 并排:

| 卡片 | 数据源 | 图标 |
|------|--------|------|
| 商品总数 | `listProducts({page:1, page_size:1})` 取 `total` | Goods |
| 订单总数 | `listOrders({page:1, page_size:1})` 取 `total` | List |
| 总收入 | 遍历所有订单的 `total_price_cents` 求和 | Money |
| 待支付订单 | 筛选 status=pending 的订单数 | Warning |

> 注意: 总收入和待支付数的精确计算需要获取全部订单。简化方案: 
> - 总收入: 只计算当前返回的前N个订单（前端展示为"近期收入"）
> - 或者: 调 `listOrders({page:1, page_size:100})` 获取较多数据来计算
> - 未来可以在后端加统计 API，当前先用前端聚合

**卡片样式:**
```vue
<el-card shadow="hover">
  <div class="stat-card">
    <el-icon :size="40"><Goods /></el-icon>
    <div>
      <div class="stat-value">{{ productTotal }}</div>
      <div class="stat-label">商品总数</div>
    </div>
  </div>
</el-card>
```

**最近订单表格:**

```
<h3>最近订单</h3>
el-table (:data="recentOrders")  ← 最近5条
├── 列: 订单号
├── 列: 状态 — OrderStatusTag
├── 列: 总金额 — PriceDisplay
└── 列: 创建时间
```

### 2. 数据加载

- 组件 `onMounted` 时并行请求:
  - `listProducts({page: 1, page_size: 1})` → 获取 total
  - `listOrders({page: 1, page_size: 5})` → 获取 total + 最近5条
- 使用 `Promise.all` 并行加载
- 加载中显示 `v-loading` 骨架

### 3. 样式

- 卡片区: `el-row :gutter="20"` + `el-col :span="6"` 四列均分
- 卡片内: flex 布局，图标+文字
- stat-value: 大字号 + 粗体
- stat-label: 小字号 + 灰色

## 交付物
- 完整的仪表盘页面
- 统计卡片（商品数、订单数、收入、待支付）
- 最近订单表格

## 验证
1. 登录后默认进入 dashboard，4个统计卡片显示正确数字
2. 最近订单表格显示最新5条
3. 数据与商品列表页、订单列表页一致
4. 加载过程有 loading 状态
