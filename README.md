# 智能文本校对助手 (Text Polish)

一个基于 AI 的智能文本校对和优化工具，帮助用户提升写作质量。该项目使用 Next.js 14 构建，集成了 OpenAI API，提供实时的文本校对和优化功能。

## 功能特点

- 🤖 基于 AI 的智能文本校对
- ✨ 实时文本优化
- 🎨 美观的用户界面
- 🌓 支持深色/浅色主题
- 💫 流畅的动画效果
- 📱 响应式设计

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI
- **状态管理**: Zustand
- **动画**: Framer Motion
- **AI 集成**: OpenAI API
- **代码规范**: ESLint, Prettier
- **版本控制**: Git, Husky

## 开始使用

### 环境要求

- Node.js 18+
- pnpm

### 安装步骤

1. 克隆仓库
   \`\`\`bash
   git clone [repository-url]
   cd text-polish
   \`\`\`

2. 安装依赖
   \`\`\`bash
   pnpm install
   \`\`\`

3. 配置环境变量
   创建 \`.env\` 文件并添加以下配置：
   \`\`\`env
   NEXT_PUBLIC_OPENAI_BASE_URL="your-openai-base-url"
   NEXT_PUBLIC_OPENAI_API_KEY="your-openai-api-key"
   NEXT_PUBLIC_OPENAI_MODEL="your-model-name"
   \`\`\`

4. 启动开发服务器
   \`\`\`bash
   pnpm dev
   \`\`\`

访问 http://localhost:3000 查看应用。

## 项目结构

\`\`\`
src/
├── app/ # Next.js 应用主目录
│ ├── api/ # API 路由
│ ├── layout.tsx # 应用布局
│ └── page.tsx # 主页面
├── components/ # React 组件
│ ├── features/ # 功能组件
│ └── ui/ # UI 组件
├── hooks/ # 自定义 React Hooks
└── lib/ # 工具函数和配置
\`\`\`

## 开发

### 可用的脚本

- \`pnpm dev\`: 启动开发服务器
- \`pnpm build\`: 构建生产版本
- \`pnpm start\`: 启动生产服务器
- \`pnpm lint\`: 运行 ESLint 检查
- \`pnpm format\`: 使用 Prettier 格式化代码

### 代码规范

项目使用 ESLint 和 Prettier 进行代码规范和格式化。提交代码前会自动运行 lint-staged 检查。

## 贡献

欢迎提交 Pull Request 和 Issue。在提交 PR 之前，请确保：

1. 代码通过所有测试
2. 遵循现有的代码风格
3. 更新相关文档

## 许可证

[MIT License](LICENSE)
