# 🚀 部署指南

## 完整工作流程

```
OpenClaw (OrangePi) → GitHub → Codespaces 测试 → 部署
```

---

## Step 1: 推送到 GitHub

```bash
# 初始化 git (在 OrangePi 上)
cd /home/orangepi/.openclaw/workspace/ai-parliament/projects/dashboard
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库后
git remote add origin https://github.com/YOUR_USERNAME/ai-parliament-dashboard.git
git branch -M main
git push -u origin main
```

---

## Step 2: Codespaces 测试

推送后，在 GitHub 仓库页面：
1. 点击 **Code** → **Codespaces** → **Create codespace on main**
2. 等待环境创建完成
3. 在终端运行：

```bash
# 启动后端
cd backend
npm start
# 后端运行在 http://localhost:3001

# 新开终端启动前端
cd frontend
npm run dev
# 前端运行在 http://localhost:5173
```

4. 在浏览器预览测试

---

## Step 3: 部署

镜像构建完成后 (GitHub Actions 自动完成)：

### 选项 A: Railway (推荐)
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录并部署
railway login
railway init
railway up
```

### 选项 B: 自己的服务器
```bash
# 复制镜像
docker pull ghcr.io/YOUR_USERNAME/ai-parliament-dashboard-frontend:latest
docker pull ghcr.io/YOUR_USERNAME/ai-parliament-dashboard-backend:latest

# 运行
docker-compose -f docker-compose.prod.yml up -d
```

### 选项 C: Vercel (仅前端)
```bash
cd frontend
vercel deploy --prod
```

---

## GitHub Actions 自动流程

| 触发 | 动作 |
|------|------|
| Push to main | 构建 Docker 镜像推送到 ghcr.io |
| PR | 在 Codespaces 环境测试 |
| 手动 | 可选择部署 |

---

## 环境变量

部署时需要设置：
- 无需额外环境变量 (所有配置在代码中)
