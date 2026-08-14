---
name: /comet-archive
id: comet-archive
category: Workflow
description: Comet Archive 阶段，同步规格并归档 OpenSpec change
---

Archive 阶段用于归档 OpenSpec change，并确认 Comet 状态闭环。

**Input**: change 名称。

**Steps**

1. 读取 `openspec/changes/<change-name>/.comet.yaml`，确认 `phase: archive`、`verify_result: pass`、`archived: false`。
2. 按现有 `/opsx:archive` 或 `openspec-archive-change` 规则同步 delta spec、生成归档说明并移动归档目录。
3. 确认输出报告已在 `openspec/output/<change-name>/`。
4. 归档完成后更新 `.comet.yaml`：`archived: true`、`phase: archive`。
5. 输出归档位置、验证报告位置和残留风险。

**Guardrails**

- 未通过 Verify 不得归档。
- 不删除审计、评审、验证报告。
- 归档失败时保持 `archived: false` 并说明阻塞原因。
