---
name: ruoyi-local-dev
description: >-
  ruoyi-ai-quick-starter 本地 admin / AI Agent 侧车 / React 前端启停与探活。
  Triggers: 本地启动, 重启, 停服务, 启停, 起来了吗, status, npm start, mvnw,
  vite, 8080, 19090, 80, /ruoyi-local-dev, ruoyi-dev.sh.
---

# RuoYi：本地服务启停

| 服务 | 目录 | 前台命令 | 端口 | 探活 |
|------|------|----------|------|------|
| `admin` | 仓库根 | `./mvnw -s .mvn/maven-settings.xml spring-boot:run -pl ruoyi-admin -Dspring-boot.run.profiles=dev` | **8080** | `curl -fsS -o /dev/null -w '%{http_code}' http://127.0.0.1:8080/` → `200` |
| `agent` | `ruoyi-ai-agent/` | `node src/server.js`（不要用 `npm start` 记 PID） | **19090** | `curl -fsS -H "X-AI-Agent-Token: $TOKEN" http://127.0.0.1:19090/v1/health` |
| `web` | `ruoyi-react-web/` | `./node_modules/.bin/vite` | **80** | `curl -fsS -o /dev/null -w '%{http_code}' http://127.0.0.1:80/` → `200` |

`TOKEN` 默认 `ruoyi-ai-agent-dev-token`（与 `ruoyi.ai.agent.internal-token` 一致）。

**启动顺序（all）**：admin → agent → web。  
**停止顺序（all）**：web → agent → admin。

---

## 两条启动路径（必读）

### A. Cursor Agent 内（默认走这条）

短生命周期 shell + `nohup`/`disown` **不可靠**：命令结束后 Cursor 可能收掉子进程，出现「刚报 UP、再查全 DOWN」。

**必须**开常驻 shell（`block_until_ms: 0`），进程用 `exec` 占住前台：

1. **先停端口**（避免 EADDRINUSE）：
   ```bash
   for p in 80 19090 8080; do
     ids=$(lsof -tiTCP:$p -sTCP:LISTEN 2>/dev/null || true)
     [ -n "$ids" ] && kill $ids 2>/dev/null || true
   done
   ```
2. **并行起 3 个常驻任务**（绝对路径替换 `$ROOT`）：
   - **agent**（需先恢复/export `AI_API_*`，见下）：
     ```bash
     cd "$ROOT/ruoyi-ai-agent" && exec env \
       AI_AGENT_HOST=127.0.0.1 AI_AGENT_PORT=19090 \
       AI_AGENT_INTERNAL_TOKEN="${AI_AGENT_INTERNAL_TOKEN:-ruoyi-ai-agent-dev-token}" \
       AI_AGENT_TOOL_MODE="${AI_AGENT_TOOL_MODE:-business}" \
       AI_AGENT_GATEWAY_URL="${AI_AGENT_GATEWAY_URL:-http://127.0.0.1:8080}" \
       AI_API_BASE_URL="$AI_API_BASE_URL" AI_API_KEY="$AI_API_KEY" AI_MODEL="$AI_MODEL" \
       node src/server.js
     ```
   - **admin**：
     ```bash
     cd "$ROOT" && exec ./mvnw -s .mvn/maven-settings.xml spring-boot:run \
       -pl ruoyi-admin -Dspring-boot.run.profiles=dev
     ```
   - **web**：
     ```bash
     cd "$ROOT/ruoyi-react-web" && exec ./node_modules/.bin/vite
     ```
3. **Await 就绪日志**：
   - agent: `listening on`
   - admin: `Started RuoYiApplication`
   - web: `ready in`
4. **双重探活**（立刻一次 + **再 sleep 3s 一次**），都过才可对用户说「起来了」：
   ```bash
   ./scripts/ruoyi-dev.sh status all
   curl -fsS -o /dev/null -w "admin:%{http_code}\n" http://127.0.0.1:8080/
   curl -fsS -H "X-AI-Agent-Token: ruoyi-ai-agent-dev-token" -o /dev/null -w "agent:%{http_code}\n" http://127.0.0.1:19090/v1/health
   curl -fsS -o /dev/null -w "web:%{http_code}\n" http://127.0.0.1:80/
   ```

只重启单个服务时：只杀对应端口，只开对应常驻 shell。

### B. 用户本机终端

```bash
cd "$ROOT"
# 可选：export AI_API_BASE_URL=... AI_API_KEY=... AI_MODEL=...
./scripts/ruoyi-dev.sh restart all
./scripts/ruoyi-dev.sh status all
```

脚本日志：`.dev-run/{admin,agent,web}.log`（已 gitignore）。

---

## 智能体执行约定

1. 仅在用户明确要求启停 / 重启 / status / 「起来了吗」/ `/ruoyi-local-dev` 时操作。
2. **Cursor 内默认路径 A**；不要只用 `./scripts/ruoyi-dev.sh start` 然后立刻声称成功。
3. Agent 缺 `AI_API_KEY` 时：从近期 terminals 文本里用正则捞 `AI_API_*=`（**不要把 key 打进对用户回复**）；捞不到则启动后说明「侧车在线但 prompt 会失败，需 export AI_API_KEY」。
4. 改 Java 后 admin 需重启才生效；改侧车 JS 后重启 agent；前端 Vite 多数热更新。
5. 收尾格式固定三行表：服务 / 端口 / HTTP；失败附对应 log 末尾 20 行路径。
6. **禁止**在回复里粘贴完整 API Key。

---

## 环境变量（agent）

| 变量 | 说明 |
|------|------|
| `AI_API_BASE_URL` / `AI_API_KEY` / `AI_MODEL` | LLM；缺 key 时 health 仍可能 ok |
| `AI_AGENT_INTERNAL_TOKEN` | 默认 `ruoyi-ai-agent-dev-token` |
| `AI_AGENT_TOOL_MODE` | 默认 `business`（仅 sys_*）；`full` 开沙箱 |
| `AI_AGENT_GATEWAY_URL` | 默认 `http://127.0.0.1:8080` |

---

## 排障

| 现象 | 处理 |
|------|------|
| 报 UP 再查全 DOWN | 用了短 shell+nohup；改走路径 A 常驻 `exec` |
| Agent `401 unauthorized` | Token 不一致；对齐 `AI_AGENT_INTERNAL_TOKEN` 与 admin yml |
| Agent health ok、对话失败 | 缺/错 `AI_API_KEY`；看 agent 日志 |
| Admin 起不来 | `tail -n 40 .dev-run/admin.log` 或常驻 shell 输出；常见编译失败/DB |
| Vite `:80` 失败 | macOS 权限；看 web 日志；可临时改 `vite.config.js` port |
| `EADDRINUSE` | 先 `lsof -tiTCP:<port> -sTCP:LISTEN \| xargs kill` |
| PG / 审计表缺失 | 执行 `sql/ai-agent-audit.sql`（MCP 或 psql） |

更多细节：[reference.md](reference.md)
