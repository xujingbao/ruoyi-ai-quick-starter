# RuoYi AI Quick Starter

![version](https://img.shields.io/badge/version-6.1.0-blue) ![JDK](https://img.shields.io/badge/JDK-17%2B-orange) ![Spring%20Boot](https://img.shields.io/badge/Spring%20Boot-4.0.7-green) ![React](https://img.shields.io/badge/React-18.3.1-61dafb) ![license](https://img.shields.io/badge/license-MIT-green)

基于 RuoYi 的 **AI 原生产品**：Pi Agent 作为核心引擎，Spring 提供鉴权与 System Tool Bus，前端全局 Agent Shell（⌘/Ctrl+K）为主交互。

## 技术栈

**后端：** Spring Boot 4.0.7 + MyBatis + Redis + PostgreSQL + Quartz  
**Agent 引擎：** Pi Coding Agent SDK（`ruoyi-ai-agent`）+ System Tool Bus（`/ai/agent/tools/**`）  
**前端：** React 18 + Ant Design + Vite + pnpm + Zustand + Agent Shell  
**移动端：** uni-app、React Native（Expo）、HarmonyOS

## 快速开始

### 环境要求

JDK 17+ | Maven 3.9+（推荐 `./mvnw`） | Node.js 20.19+ 或 22.12+ | pnpm 9+ | PostgreSQL 15+ | Redis 6.0+

### 启动步骤

1. **初始化数据库**
   ```bash
   # 唯一终版脚本（系统表 + Quartz + AI + Agent 审计）
   # 执行 sql/ry-demo-postgresql.sql
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

### 构建部署

```bash
# 后端构建（推荐使用 Wrapper）
./mvnw -s .mvn/maven-settings.xml clean package -DskipTests

# 前端构建
cd ruoyi-react-web && pnpm build:prod
```

## 项目结构

```
ruoyi-quick-starter/
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
├── openspec/             # OpenSpec 规范文档
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

- [AI Agent 架构](docs/ai-agent-architecture.md) - Pi 侧车、网关与 Tool Bus
- [技术栈版本清单](VERSIONS.md) - 各端依赖与版本明细
- [更新日志](CHANGELOG.md) - 版本变更记录

## 参考文档

- [RuoYi 官方文档](http://doc.ruoyi.vip) - 基础框架文档
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
