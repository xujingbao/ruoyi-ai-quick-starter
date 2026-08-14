---
name: /comet-verify
id: comet-verify
category: Workflow
description: Comet Verify 阶段，验证实现、规格和报告闭环
---

Verify 阶段用于确认实现、任务、规格与验证报告一致。

**Input**: change 名称。

**Steps**

1. 读取 `openspec/changes/<change-name>/.comet.yaml`，确认 `phase` 为 `verify`。
2. 检查 `tasks.md` 是否全部完成。
3. 按 `testcases.md` 或等价清单执行用户要求的验证；未要求自动验证时记录原因，不伪造通过。
4. 运行或提示运行 `openspec verify`。
5. 将验证结果写入 `openspec/output/<change-name>/validation-report.md` 或既有约定报告。
6. 验证通过后更新 `.comet.yaml`：`verify_result: pass`、`phase: archive`、`verified_at: <ISO-8601>`。

**Guardrails**

- 未实际执行的测试不得写成通过。
- `verify_result` 为 `fail` 时不得进入 Archive。
- 验证范围必须与 change 范围一致。
