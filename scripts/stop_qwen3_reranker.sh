#!/bin/bash

if pgrep -f "vllm serve.*Reranker" > /dev/null; then
    echo "正在停止 Qwen3-Reranker 服务..."
    pkill -f "vllm serve.*Reranker"
    sleep 2
    if pgrep -f "vllm serve.*Reranker" > /dev/null; then
        echo "强制终止..."
        pkill -9 -f "vllm serve.*Reranker"
    fi
    echo "Qwen3-Reranker 服务已停止"
else
    echo "Qwen3-Reranker 服务未运行"
fi
