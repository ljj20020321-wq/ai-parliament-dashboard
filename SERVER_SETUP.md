# 🚀 服务器部署指南

## 准备工作

### 1. 服务器要求
- Ubuntu 20.04+ / Debian 11+
- Docker + Docker Compose
- 2GB+ RAM
- 开放端口 3000

### 2. 服务器初始化

在服务器上运行：

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 创建部署目录
sudo mkdir -p /opt/ai-parliament-dashboard
cd /opt/ai-parliament-dashboard

# 创建 docker-compose.yml
sudo vim docker-compose.yml
```

### 3. docker-compose.yml 内容

```yaml
version: '3.8'

services:
  frontend:
    image: ghcr.io/YOUR_USERNAME/ai-parliament-dashboard-frontend:latest
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    image: ghcr.io/YOUR_USERNAME/ai-parliament-dashboard-backend:latest
    ports:
      - "3001:3001"
    restart: unless-stopped
```

### 4. 配置防火墙

```bash
sudo ufw allow 3000/tcp
sudo ufw enable
```

---

## GitHub 配置

### 1. 创建 GitHub 仓库

1. 在 GitHub 创建新仓库 `ai-parliament-dashboard`
2. 推送代码:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-parliament-dashboard.git
git push -u origin main
```

### 2. 配置 GitHub Secrets

在仓库 Settings → Secrets and variables → Actions 中添加:

| Secret | 值 |
|--------|-----|
| DEPLOY_HOST | 服务器 IP 地址 |
| DEPLOY_USER | SSH 用户名 (如 ubuntu) |
| DEPLOY_KEY | SSH 私钥 |

### 3. 获取 GitHub Container Registry 权限

```bash
# 登录 GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
```

---

## 部署流程

1. **推送代码到 main 分支** → 自动触发 GitHub Actions
2. **GitHub Actions** → 构建 Docker 镜像并推送到 ghcr.io
3. **部署脚本** → SSH 登录服务器拉取最新镜像并重启

---

## 验证部署

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 检查端口
curl http://localhost:3000
```

---

## 常见问题

### Q: 部署失败怎么办？
A: 检查 GitHub Actions 日志，确认 SSH 密钥配置正确

### Q: 如何更新版本？
A: 只需推送新代码到 main 分支，GitHub Actions 会自动部署

### Q: 如何回滚？
A: 使用 `docker-compose pull` 拉取特定版本标签
