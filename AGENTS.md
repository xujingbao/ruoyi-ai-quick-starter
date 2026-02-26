<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

## Cursor Cloud specific instructions

### Services overview

| Service | Tech | Default Port | Notes |
|---------|------|-------------|-------|
| Backend | Spring Boot 3.5.4 (Java 17+) | 8080 | Entry point: `ruoyi-admin`, profile: `dev` |
| Frontend | Vue 3 + Vite + pnpm | 80 (needs sudo) or use `--port 8081` | Proxies `/dev-api` to backend |
| MySQL | 8.0+ | 3306 | DB: `ry-demo`, user: `root`, pass: `password` |
| Redis | 6.0+ | 6379 | Password: `finagent123` |

### Starting infrastructure services

```bash
sudo service mysql start
sudo service redis-server start
redis-cli -a "finagent123" CONFIG SET requirepass "finagent123"
```

### Starting the backend

The backend requires a non-empty `spring.ai.openai.api-key` in `application-dev.yml` or via env var `SPRING_AI_OPENAI_API_KEY`. Without it, Spring AI autoconfiguration fails and the app won't start. A placeholder value (e.g. `sk-placeholder-for-dev`) is sufficient for non-AI features.

```bash
cd /workspace && mvn spring-boot:run -pl ruoyi-admin -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### Starting the frontend

Port 80 requires root. Use `--port 8081` as non-root:

```bash
cd /workspace/ruoyi-front && pnpm dev --host 0.0.0.0 --port 8081
```

### Key gotchas

- The `ruoyi.profile` upload path in `application-dev.yml` defaults to a macOS path. On Linux, update it (e.g. `/tmp/ruoyi/uploadPath`) and ensure the directory exists.
- Captcha is enabled by default (math-based). To disable for automated testing, set `sys.account.captchaEnabled` to `false` in the `sys_config` DB table and clear the Redis cache key `sys_config:sys.account.captchaEnabled`.
- Login credentials: `admin` / `admin123456`.
- Lint/test: no dedicated ESLint config or test framework is configured in the frontend. The backend has no unit test configuration either. Build verification: `mvn install -DskipTests` (backend), `pnpm build:prod` (frontend).
- See `README.md` for standard dev commands and project structure.