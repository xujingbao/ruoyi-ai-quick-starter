# 项目技术栈版本

## 后端

- **RuoYi**: 6.4.0
- **Java**: 21
- **Spring Boot**: 4.1.1
- **MyBatis**: 4.1.0
- **PostgreSQL JDBC**: 42.7.13
- **PostgreSQL**: 15+ (数据库)
- **Redis**: 6.0+ (Lettuce 客户端)
- **Druid**: 1.2.28
- **FastJSON2**: 2.0.65
- **SpringDoc**: 3.1.1
- **PageHelper**: 4.1.1
- **JWT**: 0.13.0
- **Apache POI**: 5.5.1
- **commons-io**: 2.22.0
- **Apache Velocity**: 2.4.1
- **Quartz**: 已启用（版本由 Spring Boot 依赖管理）

## 前端

### Web（React）

- **React**: 19.3.0
- **React DOM**: 19.3.0
- **Ant Design**: 6.6.5
- **Ant Design X**: 2.9.0
- **React Router**: 7.18.4
- **Zustand**: 5.0.15
- **Vite**: 8.3.1
- **@vitejs/plugin-react**: 6.1.1
- **Axios**: 1.20.0
- **ECharts**: 6.1.0
- **富文本编辑器**: react-quill-new 3.8.3（替代已停止维护的 react-quill）

## 移动端

### React Native / Expo

- **React**: 19.2.3
- **React Native**: 0.86.3
- **Expo**: 57.0.26
- **Expo Router**: 57.0.24
- **React DOM**: 19.2.3
- **React Native Web**: 0.21.2
- **Redux Toolkit**: 2.11.0
- **React Navigation**: 7.1.25
- **React Navigation Native Stack**: 7.8.6
- **Axios**: 1.13.2

### uni-app

- **应用版本**: 1.2.0（manifest.json versionName / versionCode 100）
- **uni-app**: 已使用
- **uni-ui**: 已使用
- **Vue**: 3
- **Pinia**: 已使用

### HarmonyOS / OpenHarmony

- **应用版本**: 1.0.0
- **OHPM Lockfile**: 3
- **@ohos/hamock**: 1.0.0
- **@ohos/hypium**: 1.0.24

## 开发环境

- **Node.js**: 22.19+（Pi Coding Agent 侧车要求；Comet CLI 要求 22.16+ 或 24+）
- **pnpm**: 9.x（锁文件版本 9.0）
- **Maven**: 3.9+（推荐使用项目根目录 `./mvnw`，锁定 3.9.16）
- **OpenSpec CLI**: 1.14.0
- **Comet CLI**: `@rpamis/comet` 0.4.3（Classic 五阶段工作流）
- **Superpowers**: obra/superpowers（14 个技能：brainstorming / writing-plans / executing-plans 等）
- **Pi Coding Agent**: `@earendil-works/pi-coding-agent` 0.99.2（侧车 `ruoyi-ai-agent`，默认 `127.0.0.1:19090`，Node >= 22.19.0）
- **hono**: 4.13.2（侧车 HTTP 框架）
- **typebox**: 1.3.13（侧车工具参数 schema）
- **System Tool Bus**: `/ai/agent/tools/**`（只读：users / config / notices / jobs）
- **Agent Shell**: 全局 Drawer（⌘/Ctrl+K）
