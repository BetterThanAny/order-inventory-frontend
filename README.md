# 订单与库存管理系统 · 前端

`order-inventory-system` 配套的 Vue 3 前端：登录注册、仪表盘、商品管理、订单管理、库存查看。
后端见 [order-inventory-system](https://github.com/BetterThanAny/order-inventory-system)。

## 功能

| 页面 | 路径 | 内容 |
|---|---|---|
| 登录 / 注册 | `/login`、`/register` | 邮箱 + 密码，JWT 存 localStorage |
| 仪表盘 | `/dashboard` | 商品总数 / 订单总数 / 总收入 / 待支付订单四张统计卡 + 最近订单表 |
| 商品管理 | `/products` | 商品列表、按名称搜索、新增 / 编辑 / 删除（弹窗表单） |
| 订单管理 | `/orders` | 创建订单（选商品 + 数量）、查看订单明细、取消待支付订单 |
| 库存查看 | `/inventory` | 商品 ID / SKU / 名称 / 可用库存 / 锁定库存 |

鉴权在路由守卫里统一处理：未登录访问受保护页面会跳 `/login?redirect=...`，已登录访问登录页会跳回仪表盘；
axios 拦截器自动附加 `Authorization: Bearer <token>`，收到 401 时清除本地 token 并跳回登录页。

## 技术栈

- **Vue 3**（`<script setup>` SFC）+ **TypeScript**
- **Vite 8**：开发服务器代理 `/api` 到 `http://localhost:8000`
- **Element Plus**（组件按需自动导入）+ **Pinia**（`auth` / `product` / `order` 三个 store）
- **Vue Router 4**（history 模式 + 路由守卫）
- **axios**（统一 baseURL、请求/响应拦截器）
- **Sass**、**vue-tsc** 类型检查

## 本地运行

需要先把后端 `order-inventory-system` 起在 `localhost:8000`。

```bash
npm ci
npm run dev        # http://localhost:5173
```

开发服务器已配置代理，前端 `/api/*` 的请求会转发到后端，无需额外配置跨域。

其他命令：

```bash
npm run build      # vue-tsc 类型检查 + 产物输出到 dist/
npm run preview    # 本地预览构建产物
```

## 环境变量

| 变量 | 说明 |
|---|---|
| `VITE_API_BASE_URL` | 接口基地址。留空表示与前端同源（Docker 部署时由 nginx 反代 `/api`） |

## Docker 部署

```bash
docker build -t order-inventory-frontend .
docker run -p 8080:80 order-inventory-frontend
```

镜像为两段式构建：`node:20-alpine` 里 `npm ci && npm run build`，再把 `dist/` 和 `nginx.conf` 复制进
`nginx:1.25-alpine`。nginx 负责 SPA history 回退（`try_files $uri $uri/ /index.html`）并把 `/api/` 反代到
`http://api:8000`——这个主机名对应 docker compose 里的后端服务名，单独 `docker run` 运行时需要自行改成实际地址。

## 目录结构

```
src/
├── api/            # axios 实例 + auth / products / orders 接口封装
├── components/     # common（价格展示）、layout（头部/侧边栏/外壳）、order、product
├── composables/    # usePagination、usePrice
├── router/         # 路由表与鉴权守卫
├── stores/         # Pinia：auth / product / order
├── types/          # 接口出入参类型
└── views/          # 登录、注册、仪表盘、商品、订单、库存
```

## 对接的接口

后端 `order-inventory-system` 的 `/api/v1`：

```
POST   /auth/register          POST   /auth/login
GET    /products               GET    /products/{id}
POST   /products               PUT    /products/{id}
DELETE /products/{id}          GET    /products/inventory
GET    /orders                 GET    /orders/{id}
POST   /orders                 POST   /orders/{id}/cancel
```
