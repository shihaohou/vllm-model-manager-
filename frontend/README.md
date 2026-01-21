# vLLM Model Manager - Frontend

现代化 Cyberpunk 风格的 vLLM 模型管理仪表板。

## 技术栈

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (高质量 UI 组件)
- **SWR** (数据获取和自动刷新)
- **Framer Motion** (动画)
- **Lucide React** (图标)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（可选）

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

默认配置：
- API Backend URL: `http://localhost:9000`

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 生产构建

```bash
npm run build
npm start
```

## 功能特性

- ✨ **Cyberpunk/Tech-Noir 美学** - 独特的暗黑霓虹主题
- 📊 **实时监控** - 每 5 秒自动刷新数据
- 🎮 **GPU 状态** - 利用率、显存、温度、功耗
- 💻 **系统资源** - CPU、内存、磁盘使用情况
- 🤖 **服务管理** - 一键启动/停止 vLLM 服务
- 📝 **日志查看** - 实时查看服务日志
