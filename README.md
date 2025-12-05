# RuoYi AI Quick Starter

基于 RuoYi 成熟框架的 **AI 快速开发框架**，AI 友好设计，前后端统一仓库实现全栈开发，集成 AI 原生组件和规范驱动开发方法，支持 Web 和移动端多端部署，可快速生成模块完整代码，助力快速搭建多端的企业级管理系统。

## 技术栈

### 后端

- **Spring Boot 3.x** - 核心框架
- **Spring Security** - 安全框架
- **MyBatis** - ORM 框架
- **Redis** - 缓存数据库
- **MySQL** - 关系型数据库
- **Quartz** - 定时任务调度

### 前端

- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 组件库
- **Vite** - 前端构建工具
- **pnpm** - 包管理器
- **Pinia** - 状态管理

### 移动端

- **uni-app** - 跨平台应用框架

## 快速开始

### 环境要求

- JDK 17+
- Maven 3.6+
- Node.js 18+
- pnpm 8+
- MySQL 8.0+
- Redis 6.0+

### 后端启动

1. 导入数据库脚本

   ```bash
   # 执行 sql/ry_20250522.sql 初始化数据库
   ```

2. 修改数据库配置

   ```yaml
   # ruoyi-admin/src/main/resources/application-dev.yml
   # 修改数据库连接信息
   ```

3. 在 Cursor 中启动后端服务

   > ⚠️ **推荐方式**：使用 Cursor 调试配置启动，不推荐使用脚本直接启动

   **使用 Cursor 调试配置启动（推荐）：**

   - 按 `F5` 键，或点击左侧调试面板
   - 选择 **"RuoYi Backend"** 配置
   - 点击启动按钮（或按 `F5`）
   - 服务将自动启动，并自动使用 `dev` 环境配置

   **优势：**
   - ✅ 支持断点调试
   - ✅ 自动使用正确的环境配置
   - ✅ 日志输出在 Cursor 集成终端
   - ✅ 便于使用 Cursor AI 辅助调试

   > ❌ **不推荐**：使用 `mvn spring-boot:run` 或脚本启动，无法享受调试和 AI 辅助功能

4. 访问后端接口
   - API 文档：<http://localhost:8080/swagger-ui.html>
   - 后端服务：<http://localhost:8080>

### 前端启动

1. 安装依赖

   ```bash
   cd ruoyi-front
   pnpm install
   ```

2. 在 Cursor 中启动前端服务

   > ⚠️ **推荐方式**：使用 Cursor 调试配置启动，不推荐使用脚本直接启动

   **使用 Cursor 调试配置启动（推荐）：**

   - 按 `F5` 键，或点击左侧调试面板
   - 选择 **"RuoYi Frontend"** 配置
   - 点击启动按钮（或按 `F5`）
   - 开发服务器将自动启动

   **优势：**
   - ✅ 自动使用 pnpm 包管理器
   - ✅ 日志输出在 Cursor 集成终端
   - ✅ 便于使用 Cursor AI 辅助开发
   - ✅ 统一的开发环境配置

   > ❌ **不推荐**：使用 `pnpm dev` 脚本启动，无法享受 AI 辅助和统一调试体验

3. 访问前端应用
   - 前端地址：<http://localhost:80>

### 构建部署

#### 后端构建

```bash
mvn clean package -DskipTests
```

#### 前端构建

```bash
cd ruoyi-front
pnpm build:prod
```

## 项目结构

```text
ruoyi-quick-starter/
├── ruoyi-admin/          # 后端主模块（启动入口）
├── ruoyi-framework/      # 框架核心模块
├── ruoyi-system/         # 系统业务模块
├── ruoyi-common/         # 通用工具模块
├── ruoyi-quartz/         # 定时任务模块
├── ruoyi-front/          # 前端项目（Vue3 + Vite）
├── ruoyi-app/            # 移动端项目（uni-app）
├── openspec/             # OpenSpec 规范文档
│   ├── project.md        # 项目上下文
│   ├── AGENTS.md         # AI 助手指令
│   └── specs/            # 功能规格说明
└── sql/                  # 数据库脚本
```

## 核心功能

- ✅ 用户权限管理（用户、角色、菜单、部门）
- ✅ 系统监控（在线用户、服务监控、缓存监控）
- ✅ 定时任务管理
- ✅ 操作日志、登录日志
- ✅ 字典管理、参数配置
- ✅ 多终端支持（Web、移动端）

