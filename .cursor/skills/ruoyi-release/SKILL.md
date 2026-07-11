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
git remote -v
```

根据 diff 判断版本号（SemVer）：

| 变更类型 | 版本 |
|---------|------|
| Bug 修复、文档小修 | patch `x.y.Z+1` |
| 新功能、UI 改版、依赖小升级 | minor `x.Y+1.0` |
| 破坏性变更（如 Spring Boot 主版本） | major `X+1.0.0` |

## 安全检查（发版前必做）

- `ruoyi-admin/src/main/resources/application-dev.yml`：AI 配置必须用环境变量（`AI_API_BASE_URL`、`AI_API_KEY`、`AI_MODEL`），禁止硬编码内部 URL 或密钥
- 确认无 `.env`、凭据文件进入暂存区（尤其 `.env.release.local`）
- 用户若在聊天中粘贴了 Token：**用完立即提醒其到对应平台吊销并重建**

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
| `README.md` | 顶部 version 徽章 |

## 文档更新

1. **`VERSIONS.md`**：更新 RuoYi 版本；从 `pom.xml` / `ruoyi-react-web/package.json` 同步主要依赖版本；开发环境区包含 OpenSpec CLI 版本
2. **`CHANGELOG.md`** 与 **`CHANGELOG_en.md`**：顶部插入新版本章节（结构见 [reference.md](reference.md)）
3. **`README.md`**：版本徽章、技术栈描述、文档链接
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

**禁止** `git push <remote> --tags`（会推送全部本地旧标签，易触发 `already exists` 拒绝）。只推 `main` 与本次标签：

```bash
git tag -a vX.Y.Z -m "$(cat <<'EOF'
vX.Y.Z - <标题>

主要亮点：
- <亮点 1>
- <亮点 2>
EOF
)"

