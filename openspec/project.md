# Project Context

## Purpose

RuoYi AI Quick Starter 是基于 RuoYi 成熟框架的 **AI 快速开发框架**，旨在通过 AI 友好设计和规范驱动开发方法，实现前后端统一仓库的全栈开发。项目支持 Web 和移动端多端部署，可快速生成模块完整代码，助力快速搭建多端的企业级管理系统。

**核心目标：**
- 提供 AI 友好的开发环境，让 AI 工具能够理解完整的业务上下文
- 集成规范驱动开发（SDD）方法，通过规格说明作为"单一事实来源"
- 支持端到端的代码生成，从数据库设计到前后端接口，从页面组件到业务逻辑
- 确保代码质量和一致性，助力团队快速交付高质量的企业级应用

## Tech Stack

### Backend
- **Java 17** - 编程语言
- **Spring Boot 3.5.4** - 核心框架
- **Spring Security** - 安全框架
- **MyBatis 3.0.4** - ORM 框架
- **Redis 6.0+** - 缓存数据库
- **MySQL 8.0+** - 关系型数据库
- **Quartz** - 定时任务调度
- **Maven** - 构建工具

### Frontend
- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 组件库
- **Vite** - 前端构建工具
- **pnpm 8+** - 包管理器
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 客户端

### Mobile
- **uni-app** - 跨平台应用框架
- **uni-ui** - uni-app 官方 UI 组件库

### Development Tools
- **Cursor** - AI 辅助开发 IDE（推荐）
- **OpenSpec** - 规范驱动开发工具
- **MySQL MCP** - 数据库操作工具

## Project Conventions

### Code Style

#### Java 代码规范
- **包命名**：小写字母，点分隔（如：`com.ruoyi.system.service`）
- **类命名**：大驼峰命名（PascalCase），如：`SysUserController`、`UserServiceImpl`
- **方法命名**：小驼峰命名（camelCase），动词开头，如：`selectUserList`、`updateUser`
- **变量命名**：小驼峰命名（camelCase），如：`userName`、`userId`
- **常量命名**：全大写下划线分隔（UPPER_SNAKE_CASE），如：`MAX_RETRY_COUNT`
- **枚举命名**：
  - 枚举类名：大驼峰命名，如：`UserStatus`、`BusinessType`
  - 枚举值名：全大写下划线分隔，如：`OK`、`DISABLE`、`INSERT`

#### 前端代码规范
- **组件命名**：PascalCase，如：`UserList.vue`、`UserForm.vue`
- **文件命名**：kebab-case，如：`user-list.vue`、`user-form.vue`
- **变量命名**：camelCase，如：`userName`、`userList`
- **常量命名**：UPPER_SNAKE_CASE，如：`API_BASE_URL`
- **组件封装规范**：单文件不超过 800 行，超过时进行合理的组件封装

#### 代码格式化
- Java：遵循 Spring Boot 代码风格
- JavaScript/Vue：使用 ESLint 进行代码检查
- 遵循项目现有代码风格，保持一致性

### Architecture Patterns

#### 后端架构
- **分层架构**：Controller → Service → Mapper → Database
- **模块化设计**：
  - `ruoyi-admin` - 启动入口模块
  - `ruoyi-framework` - 框架核心模块（安全、配置、拦截器等）
  - `ruoyi-system` - 系统业务模块
  - `ruoyi-common` - 通用工具模块（工具类、枚举、常量等）
  - `ruoyi-quartz` - 定时任务模块
- **统一响应格式**：使用 `AjaxResult` 统一封装 API 响应
- **异常处理**：全局异常处理器统一处理异常
- **数据权限**：通过 `@DataScope` 注解实现数据权限控制

#### 前端架构
- **组件化开发**：基于 Vue 3 Composition API
- **状态管理**：使用 Pinia 进行状态管理
- **路由管理**：Vue Router 支持动态路由和权限控制
- **API 封装**：统一使用 Axios 封装 API 请求
- **布局系统**：Layout 组件支持多种布局模式

#### 移动端架构
- **跨平台框架**：基于 uni-app 实现一套代码多端运行
- **API 统一**：与后端系统共享同一套 API 接口
- **状态管理**：使用 Pinia 进行状态管理

### Testing Strategy

当前项目暂未强制要求单元测试，但建议：
- 关键业务逻辑应编写单元测试
- API 接口建议编写集成测试
- 前端组件可选择性编写测试

### Git Workflow

- **主分支**：`main` - 生产环境代码
- **提交规范**：使用清晰的提交信息，描述变更内容
- **分支策略**：功能开发建议创建功能分支，合并前进行代码审查

## Domain Context

### 核心业务模块

1. **用户权限管理**
   - 用户管理（SysUser）
   - 角色管理（SysRole）
   - 菜单管理（SysMenu）
   - 部门管理（SysDept）
   - 权限控制（基于 Spring Security）

