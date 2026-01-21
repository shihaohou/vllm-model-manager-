#!/bin/bash

if pgrep -f "vllm serve" > /dev/null; then
    echo "正在停止 vLLM 服务..."
    pkill -f "vllm serve"
    sleep 2
    if pgrep -f "vllm serve" > /dev/null; then
        echo "强制终止..."
        pkill -9 -f "vllm serve"
    fi
    echo "服务已停止"
else
    echo "vLLM 服务未运行"
fi
