#!/bin/bash

PID_FILE="/root/logs/model_manager.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "正在停止模型管理系统 (PID: $PID)..."
        kill "$PID"
        sleep 2
        if ps -p "$PID" > /dev/null 2>&1; then
            echo "强制终止..."
            kill -9 "$PID"
        fi
        rm -f "$PID_FILE"
        echo "服务已停止"
    else
        echo "服务未运行"
        rm -f "$PID_FILE"
    fi
else
    # 尝试通过进程名查找
    if pgrep -f "python3 app.py" > /dev/null; then
        echo "正在停止模型管理系统..."
        pkill -f "python3 app.py"
        sleep 2
        if pgrep -f "python3 app.py" > /dev/null; then
            echo "强制终止..."
            pkill -9 -f "python3 app.py"
        fi
        echo "服务已停止"
    else
        echo "服务未运行"
    fi
fi
