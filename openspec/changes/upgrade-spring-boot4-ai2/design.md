## Context

项目后端为多模块 Maven 工程（`ruoyi-admin` / `ruoyi-framework` / `ruoyi-system` / `ruoyi-common` / `ruoyi-quartz`），当前基线为 Spring Boot `3.5.4` + Spring AI `1.1.8`。代码侧已有部分 Boot 4 预备改动（`DruidConfig` 已引用 `com.alibaba.druid.spring.boot4.autoconfigure`），但 POM 仍绑定 Boot 3 starter，导致依赖与源码不一致。

Spring AI 2.0 要求 Spring Boot 4；本项目 AI 面较窄（`ChatModel.stream` + `OpenAiChatOptions`），预期 API 迁移成本可控，主要风险在第三方 starter 与 Jackson 3。

## Goals / Non-Goals

**Goals:**
- 将运行时升级到 Spring Boot `4.0.7` + Spring AI `2.0.0`
- 同步可编译、可启动的配套依赖（MyBatis / PageHelper / Druid / springdoc）
- 修复 Boot 4 包迁移与 Jackson 3 自动配置 API 变更
- 保持现有 AI 流式聊天接口契约（`/ai/chat/stream`）与业务行为不变

**Non-Goals:**
- 不升级到 Spring Boot 4.1（先稳在 4.0.x 补丁线）
- 不引入新的 AI Agent / Tool Calling 能力
- 不强制升级 JDK（保持 Java 17 基线）
- 不在本变更中发版/打 tag（由后续 release 流程处理）

## Decisions

1. **Boot 版本选 `4.0.7` 而非 `4.1.0`**
   - Rationale：Spring AI 2.0.0 以 Boot 4.0 依赖模型发布；4.0.7 是 4.0 线最新补丁，第三方生态验证更充分。
   - Alternative：直接上 4.1.0 —— 可后续单独评估。

2. **Druid 切换到官方 `druid-spring-boot-4-starter:1.2.28`**
   - Rationale：Maven Central 已发布；源码已使用 `spring.boot4.autoconfigure` 包。
   - Alternative：继续用 boot3 starter + 手工补丁 —— 不可行。

3. **MyBatis / PageHelper / springdoc 跟随 Boot 4 主线**
   - `mybatis-spring-boot-starter:4.0.1`
   - `pagehelper-spring-boot-starter:4.1.1`
   - `springdoc-openapi-starter-webmvc-ui:3.0.3`
   - Rationale：官方兼容矩阵明确要求。

4. **Jackson：优先适配 Boot 4 Jackson 3 自动配置 API，注解尽量保留 `com.fasterxml.jackson.annotation`**
   - `Jackson2ObjectMapperBuilderCustomizer` → `JsonMapperBuilderCustomizer`
   - 业务注解若编译通过则暂不批量改包，避免大范围无关 diff。
   - Alternative：全量迁移到 `tools.jackson` —— 留作后续清理。

5. **AI 层保持 `ChatModel` 直接流式调用**
   - 项目未使用 Tool Calling / ChatClient advisors；按 Upgrade Notes，直接 `ChatModel.stream` 仍有效。
   - 仅在编译/运行失败时再做针对性 API 调整。

## Risks / Trade-offs

- [Risk] 第三方库运行时 classpath / 自动配置冲突 → 以 `mvn -DskipTests compile` 与启动日志验证，按报错逐项修。
- [Risk] Jackson 3 序列化行为变化影响日期/脱敏字段 → 必要时启用 `spring.jackson.use-jackson2-defaults=true` 过渡。
- [Risk] springdoc 3.x 路径或 UI 行为微调 → 校验 `/swagger-ui/**` 与 `/v3/api-docs/**` 仍可访问。
- [Trade-off] 选 4.0.7 而非最新 4.1.0，短期少踩坑，后续需二次升级。

## Migration Plan

1. 更新根 POM 版本属性与 dependencyManagement
2. 子模块 starter 坐标切换（尤其 Druid）
3. 修复源码 import / 自动配置 API
4. 编译通过后更新文档版本说明
5. 本地启动冒烟（由用户执行，本流程不启动长期服务）

回滚：还原 POM 版本与相关源码改动即可回到 Boot 3.5.4 / AI 1.1.8。

## Open Questions

- 无阻塞问题；若编译阶段发现 JWT / POI 等库与 Jackson 3 不兼容，再定点升级对应版本。
