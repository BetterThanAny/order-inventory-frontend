# 模块 05-orders: 订单管理

## 职责
订单列表、创建订单、取消订单、订单状态展示。

## 前置依赖
- 01-core（api/orders.ts, types, composables）
- 02-auth（路由已定义）
- 03-layout（布局已就位）
- 04-products（ProductSelect 组件 + product store 用于获取商品价格）

## 可使用的导出
- `src/api/orders.ts`: 全部 API 函数
- `src/types/order.ts`: `Order`, `OrderPage`, `OrderCreate`, `OrderItemIn`
- `src/composables/usePrice.ts`: `formatPrice()`
- `src/composables/usePagination.ts`
- `src/components/product/ProductSelect.vue`: 商品选择器
- `src/stores/product.ts`: `useProductStore()` — 获取商品信息用于显示

## 任务清单

### 1. Order Store (`src/stores/order.ts`)

```typescript
// State
items: Order[]
total: number
page: number              // 默认 1
pageSize: number           // 默认 20
loading: boolean

// Actions
fetchOrders()              // 调 listOrders API
createOrder(data)          // 调 API → 刷新列表
cancelOrder(id)            // 调 API → 刷新列表
setPage(page)
```

### 2. OrderStatusTag (`src/components/order/OrderStatusTag.vue`)

Props: `status: 'pending' | 'paid' | 'cancelled' | 'expired'`

映射:
| status | el-tag type | 中文 |
|--------|-------------|------|
| pending | warning | 待支付 |
| paid | success | 已支付 |
| cancelled | info | 已取消 |
| expired | danger | 已过期 |

### 3. OrderListView (`src/views/OrderListView.vue`)

**顶部操作栏:**
```
el-row
└── el-button (type="primary", "创建订单", @click 打开创建弹窗)
```

**订单表格:**
```
el-table (:data="orderStore.items" v-loading)
├── 列: 订单号 (order_no)
├── 列: 状态 — OrderStatusTag 组件
├── 列: 商品数量 — items.length + '种'
├── 列: 总金额 — PriceDisplay
├── 列: 创建时间 — 格式化为 YYYY-MM-DD HH:mm
└── 列: 操作
    └── el-button link "取消" (仅 status=pending 时显示)
        → ElMessageBox.confirm 确认后取消
```

**底部分页:**
```
el-pagination (同商品列表模式)
```

**可展开行（可选）:**
- 展开显示订单明细: 商品名、数量、单价、小计

### 4. OrderCreateDialog (`src/components/order/OrderCreateDialog.vue`)

Props: `modelValue: boolean`
Emit: `update:modelValue`, `created`

```
el-dialog (title="创建订单" width="600px")
└── el-form
    ├── 动态行列表:
    │   每行:
    │   ├── ProductSelect (v-model=item.product_id)
    │   ├── el-input-number (v-model=item.quantity :min="1")
    │   └── el-button (icon="Delete" @click 删除此行)
    ├── el-button ("添加商品" @click 新增一行)
    ├── el-divider
    └── 合计金额 (根据选中商品价格 * 数量计算，实时显示)
```

**关键逻辑:**
- 商品行数据结构: `{ product_id: number, quantity: number }`
- 至少1个商品，不允许提交空列表
- 同一商品不能重复添加（ProductSelect 排除已选商品）
- 提交时自动生成 `idempotency_key: crypto.randomUUID()`
- 合计金额: 需要从 productStore 获取各商品的 price_cents 来计算
- 提交成功: `ElMessage.success('订单创建成功')` + emit `created`
- 库存不足(409): `ElMessage.error()` 显示后端返回的详情

### 5. 时间格式化

使用简单的工具函数（不引入 dayjs 等外部库）:
```typescript
function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', { 
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}
```

## 交付物
- 订单列表页（表格+分页+状态标签）
- 创建订单弹窗（多商品动态表单）
- 取消订单功能
- OrderStatusTag 可复用组件

## 验证
1. 创建订单（选2种商品）→ 列表出现新订单，状态为"待支付"
2. 取消订单 → 状态变为"已取消"
3. 已取消/已过期的订单无法再次取消（按钮隐藏）
4. 重复提交（快速双击）→ 幂等性保护，不会创建重复订单
5. 库存不足 → 友好错误提示
6. 分页正常切换
