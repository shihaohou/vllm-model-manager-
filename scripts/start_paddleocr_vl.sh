#!/bin/bash

# 激活 conda 环境
source /root/miniconda3/etc/profile.d/conda.sh
conda activate base

MODEL_PATH="/root/models/PaddleOCR-VL"
LOG_FILE="/root/logs/vllm_paddleocr.log"
PORT=8080

# 检查是否已有PaddleOCR-VL服务运行
if pgrep -f "vllm serve.*PaddleOCR-VL" > /dev/null; then
    echo "PaddleOCR-VL服务已在运行中"
    curl -s http://localhost:$PORT/v1/models | python3 -m json.tool
    exit 0
fi

echo "启动 PaddleOCR-VL..."
CUDA_VISIBLE_DEVICES=0 nohup vllm serve $MODEL_PATH \
    --served-model-name PaddleOCR-VL-0.9B \
    --port $PORT \
    --host 0.0.0.0 \
    --trust-remote-code \
    --max-num-batched-tokens 16384 \
    --no-enable-prefix-caching \
    --mm-processor-cache-gb 0 \
    --gpu-memory-utilization 0.4 \
    > $LOG_FILE 2>&1 &

echo "服务启动中，日志: $LOG_FILE"
echo "服务正在后台启动，请稍后查看状态"
