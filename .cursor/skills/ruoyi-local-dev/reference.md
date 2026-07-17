# ruoyi-local-dev 参考

## 为什么 Cursor 里不能只靠 nohup

Cursor Agent 的 Shell 在命令结束后可能清理进程组。  
`nohup … &` + `disown` 在本机终端通常够用，但在 Agent 短任务里仍可能被收掉，表现为：

1. `wait_port` 看到 LISTEN → 对用户说 UP  
2. 数秒后进程消失 → 用户再问「起来了吗」全 DOWN  

因此 Agent 内必须用 **常驻 shell + `exec` 前台进程**（`block_until_ms: 0`）。

## 恢复 AI_API_*（不回显密钥）

可从 `agent-transcripts` 或 `terminals/*.txt` 用正则提取（仅写入临时 env / 进程环境）：

```text
AI_API_BASE_URL=['"]([^'"]+)['"]
AI_API_KEY=['"]([^'"]+)['"]
AI_MODEL=['"]([^'"]+)['"]
```

临时文件用完删除；对用户只说「已带上已有 LLM 配置」，不打印值。

## 脚本 `scripts/ruoyi-dev.sh`

| 动作 | 说明 |
|------|------|
| `start\|stop\|restart\|status` | 第二参数：`agent\|admin\|web\|all` |
| agent 实现 | `node src/server.js` + 透传环境变量 |
| admin 实现 | `./mvnw … spring-boot:run -pl ruoyi-admin` |
| web 实现 | `vite` |
| 状态 | 以 **端口 LISTEN** 为准，不以 pid 文件为准 |

适用：用户自己终端、CI 旁路。Agent 内启停仍以常驻 shell 为准。

## 架构依赖（启停相关）

```text
浏览器 :80 (web)
  → admin :8080  (JWT)
    → agent :19090  (X-AI-Agent-Token)
      → LLM (AI_API_*)
      → admin /ai/agent/tools/** (用户 JWT 回调)
```

浏览器不直连 agent。侧车默认绑 `127.0.0.1`。

## 健康检查完整命令

```bash
ROOT=...  # 仓库绝对路径
"$ROOT/scripts/ruoyi-dev.sh" status all

curl -fsS -o /dev/null -w "admin:%{http_code}\n" http://127.0.0.1:8080/
curl -fsS -H "X-AI-Agent-Token: ruoyi-ai-agent-dev-token" \
  http://127.0.0.1:19090/v1/health
curl -fsS -o /dev/null -w "web:%{http_code}\n" http://127.0.0.1:80/
```

agent health JSON 关键字段：`status`、`toolMode`、`model`、`auth`。

## 常见日志关键字

| 服务 | 成功 | 失败 |
|------|------|------|
| agent | `listening on http://127.0.0.1:19090` | `AI_API_KEY is missing`、`EADDRINUSE`、`Refuse to bind` |
| admin | `Started RuoYiApplication` | `APPLICATION FAILED`、`Build Failure`、DB 连接 |
| web | `VITE … ready` / `Local: http://localhost:80/` | `EACCES`、`EADDRINUSE` |
