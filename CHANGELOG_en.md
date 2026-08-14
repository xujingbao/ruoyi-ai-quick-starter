# Changelog

All notable changes to this project will be documented in this file.

## [6.2.0] - 2026-08-14

**Title:** Dependency Upgrades and Pi Agent 0.84 Engine Adaptation

**Release:** [v6.2.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Summary

This release applies a batch of low-risk dependency upgrades: patch-level backend dependencies, minor Web frontend upgrades, and the Pi Coding Agent 0.84.1 engine adaptation. The README is restructured around "what you can do with this framework", and the OpenSpec CLI version is synced.

### Highlights

- Backend: fastjson2 / PostgreSQL JDBC / commons-io / POI / Velocity / jjwt upgraded
- Frontend: antd 6.6.0, @ant-design/x 2.9.0, axios 1.19.0, Vite 8.2.1 and more; jsencrypt 3.5.4 import path adapted
- Agent sidecar: pi-coding-agent 0.80.7 → 0.84.1, adapted to the new ModelRuntime API (AuthStorage / ModelRegistry.create removed)
- Docs: README gains a "what can you do" section; VERSIONS.md version records corrected

### Dependency Upgrades

- Root project version bumped to `6.2.0`
- `fastjson2`: `2.0.58` → `2.0.64`
- `postgresql`: `42.7.7` → `42.7.13`
- `commons-io`: `2.19.0` → `2.22.0`
- `poi-ooxml`: `5.3.0` → `5.5.1`
- `velocity-engine-core`: `2.3` → `2.4.1`
- `jjwt`: `0.12.6` → `0.13.0`
- `antd`: `6.4.5` → `6.6.0`
- `@ant-design/x`: `2.8.0` → `2.9.0`
- `@ant-design/icons`: `6.2.5` → `6.3.2`
- `axios`: `1.9.0` → `1.19.0`
- `vite`: `8.0.16` → `8.2.1`
- `@vitejs/plugin-react`: `6.0.2` → `6.0.5`
- `zustand`: `5.0.14` → `5.0.15`
- `js-cookie`: `3.0.5` → `3.0.8`
- `jsencrypt`: `3.3.2` → `3.5.4`
- `react-split-pane`: `3.0.4` → `3.2.0`
- `sass` / `sass-embedded`: `1.97.2` / `1.89.1` → `1.102.0`
- `@earendil-works/pi-coding-agent`: `0.80.7` → `0.84.1`
- `hono`: `4.12.30` → `4.13.2`
- `@hono/node-server`: `1.19.14` → `1.19.17`
- `typebox`: `1.1.38` → `1.3.13`
- OpenSpec CLI: `1.4.1` → `1.9.0`

### Security and Configuration

- LLM config remains environment-driven (`AI_API_BASE_URL` / `AI_API_KEY` / `AI_MODEL`); no hardcoded secrets
- Agent sidecar keeps loopback binding and internal token auth

### Best For

- Projects upgrading from 6.1.0 that want current dependencies and the latest Pi Agent engine
- New users who want a quick overview of framework capabilities from the README

---

## [6.1.0] - 2026-07-17

**Title:** Pi Agent Productization and Spring AI Removal

**Release:** [v6.1.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Summary

This release makes the Pi Coding Agent sidecar the primary AI runtime, with Spring Boot as the auth gateway and System Tool Bus. The global Agent Shell (⌘/Ctrl+K) is the main UX. Spring AI lightweight chat is removed; session transcripts can persist and restore.

### Highlights

- Add `ruoyi-ai-agent` (Pi SDK) and gateway `/ai/agent/**` with business/full tool modes, SSE streaming, and session restore
- Agent Shell + workbench: tool process UI, history picker, AI session titles, message persistence
- System Tool Bus: users / config / notices / jobs (permission-aware)
- Sidecar internal auth, loopback bind, audit logging, and `scripts/ruoyi-dev.sh`
- **Remove** Spring AI: `/ai/chat/**`, chat UI, and `spring-ai` dependencies (breaking)

### Dependency Upgrades

- Root project version bumped to `6.1.0`
- Removed `spring-ai-bom` / `spring-ai-starter-model-openai` (was `2.0.0`)
- `@earendil-works/pi-coding-agent`: `0.80.7` (new sidecar)
- OpenSpec CLI: `1.4.1`

### Security and Configuration

- LLM credentials for the sidecar only via `AI_API_BASE_URL` / `AI_API_KEY` / `AI_MODEL`
- Sidecar binds `127.0.0.1:19090` with `X-AI-Agent-Token`
- Cleanup script: `sql/remove-spring-ai-chat.sql`

### Best For

- Admin AI Agent with tool calling instead of single-turn chat
- Projects migrating from Spring AI chat to the Pi Agent product shape

---

## [6.0.0] - 2026-07-11

**Title:** Spring Boot 4.0 / Spring AI 2.0 Major Upgrade

**Release:** [v6.0.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Summary

Upgrades the backend runtime to Spring Boot 4.0.7 and Spring AI 2.0.0, adapts Jackson 3 and modular auto-configuration, and fixes a Spring Security 7 login NPE.

### Highlights

- Spring Boot `3.5.4` → `4.0.7`, Spring AI `1.1.8` → `2.0.0` (breaking)
- Companion upgrades for MyBatis / PageHelper / Druid / springdoc; add Boot 4 `quartz`, `cache`, and `aspectj` starters
- Jackson 3 adaptations for mapper customization and desensitization serializers
- Fix `LoginUser.getAuthorities()` null NPE; surface `BaseException` messages to the client
- Add `.mvn/maven-settings.xml` so local builds can bypass a corporate Nexus mirror

### Dependency Upgrades

- Root project version bumped to `6.0.0`
- `spring-boot.version`: `3.5.4` → `4.0.7`
- `spring-ai.version`: `1.1.8` → `2.0.0`
- `mybatis-spring-boot.version`: `3.0.4` → `4.0.1`
- `pagehelper.boot.version`: `2.1.1` → `4.1.1`
- `druid`: `druid-spring-boot-3-starter:1.2.23` → `druid-spring-boot-4-starter:1.2.28`
- `springdoc.version`: `2.8.9` → `3.0.3`
- `spring-boot-starter-aop` → `spring-boot-starter-aspectj`

### Security and Configuration

- AI settings remain environment-variable driven (`AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL`)
- User-facing exceptions (e.g. captcha) are no longer masked as a generic internal error

### Best For

- Teams adopting Spring Boot 4 / Spring AI 2.0
- Projects migrating from RuoYi AI Quick Starter 5.x

---

## [5.3.3] - 2026-06-30

**Title:** Cloud Agent Release Rules and Mobile Development Docs

**Release:** [v5.3.3 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Summary

A documentation and process patch release capturing Cloud Agent release lessons and adding mobile remote-development guidance.

### Highlights

- Added a "Cloud Agent" section to the `ruoyi-release` skill: remote verification, push code before creating the release, Gitee inline-token push, 429 backoff retry, post-release API verification
- Added a "Cursor iOS + Cloud Agent development" section to the README describing the mobile remote-development flow

### Best For

- Teams doing remote development and dual-platform releases via Cursor Cloud Agent / iOS

---

## [5.3.2] - 2026-06-30

**Title:** README Documentation Polish and Multi-platform Module Info

**Release:** [v5.3.2 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Summary

A documentation patch release that polishes the README so it stays consistent with the current repository structure and versions.

### Highlights

- Added version and tech-stack badges to the README header (version, JDK, Spring Boot, Spring AI, React, License)
- Added concrete version numbers to the tech-stack description; clarified React Native (Expo) on mobile
- Added the missing `ruoyi-rn-app/` (React Native + Expo) module to the project structure
- Added links to `VERSIONS.md` (version list) and `CHANGELOG.md` (changelog) in the docs section

### Best For

- Developers who want a clear view of the tech stack and multi-platform module structure

---

## [5.3.1] - 2026-06-23

**Title:** README Documentation Polish and Release Automation

**Release:** [v5.3.1 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Summary

A documentation and tooling patch release that polishes the README startup guide and adds release automation.

### Highlights

- README AI configuration switched to environment-variable driven setup (`AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL`) to match the actual config
- Fixed incorrect step numbering in the README startup guide
- Added the `ruoyi-release` skill and `/release` command for one-command releases
- Added `create-release.sh` to automatically create Gitee / GitHub releases

### Best For

- Teams wanting a standardized, automated release workflow

---

## [5.3.0] - 2026-06-23

**Title:** Auth Page Refresh, Spring AI 1.1.8 Upgrade, and Frontend Dependency Updates

**Release:** [v5.3.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Summary

This release focuses on a refreshed login/register experience, AI dependency upgrades, frontend component library updates, and OpenSpec 1.4.1 workflow sync.

### Highlights

- New two-column login/register layout with `AuthBrandPanel` brand showcase and responsive design
- Upgraded Spring AI to `1.1.8`; Druid adapted to Spring Boot 4 auto-configuration
- Ant Design upgraded to `6.4.5`, Ant Design X to `2.8.0`
- OpenSpec commands and skills synced to 1.4.1; removed legacy `.cursor/rules/default.mdc`
- Default sidebar theme changed to light (`theme-light`)

### Dependency Upgrades

- Root project version bumped to `5.3.0`
- `spring-ai.version`: `1.1.3` → `1.1.8`
- `antd`: `6.1.4` → `6.4.5`
- `@ant-design/x`: `2.1.3` → `2.8.0`
- `@ant-design/icons`: `6.1.0` → `6.2.5`
- `vite`: `8.0.0` → `8.0.16`
- `@vitejs/plugin-react`: `6.0.1` → `6.0.2`
- OpenSpec CLI: `1.1.1` → `1.4.1`

### Security and Configuration

- AI configuration remains environment-variable driven (`AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL`)
- Removed hardcoded internal API URLs from development configuration

### Best For

- Projects upgrading to Spring AI 1.1.8
- Teams wanting a modern login/register experience
- Teams using OpenSpec 1.4.1 for spec-driven development

---

## [5.2.0] - 2026-03-21

**Title:** Spring AI 1.1.3 Upgrade, Frontend Build Chain Refresh, and Safer Local Configuration

**Release:** [v5.2.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Summary

This release focuses on AI dependency upgrades, a refreshed frontend toolchain, safer environment-based configuration, and repository cleanup for smoother local development.

### Highlights

- Upgraded Spring AI to `1.1.3` to stay aligned with the current Spring Boot 3.5.4 stack
- Refreshed the React Web build toolchain to Vite 8
- Moved AI-related configuration to environment variables to avoid hardcoded credentials
- Stopped tracking the `ai-quick-dev-website` submodule to simplify repository maintenance

### Dependency Upgrades

- Root project version bumped to `5.2.0`
- `spring-ai.version`: `1.1.2` → `1.1.3`
- `vite`: `7.2.7` → `8.0.0`
- `@vitejs/plugin-react`: `4.3.3` → `6.0.1`
- `vite-plugin-svg-icons`: version declaration adjusted for the refreshed frontend dependency set

### Security and Configuration

- AI base URL now reads from the `AI_API_BASE_URL` environment variable
- AI API key now reads from the `AI_API_KEY` environment variable
- AI model selection now reads from the `AI_MODEL` environment variable
- Removed hardcoded credential defaults from local development configuration

### Frontend Build Improvements

- Added Vite `optimizeDeps.include`
- Pre-bundled `react`, `react-dom`, and `react-router-dom`
- Updated `pnpm-lock.yaml` to reflect the new dependency resolution

### Repository Maintenance

- Added ignore rules for local `Claude Code` settings
- Removed git submodule tracking for `ai-quick-dev-website` while keeping the local directory workflow intact

### Best For

- Projects upgrading to Spring AI 1.1.3
- Teams wanting a more stable React + Vite 8 local dev experience
- Environments that want to reduce accidental commits of sensitive local configuration

---

## [5.1.0] - 2026-03-13

**Title:** Comprehensive Security Hardening and Code Quality Improvement

**Release:** [v5.1.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Security Hardening

Based on 61 Code Review findings (8 Critical / 16 High / 22 Medium / 15 Low)

- JWT upgraded: jjwt 0.9.1 → 0.12.6 with expiration claims and stronger keys (64+ bytes Base64)
- All sensitive credentials externalized: DB_PASSWORD, REDIS_PASSWORD, DRUID_PASSWORD, SPRING_AI_OPENAI_API_KEY
- SQL injection vectors blocked via @JsonIgnore
- CORS configured as whitelist
- Druid console disabled in production
- XSS filtering expanded to all endpoints

### Bug Fixes

- Multiple bug fixes across backend and frontend components
- Database indexes added for sys_user, sys_dict_data, sys_config, ai_session_context

---

## [5.0.0] - 2026-03-02

**Title:** MySQL to PostgreSQL Migration

**Release:** [v5.0.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Breaking Changes

- Database migration from MySQL to PostgreSQL
- Removal of MySQL drivers, configuration and dialect support

### AI-Native Capabilities

- Vector retrieval (pgvector)
- JSONB for session context storage
- Full-text search preparation

---

## [4.3.0] - 2026-02-12

**Title:** OpenSpec Upgraded to 1.1.1

### Changed

- OpenSpec upgraded to 1.1.1
- AI assistant instructions and development standards documentation added

---

## [4.2.2] - 2026-02-12

**Title:** Unified Theme Variables for Ant Design v5

### Changed

- Default theme color updated to #1d5ccc
- Sidebar menu indicator added
- Theme color variable synchronization optimized

---

## [4.2.1] - 2026-01-15

**Title:** Repository Structure Reorganization and Naming Unification

### Breaking Changes

- Vue Web version removed
- Multi-end directory naming unified

---

## [4.2.0] - 2026-01-09

**Title:** HarmonyOS Native Application Support

### Added

- HarmonyOS native application support using ArkTS
- Targeting SDK 6.0.2

---

## [4.1.0] - 2026-01-09

**Title:** RuoYi AI Quick Starter v4.1

### Tech Stack

- Backend: Spring Boot 3.5, React 18, Ant Design
- Spring AI 1.1.2 for DeepSeek/OpenAI integration
