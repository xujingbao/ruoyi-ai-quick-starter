## Why

项目当前运行在 Spring Boot 3.5.4 + Spring AI 1.1.8。Spring Boot 3.5 OSS 已结束支持，Spring AI 2.0 强制依赖 Boot 4.0 依赖模型；为保持 AI 能力与主流 Spring 生态对齐，需要完成主版本升级。

## What Changes

- 将 Spring Boot 从 `3.5.4` 升级到 `4.0.7`（**BREAKING**）
- 将 Spring AI 从 `1.1.8` 升级到 `2.0.0`（**BREAKING**）
- 同步升级 Boot 4 配套依赖：MyBatis Spring Boot Starter `4.0.1`、PageHelper `4.1.1`、Druid `druid-spring-boot-4-starter:1.2.28`、springdoc `3.0.3`
- 适配 Boot 4 包迁移（如 `DataSourceAutoConfiguration`）、Jackson 3 自动配置 API、Druid Boot4 自动配置包
- 按 Spring AI 2.0 Upgrade Notes 检查并修正 AI 聊天相关 API/配置
- 更新 `VERSIONS.md`、`README.md`、`openspec/project.md` 中的技术栈版本描述

## Capabilities

### New Capabilities

- `spring-boot4-runtime`: Spring Boot 4.0 运行时基线与第三方 starter 兼容性
- `spring-ai2-integration`: Spring AI 2.0 聊天流式能力与配置契约

### Modified Capabilities

- （无现有主 specs；本次为全新能力规格）

## Impact

- 根 `pom.xml` 及各子模块依赖声明
- `RuoYiApplication`、`ApplicationConfig`、`DruidConfig` 等框架配置
- `AiChatController` 及 `spring.ai.*` 配置
- Jackson 注解/自定义序列化相关代码（若 Boot 4 / Jackson 3 要求变更）
- 文档中的版本徽章与技术栈说明
