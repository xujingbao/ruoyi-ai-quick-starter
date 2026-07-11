# 更新日志

项目所有重要变更都将记录在此文件中。

## [6.0.0] - 2026-07-11

**标题:** Spring Boot 4.0 / Spring AI 2.0 主版本升级

**发布地址:** [v6.0.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### 发行摘要

本版本将后端运行时升级至 Spring Boot 4.0.7 与 Spring AI 2.0.0，同步适配 Jackson 3、模块化自动配置及第三方 starter，并修复 Security 7 登录鉴权空指针问题。

### 主要亮点

- Spring Boot `3.5.4` → `4.0.7`，Spring AI `1.1.8` → `2.0.0`（破坏性升级）
- 配套升级 MyBatis / PageHelper / Druid / springdoc，并补齐 Boot 4 所需 `quartz`、`cache`、`aspectj` starter
- Jackson 3 适配：`JsonMapperBuilderCustomizer`、脱敏序列化器、`tools.jackson` 坐标
- 修复 `LoginUser.getAuthorities()` 返回 null 导致登录失败；`BaseException` 错误消息正确返回前端
- 新增 `.mvn/maven-settings.xml`，本项目构建可绕过公司 Nexus 私服

### 依赖与版本升级

- 根项目版本升级至 `6.0.0`
- `spring-boot.version`: `3.5.4` → `4.0.7`
- `spring-ai.version`: `1.1.8` → `2.0.0`
- `mybatis-spring-boot.version`: `3.0.4` → `4.0.1`
- `pagehelper.boot.version`: `2.1.1` → `4.1.1`
- `druid`: `druid-spring-boot-3-starter:1.2.23` → `druid-spring-boot-4-starter:1.2.28`
- `springdoc.version`: `2.8.9` → `3.0.3`
- `spring-boot-starter-aop` → `spring-boot-starter-aspectj`

### 配置与安全

- AI 配置继续通过环境变量驱动（`AI_API_BASE_URL`、`AI_API_KEY`、`AI_MODEL`）
- 用户侧异常（验证码等）不再被统一遮罩为「系统内部错误」

### 适用场景

- 需要跟进 Spring Boot 4 / Spring AI 2.0 生态的项目
- 从 RuoYi AI Quick Starter 5.x 迁移到 Boot 4 运行时的团队

---

## [5.3.3] - 2026-06-30

**标题:** Cloud Agent 发版规则与移动端开发文档

**发布地址:** [v5.3.3 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### 发行摘要

本版本为文档与流程补丁更新，沉淀 Cloud Agent 云端发版经验，并补充移动端远程开发说明。

### 主要亮点

- `ruoyi-release` 发版 Skill 新增「Cloud Agent 环境」章节：远程确认、先推代码再建 Release、Gitee 内联 token 推送、429 退避重试、发版后 API 核验
- README 新增「Cursor iOS + Cloud Agent 开发」说明，介绍移动端远程开发流程

### 适用场景

- 在 Cursor Cloud Agent / iOS 上进行远程开发与双平台发版的团队

---

## [5.3.2] - 2026-06-30

**标题:** README 文档完善与多端模块信息补全

**发布地址:** [v5.3.2 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### 发行摘要

本版本为文档补丁更新，完善 README 项目信息展示，使其与当前仓库实际结构与版本保持一致。

### 主要亮点

- README 顶部新增版本与技术栈徽章（version、JDK、Spring Boot、Spring AI、React、License）
- 技术栈描述补充具体版本号，移动端明确 React Native（Expo）
- 项目结构补全缺失的 `ruoyi-rn-app/`（React Native + Expo 模块）
- 技术文档区新增 `VERSIONS.md`（版本清单）与 `CHANGELOG.md`（更新日志）链接

### 适用场景

- 需要清晰了解项目技术栈与多端模块结构的开发者

---

## [5.3.1] - 2026-06-23

**标题:** README 文档完善与发版流程自动化

**发布地址:** [v5.3.1 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### 发行摘要

本版本为文档与工具链补丁更新，完善 README 启动说明，并新增自动化发版能力。

### 主要亮点

- README AI 配置说明改为环境变量驱动（`AI_API_BASE_URL`、`AI_API_KEY`、`AI_MODEL`），与实际配置一致
- 修正 README 启动步骤编号错误
- 新增 `ruoyi-release` 发版 Skill 与 `/release` 命令，支持一键发版
- 新增 `create-release.sh` 脚本，自动创建 Gitee / GitHub Release

### 适用场景

- 需要标准化、自动化发版流程的团队

---

## [5.3.0] - 2026-06-23

**标题:** 登录注册页焕新、Spring AI 1.1.8 升级与前端依赖更新

**发布地址:** [v5.3.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### 发行摘要

本版本聚焦认证页面体验升级、AI 依赖与前端组件库更新，并同步 OpenSpec 1.4.1 工作流配置。

### 主要亮点

- 登录/注册页全新双栏布局，新增 `AuthBrandPanel` 品牌展示组件，支持响应式适配
- Spring AI 升级至 `1.1.8`，Druid 适配 Spring Boot 4 自动配置
- Ant Design 升级至 `6.4.5`，Ant Design X 升级至 `2.8.0`
- OpenSpec 命令与技能同步至 1.4.1，移除过时的 `.cursor/rules/default.mdc`
- 默认侧边栏主题调整为浅色（`theme-light`）

### 依赖与版本升级

- 根项目版本升级至 `5.3.0`
- `spring-ai.version`: `1.1.3` → `1.1.8`
- `antd`: `6.1.4` → `6.4.5`
- `@ant-design/x`: `2.1.3` → `2.8.0`
- `@ant-design/icons`: `6.1.0` → `6.2.5`
- `vite`: `8.0.0` → `8.0.16`
- `@vitejs/plugin-react`: `6.0.1` → `6.0.2`
- OpenSpec CLI: `1.1.1` → `1.4.1`

### 配置与安全

- AI 配置保持环境变量驱动（`AI_API_BASE_URL`、`AI_API_KEY`、`AI_MODEL`）
- 移除开发配置中的硬编码内部 API 地址

### 适用场景

- 需要升级 Spring AI 1.1.8 的项目
- 希望获得更现代登录/注册体验的团队
- 使用 OpenSpec 1.4.1 规范驱动开发的团队

---

## [5.2.0] - 2026-03-21

**标题:** Spring AI 1.1.3 升级、前端构建链更新与配置安全增强

**发布地址:** [v5.2.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### 发行摘要

本版本聚焦于 AI 依赖升级、前端构建链更新和开发配置安全加固，同时清理仓库结构，降低本地开发环境耦合。

### 主要亮点

- Spring AI 升级至 `1.1.3`，与当前 Spring Boot 3.5.4 依赖体系保持一致
- React Web 前端升级到 Vite 8 构建链，提升开发与构建兼容性
- AI 相关配置切换为环境变量驱动，移除开发配置中的硬编码凭据
- 仓库不再追踪 `ai-quick-dev-website` 子模块，减少多仓库协作带来的干扰

### 依赖与版本升级

- 根项目版本升级至 `5.2.0`
- `spring-ai.version`: `1.1.2` → `1.1.3`
- `vite`: `7.2.7` → `8.0.0`
- `@vitejs/plugin-react`: `4.3.3` → `6.0.1`
- `vite-plugin-svg-icons`: 调整为兼容当前前端依赖的版本声明

### 配置与安全增强

- `application-dev.yml` 中的 AI 接口地址改为 `AI_API_BASE_URL` 环境变量读取
- AI API Key 改为 `AI_API_KEY` 环境变量读取
- AI 模型名改为 `AI_MODEL` 环境变量读取
- 移除默认硬编码凭据，降低开发配置误提交风险

### 前端构建优化

- 新增 Vite `optimizeDeps.include` 配置
- 预构建 `react`、`react-dom`、`react-router-dom`
- 更新 `pnpm-lock.yaml` 以匹配新的依赖解析结果

### 仓库维护

- `.gitignore` 新增 `Claude Code` 本地配置文件排除规则
- 移除 `ai-quick-dev-website` 的 git 子模块追踪，保留为本地目录

### 适用场景

- 需要升级到 Spring AI 1.1.3 的项目
- 需要更稳定 React + Vite 8 本地开发体验的团队
- 希望减少本地敏感配置硬编码风险的开发环境

---

## [5.1.0] - 2026-03-13

**标题:** 全面安全加固与代码质量提升

**发布地址:** [v5.1.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### 安全加固

基于 61 个代码审查问题（8 个 Critical / 16 个 High / 22 个 Medium / 15 个 Low）

- JWT 升级：jjwt 0.9.1 → 0.12.6，新增过期声明和更强密钥（64+ 字节 Base64）
- 所有敏感凭据外部化：DB_PASSWORD、REDIS_PASSWORD、DRUID_PASSWORD、SPRING_AI_OPENAI_API_KEY
- 通过 @JsonIgnore 阻止 SQL 注入
- CORS 配置为白名单
- 生产环境禁用 Druid 控制台
- XSS 过滤扩展至所有端点

### Bug 修复

- 后端和前端多类型 Bug 修复
- 数据库索引补充：sys_user、sys_dict_data、sys_config、ai_session_context

---

## [5.0.0] - 2026-03-02

**标题:** MySQL 迁移至 PostgreSQL

**发布地址:** [v5.0.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### 破坏性变更

- 数据库从 MySQL 迁移至 PostgreSQL
- 移除 MySQL 驱动、配置和方言支持

### AI 原生能力

- 向量检索（pgvector）
- JSONB 会话上下文存储
- 全文搜索预留

---

## [4.3.0] - 2026-02-12

**标题:** OpenSpec 升级至 1.1.1

### 变更

- OpenSpec 升级至 1.1.1
- 新增 AI 助手指令和开发规范文档

---

## [4.2.2] - 2026-02-12

**标题:** 统一主题变量名以适配 Ant Design v5

### 变更

- 默认主题色更新为 #1d5ccc
- 侧边栏菜单新增指示器
- 主题色变量同步优化

---

## [4.2.1] - 2026-01-15

**标题:** 仓库结构梳理与命名统一

### 破坏性变更

- 移除 Vue Web 版本
- 多端目录命名统一

---

## [4.2.0] - 2026-01-09

**标题:** HarmonyOS 原生应用支持

### 新增

- HarmonyOS 原生应用支持（ArkTS）
- 目标 SDK 6.0.2

---

## [4.1.0] - 2026-01-09

**标题:** RuoYi AI Quick Starter v4.1

### 技术栈

- 后端：Spring Boot 3.5、React 18、Ant Design
- Spring AI 1.1.2 集成 DeepSeek/OpenAI
