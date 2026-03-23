# 更新日志

项目所有重要变更都将记录在此文件中。

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
