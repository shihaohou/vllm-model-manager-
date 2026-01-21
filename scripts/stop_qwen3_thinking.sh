#!/bin/bash

# 查找并停止 Qwen3-Thinking 服务
echo "正在查找 Qwen3-Thinking 服务..."

PID=$(pgrep -f "vllm serve.*Qwen3-Next-80B-A3B-Thinking")

if [ -z "$PID" ]; then
    echo "未找到运行中的 Qwen3-Thinking 服务"
    exit 0
fi

echo "找到服务进程: $PID"
echo "正在停止服务..."

kill $PID

# 等待进程结束
for i in {1..30}; do
    if ! ps -p $PID > /dev/null 2>&1; then
        echo "Qwen3-Thinking 服务已停止"
        exit 0
    fi
    sleep 1
done

echo "进程未正常结束，强制终止..."
kill -9 $PID
echo "Qwen3-Thinking 服务已强制停止"
