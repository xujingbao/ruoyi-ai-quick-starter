# Comet 工作流

Comet 是本仓库 OpenSpec 研发流程的编排层，把 `open → design → build → verify → archive` 串成可恢复、可看板的需求流程。底层复用 OpenSpec CLI 与 Superpowers 技能，一个需求对应一个 OpenSpec change。

## 组件与版本

| 组件 | 版本 | 作用 |
|------|------|------|
| Comet CLI | `@rpamis/comet` 0.4.0-beta.18 | 阶段编排、`.comet.yaml`、dashboard |
| OpenSpec | 1.9.0 | 需求 / 规格 / 任务 / 归档 |
| Superpowers | obra/superpowers（14 个技能） | TDD / 计划 / 审查等 HOW |
| Node.js | >= 22 | Comet CLI 要求 |

## 落点

| 路径 | 说明 |
|------|------|
| `.comet/config.yaml` | 项目配置（Classic、legacy 布局、中文产物） |
| `openspec/config.yaml` | OpenSpec 项目上下文与产物规则 |
| `.cursor/skills/comet*` · `.claude/skills/comet*` | 阶段技能 |
| `.cursor/rules/comet-workflow-guard.mdc` | 防跳阶段常驻规则 |
| `openspec/changes/<name>/` | 单次变更产物（含 `.comet.yaml` 状态） |

## 上手

```bash
npx comet --version && openspec --version
npx comet doctor     # 检查安装健康
npx comet status     # 查看活跃 change
npx comet dashboard  # 只读看板；默认 http://localhost:4321
```

在 Cursor 中：

| 场景 | 入口 |
|------|------|
| 正式变更 | `/comet` · `/comet-open` · `/comet-design` · `/comet-build` · `/comet-verify` · `/comet-archive` |
| 轻量 / 热修 | `/comet-tweak` · `/comet-hotfix` |

## 阶段协议

- **Open**：明确 change 名称、范围与 OpenSpec 基础产物；不写实现代码。
- **Design**：把 WHAT 转成设计、边界与任务；缺少测试策略不得进入 Build。
- **Build**：按 `tasks.md` 逐项实施并勾选；暴露设计问题时回到 Design。
- **Verify**：检查任务完成度、执行测试清单并运行 `openspec verify`；未实际执行的测试不得写成通过。
- **Archive**：同步 delta spec、生成归档说明；`verify_result: pass` 且 `archived: false` 才可归档。

阶段推进以 `openspec/changes/<name>/.comet.yaml` 为准，不看板代替推进，不凭对话猜测阶段。

## 约定

1. 未明确是正式变更时，不建 `openspec/changes/`、不写 `.comet.yaml`。
2. 「看过看板」≠ 阶段已推进。
3. 升级工具后同步本文与 `VERSIONS.md` 的版本表。
4. **NEVER** 为润色本文改 Comet 框架资产（`comet*` 技能、guard 规则、CLI 生成文件）。
