#!/bin/bash

# AI Parliament Dashboard 部署脚本
# 支持 Linux/macOS 服务器

set -e

echo "🏛️ AI Parliament Dashboard 部署脚本"
echo "===================================="

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}请先安装 Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}请先安装 Docker Compose${NC}"
    exit 1
fi

# 部署目录
DEPLOY_DIR="/opt/ai-parliament-dashboard"

echo -e "${YELLOW}1. 创建部署目录...${NC}"
sudo mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

echo -e "${YELLOW}2. 复制项目文件...${NC}"
# 这里需要你手动复制项目到服务器
# scp -r ./dashboard/* user@your-server:/opt/ai-parliament-dashboard/

echo -e "${YELLOW}3. 构建 Docker 镜像...${NC}"
docker-compose build

echo -e "${YELLOW}4. 启动服务...${NC}"
docker-compose up -d

echo -e "${YELLOW}5. 检查状态...${NC}"
docker-compose ps

echo -e "${GREEN}✅ 部署完成！${NC}"
echo "访问地址: http://your-server-ip:3000"
echo ""
echo "常用命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
