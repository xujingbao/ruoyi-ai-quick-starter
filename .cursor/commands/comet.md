---
name: /comet
id: comet
category: Workflow
description: Comet 主入口，根据 OpenSpec change 与 .comet.yaml 状态继续推进
---

Comet 是仓库当前 OpenSpec 研发流程的总入口，把 `open → design → build → verify → archive` 串成可恢复流程。

**Input**: 可选 change 名称。未提供时先从对话上下文或 `openspec/changes/` 判断；存在多个候选时必须询问用户选择。

**Steps**

1. **选择 change**：使用用户提供的名称，或从 `openspec/changes/` 判断；使用 `openspec/changes/<change-name>/.comet.yaml` 作为状态来源，缺失时按 `phase: open` 提示先执行 `/comet-open`。
2. **读取状态**：读取 `openspec/changes/<change-name>/.comet.yaml`。
3. **调度阶段**：`phase: open` → `/comet-open`；`design` → `/comet-design`；`build` → `/comet-build`；`verify` → `/comet-verify`；`archive` → `/comet-archive`；`archived: true` 仅汇报。
4. **输出**：当前 change、phase、build_mode、verify_result、下一步命令与缺失产物。

**Guardrails**

- 不凭对话猜测阶段；以 `.comet.yaml` 和实际文件状态为准。
- 不跳过 `design`、`verify`、`archive` 直接宣称完成。
- 现有 `/opsx-*` 命令可作为底层兼容入口，用户侧优先使用 `/comet-*`。
