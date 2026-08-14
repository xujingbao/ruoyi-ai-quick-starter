# RuoYi AI Quick Starter

![version](https://img.shields.io/badge/version-6.3.0-blue) ![JDK](https://img.shields.io/badge/JDK-17%2B-orange) ![Spring%20Boot](https://img.shields.io/badge/Spring%20Boot-4.0.7-green) ![React](https://img.shields.io/badge/React-18.3.1-61dafb) ![Ant%20Design](https://img.shields.io/badge/Ant%20Design-6.6.0-1677ff) ![Vite](https://img.shields.io/badge/Vite-8.2.1-646cff) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-336791) ![Redis](https://img.shields.io/badge/Redis-6%2B-dc382d)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933) ![Maven](https://img.shields.io/badge/Maven-3.9%2B-c71a36) ![pnpm](https://img.shields.io/badge/pnpm-9%2B-f69220) ![Pi%20Agent](https://img.shields.io/badge/Pi%20Agent-0.84.1-000000) ![OpenSpec](https://img.shields.io/badge/OpenSpec-1.9.0-4f46e5) ![Comet](https://img.shields.io/badge/Comet-0.4.0--beta.18-0ea5e9) ![license](https://img.shields.io/badge/license-MIT-green)

基于 RuoYi 的 **AI 原生产品**：Pi Agent 作为核心引擎，Spring 提供鉴权与 System Tool Bus，前端全局 Agent Shell（⌘/Ctrl+K）为主交互。装好即得一套带 AI 助手的多端企业后台：既能用自然语言查询系统数据、分析沙箱文件，也能按传统 Spring Boot 后台的方式继续开发业务模块。

## 目录

- [用这个框架可以做什么](#用这个框架可以做什么)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [技术文档](#技术文档)
- [参考文档](#参考文档)
- [项目链接](#项目链接)
- [许可证](#许可证)

## 用这个框架可以做什么

### 🤖 开箱即用的 AI 企业后台

启动后，顶部导航的 **AI Agent（⌘/Ctrl+K）** 就是系统的智能助手：

- **自然语言查系统数据**：直接问「有哪些用户」「查询公告」「列出定时任务」，Agent 通过 System Tool Bus 实时查询，权限与登录用户一致
- **工具过程可视化**：对话中展示推理与每次工具调用（工具名、参数、结果），AI 结论有据可查
- **流式对话与会话持久化**：SSE 流式输出，会话自动生成主题，历史会话可回显、可继续
- **业务 / 沙箱双模式**：业务模式只读访问系统数据；沙箱模式额外提供只读文件工具（read / grep / find / ls），可分析每个会话独立的沙箱工作区

上手最快的方式，直接在 Agent Shell 里提问：

- 业务模式：「列出用户」「查询公告」「列出定时任务」「查询配置 sys.user.initPassword」
- 沙箱模式：「沙箱里有哪些文件？」

### 🏢 完整的企业后台基础框架

用户 / 角色 / 菜单 / 部门权限管理、系统监控（在线用户、服务、缓存）、定时任务、操作日志、登录日志、字典与参数配置等 RuoYi 能力全部保留，开箱即用，可直接在此基础上扩展业务模块。

### 🛠️ 可扩展的 Agent 工具生态

System Tool Bus 是 Spring 侧一组受权限约束的只读 API（`/ai/agent/tools/**`）。把业务 Service 按同样模式暴露为 `sys_*` 工具，Agent 就能"学会"查询你的业务数据；每次工具调用都有审计日志（用户、工具、耗时、成败），可追溯。

### 🧑‍💻 AI 友好的全栈开发环境

前后端统一仓库 + Cursor 预配置（F5 一键调试）+ OpenSpec + Comet 规范驱动开发流程，AI 能理解完整业务上下文，按规范快速生成模块代码。

### 📱 一套代码多端交付

Web（React 18 + Ant Design）、uni-app、React Native（Expo）、HarmonyOS 示例工程共享同一套后端 API，覆盖主流端场景。

## 技术栈

**后端：** Spring Boot 4.0.7 + MyBatis + Redis + PostgreSQL + Quartz  
**Agent 引擎：** Pi Coding Agent SDK（`ruoyi-ai-agent`）+ System Tool Bus（`/ai/agent/tools/**`）  
**前端：** React 18 + Ant Design + Vite + pnpm + Zustand + Agent Shell  
**移动端：** uni-app、React Native（Expo）、HarmonyOS  
**开发流程：** OpenSpec 1.9.0 + Comet Classic（open → design → build → verify → archive）

## 快速开始

### 环境要求

JDK 17+ | Maven 3.9+（推荐 `./mvnw`） | Node.js 20.19+ 或 22.12+（Comet 需 22+） | pnpm 9+ | PostgreSQL 15+ | Redis 6.0+

### 启动步骤

1. **初始化数据库**
   ```bash
   # 创建数据库（UTF-8，AI 向量能力需预装 pgvector）
   createdb -U postgres ry_demo

   # 执行唯一终版脚本（系统表 + Quartz + AI + Agent 审计）
   psql -U postgres -d ry_demo -f sql/ry-demo-postgresql.sql

   # 修改 ruoyi-admin/src/main/resources/application-dev.yml 中的数据库连接信息
   ```

2. **配置 AI API Key**（Agent 侧车需要）

   LLM 配置通过环境变量注入到 `ruoyi-ai-agent`，推荐设置：
   ```bash
   export AI_API_BASE_URL=https://api.deepseek.com
   export AI_API_KEY=sk-your-api-key-here
   export AI_MODEL=deepseek-chat
   ```

3. **本地启停（推荐）**
   ```bash
   # 可选：export AI_API_KEY=... AI_API_BASE_URL=... AI_MODEL=...
   ./scripts/ruoyi-dev.sh restart all   # admin:8080 + agent:19090 + web:80
   ./scripts/ruoyi-dev.sh status all
   ```
   也可分别：`agent` / `admin` / `web`。Agent 单独也可用 `cd ruoyi-ai-agent && npm start`。  
   架构说明见 `docs/ai-agent-architecture.md`。

4. **或用 Cursor 调试配置单独启动**
   - 后端：`F5` → **"RuoYi Backend"**，或 `./mvnw -s .mvn/maven-settings.xml spring-boot:run -pl ruoyi-admin`
   - 前端：`F5` → **"RuoYi Frontend (React)"**，或 `cd ruoyi-react-web && pnpm install && pnpm dev`
   - 访问：<http://localhost:80> → 顶部 **AI Agent**（或 ⌘/Ctrl+K）；Swagger：<http://localhost:8080/swagger-ui.html>
   - 默认管理员：`admin / admin123`（新用户初始密码由参数 `sys.user.initPassword` 控制，默认 `123456`）

### 构建部署

```bash
# 后端构建（推荐使用 Wrapper）
./mvnw -s .mvn/maven-settings.xml clean package -DskipTests

# 前端构建
cd ruoyi-react-web && pnpm build:prod
```

## 项目结构

```
ruoyi-ai-quick-starter/
├── ruoyi-admin/          # 后端主模块（启动入口 / Agent 网关）
├── ruoyi-framework/      # 框架核心模块
├── ruoyi-system/         # 系统业务模块
├── ruoyi-common/         # 通用工具模块
├── ruoyi-quartz/         # 定时任务模块
├── ruoyi-ai-agent/       # Pi Agent Node 侧车
├── ruoyi-react-web/      # Web 前端（React 18 + Ant Design + Vite）
├── ruoyi-uni-app/        # 移动端项目（uni-app + Vue3 + Pinia）
├── ruoyi-rn-app/         # 移动端项目（React Native + Expo）
├── ruoyi-harmony-app/    # HarmonyOS/OpenHarmony ArkTS 示例工程
├── .comet/               # Comet 工作流配置（Classic 五阶段）
├── openspec/             # OpenSpec 规范文档
├── docs/                 # 技术文档（含 Comet 工作流说明）
├── package.json          # 根工程：Comet CLI 与脚本
└── sql/                  # 数据库脚本
```

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
/opsx-new 添加新功能
```

**项目结构：**
- `openspec/project.md` - 项目上下文
- `openspec/AGENTS.md` - AI 助手指令
- `openspec/conventions/` - 开发规范
- `openspec/specs/` - 功能规格说明
- `openspec/changes/` - 变更提案

**更多信息：** [https://openspec.dev/](https://openspec.dev/)

### 🧩 Comet 工作流

项目已集成 **Comet**，把 OpenSpec 的 `open → design → build → verify → archive` 编排成可恢复、可看板的需求流程（底层复用 OpenSpec 1.9.0 与 Superpowers 技能）。

**快速开始：**
```bash
npm install            # 首次：安装根工程依赖（Comet CLI）
npx comet doctor       # 检查安装健康
npx comet status       # 查看活跃 change
npx comet dashboard    # 只读看板（默认 http://localhost:4321）
```

- 正式变更：`/comet` 按 `.comet.yaml` 阶段推进；轻量改动用 `/comet-tweak`
- 配置：`.comet/config.yaml`（Classic 工作流、中文产物、legacy 布局）
- 详细说明见 [Comet 工作流](docs/comet-workflow.md)

## 技术文档

项目技术文档位于 `docs/` 目录：

- [AI Agent 架构](docs/ai-agent-architecture.md) - Pi 侧车、网关与 Tool Bus
- [Comet 工作流](docs/comet-workflow.md) - 五阶段研发流程与阶段命令
- [技术栈版本清单](VERSIONS.md) - 各端依赖与版本明细
- [更新日志](CHANGELOG.md) - 版本变更记录

## 参考文档

- [RuoYi 官方文档](http://doc.ruoyi.vip) - 基础框架文档
- [React 文档](https://react.dev) - 前端框架文档
- [Ant Design 文档](https://ant.design) - UI 组件库文档
- [Spring Boot 文档](https://spring.io/projects/spring-boot) - 后端框架文档
- [OpenSpec 官方文档](https://openspec.dev/) - 规范驱动开发文档
- [Comet 官方文档](https://docs.comet.rpamis.com/zh/overview) - Comet 工作流文档

## 项目链接

- **GitHub**: [https://github.com/xujingbao/ruoyi-ai-quick-starter](https://github.com/xujingbao/ruoyi-ai-quick-starter)
- **Gitee**: [https://gitee.com/xujingbao/ruoyi-ai-quick-starter](https://gitee.com/xujingbao/ruoyi-ai-quick-starter)

## 致谢

本项目基于 [RuoYi](http://doc.ruoyi.vip) 框架开发，感谢 RuoYi 团队的开源贡献。

## 许可证

[MIT License](LICENSE)