2. **系统管理**
   - 字典管理（SysDictType、SysDictData）
   - 参数配置（SysConfig）
   - 操作日志（SysOperLog）
   - 登录日志（SysLogininfor）

3. **系统监控**
   - 在线用户监控
   - 服务监控
   - 缓存监控

4. **定时任务**
   - 任务管理（SysJob）
   - 任务日志（SysJobLog）

### 数据字典与枚举

- **枚举（Enum）**：用于业务逻辑中的固定状态和操作类型
  - 位置：`com.ruoyi.common.enums`
  - 示例：`UserStatus`、`BusinessType`、`OperatorType`
  - 使用场景：业务逻辑判断、类型安全保证
  - **详细规范**：参考 `openspec/conventions/枚举使用规范.md`

- **字典（Dict）**：用于可配置的业务选项和前端展示
  - 存储：数据库 `sys_dict_type` 和 `sys_dict_data` 表
  - 使用场景：前端下拉框、可配置的业务选项
  - 缓存：使用 Redis 缓存提高性能
  - **详细规范**：参考 `openspec/conventions/枚举使用规范.md`（包含字典管理部分）

- **选择原则**：
  - 业务逻辑固定 → 使用枚举
  - 可配置选项 → 使用字典
  - 可混合使用：业务层用枚举，展示层用字典

### 参数配置规范

- **命名规范**：`{模块}.{功能}.{参数名}`，如：`sys.user.initPassword`
- **模块前缀**：
  - `sys` - 系统级配置
  - `app` - 应用级配置
  - `business` - 业务级配置
  - `third` - 第三方配置
- **缓存机制**：使用 Redis 缓存，键格式：`sys_config:{configKey}`
- **使用方式**：通过 `ISysConfigService.selectConfigByKey()` 获取配置值
- **详细规范**：参考 `openspec/conventions/业务参数配置规范.md`

### AI 开发支持

- **Cursor AI 配置**：项目已针对 Cursor AI 进行优化
- **开发规范**：`.cursor/rules/default.mdc` 定义了 AI 开发规范
- **调试配置**：`.vscode/launch.json` 预配置了调试启动项
- **推荐工作流**：使用 Cursor 调试配置启动服务（F5），而非脚本启动
- **数据库操作**：使用 MySQL MCP 工具在 Cursor 中直接操作数据库

## Important Constraints

### 技术约束
- **JDK 版本**：必须使用 JDK 17+
- **Spring Boot 版本**：3.5.4（Spring Boot 3.x 系列）
- **数据库**：MySQL 8.0+，不支持其他数据库
- **前端构建**：必须使用 pnpm 作为包管理器
- **前端页面限制**：单文件不超过 800 行，超过需组件化

### 开发约束
- **不自动启动服务**：不要自动编译代码或启动服务，等待用户明确指令
- **不自动打包**：不要自动打包，等待用户明确指令
- **不生成测试脚本**：除非明确要求，否则不生成测试脚本
- **数据库操作**：统一使用 MySQL MCP 相关工具
- **环境配置**：默认使用 `dev` 环境（`--spring.profiles.active=dev`）

### 业务约束
- **系统内置参数**：`config_type='Y'` 的参数不应删除
- **字典类型命名**：使用小写下划线分隔，如：`sys_user_sex`
- **参数键名唯一性**：参数键名必须唯一，遵循命名规范

### 代码质量约束
- **遵循项目规范**：必须遵循项目代码规范（枚举、参数配置、字典管理等）
- **保持代码风格一致**：遵循项目现有代码风格
- **参考文档**：参考 `doc/` 目录下的规范文档

## External Dependencies

### 数据库
- **MySQL 8.0+** - 主数据库
- **Redis 6.0+** - 缓存数据库（用于会话、字典、参数配置缓存）

### 第三方服务
- **无强制第三方服务依赖** - 项目可独立运行

### 开发工具依赖
- **Cursor** - 推荐使用的 AI 辅助开发 IDE
- **MySQL MCP** - 数据库操作工具（在 Cursor 中使用）
- **OpenSpec** - 规范驱动开发工具

### Maven 仓库
- **阿里云 Maven 仓库** - 主要依赖源（`https://maven.aliyun.com/repository/public`）

### 前端 CDN 依赖
- **Tailwind CSS** - 网站样式（CDN）
- **Font Awesome** - 图标库（CDN）

### 参考资源
- [RuoYi 官方文档](http://doc.ruoyi.vip)
- [Cursor 文档](https://cursor.com/cn/docs)
- [规范驱动开发](https://zhuanlan.zhihu.com/p/1976070658233492911)
- [Kiro](https://kiro.dev/)
- [OpenSpec](https://openspec.dev/)
- [Spec Kit](https://github.com/github/spec-kit)
