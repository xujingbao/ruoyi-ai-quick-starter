## Context

现网 AI 能力为 Spring AI `ChatModel.stream` 单轮聊天。Pi（pi.dev）提供 TypeScript Agent harness（SDK：`createAgentSession`），适合作为产品 Agent 运行时；Java 侧继续承担鉴权与业务网关。

## Goals / Non-Goals

**Goals**

- 产品主路径变为「可工具调用的 Agent 会话」
- JWT 保护的管理端工作台，展示 text_delta 与 tool 事件
- 每用户沙箱工作区；侧车仅本机可达

**Non-Goals**

- 不开放 `bash` / `write` / `edit`
- 不接 MCP、不做多 Agent / plan mode
- 不改移动端；不嵌入 Pi TUI

## Decisions

1. **Node 侧车 + Spring 网关**：Pi SDK 仅 Node；Spring 校验登录后转发，注入 `userId`。
2. **内部 HTTP + SSE**：侧车 `127.0.0.1:19090`；事件原样透传，前端解析。
3. **只读工具集**：`tools: ["read","grep","find","ls"]`（以 SDK 实际工具名为准）。
4. **会话**：Pi 内存/文件会话 + PG `ai_session_context` 存元数据（title/updated_at）。
5. **模型配置**：复用 `AI_API_BASE_URL` / `AI_API_KEY` / `AI_MODEL`（OpenAI-compatible）。

## Risks / Trade-offs

- [Risk] Pi SDK API 仍在演进 → 锁定依赖版本，事件映射集中在一侧。
- [Risk] 工具越权 → cwd 强制沙箱 + 禁用写/执行工具。
- [Risk] 侧车宕机 → 网关返回明确 503。

## Migration Plan

1. 部署侧车与网关；执行菜单增量 SQL。
2. 旧 `ai/chat` 页面保留，菜单主入口改为 Agent。
3. 回滚：停侧车、还原菜单组件路径即可。

## Open Questions

- 无（首版范围已锁定）。
