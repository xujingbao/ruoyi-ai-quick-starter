## Context

项目后端基于 Spring Boot + MyBatis，当前默认以 MySQL 为主要运行数据库，并在配置、依赖、SQL 语法与初始化脚本中存在 MySQL 绑定。该变更需要将运行时数据库替换为 PostgreSQL，同时保证核心业务读写行为与现有接口契约保持一致。

约束包括：不引入业务语义变化、不更改外部 API 合约、兼容开发与部署环境的配置切换，并控制迁移风险（数据类型、关键字、分页语法、函数差异）。此外，项目定位 AI 原生应用，数据库层需要为向量检索、会话上下文组织与文本检索能力预留标准化结构。

## Goals / Non-Goals

**Goals:**
- 应用在 PostgreSQL 环境下可稳定启动，核心业务读写与事务行为正常。
- MyBatis 映射与 SQL 适配 PostgreSQL，消除 MySQL 方言依赖点。
- 初始化与迁移脚本可在 PostgreSQL 上执行，支持新环境快速落库。
- 配置层清晰支持 PostgreSQL，便于本地与环境部署。
- 为 AI 场景提供数据库基础能力：向量字段与索引扩展点、JSONB 上下文存储、全文检索能力预留。
- 彻底移除 MySQL 运行与构建相关资产（依赖、配置、脚本、模板），避免双数据库长期并存。

**Non-Goals:**
- 不在本次变更中同时兼容双数据库在线写入。
- 不进行领域模型重构或业务规则调整。
- 不覆盖性能专项优化（仅保证功能正确与可运行）。

## Decisions

- **决策 1：以 PostgreSQL 作为默认目标数据库，移除 MySQL 专属运行依赖。**  
  原因：目标是完成数据库替换，而不是多数据库并行支持。  
  备选：保留 MySQL 与 PostgreSQL 双驱动并通过 profile 切换；放弃原因是配置和测试矩阵显著扩大。

- **决策 2：按“配置层 -> SQL 兼容层 -> 脚本层”分层迁移。**  
  原因：可分段验证并快速定位回归点。  
  备选：一次性全量修改；放弃原因是风险集中、回滚困难。

- **决策 3：对 SQL 方言差异采用显式修正，不引入额外 ORM 迁移框架。**  
  原因：项目已基于 MyBatis，局部 SQL 调整成本更低，改动更可控。  
  备选：引入新迁移框架统一方言；放弃原因是学习与落地成本高、短期收益低。

- **决策 4：初始化脚本采用 PostgreSQL 原生语法重写并保持幂等执行。**  
  原因：保障环境快速重建与重复执行安全。  
  备选：运行时动态转换 MySQL 脚本；放弃原因是不可预期转换错误高。

- **决策 5：在迁移阶段同步引入 AI 能力基础结构，优先“能力预留”而非一次性业务绑定。**  
  原因：项目面向 AI 原生应用，需尽早统一底层能力模型，同时控制首期复杂度。  
  备选：仅完成数据库替换，AI 结构后置；放弃原因是后续重复迁移成本高、数据模型容易碎片化。

- **决策 6：采用 PostgreSQL 原生能力组合（`pgvector` + `JSONB` + 全文检索）作为标准技术路线。**  
  原因：同库内可兼顾结构化与非结构化检索，减少多存储系统同步复杂度。  
  备选：额外引入独立向量数据库；放弃原因是运维复杂度和一致性成本更高。

## Risks / Trade-offs

- [SQL 方言差异导致隐性查询错误] → 通过梳理关键 Mapper、优先覆盖高频 SQL 并逐步修正。
- [数据类型映射变化（如时间、布尔、自增）引起兼容问题] → 明确字段映射策略并在初始化阶段做结构校验。
- [部署环境仍依赖 MySQL 参数模板] → 同步更新配置示例和环境变量说明，避免错误发布。
- [彻底移除后短期无法直接回退 MySQL] → 在切换前完成全量备份与预发全链路验证，回滚以版本回退+数据恢复为主。
- [AI 能力引入后索引与存储成本上升] → 先按核心表建立最小化索引，后续依据访问模式迭代优化。

## Migration Plan

