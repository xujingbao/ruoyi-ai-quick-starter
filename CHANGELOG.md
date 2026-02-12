# 更新日志

本项目的所有重要更改都将记录在此文件中。

## [4.3.0]

### 变更
- **规范**:
  - OpenSpec 升级到 1.1.1。

## [4.2.2] - 2026-02-12

### 变更
- **主题**:
  - 更新默认系统主题色为 `#1d5ccc` (蓝色)。
- **侧边栏菜单**:
  - 在选中菜单项的右侧添加了主题色竖线指示器。
  - 调整菜单项圆角为 4px，使外观更整洁。

### 修复
- **主题同步**:
  - 修复了链接按钮 (`colorLink`) 未跟随主主题色的问题。
  - 优化了自定义样式的主题色变量同步。

## [4.2.1] - 仓库结构梳理与命名统一

### 概要说明
- 本版本聚焦仓库结构梳理与命名统一：移除 Vue Web 版本、统一多端目录命名，并同步更新相关文档与调试配置。
- 后端与业务功能无变更，本次为工程组织与文档层面的发布。

### 破坏性变更（Breaking Changes）
- 删除 Web(Vue) 工程目录： `ruoyi-front-vue/` 已移除。
- 多端目录重命名（涉及所有引用路径需更新）：
  - `ruoyi-front-react/` → `ruoyi-react-web/`
  - `ruoyi-rn/` → `ruoyi-rn-app/`
  - `ruoyi-app/` → `ruoyi-uni-app/`
  - `ruoyi-harmony/` → `ruoyi-harmony-app/`
- 若你有脚本/CI/本地命令依赖旧目录名，请按上表替换路径。
- VS Code/Cursor 启动配置已同步更新（React Web 与 RN 的 cwd 路径）。
- 文档中所有示例路径已同步更新；若你在外部文章/自动化文档引用旧路径，需要一并替换。

### 文档与工程维护
- 更新项目根 README 的启动、构建命令与项目结构树。
- 更新 docs/ 下的导航与 HarmonyOS 支持文档路径说明。
- 更新流式渲染文档中 Web 前端示例路径到新目录名。
- 调整子项目标识：
  - Web：更新 `ruoyi-react-web/package.json` 的 name
  - RN：更新 `ruoyi-rn-app/package.json` 的 name ，以及 `app.json` 的 slug/scheme

### 影响范围
- 仅影响仓库目录结构、文档与配置引用；不影响后端接口与业务逻辑。

## [4.2.0] - HarmonyOS 原生应用支持

- 新增 HarmonyOS 原生应用支持，基于 ArkTS 开发，目标 SDK 6.0.2
- 集成登录认证（用户名、密码、验证码），与后端 Spring Boot API 对接
- 实现主页面框架（首页、工作、我的），支持底部标签导航
- 使用 AppStorage 进行全局状态管理，支持 Token、用户信息、角色权限等
- 模块化架构：common（公共模块）、adaptiveLayout（自适应布局）、responsiveLayout（响应式布局）
- 使用 Hvigor 构建系统，支持多模块开发与依赖管理
- 支持网络请求、路由导航、资源管理等基础能力

## [4.1.1] - 统一主题与配置化优化

- 抽出 themeTokens 和 layoutConfig，让 AppProviders、全局样式和布局组件共用颜色/字体/断点，新增 useResponsiveLayout 钩子与 getLayoutWrapperClass 工具，布局逻辑更清晰。
- 将所有路由 meta 和 Navbar 菜单文案集中在 routeMeta.js，router/index.jsx 与 Navbar 统一读取，方便批量调整或国际化。
- 引入 requestConfig，把 axios 的 baseURL、超时、重复提交保护与提示文案都交给可通过 env 覆盖的配置，request.js 只负责消费配置。

## [4.1.0] - 2026-01-09

### 版本定位
- 基于成熟的 RuoYi 全栈架构，融合 Spring AI 原生组件，覆盖后端（Spring Boot 3.5 + MyBatis + Redis + MySQL + Quartz）、前端（React 18 + Ant Design + Vite + pnpm + Zustand）与移动端（uni-app / React Native），在单仓库内实现 Web + 移动的企业级管理系统开发。

### AI 能力集成
- 内嵌 Spring AI 1.1.2 示例，配置 DeepSeek/OpenAI API Key 即可启用智能代码生成、流式渲染等能力。
- 支持 Cursor AI 专属交互，优化自动补全、重构与文档生成流程。

### 开发与部署流程
- 推荐在 Cursor 中使用 `.vscode/launch.json` 所提供的调试配置，保持 AI 辅助开发体验一致。

### 规范驱动协同
- 全面集成 OpenSpec 快速提案与规范编写，和 AI 助手指令 `openspec/AGENTS.md` 达成一致的开发节奏。
- 项目结构清晰，各模块（`ruoyi-admin`, `ruoyi-system`, `ruoyi-common`, `ruoyi-quartz`, 前端/移动端）协同提供完整能力。

### 核心能力
- 覆盖用户权限、系统监控（在线用户 / 服务 / 缓存）、日志、定时任务、字典与参数管理等企业级能力。
