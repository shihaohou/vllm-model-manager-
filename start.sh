#!/bin/bash

# vLLM Model Manager 启动脚本

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  vLLM Model Manager${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}错误: 未找到 Python3${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Python3 已安装"

# 检查配置文件
if [ ! -f "config/services.json" ]; then
    echo -e "${YELLOW}⚠${NC} 未找到配置文件，从示例创建..."
    if [ -f "config/services.json.example" ]; then
        cp config/services.json.example config/services.json
        echo -e "${YELLOW}请编辑 config/services.json 配置你的服务${NC}"
        exit 1
    else
        echo -e "${RED}错误: 未找到配置文件示例${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} 配置文件存在"

# 检查依赖
echo -e "${BLUE}检查 Python 依赖...${NC}"
pip3 list | grep -q flask || {
    echo -e "${YELLOW}安装依赖...${NC}"
    pip3 install -r requirements.txt
}

echo -e "${GREEN}✓${NC} 依赖已安装"

# 设置默认端口
PORT=${PORT:-9000}
HOST=${HOST:-0.0.0.0}

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}启动服务...${NC}"
echo -e "${BLUE}访问地址: http://${HOST}:${PORT}${NC}"
echo -e "${BLUE}========================================${NC}"

# 启动应用
python3 app.py
