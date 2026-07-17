## Why

产品当前仅有 Spring AI 单轮流式聊天，无法形成可工具调用的 Agent 能力。为走 AI 原生产品路线，需要以 Pi Coding Agent 作为运行时，在管理端提供可观测的 Agent 工作台。

## What Changes

- 新增 Node 侧车 `ruoyi-ai-agent`，嵌入 `@earendil-works/pi-coding-agent` SDK
- Spring Boot 增加 `/ai/agent/**` 鉴权网关，透传 SSE，会话元数据写入 `ai_session_context`
- 管理端新增 AI Agent 工作台（文本流 + 工具事件），菜单主入口从「聊天测试」切换为 Agent
- 首版工具仅只读：`read` / `grep` / `find` / `ls`；沙箱 cwd；侧车绑定 `127.0.0.1`
- 移除 Spring AI 轻量聊天；产品 AI 能力统一走 Pi Agent

## Capabilities

### New Capabilities

- `pi-agent-sidecar`: Pi Agent Node 侧车会话、只读工具、沙箱与内部 HTTP/SSE API
- `ai-agent-gateway`: Spring 鉴权网关、会话元数据、权限与菜单
- `ai-agent-workbench`: 管理端 Agent 工作台 UI 与 SSE 客户端

### Modified Capabilities

- （无现有主 specs 需 delta）

## Impact

- 新增 `ruoyi-ai-agent/`（`npm start` 启停）
- `ruoyi-admin` AI Controller / 配置 / SQL 增量
- `ruoyi-react-web` Agent 页面与 API
- `openspec/project.md`、`VERSIONS.md`、`README.md`
