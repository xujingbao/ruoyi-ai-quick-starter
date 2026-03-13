## Context

ruoyi-ai-quick-starter 是基于 RuoYi 框架的 AI 快速开发启动器，技术栈为 Spring Boot 3.x + MyBatis + React 18 + Ant Design + PostgreSQL。Code Review 发现 61 个问题，其中安全漏洞占比最高，多个 Critical 级别问题可导致系统被完全接管。项目目前处于开发阶段，但部分配置已区分 dev/test/prod 三套环境，说明有上线意图。

当前主要痛点：
1. 安全基础设施薄弱（JWT、文件上传、SQL 注入防护均存在设计缺陷）
2. 凭据管理不规范（密钥/密码硬编码在版本控制中）
3. 前后端均存在可导致运行时异常的 bug
4. 前端部分页面超出 800 行规范

## Goals / Non-Goals

**Goals:**
- 修复所有 8 个 Critical 安全漏洞，消除系统被接管风险
- 修复所有 16 个 High 级别问题，达到基本生产部署标准
- 修复影响运行时稳定性的 Medium 级别 bug（NPE、逻辑错误等）
- 前端页面拆分至 800 行以内，符合项目规范
- 敏感凭据全部外部化，不再出现在版本控制中

**Non-Goals:**
- 不做全面的架构重构（如 AjaxResult 改为 POJO、SysUser 领域模型分层）
- 不做 @Autowired → 构造器注入的全量改造（涉及文件过多，可作为独立 Change）
- 不升级 Spring Boot 主版本
- 不新增单元测试
- 不改动业务功能逻辑

## Decisions

### D1: JWT 改造方案 — 升级 jjwt 到 0.12.x + 环境变量注入密钥

**选项 A**: 仅更换密钥值 → 治标不治本，deprecated API 仍在
**选项 B**: 升级 jjwt 到 0.12.x，使用新 API + 生成强密钥 → 一次性解决密钥强度、过期时间、废弃 API 三个问题
**决定**: 选项 B。升级 jjwt 版本，使用 `Keys.hmacShaKeyFor()` 生成密钥对象，`Jwts.builder().expiration()` 设置过期时间。密钥通过 `${JWT_SECRET}` 环境变量注入，配置文件中提供默认开发密钥（64+ 字节 Base64 编码）。

### D2: SQL 注入防护 — @JsonIgnore 标注 params.dataScope

**选项 A**: 在 DataScopeAspect 中清除客户端传入的 dataScope → 需要修改 AOP 逻辑
**选项 B**: 在 BaseEntity.setParams 上加 @JsonIgnore → 简单直接，阻断输入源
**选项 C**: 自定义 Jackson Deserializer 过滤 dataScope key → 过度设计
**决定**: 选项 B + 防御补充。在 `setParams` 上加 `@JsonIgnore` 阻断 JSON 反序列化注入。同时在 DataScopeAspect 执行前清除 `params` 中的 `dataScope` 作为纵深防御。

### D3: 文件上传安全 — 路径规范化 + Content-Type 校验

在 `FileUploadUtils.upload()` 方法返回前增加 `file.getCanonicalPath().startsWith(baseDir)` 校验。增加 magic bytes 检测方法，对图片上传场景校验文件头。不引入外部库，利用已有的 `getFileExtendName` 方法增强。

### D4: 全局异常处理 — 通用消息 + 内部日志

`RuntimeException` 和 `Exception` handler 返回固定的 "系统内部错误，请联系管理员" 消息。原始异常信息仅记录在服务端日志中。这是 **BREAKING** 变更，前端需要适配不再依赖服务端返回的具体错误文本。

### D5: 凭据外部化策略

所有环境配置文件中的密码/密钥改为 `${ENV_VAR:defaultValue}` 格式：
- dev 环境保留默认值方便本地开发
- test/prod 环境不设默认值，强制从环境变量读取
- 已泄露的 API Key 需立即轮换

### D6: 前端组件拆分策略

`user/index.jsx` 拆分为：UserQueryForm、UserTable、UserFormModal、UserImportModal
`role/index.jsx` 拆分为：RoleQueryForm、RoleTable、RoleFormModal、RoleDataScopeModal
主文件保留状态管理和数据流编排，子组件通过 props 接收数据和回调。

### D7: Quartz 任务安全 — 白名单机制

在 `ScheduleUtils` 或 `JobInvokeUtil` 中维护允许调用的 Bean 白名单。新增 `@AllowedTask` 注解标注可被调度的 Bean。不允许通过 `Class.forName` 加载未注册的类。

## Risks / Trade-offs

- **[jjwt 升级]** → 升级到 0.12.x 后 API 变动较大，需要同时修改 createToken、parseToken、getToken 三个方法。**缓解**: 变更范围集中在 TokenService 一个类中。
- **[异常消息变更 BREAKING]** → 前端可能依赖服务端返回的具体异常消息做业务判断。**缓解**: 保留 `ServiceException` 的消息传递（这些是业务异常），仅屏蔽 RuntimeException/Exception 的原始消息。
- **[凭据外部化]** → 开发者首次 clone 后需要配置环境变量才能启动。**缓解**: dev 环境保留合理的默认值，README 中增加环境变量说明。
- **[前端组件拆分]** → 拆分后组件间的状态传递增加复杂度。**缓解**: 使用提升状态到父组件 + props 下传的标准 React 模式，不引入新的状态管理方案。
- **[依赖升级]** → POI、jjwt 等升级可能引入 API 变更。**缓解**: 逐个升级，编译验证。
