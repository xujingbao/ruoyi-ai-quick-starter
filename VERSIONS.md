# 项目技术栈版本

## 后端

- **RuoYi**: 6.1.0
- **Java**: 17
- **Spring Boot**: 4.0.7
- **MyBatis**: 4.0.1
- **PostgreSQL JDBC**: 42.7.7
- **PostgreSQL**: 15+ (数据库)
- **Redis**: 6.0+ (Lettuce 客户端)
- **Druid**: 1.2.28
- **FastJSON2**: 2.0.58
- **SpringDoc**: 3.0.3
- **PageHelper**: 4.1.1
- **JWT**: 0.12.6
- **Apache POI**: 5.3.0
- **Quartz**: 已启用（版本由 Spring Boot 依赖管理）

## 前端

### Web（React）

- **React**: 18.3.1
- **React DOM**: 18.3.1
- **Ant Design**: 6.4.5
- **Ant Design X**: 2.8.0
- **React Router**: 6.30.3
- **Zustand**: 5.0.9
- **Vite**: 8.0.16
- **@vitejs/plugin-react**: 6.0.2
- **Axios**: 1.9.0
- **ECharts**: 5.6.0

## 移动端

### React Native / Expo

- **React**: 19.1.0
- **React Native**: 0.81.5
- **Expo**: 54.0.27
- **Expo Router**: 6.0.17
- **React DOM**: 19.1.0
- **React Native Web**: 0.21.2
- **Redux Toolkit**: 2.11.0
- **React Navigation**: 7.1.25
- **React Navigation Native Stack**: 7.8.6
- **Axios**: 1.13.2

### uni-app

- **应用版本**: 4.2.1
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

- **Node.js**: 20.19+ 或 22.12+
- **pnpm**: 9.x（锁文件版本 9.0）
- **Maven**: 3.9+（推荐使用项目根目录 `./mvnw`，锁定 3.9.16）
- **OpenSpec CLI**: 1.4.1
- **Pi Coding Agent**: `@earendil-works/pi-coding-agent` 0.80.7（侧车 `ruoyi-ai-agent`，默认 `127.0.0.1:19090`）
- **System Tool Bus**: `/ai/agent/tools/**`（只读：users / config / notices / jobs）
- **Agent Shell**: 全局 Drawer（⌘/Ctrl+K）
