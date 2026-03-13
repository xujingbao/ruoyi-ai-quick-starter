## ADDED Requirements

### Requirement: JWT 密钥强度与环境变量注入
系统 SHALL 使用至少 64 字节的 Base64 编码密钥签发 JWT Token，密钥 SHALL 通过环境变量 `JWT_SECRET` 注入，配置文件中 dev 环境可保留默认开发密钥。

#### Scenario: JWT 使用强密钥签名
- **WHEN** TokenService 创建 JWT Token
- **THEN** 使用 HS512 算法且密钥长度不低于 512 bits（64 字节）

#### Scenario: 密钥从环境变量读取
- **WHEN** 应用启动且环境变量 `JWT_SECRET` 已设置
- **THEN** 使用该环境变量值作为 JWT 签名密钥

### Requirement: JWT Token 包含过期时间
系统 SHALL 在 JWT Token 中设置 `exp` claim，过期时间与 Redis TTL 一致。

#### Scenario: Token 携带 exp claim
- **WHEN** TokenService 创建新 Token
- **THEN** JWT payload 中包含 `exp` 字段，值为当前时间 + 配置的过期分钟数

#### Scenario: 过期 Token 被拒绝
- **WHEN** 客户端使用已过期的 JWT Token 请求受保护接口
- **THEN** 返回 401 未授权响应

### Requirement: jjwt 升级到 0.12.x
系统 SHALL 使用 jjwt 0.12.x 版本的新 API（`Jwts.builder().signWith(key)`、`Jwts.parser().verifyWith(key)`），不再使用已废弃的 `signWith(SignatureAlgorithm, String)` 和 `setSigningKey(String)` 方法。

#### Scenario: 使用现代 jjwt API
- **WHEN** 编译 TokenService
- **THEN** 不存在对已废弃方法 `signWith(SignatureAlgorithm, String)` 或 `setSigningKey(String)` 的调用

### Requirement: AI API Key 不出现在版本控制中
配置文件 SHALL 不包含硬编码的 AI API Key，SHALL 通过 `${SPRING_AI_OPENAI_API_KEY}` 环境变量注入。

#### Scenario: API Key 外部化
- **WHEN** 查看 application-dev.yml
- **THEN** `api-key` 字段值为 `${SPRING_AI_OPENAI_API_KEY}` 而非明文密钥

### Requirement: BaseEntity.params 防 SQL 注入
`BaseEntity` 的 `params` 字段 SHALL 不接受来自客户端 JSON 的 `dataScope` 值，防止通过 `${params.dataScope}` 插值注入 SQL。

#### Scenario: 客户端无法注入 dataScope
- **WHEN** 客户端发送包含 `{"params":{"dataScope":"OR 1=1"}}` 的 JSON 请求
- **THEN** `dataScope` 不被反序列化到 BaseEntity.params 中

#### Scenario: DataScopeAspect 正常工作
- **WHEN** 标注了 @DataScope 的接口被调用
- **THEN** DataScopeAspect 仍能正确设置 dataScope 进行数据权限过滤

### Requirement: 文件上传路径规范化校验
`FileUploadUtils` SHALL 在保存文件后验证最终路径在允许的上传目录内，防止路径穿越。

#### Scenario: 路径穿越被拒绝
- **WHEN** 上传文件名包含 `../` 路径穿越序列
- **THEN** 系统抛出异常拒绝保存

#### Scenario: 正常文件上传成功
- **WHEN** 上传合法文件名的文件
- **THEN** 文件保存在配置的上传目录内

### Requirement: 文件上传内容类型校验
对图片类型的上传 SHALL 校验文件头 magic bytes 与声明的扩展名一致。

#### Scenario: 伪装图片被拒绝
- **WHEN** 上传扩展名为 .jpg 但文件头不是 JPEG magic bytes 的文件
- **THEN** 系统拒绝上传并返回错误

### Requirement: 用户密码哈希不暴露在 API 响应中
`SysUser` 的 `password` 字段 SHALL 标注 `@JsonProperty(access = WRITE_ONLY)`，确保序列化到 JSON 时被排除。

#### Scenario: 用户列表不含密码
- **WHEN** 调用 /system/user/list 接口
- **THEN** 响应 JSON 中每个用户对象不包含 `password` 字段