1. 更新依赖与数据源配置，接入 PostgreSQL 驱动与连接参数。
2. 修正 MyBatis 语句中的方言差异（关键字、分页、函数、类型转换）。
3. 重写数据库初始化脚本为 PostgreSQL 版本，并验证幂等执行。
4. 增加 AI 能力基础结构（向量字段/索引、JSONB 上下文列、全文检索索引）并完成向后兼容校验。
5. 对核心业务路径做联调验证（启动、登录、查询、写入、事务回滚）以及 AI 检索基础路径验证。
6. 清理并删除 MySQL 相关运行资产（依赖、配置、脚本、模板、文档）。
7. 发布时先在预发环境完成全链路验证，再切换生产数据库配置。

回滚策略：以发布版本回退和数据备份恢复为主，不依赖运行时切回 MySQL。

## Transaction Consistency Review

- 已完成代码级事务边界审查，重点覆盖 `@Transactional` 写路径方法：
  - `SysUserServiceImpl`（用户/角色/岗位关联写入与删除）
  - `SysRoleServiceImpl`（角色、角色菜单、角色数据权限）
  - `SysDictTypeServiceImpl`（字典类型与字典数据联动更新）
  - `SysJobServiceImpl`（任务状态变更与调度器操作，`rollbackFor = Exception.class`）
- 当前实现未使用 MySQL 专有事务语义或隔离级别参数，事务注解依赖 Spring 默认事务管理，数据库切换到 PostgreSQL 后语义保持一致。
- 联调阶段需重点确认两类回滚行为：
  1. 业务表+关联表批量写入异常时是否整体回滚。
  2. Quartz 任务状态持久化与调度器操作异常时是否按预期回滚/补偿。

## PostgreSQL Migration Runbook

1. 准备数据库：
   - 创建 `ry_demo` 数据库（UTF-8）。
   - 准备账号权限（建议 `postgres` 或具备 DDL/DML 权限的应用账号）。
2. 执行初始化脚本（按顺序）：
   - `sql/ry-demo-postgresql.sql`
   - `sql/quartz-postgresql.sql`
   - `sql/ai-postgresql.sql`（启用 AI 能力时执行）
3. 初始化后执行序列对齐校验（防止主键冲突）：
   - 校验关键表 `MAX(id)` 与对应序列 `last_value` 是否一致（如 `sys_post`、`sys_config`、`sys_user`、`sys_menu`）。
   - 若不一致，执行 `setval` 按各表 `MAX(id)` 对齐，再进行应用写入联调。
   - 建议保留通用对齐 SQL（遍历 `column_default like 'nextval(%'` 的列自动修复）。
4. 更新应用配置：
   - `application-dev.yml` / `application-test.yml` / `application-prod.yml` 连接串统一为 PostgreSQL。
   - 确认 `driverClassName=org.postgresql.Driver`、`pagehelper.helperDialect=postgresql`。
5. 启动应用并做最小可用验证：
   - 登录、用户查询、角色管理、菜单查询、字典查询、定时任务列表。
6. 验证失败时处理：
   - 优先检查 SQL 脚本对象是否完整落库（表、索引、约束、扩展）。
   - 再检查连接参数/权限/schema，以及序列是否已对齐。
7. 切换发布：
   - 预发通过后切生产，保留数据库备份与应用版本回退包。

## AI Capability Integration Checklist

- 向量能力（pgvector）：
  - 已启用 `CREATE EXTENSION IF NOT EXISTS vector;`
  - 校验 `ai_knowledge_chunk.embedding vector(1024)` 字段及 `ivfflat` 索引存在。
- 上下文能力（JSONB）：
  - 校验 `ai_knowledge_chunk.metadata` 与 `ai_session_context.context_data` 为 `jsonb`。
  - 校验 GIN 索引可用（`idx_ai_chunk_metadata_gin`、`idx_ai_session_context_gin`）。
- 全文检索能力（FTS）：
  - 校验 `ai_knowledge_chunk.tsv` 生成列存在与 GIN 索引可用（`idx_ai_chunk_tsv_gin`）。
- 推荐联调 SQL（开发阶段）：
  - `SELECT COUNT(*) FROM ai_knowledge_chunk;`
  - `SELECT biz_key FROM ai_knowledge_chunk ORDER BY embedding <=> $1 LIMIT 5;`
  - `SELECT session_id FROM ai_session_context WHERE context_data @> '{\"channel\":\"web\"}'::jsonb;`
  - `SELECT chunk_id FROM ai_knowledge_chunk WHERE tsv @@ plainto_tsquery('simple', '权限管理');`

## Open Questions

- 现网是否存在依赖 MySQL 特有函数/索引特性的 SQL，需逐项清单化确认。
- AI 向量维度、相似度度量方式（cosine/L2）是否需要在首期统一规范并固化到数据模型。
