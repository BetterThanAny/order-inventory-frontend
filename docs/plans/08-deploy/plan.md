# 模块 08-deploy: 生产部署

## 职责
前端 Docker 化、nginx 配置、集成到后端 docker-compose。

## 前置依赖
- 所有功能模块已完成（01-07）

## 任务清单

### 1. 前端 Dockerfile (`/Users/xushuo/Desktop/Work/frontend/Dockerfile`)

多阶段构建:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. 前端 nginx.conf (`/Users/xushuo/Desktop/Work/frontend/nginx.conf`)

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 健康检查代理
    location /health {
        proxy_pass http://api:8000;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 更新后端 docker-compose.yml

路径: `/Users/xushuo/Desktop/Work/backend_week1_day1_scaffold_2026-03-08/docker-compose.yml`

新增 frontend 服务:
```yaml
frontend:
  build:
    context: ../frontend
    dockerfile: Dockerfile
  ports:
    - "3000:80"
  depends_on:
    api:
      condition: service_healthy
  restart: unless-stopped
```

> 注意: `context: ../frontend` 因为前端是独立仓库，在后端同级目录。
> 可能需要调整为绝对路径或要求两个仓库在同一父目录下。

### 4. 更新后端 nginx 配置（可选）

如果用后端现有的 nginx 作为统一入口（而非前端自带的 nginx），需要修改:
`/Users/xushuo/Desktop/Work/backend_week1_day1_scaffold_2026-03-08/nginx/nginx.conf`

添加:
```nginx
# 前端静态文件（从 frontend 容器获取或挂载 volume）
location / {
    proxy_pass http://frontend:80;
}

# API 保持现有配置
location /api/ {
    proxy_pass http://api:8000;
}
```

### 5. .dockerignore (`/Users/xushuo/Desktop/Work/frontend/.dockerignore`)

```
node_modules
dist
.git
docs
*.md
.env.local
```

### 6. 前端 .env.production

```
VITE_API_BASE_URL=
```
生产环境留空，所有 API 请求走同源 nginx 代理，无需指定 base URL。

## 部署架构

```
用户浏览器
  └── nginx (frontend 容器, :3000)
        ├── /          → 前端静态文件 (SPA)
        ├── /api/      → proxy → api 容器 (:8000)
        └── /health    → proxy → api 容器 (:8000)
```

## 交付物
- 前端 Dockerfile（多阶段构建）
- nginx 配置（SPA + API 代理）
- docker-compose 集成
- .dockerignore

## 验证
1. `docker compose build frontend` 构建成功
2. `docker compose up` 全部服务启动
3. 访问 `http://localhost:3000` 看到前端页面
4. 前端能正常调用后端 API（通过 nginx 代理）
5. 刷新任意前端路由（如 `/products`）不会 404（SPA fallback 生效）
