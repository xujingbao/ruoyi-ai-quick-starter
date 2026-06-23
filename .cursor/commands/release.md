---
name: /release
id: release
category: Workflow
description: Release a new version — bump version, update docs, commit, tag, and push
---

执行 RuoYi AI Quick Starter 完整发版流程。

**输入**：可选指定版本号（如 `/release 5.4.0`）。未指定时根据 `git diff` 自动建议 SemVer，用 **AskUserQuestion** 让用户确认。

**必读 Skill**：使用 Skill 工具读取 `ruoyi-release`，严格按其中步骤执行。

**步骤概要**

1. **分析变更** — `git status`、`git diff --stat`、`git log`、最新 tag
2. **确定版本** — patch / minor / major，与用户确认
3. **安全检查** — `application-dev.yml` 环境变量、无凭据入库
4. **更新版本号** — 全部 pom.xml、`application.yml`（见 skill 清单）
5. **更新文档** — `CHANGELOG.md`、`CHANGELOG_en.md`、`VERSIONS.md`、`README.md`、`openspec/project.md`
6. **OpenSpec 校验** — `openspec --version` 与 `.cursor/skills/openspec-*/SKILL.md` 的 `generatedBy` 一致
7. **提交** — `release: vX.Y.Z ...` 格式
8. **打标签** — 附注释的 `vX.Y.Z` tag
9. **推送** — `origin`（Gitee）和 `github`，含 tags
10. **自动 Release** — 运行 `.cursor/skills/ruoyi-release/scripts/create-release.sh X.Y.Z`（需 `GITEE_TOKEN` / `gh auth` 或 `GH_TOKEN`）

**发版后修补**

若标签已打但文档需修正：在新提交上重建标签，`git push <remote> vX.Y.Z --force`（仅标签，不 force main）。

**输出**

完成后汇报：
- 版本号与 commit hash
- 标签是否已推送双远程
- Release 创建状态（Gitee / GitHub 各自 OK、SKIP 或 FAIL）
- 若凭据未配置：提示设置 `GITEE_TOKEN` 并补跑 `create-release.sh`
- OpenSpec 版本校验结果

**约束**

- 未经用户明确要求不要发版
- 不要 force push `main`
- 不要提交含密钥或内部 API 地址的配置
