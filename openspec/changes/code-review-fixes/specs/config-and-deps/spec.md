## ADDED Requirements

### Requirement: 生产环境日志级别为 info
`application-prod.yml` 的 `com.ruoyi` 包日志级别 SHALL 设置为 `info` 而非 `debug`。

#### Scenario: 生产环境不输出 debug 日志
- **WHEN** 使用 prod 配置启动
- **THEN** com.ruoyi 包的日志级别为 info

### Requirement: 生产环境关闭 DevTools
`application-prod.yml` 的 Spring DevTools `enabled` SHALL 设置为 `false`。

#### Scenario: 生产环境无热重载
- **WHEN** 使用 prod 配置启动
- **THEN** devtools.restart.enabled 为 false

### Requirement: Swagger 仅在非生产环境暴露
SecurityConfig 中 Swagger 相关路径 SHALL 仅在 dev/test 环境 permitAll，prod 环境不暴露。

#### Scenario: 生产环境无法访问 Swagger
- **WHEN** 使用 prod 配置启动后访问 /swagger-ui.html
- **THEN** 返回 401 或 403

### Requirement: Apache POI 升级
`pom.xml` 中 POI 版本 SHALL 从 4.1.2 升级到最新稳定版本，修复已知 CVE。

#### Scenario: POI 无已知漏洞
- **WHEN** 运行 mvn dependency:check
- **THEN** POI 依赖无 Critical/High CVE

### Requirement: UserAgentUtils 替换
`bitwalker.UserAgentUtils` SHALL 替换为活跃维护的 User-Agent 解析库。

#### Scenario: 现代浏览器正确识别
- **WHEN** Chrome 120+ 的 User-Agent 被解析
- **THEN** 浏览器名称和版本正确

### Requirement: 移除未使用的 swagger.version 属性
根 `pom.xml` 中未使用的 `swagger.version` 属性 SHALL 被移除。

#### Scenario: pom.xml 无死代码
- **WHEN** 搜索 pom.xml 中 swagger.version 的引用
- **THEN** 无任何引用

### Requirement: javax.xml.bind 迁移到 Jakarta
`pom.xml` 中的 `javax.xml.bind:jaxb-api` SHALL 替换为 Jakarta 对应依赖。

#### Scenario: 使用 Jakarta XML 绑定
- **WHEN** 检查依赖树
- **THEN** 不存在 javax.xml.bind 依赖

### Requirement: SQL 补充常用查询列索引
`ry-demo-postgresql.sql` SHALL 为以下列创建索引：`sys_user.user_name`、`sys_user.dept_id`、`sys_dict_data.dict_type`、`sys_config.config_key`。

#### Scenario: 用户名查询使用索引
- **WHEN** 执行 SELECT * FROM sys_user WHERE user_name = 'admin'
- **THEN** 查询计划使用 idx_sys_user_user_name 索引

### Requirement: AI 会话表补充 user_id 索引
`ai-postgresql.sql` 的 `ai_session_context` 表 SHALL 为 `user_id` 列创建索引。

#### Scenario: 用户会话查询使用索引
- **WHEN** 查询某用户的所有会话
- **THEN** 查询计划使用 user_id 索引

### Requirement: serial 类型统一为 bigserial
所有 SQL 建表脚本中的主键类型 SHALL 统一使用 `bigserial`。

#### Scenario: 所有主键为 bigserial
- **WHEN** 检查所有 CREATE TABLE 语句
- **THEN** 主键列类型均为 bigserial

### Requirement: Quartz SQL 移除重复 COMMIT
`quartz-postgresql.sql` SHALL 移除重复的 COMMIT 语句。

#### Scenario: 无多余 COMMIT
- **WHEN** 执行 quartz SQL 脚本
- **THEN** 不产生"there is no transaction in progress"警告

### Requirement: RyTask 使用 SLF4J 日志
`RyTask` 的所有方法 SHALL 使用 SLF4J Logger 替代 `System.out.println`。

#### Scenario: 任务日志可被日志框架管理
- **WHEN** 定时任务执行
- **THEN** 输出通过 SLF4J Logger 记录，可被日志级别控制

### Requirement: FileUtils NPE 防护
`FileUtils.setFileDownloadHeader` 在 User-Agent 头为 null 时 SHALL 不抛 NPE。

#### Scenario: 无 User-Agent 头的请求
- **WHEN** 客户端不发送 User-Agent 头
- **THEN** 使用 URL 编码的文件名作为默认值

### Requirement: FileUtils.getFileExtendName 边界检查
`getFileExtendName` 在字节数组长度不足时 SHALL 返回默认值而非抛出 ArrayIndexOutOfBoundsException。

#### Scenario: 小文件不抛异常
- **WHEN** 传入长度小于 10 的字节数组
- **THEN** 返回默认扩展名 "jpg"

### Requirement: FileUploadUtils 数组比较修复
`isAllowedExtension` 方法中的异常类型判断 SHALL 使用 `Arrays.equals()` 替代 `==`。

#### Scenario: 复制的数组也能正确匹配
- **WHEN** 传入与 IMAGE_EXTENSION 内容相同但不同引用的数组
- **THEN** 仍正确抛出 InvalidImageExtensionException

### Requirement: SecurityContextHolder 策略安全
`SecurityConfig` SHALL 不使用 `MODE_INHERITABLETHREADLOCAL`，改用 `DelegatingSecurityContextRunnable` 进行显式上下文传播。

#### Scenario: 线程池不串用安全上下文
- **WHEN** 线程池线程复用处理不同用户请求
- **THEN** 每个请求使用正确的安全上下文