## 开发指南

### 🚀 使用 Cursor AI 进行开发

本项目已针对 **Cursor AI** 进行优化配置，推荐使用 Cursor 编辑器进行开发，可大幅提升开发效率。

#### Cursor AI 优势

- 🤖 **智能代码生成**：基于项目上下文自动生成符合规范的代码
- 🔍 **代码理解**：快速理解项目结构和业务逻辑
- 🛠️ **自动重构**：智能优化代码结构和性能
- 📝 **文档生成**：自动生成代码注释和文档
- 🐛 **问题诊断**：快速定位和修复问题

#### 项目 AI 配置

项目已配置 AI 开发规范（`.cursor/rules/default.mdc`），包括：

- ✅ 项目开发基本原则和代码规范
- ✅ 技术栈和开发环境配置
- ✅ 枚举使用规范（参考 `openspec/conventions/枚举使用规范.md`）
- ✅ 业务参数配置规范（参考 `openspec/conventions/业务参数配置规范.md`）
- ✅ 前端组件封装规范（单文件不超过 800 行）

#### 使用 Cursor AI 开发工作流

1. **代码生成**

   ```text
   # 在 Cursor 中使用 @ 符号引用文件或代码
   @SysUser.java 创建一个类似的实体类 SysRole
   ```

2. **代码重构**

   ```text
   # 选中代码后，使用 Cmd/Ctrl + K 进行 AI 重构
   优化这段代码的性能和可读性
   ```

3. **问题修复**

   ```text
   # 选中错误代码，使用 AI 自动修复
   修复这个编译错误
   ```

4. **功能开发**

   ```text
   # 描述需求，AI 自动生成代码
   实现一个用户管理模块，包括增删改查功能
   ```

5. **代码审查**

   ```text
   # 使用 AI 审查代码质量
   检查这段代码是否符合项目规范
   ```

#### VS Code / Cursor 调试配置

项目已预配置调试启动项（`.vscode/launch.json`），**强烈推荐使用此方式启动服务**。

**可用配置：**

- **RuoYi Backend** - 后端服务启动配置
  - 启动参数：`--spring.profiles.active=dev`
  - 主类：`com.ruoyi.RuoYiApplication`
  - 项目：`ruoyi-admin`
  
- **RuoYi Frontend** - 前端开发服务器配置
  - 包管理器：pnpm
  - 启动命令：`pnpm run dev`
  - 工作目录：`ruoyi-front`

**启动步骤：**

1. **打开调试面板**
   - 按 `Ctrl+Shift+D`（Windows/Linux）或 `Cmd+Shift+D`（Mac）
   - 或点击左侧活动栏的调试图标

2. **选择启动配置**
   - 在顶部下拉菜单中选择 **"RuoYi Backend"** 或 **"RuoYi Frontend"**

3. **启动服务**
   - 按 `F5` 键，或点击绿色播放按钮
   - 服务将在集成终端中启动

4. **调试功能**
   - 在代码行号左侧点击设置断点
   - 程序运行到断点处会自动暂停
   - 可以查看变量值、调用栈等信息

5. **使用 Cursor AI 辅助**
   - 在调试过程中，可以使用 Cursor AI 分析问题
   - 选中错误信息，使用 `Cmd/Ctrl + K` 让 AI 帮助修复

**为什么推荐使用 Cursor 调试配置？**

- ✅ **统一开发环境**：所有开发者使用相同的启动配置
- ✅ **断点调试**：可以设置断点，逐步调试代码
- ✅ **日志集中**：所有输出都在 Cursor 集成终端，便于查看
- ✅ **AI 辅助**：Cursor AI 可以理解调试上下文，提供更好的帮助
- ✅ **环境隔离**：自动使用正确的环境配置（dev/test/prod）
- ✅ **错误定位**：编译错误和运行时错误都会在 Cursor 中显示

> 💡 **提示**：首次启动可能需要编译项目，Cursor 会自动处理编译过程。

#### 前端开发

```bash
# 开发环境
pnpm dev

# 测试环境构建
pnpm build:stage

# 生产环境构建
pnpm build:prod
```

#### AI 开发最佳实践

