## ADDED Requirements

### Requirement: Spring AI 2.0 chat streaming
系统 MUST 使用 Spring AI `2.0.0` 提供 OpenAI 兼容模型的流式聊天能力，并保持现有 `/ai/chat/stream` 接口对外行为。

#### Scenario: Spring AI BOM locked to 2.0.0
- **WHEN** 查看根 `pom.xml`
- **THEN** `spring-ai.version` 为 `2.0.0`
- **AND** 通过 `spring-ai-bom` 统一管理 Spring AI 依赖

#### Scenario: Streaming chat endpoint remains available
- **WHEN** 已认证用户调用 `POST /ai/chat/stream`
- **THEN** 系统使用 `ChatModel` 流式返回 `ChatResponse`
- **AND** 可选 `temperature` / `systemPrompt` 仍可生效
