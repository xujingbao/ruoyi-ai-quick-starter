---
name: /comet-open
id: comet-open
category: Workflow
description: Comet Open 阶段，创建或接管 OpenSpec change 并初始化状态
---

Open 阶段用于明确 change 名称、范围与 OpenSpec 基础产物。

**Input**: change 名称或需求描述。

**Steps**

1. 如果 change 不存在，按现有 `/opsx:new` 规则创建 `openspec/changes/<change-name>/`。
2. 如果 change 已存在，读取 `.openspec.yaml`、`proposal.md`、`tasks.md` 等现有文件，不覆盖用户已有内容。
3. 确认 `openspec/changes/<change-name>/.comet.yaml` 是否存在；缺失时初始化：

```yaml
workflow: full
phase: design
build_mode: null
verify_mode: null
verify_result: pending
archived: false
```

4. 输出缺失的 OpenSpec 产物和下一阶段 `/comet-design <change-name>`。

**Guardrails**

- 不在 Open 阶段写实现代码。
- 不把未确认需求写成冻结规格。
- 初始化 `.comet.yaml` 前必须保留已存在的 `.openspec.yaml`。