1. **明确需求**：清晰描述要实现的功能或要解决的问题
2. **引用上下文**：使用 `@文件名` 引用相关代码文件
3. **迭代优化**：基于 AI 生成的代码进行优化和调整
4. **遵循规范**：确保生成的代码符合项目规范（AI 已自动遵循）
5. **代码审查**：使用 AI 进行代码质量检查

#### 数据库操作

项目配置了 MySQL MCP 工具，可在 Cursor 中直接操作数据库：

```text
# 使用 AI 执行数据库操作
查询用户表中的所有数据
创建一张订单表，包含订单号、用户ID、金额等字段
```

### 📋 规范驱动开发（OpenSpec）

项目已集成 **OpenSpec**，一个轻量级的规范驱动开发框架，用于管理功能规格说明和变更提案。

#### OpenSpec 简介

OpenSpec 帮助团队在编写代码之前明确需求，通过规格说明作为"单一事实来源"，确保 AI 助手和开发者对系统功能有清晰的理解。

**核心特性：**
- 📝 **规格说明管理**：将功能需求以结构化方式记录在代码库中
- 🔄 **变更提案**：通过提案、任务、设计文档管理功能变更
- 🤖 **AI 友好**：为 AI 助手提供清晰的上下文和规范
- 🔍 **持久化上下文**：规格说明作为活文档，随代码一起演进

#### 安装和初始化

项目已初始化 OpenSpec，如需重新初始化或更新：

```bash
# 安装 OpenSpec CLI（需要 Node.js 20.19.0+）
npm install -g @fission-ai/openspec@latest

# 初始化 OpenSpec（项目已初始化，无需重复执行）
openspec init

# 更新 OpenSpec 指令
openspec update
```

#### 项目结构

```
openspec/
├── project.md                    # 项目上下文（技术栈、规范、约束等）
├── AGENTS.md                     # AI 助手指令和工作流
├── 枚举使用规范.md               # 枚举和字典使用规范
├── 业务参数配置规范.md           # 参数配置规范
├── specs/                        # 功能规格说明
│   └── [capability]/            # 每个能力一个目录
│       └── spec.md              # 需求和使用场景
└── changes/                      # 变更提案
    └── [change-id]/              # 每个变更一个目录
        ├── proposal.md          # 变更提案
        ├── tasks.md             # 实施任务
        └── specs/               # 规格变更
```

#### 基本使用

**1. 创建变更提案**

在 Cursor 中使用 OpenSpec 命令：

```text
/openspec:proposal 添加记住我功能，支持 30 天会话
```

**2. 查看规格说明**

```bash
# 列出所有规格说明
openspec list --specs

# 查看特定规格
openspec show [spec-id]
```

**3. 验证变更**

```bash
# 验证变更提案
openspec validate [change-id] --strict
```

#### 在 Cursor 中使用

项目已配置 Cursor 的 OpenSpec 集成，重启 Cursor 后可使用以下命令：

- `/openspec:proposal` - 创建变更提案
- `/openspec:apply` - 应用变更
- `/openspec:archive` - 归档已完成的变更

> 💡 **提示**：首次使用需要重启 Cursor IDE 以加载 OpenSpec 命令。

#### 更多信息

- 📖 **官方文档**：[https://openspec.dev/](https://openspec.dev/)
- 📚 **项目规范**：查看 `openspec/` 目录下的文档
- 🔧 **工作流说明**：参考 `openspec/AGENTS.md`

## 致谢

本项目基于 [RuoYi](http://doc.ruoyi.vip) 框架开发，感谢 RuoYi 团队的开源贡献。

RuoYi 是一个优秀的 Java 快速开发框架，本项目在其基础上进行了 AI 友好化改造和功能增强。

## 许可证

[MIT License](LICENSE)

本项目基于 RuoYi（MIT License）开发，保留原版权声明。

## 参考文档

- [RuoYi 官方文档](http://doc.ruoyi.vip)
- [RuoYi GitHub](https://github.com/y_project/RuoYi)
- [Vue 3 文档](https://cn.vuejs.org)
- [Element Plus 文档](https://element-plus.org/zh-CN)
- [Spring Boot 文档](https://spring.io/projects/spring-boot)
- [OpenSpec 官方文档](https://openspec.dev/) - 规范驱动开发框架
