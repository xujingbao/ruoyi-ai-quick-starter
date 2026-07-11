## ADDED Requirements

### Requirement: Spring Boot 4 runtime baseline
项目后端 MUST 基于 Spring Boot `4.0.7` 构建与运行，并使用与 Boot 4 兼容的数据访问、连接池与 OpenAPI starter。

#### Scenario: Dependency versions aligned
- **WHEN** 查看根 `pom.xml` 的版本属性与 dependencyManagement
- **THEN** `spring-boot.version` 为 `4.0.7`
- **AND** MyBatis Spring Boot Starter 为 `4.0.x`
- **AND** PageHelper Spring Boot Starter 为 `4.x`
- **AND** Druid 使用 `druid-spring-boot-4-starter`
- **AND** springdoc 为 `3.x`

#### Scenario: Application compiles against Boot 4 packages
- **WHEN** 执行后端 Maven compile
- **THEN** 构建成功
- **AND** `DataSourceAutoConfiguration` 等 Boot 4 迁移后的包路径可正确解析