# 先确认远程名，再分别推送（不要 --tags）
git remote -v
git push <gitee-remote> main
git push <gitee-remote> vX.Y.Z
git push <github-remote> main
git push <github-remote> vX.Y.Z
```

**远程（本地开发约定）：**
- `origin` → Gitee（主仓库）
- `github` → GitHub 镜像

> ⚠️ Cloud Agent 环境的远程不同（通常只有 `origin` → GitHub，**没有 Gitee 远程**）。
> 发版前**务必先 `git remote -v` 确认**，不要照搬上面的 `origin`/`github` 名称。详见下方「Cloud Agent 环境」。

**标签修正：** 发版后若仅文档/OpenSpec 版本需修补，在新提交上重建标签后 force push **仅标签**：

```bash
git tag -d vX.Y.Z
git tag -a vX.Y.Z HEAD -m "..."
git push <gitee-remote> vX.Y.Z --force
git push <github-remote> vX.Y.Z --force
```

禁止 `git push --force` 到 `main`。

## Cloud Agent 环境（云端发版必读）

在 Cursor Cloud Agent 中发版与本地差异较大，需特别注意：

### 1. 远程与凭据现状

| 平台 | 远程是否自动配置 | 凭据来源 |
|------|----------------|---------|
| **GitHub** | ✅ 自动（`origin` 内嵌 `x-access-token`，`gh` 已登录 `ghs_` 安装令牌） | Cursor 自动注入 |
| **Gitee** | ❌ 无远程、无凭据 | 需 `GITEE_TOKEN`（Dashboard Secret 或本次会话临时提供） |

发版第一步永远先：

```bash
git remote -v   # 确认实际远程名称，不要假设 origin=Gitee
```

### 2. 关键顺序：先推代码，再建 Release（易错点）

`create-release.sh` 创建 Gitee Release 时 `target_commitish` 取 Gitee 的 **`main` 当前 HEAD**。
若新提交未推到 Gitee，标签会被挂在**旧提交**上 → Release 源码包仍是旧代码。

**正确顺序：先把 `main` + 标签推到每个远程，再创建 Release。**

### 3. 推送到 Gitee（无远程时用内联 token）

```bash
# main 与标签都要推；标签若已被 API 建在旧提交上，需 --force 仅推标签
git push https://oauth2:$GITEE_TOKEN@gitee.com/xujingbao/ruoyi-ai-quick-starter.git main
git push https://oauth2:$GITEE_TOKEN@gitee.com/xujingbao/ruoyi-ai-quick-starter.git vX.Y.Z --force
```

- 不要把带 token 的 URL `git remote add` 持久化进 `.git/config`，用一次性内联 URL。
- 输出中务必脱敏 Token（`sed` / 脚本内 `redact`）。
- 用户在聊天里临时提供的 token（Gitee/GitHub），**用完提醒其到对应平台吊销重置**。

### 4. Gitee 429 / 系统维护

| 现象 | 处理 |
|------|------|
| `HTTP 429` / `RPC failed` | 按 4s/8s/16s/32s 退避重试 git push |
| HTML「系统升级中」、`info/refs not valid` | **DEFER**：不要当失败终态；恢复后补推 + 补跑 `create-release.sh` |
| API 返回 HTML 却误判「Release 已存在」 | 脚本已改为仅当 JSON 含数字 `id` 才 SKIP |

### 5. 发版后核验（用 API，避开 git 限流）

确认 Gitee 的 `main` 分支与标签 commit 都等于本地 `HEAD`：

```bash
git rev-parse HEAD
curl -s "https://gitee.com/api/v5/repos/xujingbao/ruoyi-ai-quick-starter/branches/main?access_token=$GITEE_TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('commit',{}).get('sha'))"
curl -s "https://gitee.com/api/v5/repos/xujingbao/ruoyi-ai-quick-starter/releases/tags/vX.Y.Z?access_token=$GITEE_TOKEN" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tag_name'), d.get('id'))"
```

三者一致（分支 sha = 本地 HEAD，Release 指向正确 tag）才算 Gitee 同步完成。

## 自动创建 Release

推送标签后，运行发版脚本（从 `CHANGELOG.md` 提取说明，双平台幂等创建）：

```bash
# 若存在 .env.release.local，脚本会自动 source，无需手动 export
.cursor/skills/ruoyi-release/scripts/create-release.sh X.Y.Z
```

### 凭据配置（一次性）

| 平台 | 方式 | 说明 |
|------|------|------|
| **Gitee** | `export GITEE_TOKEN=...` | [私人令牌](https://gitee.com/profile/personal_access_tokens)，勾选 `projects` |
| **GitHub** | `export GH_TOKEN=...` 或 `gh auth login` | Settings → **Developer settings** → Personal access tokens；Classic 勾选 `repo`；Fine-grained 对该仓库 Contents: Read and write |

本地凭据文件 `.env.release.local`（已加入 `.gitignore`）：

```bash
export GITEE_TOKEN=...
export GH_TOKEN=...
```

```bash
# 可选：手动加载后再跑其它 git 命令
set -a && source .env.release.local && set +a
.cursor/skills/ruoyi-release/scripts/create-release.sh X.Y.Z
```

### 脚本行为

- 自动 `source .env.release.local`（若存在）
- 从 `CHANGELOG.md` 的 `## [X.Y.Z]` 章节提取标题与正文
- Gitee：检测维护页并退避重试；仅 JSON+数字 `id` 才判定已存在；否则 POST 创建
- GitHub：`gh release create`；已存在则跳过；缺凭据时打印 Developer settings 路径
- 任一平台成功即 exit 0；双平台均未创建且非「仅 DEFER」时 exit 1 并输出手动链接
- Gitee 维护导致 DEFER 时：若 GitHub 已成功则 partial Done，提示恢复后补跑

凭据未配置时，不要阻塞发版主流程（代码/标签可先推到已通的远程），但应明确提示用户配置后补跑脚本。

## 发版检查清单

```
- [ ] 版本号已全量同步（6 个 pom + application.yml + README 徽章）
- [ ] CHANGELOG.md / CHANGELOG_en.md 已更新
- [ ] VERSIONS.md 依赖版本已同步
- [ ] OpenSpec 版本与 generatedBy 一致
- [ ] 无硬编码凭据；.env.release.local 未入暂存区
- [ ] 已提交、打标签
- [ ] 已分别推送 main + vX.Y.Z 到双远程（未使用 --tags）
- [ ] 标签指向包含最终文档修正的提交
- [ ] （Cloud Agent）已 `git remote -v` 确认远程，代码已先推到 Gitee 再建 Release
- [ ] （Cloud Agent）已用 API 核验 Gitee main/Release 与本地 HEAD 一致
- [ ] 已运行 `create-release.sh`；若 Gitee DEFER，恢复后已补跑
- [ ] 聊天中出现过的 Token 已提醒用户吊销
```

## 附加资源

- CHANGELOG 章节模板与 Token 获取路径：[reference.md](reference.md)
