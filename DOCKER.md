# Docker 部署指南

使用 Docker 和 Docker Compose 快速部署 vLLM Model Manager。

## 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- （可选）NVIDIA Docker Runtime（如需 GPU 访问）

## 快速开始

### 1. 准备配置文件

复制配置文件示例：

```bash
cp config/services.json.example config/services.json
```

编辑 `config/services.json` 配置您的服务。

### 2. 使用 Docker Compose 启动

```bash
docker-compose up -d
```

这将启动两个服务：
- **后端 (Flask)**: http://localhost:9000
- **前端 (Next.js)**: http://localhost:3000

### 3. 访问仪表板

在浏览器中打开：http://localhost:3000

### 4. 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看后端日志
docker-compose logs -f backend

# 查看前端日志
docker-compose logs -f frontend
```

### 5. 停止服务

```bash
docker-compose down
```

## 单独构建和运行

### 后端 (Flask)

```bash
# 构建镜像
docker build -t vllm-manager-backend .

# 运行容器
docker run -d \
  --name vllm-backend \
  -p 9000:9000 \
  -v $(pwd)/config:/app/config:ro \
  vllm-manager-backend
```

### 前端 (Next.js)

```bash
# 构建镜像
cd frontend
docker build -t vllm-manager-frontend .

# 运行容器
docker run -d \
  --name vllm-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:9000 \
  vllm-manager-frontend
```

## GPU 支持

如需在 Docker 中访问 GPU（用于监控或直接管理服务），需要安装 NVIDIA Container Toolkit。

### 安装 NVIDIA Container Toolkit

Ubuntu/Debian:
```bash
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

### 修改 docker-compose.yml

在后端服务中添加 GPU 支持：

```yaml
services:
  backend:
    # ... 其他配置
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

## 环境变量

### 后端 (Flask)

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `HOST` | `0.0.0.0` | 监听地址 |
| `PORT` | `9000` | 监听端口 |

### 前端 (Next.js)

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:9000` | 后端 API 地址 |

## 持久化数据

如需持久化配置文件，在 docker-compose.yml 中已经配置了卷挂载：

```yaml
volumes:
  - ./config:/app/config:ro
```

## 网络配置

服务使用 Docker 网络 `vllm-network` 进行通信。前端通过容器名 `backend` 访问后端 API。

## 健康检查

后端服务配置了健康检查：
- 检查间隔：30秒
- 超时时间：3秒
- 重试次数：3次
- 启动等待：5秒

前端服务依赖后端健康检查，只有在后端健康后才启动。

## 故障排除

### 前端无法连接后端

检查 docker-compose.yml 中的 `NEXT_PUBLIC_API_URL` 环境变量：
```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://backend:9000
```

### 端口冲突

修改 docker-compose.yml 中的端口映射：
```yaml
ports:
  - "9001:9000"  # 使用不同的主机端口
```

### 权限问题

确保配置目录有正确的权限：
```bash
chmod 644 config/services.json
```

### 查看容器状态

```bash
docker-compose ps
```

### 进入容器调试

```bash
# 进入后端容器
docker-compose exec backend sh

# 进入前端容器
docker-compose exec frontend sh
```

## 生产部署建议

1. **使用环境变量文件**
   ```bash
   cp frontend/.env.example frontend/.env.production
   ```

2. **配置反向代理**（如 Nginx）
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api {
           proxy_pass http://localhost:9000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **配置 HTTPS**
   使用 Let's Encrypt 或其他 SSL 证书。

4. **资源限制**
   在 docker-compose.yml 中添加资源限制：
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '2'
         memory: 2G
   ```

5. **日志管理**
   配置日志驱动和轮转：
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

## 镜像大小优化

已使用的优化策略：
- ✅ 多阶段构建（前端）
- ✅ Alpine Linux 基础镜像（前端）
- ✅ Slim 镜像（后端）
- ✅ .dockerignore 文件
- ✅ 最小化层数

## 安全建议

1. 不要在生产环境中暴露 Docker socket
2. 使用非 root 用户运行容器（已配置）
3. 定期更新基础镜像
4. 扫描镜像漏洞：
   ```bash
   docker scan vllm-manager-backend
   docker scan vllm-manager-frontend
   ```

## 许可证

MIT
