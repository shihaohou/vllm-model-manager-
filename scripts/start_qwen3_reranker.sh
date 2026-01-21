#!/bin/bash

# 激活 conda 环境
source /root/miniconda3/etc/profile.d/conda.sh
conda activate base

MODEL_PATH="/root/models/qwen3-reranker/Qwen3-Reranker-8B"
LOG_FILE="/root/logs/vllm_reranker.log"
PORT=8012

# 检查是否已有reranker服务运行
if pgrep -f "vllm serve.*Reranker" > /dev/null; then
    echo "Qwen3-Reranker服务已在运行中"
    curl -s http://localhost:$PORT/v1/models | python3 -m json.tool
    exit 0
fi

echo "启动 Qwen3-Reranker-8B..."
CUDA_VISIBLE_DEVICES=0 nohup vllm serve $MODEL_PATH \
    --served-model-name Qwen3-Reranker-8B \
    --port $PORT \
    --host 0.0.0.0 \
    --gpu-memory-utilization 0.4 \
    --max-model-len 8192 \
    --hf_overrides '{"architectures": ["Qwen3ForSequenceClassification"],"classifier_from_token": ["no", "yes"],"is_original_qwen3_reranker": true}' \
    > $LOG_FILE 2>&1 &

echo "服务启动中，日志: $LOG_FILE"
echo "服务正在后台启动，请稍后查看状态"
