# RuoYi AI Quick Starter

基于 RuoYi 成熟框架的 **AI 快速开发框架**，AI 友好设计，前后端统一仓库实现全栈开发，集成 AI 原生组件和规范驱动开发方法，支持 Web 和移动端多端部署，可快速生成模块完整代码，助力快速搭建多端的企业级管理系统。
## 技术栈

**后端：** Spring Boot 3.x + MyBatis + Redis + MySQL + Quartz  
**前端：** Vue 3 + Element Plus + Vite + pnpm + Pinia  
**移动端：** uni-app

## 快速开始

### 环境要求

JDK 17+ | Maven 3.6+ | Node.js 20.19+ 或 22.12+ | pnpm 8+ | MySQL 8.0+ | Redis 6.0+

### 启动步骤

1. **初始化数据库**
   ```bash
   # 执行 sql/ry_20250522.sql 初始化数据库
   # 修改 ruoyi-admin/src/main/resources/application-dev.yml 中的数据库连接信息
   ```

2. **配置 DeepSeek API Key**（AI 功能需要）
   
   编辑 `ruoyi-admin/src/main/resources/application-dev.yml`，将 `api-key` 替换为你的实际 API Key：
   ```yaml
   spring:
     ai:
       openai:
         api-key: sk-your-api-key-here
   ```

3. **启动后端**（推荐使用 Cursor 调试配置）
   - 按 `F5` → 选择 **"RuoYi Backend"** → 启动
   - 或使用命令：`mvn spring-boot:run`
   - 访问：<http://localhost:8080/swagger-ui.html>

3. **启动前端**（推荐使用 Cursor 调试配置）
   ```bash
   cd ruoyi-front
   pnpm install
   # 按 F5 → 选择 "RuoYi Frontend" → 启动
   # 或使用命令：pnpm dev
   ```
   - 访问：<http://localhost:80>

### 构建部署

```bash
# 后端构建
mvn clean package -DskipTests

# 前端构建
cd ruoyi-front && pnpm build:prod
```

## 项目结构

```
ruoyi-quick-starter/
├── ruoyi-admin/          # 后端主模块（启动入口）
├── ruoyi-framework/      # 框架核心模块
├── ruoyi-system/         # 系统业务模块
├── ruoyi-common/         # 通用工具模块
├── ruoyi-quartz/         # 定时任务模块
├── ruoyi-front/          # 前端项目（Vue3 + Vite）
├── ruoyi-app/            # 移动端项目（uni-app）
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
- ✅ 多终端支持（Web、移动端）

## 开发指南

### 🚀 Cursor AI 开发

项目已针对 **Cursor AI** 进行优化配置，推荐使用 Cursor 编辑器进行开发。

**核心能力：**
- 🤖 智能代码生成、代码理解、自动重构
- 📝 文档生成、问题诊断
- 🛠️ 断点调试、AI 辅助

**项目配置：**
- AI 开发规范：`.cursor/rules/default.mdc`
- 调试配置：`.vscode/launch.json`（按 `F5` 启动）
- 开发规范：`openspec/conventions/` 目录

**快速使用：**
- 代码生成：`@文件名 创建类似的类`
- 代码重构：选中代码 → `Cmd/Ctrl + K`
- 数据库操作：使用 MySQL MCP 工具直接操作

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

- [Spring AI 集成文档](docs/SPRING_AI_INTEGRATION.md) - Spring AI 1.1.2 集成指南和问题排查
- [流式渲染逻辑文档](docs/STREAMING_RENDER_LOGIC.md) - AI 聊天流式渲染完整流程梳理

## 参考文档

- [RuoYi 官方文档](http://doc.ruoyi.vip) - 基础框架文档
- [Spring AI 官方文档](https://docs.spring.io/spring-ai/reference/) - AI 集成文档
- [Vue 3 文档](https://cn.vuejs.org) - 前端框架文档
- [Element Plus 文档](https://element-plus.org/zh-CN) - UI 组件库文档
- [Spring Boot 文档](https://spring.io/projects/spring-boot) - 后端框架文档
- [OpenSpec 官方文档](https://openspec.dev/) - 规范驱动开发文档

## 项目链接

- **GitHub**: [https://github.com/xujingbao/ruoyi-ai-quick-starter](https://github.com/xujingbao/ruoyi-ai-quick-starter)
- **Gitee**: [https://gitee.com/xujingbao/ruoyi-ai-quick-starter](https://gitee.com/xujingbao/ruoyi-ai-quick-starter)

## 致谢

本项目基于 [RuoYi](http://doc.ruoyi.vip) 框架开发，感谢 RuoYi 团队的开源贡献。

## 许可证

[MIT License](LICENSE)
