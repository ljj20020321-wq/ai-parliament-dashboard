# 🏛️ AI Parliament Dashboard

实时监测各智能体任务完成节点的可视化平台

## 功能特性

- 📊 实时监测 6 个议员的状态
- 🔄 自动更新 (3秒轮询)
- 🎨 简洁美观的仪表盘界面
- 🐳 Docker 容器化部署

## 快速开始

### 本地开发

```bash
# 启动后端
cd backend
npm install
npm run dev

# 启动前端
cd frontend
npm install
npm run dev
```

### Docker 部署

```bash
# 构建并运行
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

## 访问

- 前端: http://localhost:3000
- 后端 API: http://localhost:3001/api/agents

## API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/agents | 获取所有议员状态 |
| GET | /api/agents/:id | 获取指定议员详情 |
| GET | /api/tasks | 获取任务历史 |
| POST | /api/agents/:id/status | 更新议员状态 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + Vite + TailwindCSS |
| 后端 | Node.js + Express + Socket.io |
| 部署 | Docker + Docker Compose |

## 部署到云端

### Railway (推荐)

```bash
railway init
railway up
```

### Vercel (仅前端)

```bash
cd frontend
vercel deploy
```
