# 🚀 神秘占卜 — 部署指南

## 一键构建和启动

```bash
# 1. 构建前端
pnpm build

# 2. 初始化数据库
pnpm db:push

# 3. 启动生产服务器（同时服务前端+API）
pnpm start
```

启动后访问 `http://你的服务器IP:3001` 即可。

---

## 方案A: 部署到云服务器 (推荐)

### 1. 购买服务器和域名

| 平台 | 链接 | 推荐产品 |
|------|------|----------|
| 阿里云 | aliyun.com | 轻量应用服务器 (2核2G, ~¥60/月) |
| 腾讯云 | cloud.tencent.com | 轻量应用服务器 (2核2G, ~¥50/月) |

域名在同一个平台购买，方便备案。建议选择 `.com` 或 `.cn` 域名。

### 2. 域名实名 + ICP备案

- **实名认证**: 购买域名后48小时内完成，否则域名被锁定
- **ICP备案**: 服务器在大陆必须备案，阿里云/腾讯云App内操作，约15-20个工作日
- 备案期间可以用 IP 地址访问（部分云厂商提供临时域名）

### 3. 服务器环境配置

```bash
# SSH登录服务器后:

# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PM2（进程守护）
npm install -g pm2
```

### 4. 上传项目

```bash
# 本地打包
tar -czf fortune-teller.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='apps/server/*.db' \
  fortune-teller/

# 上传到服务器
scp fortune-teller.tar.gz root@你的服务器IP:/opt/

# 服务器上解压安装
ssh root@你的服务器IP
cd /opt && tar -xzf fortune-teller.tar.gz
cd fortune-teller
pnpm install
pnpm build
pnpm db:push
```

### 5. 启动服务

```bash
# 用 PM2 守护进程
cd /opt/fortune-teller
pm2 start pnpm --name fortune -- start
pm2 save
pm2 startup  # 设置开机自启
```

### 6. 配置 Nginx 反向代理 (可选)

```bash
sudo apt install -y nginx

# /etc/nginx/sites-available/fortune
server {
    listen 80;
    server_name 你的域名.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 方案B: 部署到 Vercel + 分离后端 (快速)

前端部署到 Vercel（免费），后端部署到 Railway/Render：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在 apps/client 目录
cd apps/client
vercel --prod
```

后端可以用 [Railway](https://railway.app) 一键部署，连接 GitHub 仓库即可。

> ⚠️ Vercel 在国内访问可能较慢，但对个人项目可以接受且无需备案。

---

## 方案C: 使用 Docker

```bash
# 一键构建
docker build -t fortune-teller .

# 运行
docker run -d -p 3001:3001 --name fortune fortune-teller

# 持久化数据库
docker run -d -p 3001:3001 \
  -v $(pwd)/data:/app/apps/server \
  --name fortune fortune-teller
```

---

## 环境变量清单

部署前修改 `apps/server/.env.production`:

| 变量 | 说明 | 示例 |
|------|------|------|
| `NODE_ENV` | 运行模式 | `production` |
| `DATABASE_URL` | 数据库连接 | `file:./prod.db` (SQLite) |
| `JWT_SECRET` | JWT密钥 | 随机32位字符串 |
| `JWT_EXPIRES_IN` | Token有效期 | `30d` |
| `PORT` | 服务端口 | `3001` |
| `CORS_ORIGIN` | 允许的域名 | `*` 或 `https://你的域名.com` |
