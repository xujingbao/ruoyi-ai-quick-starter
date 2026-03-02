## ADDED Requirements

### Requirement: Application shall run on PostgreSQL
系统 MUST 支持通过 PostgreSQL 作为唯一运行数据库完成应用启动、连接初始化与健康状态检查，且不依赖 MySQL 专有驱动或方言配置。

#### Scenario: Startup with PostgreSQL datasource
- **WHEN** 应用使用 PostgreSQL 连接参数启动
- **THEN** 应用应成功初始化数据源并进入可服务状态

### Requirement: MySQL runtime support shall be fully removed
系统 MUST 完整移除 MySQL 运行支持，包括驱动依赖、数据源配置入口与方言相关开关，避免生产环境出现双数据库歧义配置。

#### Scenario: Startup with MySQL configuration
- **WHEN** 应用使用 MySQL 连接参数或 MySQL profile 启动
- **THEN** 系统应明确报错并拒绝以 MySQL 模式运行

### Requirement: Persistence layer shall be PostgreSQL-compatible
系统 MUST 保证核心 MyBatis 查询与写入语句在 PostgreSQL 下可执行，避免使用 PostgreSQL 不支持的 MySQL 专有语法。

#### Scenario: Core query execution
- **WHEN** 业务模块发起核心查询与分页请求
- **THEN** 相关 SQL 应在 PostgreSQL 下返回与原有业务语义一致的结果

### Requirement: Transaction behavior shall remain consistent
系统 SHALL 在 PostgreSQL 下保持现有事务边界与回滚语义，确保失败操作不会产生部分提交。

#### Scenario: Transaction rollback on failure
- **WHEN** 一个事务内的后续操作发生异常
- **THEN** 事务内已执行写操作应被完整回滚
