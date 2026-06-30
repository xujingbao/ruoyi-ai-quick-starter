# RuoYi AI Quick Starter

![version](https://img.shields.io/badge/version-5.3.2-blue) ![JDK](https://img.shields.io/badge/JDK-17%2B-orange) ![Spring%20Boot](https://img.shields.io/badge/Spring%20Boot-3.5.4-green) ![Spring%20AI](https://img.shields.io/badge/Spring%20AI-1.1.8-green) ![React](https://img.shields.io/badge/React-18.3.1-61dafb) ![license](https://img.shields.io/badge/license-MIT-green)

基于 RuoYi 成熟框架的 **AI 快速开发框架**，AI 友好设计，前后端统一仓库实现全栈开发，集成 AI 原生组件和规范驱动开发方法，支持 Web 和移动端多端部署，可快速生成模块完整代码，助力快速搭建多端的企业级管理系统。

## 技术栈

**后端：** Spring Boot 3.5.4 + Spring AI 1.1.8 + MyBatis + Redis + PostgreSQL + Quartz  
**前端：** React 18 + Ant Design + Vite + pnpm + Zustand + React Router  
**移动端：** uni-app、React Native（Expo）、HarmonyOS

## 快速开始

### 环境要求

JDK 17+ | Maven 3.6+ | Node.js 20.19+ 或 22.12+ | pnpm 9+ | PostgreSQL 15+ | Redis 6.0+

### 启动步骤

1. **初始化数据库**
   ```bash
   # 先执行 sql/ry-demo-postgresql.sql 初始化业务库
   # 再执行 sql/quartz-postgresql.sql 初始化 Quartz 表
   # 如需 AI 能力基础表，执行 sql/ai-postgresql.sql
   # 修改 ruoyi-admin/src/main/resources/application-dev.yml 中的数据库连接信息
   ```

2. **配置 AI API Key**（AI 功能需要）

   AI 配置通过环境变量注入（`application-dev.yml` 已默认读取），推荐设置环境变量：
   ```bash
   export AI_API_BASE_URL=https://api.deepseek.com
   export AI_API_KEY=sk-your-api-key-here
   export AI_MODEL=deepseek-chat
   ```
   也可直接修改 `ruoyi-admin/src/main/resources/application-dev.yml` 中对应默认值，但请勿提交真实密钥。

3. **启动后端**（推荐使用 Cursor 调试配置）
   - 按 `F5` → 选择 **"RuoYi Backend"** → 启动
   - 或使用命令：`mvn spring-boot:run`
   - 访问：<http://localhost:8080/swagger-ui.html>

4. **启动前端（React）**（推荐使用 Cursor 调试配置）
   ```bash
   cd ruoyi-react-web
   pnpm install
   # 按 F5 → 选择 "RuoYi Frontend (React)" → 启动
   # 或使用命令：pnpm dev
   ```
   - 访问：<http://localhost:80>

### 构建部署

```bash
# 后端构建
mvn clean package -DskipTests

# 前端构建
cd ruoyi-react-web && pnpm build:prod
```

## 项目结构

```
ruoyi-quick-starter/
├── ruoyi-admin/          # 后端主模块（启动入口）
├── ruoyi-framework/      # 框架核心模块
├── ruoyi-system/         # 系统业务模块
├── ruoyi-common/         # 通用工具模块
├── ruoyi-quartz/         # 定时任务模块
├── ruoyi-react-web/      # Web 前端（React 18 + Ant Design + Vite）
├── ruoyi-uni-app/        # 移动端项目（uni-app + Vue3 + Pinia）
├── ruoyi-rn-app/         # 移动端项目（React Native + Expo）
├── ruoyi-harmony-app/    # HarmonyOS/OpenHarmony ArkTS 示例工程
├── docs/                 # 技术文档
│   ├── SPRING_AI_INTEGRATION.md    # Spring AI 集成文档
│   └── STREAMING_RENDER_LOGIC.md   # 流式渲染逻辑文档
├── openspec/             # OpenSpec 规范文档
│   ├── project.md        # 项目上下文
│   ├── AGENTS.md         # AI 助手指令
│   └── conventions/      # 开发规范
└── sql/                  # 数据库脚本
```

## 核心功能

- ✅ 用户权限管理（用户、角色、菜单、部门）
- ✅ 系统监控（在线用户、服务监控、缓存监控）
- ✅ 定时任务管理、操作日志、登录日志
- ✅ 字典管理、参数配置

## 开发指南

### 🚀 Cursor AI 开发

项目已针对 **Cursor AI** 进行优化配置，推荐使用 Cursor 编辑器进行开发。

**核心能力：**
- 🤖 智能代码生成、代码理解、自动重构
- 📝 文档生成、问题诊断
- 🛠️ 断点调试、AI 辅助

**项目配置：**
- AI 开发规范：`openspec/AGENTS.md` 与 `openspec/conventions/`
- 调试配置：`.vscode/launch.json`（按 `F5` 启动）
- 开发规范：`openspec/conventions/` 目录

**快速使用：**
- 代码生成：`@文件名 创建类似的类`
- 代码重构：选中代码 → `Cmd/Ctrl + K`
- 数据库操作：使用 PostgreSQL MCP 工具直接操作

### 📱 Cursor iOS + Cloud Agent 开发

可在 **Cursor iOS App** 中通过 **Cloud Agent** 远程开发本项目，随时随地发起任务、查看进度。

- **绑定仓库**：在 App 中登录并连接 GitHub 仓库（`xujingbao/ruoyi-ai-quick-starter`）
- **下发任务**：用自然语言描述需求，Cloud Agent 在云端 VM 自动改码、提交并创建 PR
- **配置 Secret**：发版等需要的密钥（如 `GITEE_TOKEN`）在 [Cursor Dashboard](https://cursor.com) → Cloud Agents → Secrets 配置，跨会话复用
- **查看结果**：在 App 内审阅 diff 与 PR，确认后合并

> 提示：Cloud Agent 默认只接入 GitHub；如需同步 Gitee，请按上文配置 `GITEE_TOKEN`。

### 📋 规范驱动开发（OpenSpec）

项目已集成 **OpenSpec**，用于管理功能规格说明和变更提案。

**快速开始：**
```bash
# 安装 OpenSpec CLI（需要 Node.js 20.19.0+）
npm install -g @fission-ai/openspec@latest

# 在 Cursor 中使用
/openspec:proposal 添加新功能
```

**项目结构：**
- `openspec/project.md` - 项目上下文
- `openspec/AGENTS.md` - AI 助手指令
- `openspec/conventions/` - 开发规范
- `openspec/specs/` - 功能规格说明
- `openspec/changes/` - 变更提案

**更多信息：** [https://openspec.dev/](https://openspec.dev/)

## 技术文档

项目技术文档位于 `docs/` 目录：

- [Spring AI 集成文档](docs/SPRING_AI_INTEGRATION.md) - Spring AI 1.1.8 集成指南和问题排查
- [流式渲染逻辑文档](docs/STREAMING_RENDER_LOGIC.md) - AI 聊天流式渲染完整流程梳理
- [HarmonyOS 支持文档](docs/HARMONYOS_SUPPORT.md) - DevEco Studio + hvigor + 资源说明
- [技术栈版本清单](VERSIONS.md) - 各端依赖与版本明细
- [更新日志](CHANGELOG.md) - 版本变更记录

## 参考文档

- [RuoYi 官方文档](http://doc.ruoyi.vip) - 基础框架文档
- [Spring AI 官方文档](https://docs.spring.io/spring-ai/reference/) - AI 集成文档
- [React 文档](https://react.dev) - 前端框架文档
- [Ant Design 文档](https://ant.design) - UI 组件库文档
- [Spring Boot 文档](https://spring.io/projects/spring-boot) - 后端框架文档
- [OpenSpec 官方文档](https://openspec.dev/) - 规范驱动开发文档

## 项目链接

- **GitHub**: [https://github.com/xujingbao/ruoyi-ai-quick-starter](https://github.com/xujingbao/ruoyi-ai-quick-starter)
- **Gitee**: [https://gitee.com/xujingbao/ruoyi-ai-quick-starter](https://gitee.com/xujingbao/ruoyi-ai-quick-starter)

## 致谢

本项目基于 [RuoYi](http://doc.ruoyi.vip) 框架开发，感谢 RuoYi 团队的开源贡献。

## 许可证

[MIT License](LICENSE)
