---
name: /comet-build
id: comet-build
category: Workflow
description: Comet Build 阶段，按 tasks 实施并维护进度
---

Build 阶段用于执行实现计划，底层兼容现有 `/opsx:apply` 与 `openspec-apply-change`。

**Input**: change 名称。

**Steps**

1. 读取 `openspec/changes/<change-name>/.comet.yaml`，确认 `phase` 为 `build`。
2. 读取 OpenSpec apply 上下文：`openspec instructions apply --change "<change-name>" --json`。
3. 读取所有 `contextFiles`（proposal、specs、design、tasks、testcases）。
4. 按 `tasks.md` 逐项实施，完成一项立即勾选。
5. 实现暴露设计问题时暂停并回到 `/comet-design` 更新产物。
6. 全部完成后将 `.comet.yaml` 推进到 `phase: verify`，保持 `verify_result: pending`。

**Guardrails**

- 不绕过 `.comet.yaml` 直接实施。
- 不批量完成未实际处理的 task。
- 不扩大到当前 change 之外的重构。