### Requirement: 全局异常处理不泄露内部信息
`GlobalExceptionHandler` 中 `RuntimeException` 和 `Exception` 的处理 SHALL 返回通用错误消息，不返回 `e.getMessage()`。`ServiceException` 保持返回业务消息。

#### Scenario: RuntimeException 返回通用消息
- **WHEN** 接口抛出 RuntimeException
- **THEN** API 返回 `{"msg": "系统内部错误，请联系管理员"}` 而非异常原始消息

#### Scenario: ServiceException 返回业务消息
- **WHEN** 接口抛出 ServiceException("用户不存在")
- **THEN** API 返回 `{"msg": "用户不存在"}`

### Requirement: CORS 限制为配置白名单
`ResourcesConfig` 的 CORS 配置 SHALL 不使用 `*` 通配符，SHALL 从配置文件读取允许的源地址列表。

#### Scenario: 非白名单源被拒绝
- **WHEN** 从未配置的域名发起跨域请求
- **THEN** 请求被 CORS 策略拒绝

### Requirement: Druid 控制台在生产环境关闭
`application-prod.yml` 中 Druid 的 `statViewServlet` SHALL 设置 `enabled: false`。

#### Scenario: 生产环境不暴露 Druid
- **WHEN** 使用 prod 配置启动应用
- **THEN** 访问 /druid/* 返回 404

### Requirement: 凭据外部化
所有环境配置文件中的数据库密码、Redis 密码 SHALL 使用 `${ENV_VAR}` 格式，dev 环境可提供默认值 `${ENV_VAR:default}`，test/prod 不设默认值。

#### Scenario: prod 环境缺少环境变量启动失败
- **WHEN** 使用 prod 配置启动但未设置 DB_PASSWORD 环境变量
- **THEN** 应用启动失败并提示缺少配置

### Requirement: 登录错误消息统一
`UserDetailsServiceImpl` 对于用户不存在、已删除、已停用等情况 SHALL 返回相同的通用错误消息，防止用户名枚举。

#### Scenario: 不存在的用户名
- **WHEN** 使用不存在的用户名登录
- **THEN** 返回通用消息"用户名或密码错误"

#### Scenario: 已停用的用户名
- **WHEN** 使用已停用的用户名登录
- **THEN** 返回相同的通用消息"用户名或密码错误"

### Requirement: Quartz 任务白名单机制
`JobInvokeUtil` SHALL 仅允许调用白名单中注册的 Bean，不允许通过 `Class.forName` 调用任意类。

#### Scenario: 白名单内 Bean 可执行
- **WHEN** 调度任务指定的 Bean 在白名单中
- **THEN** 任务正常执行

#### Scenario: 白名单外 Bean 被拒绝
- **WHEN** 调度任务指定的 Bean 不在白名单中
- **THEN** 任务执行被拒绝并记录告警日志

### Requirement: XSS 过滤全覆盖
`application.yml` 的 XSS 过滤 `urlPatterns` SHALL 配置为 `/*` 覆盖所有接口。

#### Scenario: AI 接口也受 XSS 保护
- **WHEN** 向 /ai/chat 接口发送包含 `<script>` 标签的请求
- **THEN** XSS 过滤器对输入进行清理

### Requirement: Druid Wall 禁止多语句 SQL
所有环境配置中 Druid Wall 的 `multi-statement-allow` SHALL 设置为 `false`。

#### Scenario: 多语句 SQL 被拦截
- **WHEN** 应用尝试执行包含分号分隔的多条 SQL 语句
- **THEN** Druid Wall 拦截并拒绝执行

### Requirement: Token 前缀处理使用 substring
`TokenService.getToken()` SHALL 使用 `substring` 而非 `replace` 移除 Token 前缀，避免误替换 Token 内容。

#### Scenario: Token 内容不被损坏
- **WHEN** JWT Token 的 payload 碰巧包含与前缀相同的字符串
- **THEN** 仅移除开头的 Bearer 前缀，Token 内容保持完整

### Requirement: IP 获取安全加固
`IpUtils` SHALL 不直接信任 `X-Forwarded-For` 头的第一个值，并修复 `internalIp` 方法缺失的 `break` 语句。

#### Scenario: internalIp 正确判断
- **WHEN** 传入 192.168.1.1 的 IP 地址
- **THEN** 正确返回 true 表示内网 IP
