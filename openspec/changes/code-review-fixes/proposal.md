## Why

全面 Code Review 发现 61 个问题（8 Critical / 16 High / 22 Medium / 15 Low），涵盖安全漏洞、代码质量、前端规范等方面。其中 Critical 级别问题（JWT 弱密钥、SQL 注入、文件上传漏洞、密码哈希泄露等）在生产环境中存在被直接利用的风险，需要立即修复。

## What Changes

### 安全加固（P0）
- JWT 密钥改为环境变量注入，Token 增加 `exp` 过期 claim
- AI API Key 移除硬编码，改用环境变量
- `BaseEntity.params.dataScope` 增加 `@JsonIgnore` 防止 SQL 注入
- 文件上传增加路径规范化校验和 magic bytes 内容检测
- `SysUser.password` 增加 `@JsonProperty(WRITE_ONLY)` 防止哈希泄露
- 全局异常处理返回通用错误消息，不再泄露内部信息

### 安全加固（P1）
- 生产环境凭据外部化（数据库/Redis/Druid），各环境独立配置
- Druid 监控控制台在生产环境关闭
- CORS 收紧为可配置白名单
- 登录错误消息统一化，防止用户名枚举
- Quartz 任务调用改为白名单机制
- 升级 jjwt（0.9.1→0.12.x）、Apache POI（4.1.2→最新）

### 代码质量修复
- 所有 Service 的 `@Transactional` 补充 `rollbackFor = Exception.class`
- 修复多处 NPE（SysRoleServiceImpl、CaptchaController、CacheController、SysConfigServiceImpl 等）
- `CacheController.clearCacheAll` 改为按前缀清理，使用 SCAN 替代 KEYS
- `SysUserOnlineController` 使用 SCAN + 分页替代全量加载
- `SysDictTypeServiceImpl` 返回空集合替代 null
- `TokenService` 的 token 前缀处理改用 `substring`
- 修复 `SysUserMapper.xml` INSERT 条件不一致问题
- `IpUtils` 修复 break 缺失和 X-Forwarded-For 信任问题

### 前端修复
- 修复 `request.js` 拦截器缺少 `return` 的 bug
- 修复 `dictStore.getDict` 逻辑恒假的 bug
- 修复 `Editor` 组件双 useEffect 无限循环
- `user/index.jsx` 和 `role/index.jsx` 拆分子组件（低于 800 行）
- 修复 state 直接变异问题（row.status）
- 用户导入结果使用 DOMPurify 替代 dangerouslySetInnerHTML
- 登录页 redirect 参数校验防止开放重定向

### 配置与依赖
- 生产环境日志级别改为 `info`，关闭 DevTools
- XSS 过滤覆盖所有接口
- Druid Wall 关闭 multi-statement-allow
- Swagger 仅在 dev/test 暴露
- SQL 补充常用查询列索引

## Capabilities

### New Capabilities
- `security-hardening`: 安全漏洞修复 — JWT、SQL 注入防护、文件上传安全、凭据外部化、XSS 加固
- `backend-quality-fixes`: 后端代码质量修复 — NPE 防护、事务规范、Redis 操作优化、API 一致性
- `frontend-quality-fixes`: 前端代码质量修复 — React 规范、组件拆分、状态管理、错误处理
- `config-and-deps`: 配置优化与依赖升级 — 环境隔离、依赖版本更新、SQL 索引补充

### Modified Capabilities

## Impact

- **后端**: ruoyi-admin、ruoyi-framework、ruoyi-common、ruoyi-system、ruoyi-quartz 模块的 Controller/Service/Config/Util 层
- **前端**: ruoyi-react-web 的 store、views、components、utils 层
- **配置**: 所有 application-*.yml 配置文件
- **SQL**: 数据库 schema 补充索引
- **依赖**: pom.xml 中 jjwt、POI、UserAgentUtils 等版本升级
- **API**: 错误消息格式变更（不再返回内部异常信息）— **BREAKING**
