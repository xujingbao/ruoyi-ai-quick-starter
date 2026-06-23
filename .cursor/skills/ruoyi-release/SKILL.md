---
name: ruoyi-release
description: >-
  Release ruoyi-ai-quick-starter: bump version, update CHANGELOG/VERSIONS/docs,
  commit, tag, and push to Gitee and GitHub. Use when the user asks to release,
  publish a new version, cut a tag, or update release documentation (发布、发版、提交新版本).
---

# RuoYi AI Quick Starter 发版

端到端发版流程。仅在用户明确要求发版时执行；未经确认不要提交或推送。

## 前置检查

并行执行：

```bash
git status
git diff --stat
git log --oneline -5
git tag -l 'v*' | tail -5
```

根据 diff 判断版本号（SemVer）：

| 变更类型 | 版本 |
|---------|------|
| Bug 修复、文档小修 | patch `x.y.Z+1` |
| 新功能、UI 改版、依赖升级 | minor `x.Y+1.0` |
| 破坏性变更 | major `X+1.0.0` |

## 安全检查（发版前必做）

- `ruoyi-admin/src/main/resources/application-dev.yml`：AI 配置必须用环境变量（`AI_API_BASE_URL`、`AI_API_KEY`、`AI_MODEL`），禁止硬编码内部 URL 或密钥
- 确认无 `.env`、凭据文件进入暂存区

## 版本号文件清单

全部同步为新版本 `X.Y.Z`：

| 文件 | 字段 |
|------|------|
| `pom.xml` | `<version>`、`<ruoyi.version>` |
| `ruoyi-admin/pom.xml` | parent `<version>` |
| `ruoyi-common/pom.xml` | parent `<version>` |
| `ruoyi-framework/pom.xml` | parent `<version>` |
| `ruoyi-quartz/pom.xml` | parent `<version>` |
| `ruoyi-system/pom.xml` | parent `<version>` |
| `ruoyi-admin/src/main/resources/application.yml` | `ruoyi.version` |

## 文档更新

1. **`VERSIONS.md`**：更新 RuoYi 版本；从 `pom.xml` / `ruoyi-react-web/package.json` 同步主要依赖版本；开发环境区包含 OpenSpec CLI 版本
2. **`CHANGELOG.md`** 与 **`CHANGELOG_en.md`**：顶部插入新版本章节（结构见 [reference.md](reference.md)）
3. **`README.md`**：版本相关描述、文档链接、开发规范路径
4. **`openspec/project.md`**：OpenSpec 版本与 Tech Stack 一致

## OpenSpec 版本校验（易错点）

发版说明中的 OpenSpec 版本**必须**与技能文件一致，不要沿用旧文档或中间提交里的版本号。

```bash
openspec --version 2>&1
rg 'generatedBy:' .cursor/skills/openspec-*/SKILL.md
```

- CLI 输出 = 所有 `generatedBy` 值 = `openspec/project.md` = `VERSIONS.md` = CHANGELOG
- 若 OpenSpec 技能有更新，CHANGELOG 依赖表写 `OpenSpec CLI: <旧> → <新>`

## 提交

```bash
git add -A
git status   # 再次确认无敏感文件
```

提交信息格式：

```
release: vX.Y.Z <一句话摘要>

- <亮点 1>
- <亮点 2>
- 更新 CHANGELOG、VERSIONS.md 与项目文档
```

## 打标签与推送

```bash
git tag -a vX.Y.Z -m "$(cat <<'EOF'
vX.Y.Z - <标题>

主要亮点：
- <亮点 1>
- <亮点 2>
EOF
)"
git push origin main --tags
git push github main --tags
```

**远程：**
- `origin` → Gitee（主仓库）
- `github` → GitHub 镜像

**标签修正：** 发版后若仅文档/OpenSpec 版本需修补，在新提交上重建标签后 force push **仅标签**：

```bash
git tag -d vX.Y.Z
git tag -a vX.Y.Z HEAD -m "..."
git push origin vX.Y.Z --force
git push github vX.Y.Z --force
```

禁止 `git push --force` 到 `main`。

## 自动创建 Release

推送标签后，运行发版脚本（从 `CHANGELOG.md` 提取说明，双平台幂等创建）：

```bash
.cursor/skills/ruoyi-release/scripts/create-release.sh X.Y.Z
```

### 凭据配置（一次性）

| 平台 | 方式 | 说明 |
|------|------|------|
| **Gitee** | `export GITEE_TOKEN=<私人令牌>` | [设置 → 私人令牌](https://gitee.com/profile/personal_access_tokens)，勾选 `projects` |
| **GitHub** | `gh auth login` 或 `export GH_TOKEN=<token>` | `gh` 已登录时无需 `GH_TOKEN` |

可从本地文件加载（勿提交仓库）：

```bash
# .env.release.local（已加入 .gitignore）
export GITEE_TOKEN=...
export GH_TOKEN=...
```

```bash
set -a && source .env.release.local && set +a
.cursor/skills/ruoyi-release/scripts/create-release.sh X.Y.Z
```

### 脚本行为

- 从 `CHANGELOG.md` 的 `## [X.Y.Z]` 章节提取标题与正文
- Gitee：`POST /api/v5/repos/.../releases`；已存在则跳过
- GitHub：`gh release create`；已存在则跳过
- 任一平台成功即 exit 0；双平台均跳过且无凭据时 exit 1 并输出手动链接

凭据未配置时，不要阻塞发版主流程，但应明确提示用户配置后补跑脚本。

## 发版检查清单

```
- [ ] 版本号已全量同步（6 个 pom + application.yml）
- [ ] CHANGELOG.md / CHANGELOG_en.md 已更新
- [ ] VERSIONS.md 依赖版本已同步
- [ ] OpenSpec 版本与 generatedBy 一致
- [ ] 无硬编码凭据
- [ ] 已提交、打标签、推送双远程
- [ ] 标签指向包含最终文档修正的提交
- [ ] 已运行 `create-release.sh` 或确认 Release 页面已创建
```

## 附加资源

- CHANGELOG 章节模板：[reference.md](reference.md)
