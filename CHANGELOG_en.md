# Changelog

All notable changes to this project will be documented in this file.

## [5.2.0] - 2026-03-21

**Title:** Upgrade Vite8 and Spring AI 1.1.3

**Release:** [v5.2.0 Release](https://gitee.com/xujingbao/ruoyi-ai-quick-starter/releases)

### Changed

- Spring AI upgraded to 1.1.3
- Vite 7.2.7 → 8.0.0
- @vitejs/plugin-react 4.3.3 → 6.0.1
- OpenSpec 1.1.1 → 1.2.0
- API keys moved to environment variables, eliminating hardcoded credentials
- Vite optimization configuration added
- ai-quick-dev-website submodule removed

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
