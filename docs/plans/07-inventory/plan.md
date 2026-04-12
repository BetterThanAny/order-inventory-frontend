# 模块 07-inventory: 库存查看

## 职责
库存数据展示页面 + 后端库存查询 REST 接口新增。

## 前置依赖
- 01-core（api 层、types）
- 02-auth + 03-layout（路由和布局就位）

## 特殊说明
此模块需同时修改前端和后端代码。后端当前无库存查询 REST 接口。

## 任务清单

### Part A: 后端改动

后端项目路径: `/Users/xushuo/Desktop/Work/backend_week1_day1_scaffold_2026-03-08`

#### A1. 新增 Schema (`app/schemas/product.py`)

在现有文件末尾添加:
```python
class ProductInventoryOut(BaseModel):
    product_id: int
    sku: str
    name: str
    available: int
    reserved: int
    model_config = ConfigDict(from_attributes=True)

class ProductInventoryPage(BaseModel):
    items: list[ProductInventoryOut]
    total: int
    page: int
    page_size: int
```

#### A2. 新增 Repository 方法 (`app/repositories/inventory_repo.py`)

新增方法:
```python
async def list_inventory(self, page: int, page_size: int) -> tuple[list, int]:
    """查询所有商品的库存信息，JOIN product 表获取 sku 和 name"""
    # SELECT p.id as product_id, p.sku, p.name, i.available, i.reserved
    # FROM inventory i JOIN product p ON i.product_id = p.id
    # WHERE p.is_active = true
    # ORDER BY p.id
    # LIMIT page_size OFFSET (page-1)*page_size
    # 同时返回 total count
```

#### A3. 新增路由 (`app/api/v1/products.py`)

```python
@router.get("/products/inventory", response_model=ProductInventoryPage)
async def list_inventory(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user = Depends(get_current_user),  # 需认证
    db: AsyncSession = Depends(get_db),
):
    ...
```

> **重要**: 此路由必须定义在 `GET /products/{id}` 之前，否则 "inventory" 会被当作 `{id}` 参数匹配。

#### A4. 后端测试

在 `tests/` 中添加库存接口的测试用例，验证:
- 未认证 → 401
- 空库存 → 返回空列表
- 有数据 → 分页正确

### Part B: 前端

#### B1. 新增 API (`src/api/products.ts`)

在现有文件中添加:
```typescript
export function listInventory(params: { page: number; page_size: number }) {
  return api.get<ProductInventoryPage>('/api/v1/products/inventory', { params })
    .then(res => res.data)
}
```

#### B2. InventoryView (`src/views/InventoryView.vue`)

**页面结构:**
```
<PageWrapper title="库存查看">
  el-table (:data="inventoryList" v-loading)
  ├── 列: 商品ID (product_id)
  ├── 列: SKU
  ├── 列: 商品名称
  ├── 列: 可用库存 (available)
  │   └── 数字为0时标红警告
  ├── 列: 锁定库存 (reserved)
  └── 列: 总库存 (available + reserved)

  el-pagination (底部分页)
</PageWrapper>
```

**数据加载:**
- 组件 `onMounted` 调 `listInventory` 获取数据
- 分页切换重新请求

**特殊样式:**
- 可用库存为 0: `el-tag type="danger"` 显示 "缺货"
- 可用库存 < 10: `el-tag type="warning"` 显示数量
- 其他: 正常显示

## 交付物
- 后端: 库存查询 REST 接口 + 测试
- 前端: 库存查看页面（表格+分页+库存警告样式）

## 验证
1. 后端: `GET /api/v1/products/inventory` 返回正确数据
2. 后端: 未认证返回 401
3. 前端: 库存页面正确展示表格
4. 前端: 缺货商品有红色标记
5. 前端: 分页正常工作
