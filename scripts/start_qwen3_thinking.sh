#!/bin/bash

# 激活 conda 环境
source /root/miniconda3/etc/profile.d/conda.sh
conda activate base

MODEL_PATH="/root/models/Qwen3-Next-80B-A3B-Thinking-FP8"
LOG_FILE="/root/logs/vllm_qwen3_thinking.log"
PORT=8001
API_KEY="2db484b2456c8427ed2641c144dd1c95e703b9345869f8964af8a9bc0395736d"

# 检查模型目录是否存在
if [ ! -d "$MODEL_PATH" ]; then
    echo "错误: 模型目录不存在: $MODEL_PATH"
    echo "请先下载模型"
    exit 1
fi

# 检查是否已有Qwen3-Thinking服务运行
if pgrep -f "vllm serve.*Qwen3-Next-80B-A3B-Thinking" > /dev/null; then
    echo "Qwen3-Thinking服务已在运行中"
    curl -s http://localhost:$PORT/v1/models | python3 -m json.tool
    exit 0
fi

# 创建日志目录
mkdir -p /root/logs

echo "启动 Qwen3-Next-80B-A3B-Thinking-FP8..."
CUDA_VISIBLE_DEVICES=5,6 nohup vllm serve $MODEL_PATH \
    --tensor-parallel-size 2 \
    --port $PORT \
    --host 0.0.0.0 \
    --api-key $API_KEY \
    --dtype float16 \
    --max-model-len 8192 \
    > $LOG_FILE 2>&1 &

echo "服务启动中，日志: $LOG_FILE"
echo "服务正在后台启动，请稍后查看状态"
