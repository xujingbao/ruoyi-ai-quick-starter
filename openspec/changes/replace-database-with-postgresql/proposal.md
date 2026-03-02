## Why

当前项目默认依赖 MySQL，限制了在 PostgreSQL 基础设施环境中的部署与运维统一。项目定位为面向 AI 原生应用开发，需要更好地承载向量检索、半结构化上下文、全文检索与事务一致性等能力；迁移到 PostgreSQL 能同时降低环境异构成本，并充分利用其 AI 相关生态能力（如 `pgvector`、`JSONB`、全文检索）作为统一数据底座。

## What Changes

- **BREAKING**：彻底移除 MySQL 运行支持，不再保留 MySQL 驱动、方言、初始化脚本与配置模板。
- 将后端数据库从 MySQL 驱动与方言切换为 PostgreSQL，对应更新数据源配置与依赖。
- 调整 MyBatis SQL、数据类型映射与分页/关键字兼容性，确保核心业务查询在 PostgreSQL 下行为一致。
- 将初始化脚本、结构迁移与种子数据改为 PostgreSQL 可执行版本。
- 引入 AI 原生能力所需的数据结构基础（向量字段、JSONB 上下文、全文检索索引能力预留）。
- 更新开发环境说明与配置示例，明确 PostgreSQL 本地/测试环境接入方式。

## Capabilities

### New Capabilities
- `postgresql-runtime-support`: 应用可在 PostgreSQL 上稳定启动并完成核心业务读写。
- `postgresql-schema-and-data-bootstrap`: 项目可使用 PostgreSQL 脚本完成库表初始化与基础数据导入。
- `postgresql-ai-native-capabilities`: 项目具备基于 PostgreSQL 的 AI 原生数据能力基础（向量检索、JSONB 上下文存储、全文检索）。

### Modified Capabilities
- *(none)*

## Impact

- 受影响模块：后端数据源配置、持久层 SQL、数据库初始化脚本、环境配置模板。
- 受影响系统：本地开发环境、CI 集成环境、部署环境中的数据库实例。
- 依赖变更：新增/启用 PostgreSQL JDBC 驱动，彻底移除 MySQL 相关驱动与配置依赖。
- 能力影响：为后续检索增强生成（RAG）与 AI 会话上下文管理提供数据库侧基础能力。
