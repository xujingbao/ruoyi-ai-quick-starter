# 发版文档模板

## CHANGELOG.md 章节模板

```markdown
## [X.Y.Z] - YYYY-MM-DD

**标题:** <一句话标题>

**发布地址:** [vX.Y.Z Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### 发行摘要

<2-3 句概述>

### 主要亮点

- <亮点 1>
- <亮点 2>

### 依赖与版本升级

- 根项目版本升级至 `X.Y.Z`
- `<依赖名>`: `<旧>` → `<新>`

### 配置与安全

- <安全相关变更，无则省略本节>

### 适用场景

- <目标用户/场景 1>
- <目标用户/场景 2>

---
```

## CHANGELOG_en.md 章节模板

```markdown
## [X.Y.Z] - YYYY-MM-DD

**Title:** <English title>

**Release:** [vX.Y.Z Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Summary

<2-3 sentences>

### Highlights

- <highlight 1>
- <highlight 2>

### Dependency Upgrades

- Root project version bumped to `X.Y.Z`
- `<dep>`: `<old>` → `<new>`

### Security and Configuration

- <security changes, omit if none>

### Best For

- <audience 1>
- <audience 2>

---
```

## 标签注释模板

```
vX.Y.Z - <标题>

主要亮点：
- <亮点 1>
- <亮点 2>
- OpenSpec <version> 工作流同步（如有）
```

## VERSIONS.md 常见字段

从以下来源读取实际版本，不要手写猜测：

| 字段 | 来源 |
|------|------|
| RuoYi | `pom.xml` `<ruoyi.version>` |
| Spring Boot | `pom.xml` `<spring-boot.version>` |
| React / Ant Design / Vite | `ruoyi-react-web/package.json` |
| OpenSpec CLI | `openspec --version` |

## Release 凭据与脚本

```bash
# Gitee: https://gitee.com/profile/personal_access_tokens
export GITEE_TOKEN=...

# GitHub: Settings → Developer settings → Personal access tokens
# Classic: scope `repo`；Fine-grained: Contents Read and write
export GH_TOKEN=...
# 或: gh auth login
```

本地凭据文件 `.env.release.local`（勿提交，已在 `.gitignore`）：

```bash
export GITEE_TOKEN=...
export GH_TOKEN=...
```

```bash
# create-release.sh 会自动 source .env.release.local
.cursor/skills/ruoyi-release/scripts/create-release.sh X.Y.Z
```

### GitHub Token 获取路径（易错）

1. GitHub 头像 → **Settings**（个人设置，不是仓库 Settings）
2. 左侧最下方 **Developer settings**
3. **Personal access tokens** → Tokens (classic) 或 Fine-grained tokens
4. 生成后写入 `.env.release.local` 的 `GH_TOKEN=`

### 聊天中泄露 Token

若用户在对话里粘贴了 Token：发版完成后提醒其到 Gitee/GitHub **立刻吊销并重建**，再更新 `.env.release.local`。

### 推送注意

- 使用 `git push <remote> main` + `git push <remote> vX.Y.Z`
- **不要** `git push --tags`（会推全部本地旧标签）
