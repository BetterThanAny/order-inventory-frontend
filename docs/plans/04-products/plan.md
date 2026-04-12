# 模块 04-products: 商品管理

## 职责
商品列表、搜索、分页、CRUD（新增/编辑弹窗、删除确认）。

## 前置依赖
- 01-core（api/products.ts, types, composables）
- 02-auth（路由已定义）
- 03-layout（布局已就位）

## 可使用的导出
- `src/api/products.ts`: 全部 API 函数
- `src/types/product.ts`: `Product`, `ProductPage`, `ProductCreate`, `ProductUpdate`
- `src/composables/usePrice.ts`: `formatPrice()`
- `src/composables/usePagination.ts`: 分页逻辑
- `src/components/common/PriceDisplay.vue`

## 任务清单

### 1. Product Store (`src/stores/product.ts`)

```typescript
// State
items: Product[]
total: number
page: number               // 默认 1
pageSize: number            // 默认 20
nameFilter: string          // 搜索关键词
loading: boolean

// Actions
fetchProducts()             // 使用当前 state 参数调 listProducts API
createProduct(data)         // 调 API → 刷新列表
updateProduct(id, data)     // 调 API → 刷新列表
deleteProduct(id)           // 调 API → 刷新列表
setPage(page)
setNameFilter(name)
```

### 2. ProductListView (`src/views/ProductListView.vue`)

**顶部操作栏:**
```
el-row
├── el-input (搜索框, 带 search icon, v-model=nameFilter, @input 防抖300ms)
└── el-button (type="primary", "新增商品", @click 打开创建弹窗)
```

**商品表格:**
```
el-table (:data="productStore.items" v-loading="productStore.loading")
├── 列: ID
├── 列: SKU
├── 列: 名称
├── 列: 价格 — 使用 PriceDisplay 组件或 formatPrice
├── 列: 状态 — el-tag type="success" 上架 / type="info" 下架
└── 列: 操作
    ├── el-button link "编辑" → 打开编辑弹窗
    └── el-button link type="danger" "删除" → ElMessageBox.confirm 确认后删除
```

**底部分页:**
```
el-pagination (
  layout="total, sizes, prev, pager, next"
  :total :current-page :page-size
  @current-change @size-change
)
```

### 3. ProductFormDialog (`src/components/product/ProductFormDialog.vue`)

Props:
- `modelValue: boolean` (v-model 控制显隐)
- `product: Product | null` (null=创建, 有值=编辑)

Emit: `update:modelValue`, `saved`

```
el-dialog (:title="product ? '编辑商品' : '新增商品'")
└── el-form (label-width="80px")
    ├── SKU    — el-input, 编辑模式 disabled
    ├── 名称   — el-input
    ├── 描述   — el-input type="textarea"
    ├── 价格   — el-input-number (:precision="2" :min="0")
    │           用户输入元，提交时 * 100 转分
    └── 状态   — el-switch (仅编辑模式显示)
```

校验规则:
- SKU: 必填, 1-64字符
- 名称: 必填, 1-255字符
- 价格: 必填, >= 0

提交: 创建调 `createProduct`，编辑调 `updateProduct`，成功后 `ElMessage.success` + emit `saved`

### 4. ProductSelect (`src/components/product/ProductSelect.vue`)

> 此组件供 05-orders 模块使用

Props: `modelValue: number` (product_id)
Emit: `update:modelValue`

```
el-select (filterable, remote, remote-method=搜索商品)
└── el-option (v-for product, :label="product.name + ' ¥' + formatPrice(product.price_cents)")
```

- 远程搜索: 输入关键词 → 调 `listProducts({name: keyword, page: 1, page_size: 50})`
- 初始加载: 组件 mounted 时加载一批默认商品
- 选中后 emit product_id

## 交付物
- 商品列表页（搜索+分页+表格）
- 新增/编辑弹窗
- 删除确认
- ProductSelect 组件（供订单模块使用）

## 验证
1. 新增商品 → 表格出现新行
2. 编辑商品 → 数据更新
3. 删除商品 → 确认后从列表消失
4. 搜索 → 表格筛选正确
5. 分页 → 切换页码数据变化
6. 价格输入 12.34 → 后端收到 1234
