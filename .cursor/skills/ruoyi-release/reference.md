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
| Spring Boot / Spring AI | `pom.xml` properties |
| React / Ant Design / Vite | `ruoyi-react-web/package.json` |
| OpenSpec CLI | `openspec --version` |

## Release 凭据与脚本

```bash
# Gitee: https://gitee.com/profile/personal_access_tokens
export GITEE_TOKEN=...

# GitHub: gh auth login  或
export GH_TOKEN=...

.cursor/skills/ruoyi-release/scripts/create-release.sh X.Y.Z
```

本地凭据文件 `.env.release.local`（勿提交）：

```bash
set -a && source .env.release.local && set +a
```
