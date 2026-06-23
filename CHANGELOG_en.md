# Changelog

All notable changes to this project will be documented in this file.

## [5.3.0] - 2026-06-23

**Title:** Auth Page Refresh, Spring AI 1.1.8 Upgrade, and Frontend Dependency Updates

**Release:** [v5.3.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Summary

This release focuses on a refreshed login/register experience, AI dependency upgrades, frontend component library updates, and OpenSpec 1.2.0 workflow sync.

### Highlights

- New two-column login/register layout with `AuthBrandPanel` brand showcase and responsive design
- Upgraded Spring AI to `1.1.8`; Druid adapted to Spring Boot 4 auto-configuration
- Ant Design upgraded to `6.4.5`, Ant Design X to `2.8.0`
- OpenSpec commands and skills synced to 1.2.0; removed legacy `.cursor/rules/default.mdc`
- Default sidebar theme changed to light (`theme-light`)

### Dependency Upgrades

- Root project version bumped to `5.3.0`
- `spring-ai.version`: `1.1.3` → `1.1.8`
- `antd`: `6.1.4` → `6.4.5`
- `@ant-design/x`: `2.1.3` → `2.8.0`
- `@ant-design/icons`: `6.1.0` → `6.2.5`
- `vite`: `8.0.0` → `8.0.16`
- `@vitejs/plugin-react`: `6.0.1` → `6.0.2`

### Security and Configuration

- AI configuration remains environment-variable driven (`AI_API_BASE_URL`, `AI_API_KEY`, `AI_MODEL`)
- Removed hardcoded internal API URLs from development configuration

### Best For

- Projects upgrading to Spring AI 1.1.8
- Teams wanting a modern login/register experience
- Teams using OpenSpec 1.2.0 for spec-driven development

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
