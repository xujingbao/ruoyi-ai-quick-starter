# 更新日志

项目所有重要变更都将记录在此文件中。

## [5.2.0] - 2026-03-21

**标题:** 升级 Vite8 和 Spring AI 1.1.3

**发布地址:** [v5.2.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### 变更

- Spring AI 升级至 1.1.3
- Vite 7.2.7 → 8.0.0
- @vitejs/plugin-react 4.3.3 → 6.0.1
- API 密钥移至环境变量，消除硬编码凭据
- 新增 Vite 优化配置
- 移除 ai-quick-dev-website 子模块

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
