---
name: /comet-design
id: comet-design
category: Workflow
description: Comet Design 阶段，基于 OpenSpec 产物完成设计与任务拆解
---

Design 阶段用于把 OpenSpec 的 WHAT 转成可执行设计、边界和任务。

**Input**: change 名称。

**Steps**

1. 读取 `openspec/changes/<change-name>/.comet.yaml`，确认 `phase` 为 `design`。
2. 读取 `proposal.md`、`spec.md` 或 `specs/**/spec.md`、`design.md`、`tasks.md`。
3. 如缺少必要上下文，使用现有 `/opsx:continue` 规则补齐对应 OpenSpec 产物。
4. 设计收敛后确认：范围与非范围清楚、任务可逐项执行、测试策略已写入 `testcases.md` 或等价清单。
5. 将 `.comet.yaml` 推进到 `phase: build`，并设置合适的 `build_mode`。

**Guardrails**

- 设计阶段不直接改代码。
- 缺少测试策略时不得进入 Build。
- 业务边界不清时先暂停并询问用户。
