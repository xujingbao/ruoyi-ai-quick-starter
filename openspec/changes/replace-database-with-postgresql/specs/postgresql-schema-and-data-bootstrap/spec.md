## ADDED Requirements

### Requirement: PostgreSQL schema bootstrap shall be executable
系统 MUST 提供 PostgreSQL 可执行的库表初始化脚本，支持在空库环境中一次性完成结构创建。

#### Scenario: Initialize schema on empty database
- **WHEN** 在空 PostgreSQL 数据库执行初始化脚本
- **THEN** 所有必需表结构与约束应创建成功且无语法错误

### Requirement: MySQL bootstrap assets shall be removed
系统 MUST 移除 MySQL 初始化脚本与相关模板，避免误执行非目标数据库脚本。

#### Scenario: Bootstrap assets inspection
- **WHEN** 检查数据库初始化目录与部署模板
- **THEN** 仅应存在 PostgreSQL 版本脚本和对应说明，不应存在 MySQL 执行入口

### Requirement: Seed data bootstrap shall be deterministic
系统 SHALL 提供 PostgreSQL 兼容的基础数据导入脚本，并保证重复执行时不会产生破坏性冲突。

#### Scenario: Re-run seed script
- **WHEN** 重复执行基础数据脚本
- **THEN** 数据导入应保持幂等或可控更新，不产生重复主数据或执行失败

### Requirement: Data type mapping shall be explicitly defined
系统 MUST 明确关键字段类型在 PostgreSQL 下的映射规则（如布尔、时间、主键增长方式），避免运行时隐式转换错误。

#### Scenario: Validate mapped column types
- **WHEN** 应用基于初始化后的 PostgreSQL 结构执行读写
- **THEN** 关键字段读写应无类型转换异常且结果符合业务预期
