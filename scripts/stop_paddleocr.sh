#!/bin/bash

if pgrep -f "vllm serve.*PaddleOCR-VL" > /dev/null; then
    echo "正在停止 PaddleOCR-VL 服务..."
    pkill -f "vllm serve.*PaddleOCR-VL"
    sleep 2
    if pgrep -f "vllm serve.*PaddleOCR-VL" > /dev/null; then
        echo "强制终止..."
        pkill -9 -f "vllm serve.*PaddleOCR-VL"
    fi
    echo "PaddleOCR-VL 服务已停止"
else
    echo "PaddleOCR-VL 服务未运行"
fi
