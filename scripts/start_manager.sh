#!/bin/bash

LOG_FILE="/root/logs/model_manager.log"
PID_FILE="/root/logs/model_manager.pid"

# 创建日志目录
mkdir -p /root/logs

# 检查是否已经运行
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo "模型管理系统已在运行中 (PID: $OLD_PID)"
        echo "访问地址: http://0.0.0.0:9000"
        exit 0
    fi
fi

# 检查依赖
echo "检查Python依赖..."
pip3 list | grep -q flask || pip3 install flask flask-cors psutil

# 启动服务
echo "启动模型管理系统..."
cd /root/vllm-model-manager
nohup python3 app.py > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

echo "服务启动中，日志: $LOG_FILE"
echo "等待服务就绪..."

# 等待服务启动
for i in {1..30}; do
    if curl -s http://localhost:9000 > /dev/null 2>&1; then
        echo "✓ 服务已就绪!"
        echo "访问地址: http://0.0.0.0:9000"
        echo "查看日志: tail -f $LOG_FILE"
        exit 0
    fi
    sleep 1
done

echo "启动超时，请查看日志: tail -f $LOG_FILE"
exit 1
