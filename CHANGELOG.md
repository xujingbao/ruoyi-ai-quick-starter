# Changelog

All notable changes to this project will be documented in this file.

## [5.2.0] - 2026-03-21

### Changed
- **Spring AI**: 升级至 1.1.3（原 1.1.2）
- **前端依赖**: 升级多个开发依赖
  - `@vitejs/plugin-react`: 4.3.3 → 6.0.1
  - `vite`: 7.2.7 → 8.0.0
  - `vite-plugin-svg-icons`: 2.0.1

### Fixed
- **配置安全**: API 密钥从环境变量读取，避免硬编码
  - `AI_API_BASE_URL`: API 基础 URL
  - `AI_API_KEY`: API 密钥
  - `AI_MODEL`: 模型名称

### Added
- **Vite 配置**: 新增 `optimizeDeps` 配置优化依赖预构建

## [5.1.0] - 2026-03-19

### Changed
- **安全加固**: 凭据外部化、CORS 配置、登录防枚举
- **代码质量**: NPE 防护、事务规范、类型安全
- **SQL 优化**: Schema 索引补充、类型统一

### Fixed
- 修复 Critical 级别安全漏洞
- 前后端代码质量修复

## [5.0.0] - 2026-03

### Added
- 迁移至 PostgreSQL
- 集成 Spring AI
- 支持 Flux 流式响应
- MarkdownRender 流式渲染
