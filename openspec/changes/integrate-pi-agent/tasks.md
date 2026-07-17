## 1. Sidecar

- [x] 1.1 Create `ruoyi-ai-agent` with Pi SDK, localhost HTTP, session/sandbox APIs
- [x] 1.2 Sidecar start via `ruoyi-ai-agent` npm scripts (`npm start` / `npm run dev`)

## 2. Gateway

- [x] 2.1 Add Spring `/ai/agent/**` proxy + config + session metadata
- [x] 2.2 Add menu/permission incremental SQL

## 3. Frontend

- [x] 3.1 Add `api/ai/agent.js` and `views/ai/agent` workbench

## 4. Docs

- [x] 4.1 Update `project.md`, `VERSIONS.md`, `README.md`

## 5. Hardening（后续优化）

- [x] 5.1 Sidecar internal token + loopback bind guard
- [x] 5.2 Session ensure/recreate after sidecar restart + ownership checks
- [x] 5.3 Tool mode business/full + sandbox path isolation
- [x] 5.4 Tool Bus audit log + correlation id
- [x] 5.5 Shared FE session store, history resume, abort-on-cancel
