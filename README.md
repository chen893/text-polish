# 智能文本校对助手 (Text Polish)

基于 AI 的智能文本校对和优化工具，帮助用户提升写作质量。该项目使用 Next.js 14 构建，集成了 OpenAI API，提供实时的文本校对和优化功能。

## ✨ 功能特点

### 核心功能

- 🤖 **智能校对**: 基于 AI 的智能文本校对，自动识别并修正错误
- 📝 **双模式支持**:
  - 校对模式：专注于修正错误，保持原文风格
  - 润色模式：深度优化文本表达，提升文本质量
- 🎯 **精准修改**: 支持逐条审阅和确认修改建议
- 🔄 **实时预览**: 即时查看修改效果，支持接受/拒绝单条修改

### 交互体验

- 👆 **双向高亮**: 点击修改建议或文本对比区域，自动定位对应内容
- 📱 **响应式设计**: 完美适配桌面端和移动端
- ✨ **动画过渡**: 流畅的动画效果提升用户体验

### 文本优化

- 🎨 **多种文本风格**: 支持简单、商业、学术、非正式等多种风格
- 🗣️ **语气调节**: 可选择热情、亲切、自信、外交等不同语气
- 📊 **差异对比**: 直观展示修改前后的文本差异
- 📋 **一键复制**: 快速复制优化后的文本

## 🛠️ 技术栈

- **框架**: [Next.js 14](https://nextjs.org/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **组件**: [Radix UI](https://www.radix-ui.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **AI**: [OpenAI API](https://openai.com/)
- **工具**: ESLint, Prettier
- **包管理**: pnpm

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm
- OpenAI API Key

### 安装步骤

1. 克隆仓库

   ```bash
   git clone https://github.com/yourusername/text-polish.git
   cd text-polish
   ```

2. 安装依赖

   ```bash
   pnpm install
   ```

3. 配置环境变量
   创建 `.env.local` 文件并添加以下配置：

   ```env
   NEXT_PUBLIC_OPENAI_BASE_URL="your-openai-base-url"
   NEXT_PUBLIC_OPENAI_API_KEY="your-openai-api-key"
   NEXT_PUBLIC_OPENAI_MODEL="your-model-name"
   ```

4. 启动开发服务器
   ```bash
   pnpm dev
   ```

访问 http://localhost:3000 即可使用应用。

## 📁 项目结构

```
src/
├── app/                    # Next.js 应用主目录
│   ├── api/               # API 路由
│   ├── layout.tsx         # 应用布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── features/         # 功能组件
│   │   └── TextEditor/   # 文本编辑器相关组件
│   └── ui/              # 通用 UI 组件
├── hooks/                # 自定义 React Hooks
│   └── usePolishText.ts # 文本处理核心逻辑
├── lib/                  # 工具函数和配置
│   ├── openai.ts        # OpenAI API 相关
│   └── prompt.ts        # AI 提示词配置
└── types/               # TypeScript 类型定义
```

## 📝 使用说明

1. **文本输入**

   - 在文本框中输入需要校对/润色的文本
   - 选择校对模式或润色模式

2. **模式选择**

   - 校对模式：修正错误，保持原文风格
   - 润色模式：可选择文本风格和语气

3. **查看建议**

   - 右侧面板显示修改建议
   - 可逐条接受或拒绝修改
   - 点击修改内容可查看对应位置

4. **确认修改**
   - 使用"全部接受"或"全部拒绝"快速处理
   - 实时预览修改效果
   - 满意后可一键复制结果

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发规范

- 遵循 TypeScript 类型定义
- 使用 ESLint 和 Prettier 保持代码风格一致
- 编写清晰的提交信息
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [OpenAI](https://openai.com/) - AI 能力支持
- [Vercel](https://vercel.com/) - 部署平台
- [Shadcn UI](https://ui.shadcn.com/) - UI 组件库参考
