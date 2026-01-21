#!/bin/bash

# 激活 conda 环境
source /root/miniconda3/etc/profile.d/conda.sh
conda activate base

MODEL_PATH="/root/models/Qwen3-Next-80B-A3B-Instruct"
LOG_FILE="/root/logs/vllm_qwen3.log"
PORT=8000
API_KEY="2db484b2456c8427ed2641c144dd1c95e703b9345869f8964af8a9bc0395736d"

# 检查是否已有Qwen3服务运行
if pgrep -f "vllm serve.*Qwen3-Next-80B" > /dev/null; then
    echo "Qwen3服务已在运行中"
    curl -s http://localhost:$PORT/v1/models | python3 -m json.tool
    exit 0
fi

echo "启动 Qwen3-Next-80B-A3B-Instruct..."
CUDA_VISIBLE_DEVICES=1,2,3,4 nohup vllm serve $MODEL_PATH \
    --tensor-parallel-size 4 \
    --port $PORT \
    --host 0.0.0.0 \
    --api-key $API_KEY \
    > $LOG_FILE 2>&1 &

echo "服务启动中，日志: $LOG_FILE"
echo "服务正在后台启动，请稍后查看状态"
