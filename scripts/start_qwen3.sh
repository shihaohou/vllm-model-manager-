#!/bin/bash
# vLLM Qwen3 启动脚本

# 配置
MODEL_PATH="/root/models/Qwen3-Next-80B-A3B-Instruct"
PORT=8000
GPUS="1,2,3,4"
LOG_FILE="/root/vllm-model-manager/logs/vllm_qwen3.log"
API_KEY="2db484b2456c8427ed2641c144dd1c95e703b9345869f8964af8a9bc0395736d"

# 启动 vLLM
nohup vllm serve $MODEL_PATH \
  --tensor-parallel-size 4 \
  --port $PORT \
  --host 0.0.0.0 \
  --api-key $API_KEY \
  --gpu-memory-utilization 0.95 \
  > $LOG_FILE 2>&1 &

echo "Qwen3 服务已启动，PID: $!"
echo "日志文件: $LOG_FILE"
