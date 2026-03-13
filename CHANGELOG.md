# 更新日志

本项目的所有重要更改都将记录在此文件中。

## [5.1.0] - 2026-03-13

### 版本定位
- 全面安全加固与代码质量提升版本。基于 Code Review 发现的 61 个问题（8 Critical / 16 High / 22 Medium / 15 Low），系统性修复安全漏洞、运行时 Bug 和代码规范问题。

### 破坏性变更（Breaking Changes）
- **JWT 升级**: jjwt 从 0.9.1 升级到 0.12.6，密钥格式变为 Base64 编码，需通过环境变量 `JWT_SECRET` 注入（dev 环境保留默认值）。
- **API Key 外部化**: AI API Key 不再硬编码，需通过 `SPRING_AI_OPENAI_API_KEY` 环境变量注入。
- **凭据外部化**: 数据库密码（`DB_PASSWORD`）、Redis 密码（`REDIS_PASSWORD`）、Druid 密码（`DRUID_PASSWORD`）均改为环境变量注入，test/prod 环境无默认值。
- **异常消息变更**: `RuntimeException`/`Exception` 不再返回原始异常消息，统一返回"系统内部错误，请联系管理员"。`ServiceException` 业务消息保持不变。
- **登录消息统一**: 用户不存在、已删除、已停用等场景统一返回"用户名或密码错误"，防止用户名枚举。
- **Quartz 任务**: 禁止通过全类名（`Class.forName`）调用任务，仅允许 Spring Bean 名称调用。
- **javax.xml.bind 移除**: 随 jjwt 升级不再需要 jaxb-api 依赖。

### 安全修复
- JWT Token 增加 `exp` 过期 claim，不再完全依赖 Redis TTL。
- JWT 密钥强度从 26 字节提升至 64+ 字节（Base64 编码），符合 HS512 规范。
- Token 前缀处理从 `replace` 改为 `substring`，避免误替换 Token 内容。
- `BaseEntity.setParams` 增加 `@JsonIgnore`，阻断 `${params.dataScope}` SQL 注入攻击向量。
- `SysUser.password` 增加 `@JsonProperty(WRITE_ONLY)`，API 响应不再泄露密码哈希。
- 文件上传增加路径规范化校验（`getCanonicalPath`），防止目录穿越。
- CORS 配置从 `*` 改为可配置白名单（`ruoyi.cors.allowed-origins`）。
- Druid 监控控制台在生产环境关闭。
- XSS 过滤范围从部分接口扩展到所有接口（`/*`）。
- Druid Wall 禁止多语句 SQL 执行（`multi-statement-allow: false`）。
- `IpUtils.internalIp` 修复缺失的 `break` 语句，修正内网 IP 判断逻辑。
- `SecurityConfig` 移除 `MODE_INHERITABLETHREADLOCAL`，消除线程池场景下的权限串用风险。
- Swagger/API Docs 在生产环境通过 springdoc 配置禁用。

### Bug 修复
- 修复 `SysRoleServiceImpl.insertRoleMenu`/`insertRoleDept` 在 menuIds/deptIds 为 null 时的 NPE。
- 修复 `CaptchaController` 在验证码类型不支持时的 NPE。
- 修复 `CacheController` 中 `keys()` 返回 null 时的 NPE，`clearCacheAll` 改为按已知前缀清理。
- 修复 `SysUserOnlineController` 中 `keys()` 返回 null 时的 NPE。
- 修复 `SysConfigServiceImpl.updateConfig` 在配置不存在时的 NPE。
- 修复 `SysDictTypeServiceImpl.selectDictDataByType` 返回 null 改为空集合。
- 修复 `SysUserMapper.xml` INSERT 语句列条件与值条件不一致的问题。
- 修复 `SysDeptController` 和 `SysMenuServiceImpl` 中 Long 类型比较使用 `==` 的问题。
- 修复 `FileUtils.setFileDownloadHeader` 在 User-Agent 为 null 时的 NPE。
- 修复 `FileUtils.getFileExtendName` 在字节数组长度不足时的越界异常。
- 修复 `FileUploadUtils` 中数组比较使用 `==` 而非 `Arrays.equals()` 的问题。
- 修复前端 `request.js` 拦截器错误回调缺少 `return` 导致错误被静默吞噬。
- 修复前端 `dictStore.getDict` 中 `&&` 逻辑恒为 false 的 Bug。
- 修复前端 `Editor` 组件双 `useEffect` 导致的潜在无限循环。
- 修复前端登录页 `redirect` 参数未校验导致的开放重定向风险。

### 改进
- 所有 `@Transactional` 注解补充 `rollbackFor = Exception.class`，确保 checked exception 也能回滚。
- `SysDeptServiceImpl.updateDept` 增加事务注解，保证多步更新的原子性。
- `CommonController` 文件下载增加路径规范化校验。
- `AiChatController` 的 `temperature` 参数现在正确应用到 AI 模型调用。
- `AiChatController` 日志不再记录完整用户消息内容（PII 保护）。
- 角色权限修改后刷新所有关联在线用户的权限缓存，而非仅刷新当前用户。
- 密码修改接口增加空值校验。
- 生产环境日志级别从 `debug` 改为 `info`，关闭 DevTools。
- `RyTask` 从 `System.out.println` 改为 SLF4J Logger。

### 前端改进
- 用户管理页面拆分为 `UserFormModal` + `UserImportModal` 子组件（951行 → 792行）。
- 角色管理页面拆分为 `RoleFormModal` + `RoleDataScopeModal` 子组件（933行 → 771行）。
- 所有 state 变更改为不可变更新，消除 React state 直接变异。
- 导入结果改为纯文本展示，消除 `dangerouslySetInnerHTML` XSS 风险。
- `App.jsx` 的 roles 依赖改为内容比较，避免角色内容变更但长度不变时路由不刷新。
- `App.jsx` 增加 `ErrorBoundary`，懒加载失败时显示恢复界面。
- `Navbar` 全屏状态同步浏览器 `fullscreenchange` 事件。
- `Promise.reject` 统一传入 Error 对象而非字符串。

### 依赖升级
- jjwt: 0.9.1 → 0.12.6（含 jjwt-api/jjwt-impl/jjwt-jackson 模块化拆分）
- Apache POI: 4.1.2 → 5.3.0
- 移除 javax.xml.bind:jaxb-api（不再需要）
- 移除未使用的 swagger.version 属性

### SQL 优化
- 添加索引：`sys_user(user_name)`、`sys_user(dept_id)`、`sys_dict_data(dict_type)`、`sys_config(config_key)`、`ai_session_context(user_id)`。
- AI 向量索引从 IVFFlat 改为 HNSW（无需预填充数据）。
- 主键类型统一为 `bigserial`。
- 修复 quartz SQL 重复 COMMIT 问题。

## [5.0.0] - 2026-03-01

### 版本定位
- 本版本是数据库与 AI 基座升级的主版本发布：项目从 MySQL 体系迁移到 PostgreSQL 统一基线，并面向 AI 原生应用场景强化数据能力。

### 破坏性变更（Breaking Changes）
- **数据库基线切换**:
  - 彻底移除 MySQL 运行支持，不再提供 MySQL 驱动、配置入口与初始化脚本。
  - 默认且唯一支持 PostgreSQL，数据库相关部署与运维需按 PostgreSQL 标准执行。
- **兼容策略调整**:
  - 不再支持通过 profile 在 MySQL 与 PostgreSQL 之间切换。
  - 既有依赖 MySQL 方言或脚本的流程需完成迁移后再升级到本版本。

### AI 原生能力增强
- 引入 PostgreSQL AI 相关能力基座：
  - 向量检索能力预留（`pgvector` 方向）
  - 会话与上下文半结构化存储（`JSONB`）
  - 全文检索能力预留（FTS）
- 为后续 RAG、知识检索与 AI 会话管理提供统一数据库支撑。

### 工程与迁移影响
- 受影响范围：后端数据源配置、MyBatis SQL 方言、数据库初始化脚本、部署模板与环境变量配置。
- 升级建议：先完成数据与脚本迁移校验，再执行版本升级；回滚策略以“版本回退 + 数据备份恢复”为主。

## [4.3.0]

### 变更
- **规范**:
  - OpenSpec 升级到 1.1.1。

## [4.2.2] - 2026-02-12

### 变更
- **主题**:
  - 更新默认系统主题色为 `#1d5ccc` (蓝色)。
- **侧边栏菜单**:
  - 在选中菜单项的右侧添加了主题色竖线指示器。
  - 调整菜单项圆角为 4px，使外观更整洁。

### 修复
- **主题同步**:
  - 修复了链接按钮 (`colorLink`) 未跟随主主题色的问题。
  - 优化了自定义样式的主题色变量同步。

## [4.2.1] - 仓库结构梳理与命名统一

### 概要说明
- 本版本聚焦仓库结构梳理与命名统一：移除 Vue Web 版本、统一多端目录命名，并同步更新相关文档与调试配置。
- 后端与业务功能无变更，本次为工程组织与文档层面的发布。

### 破坏性变更（Breaking Changes）
- 删除 Web(Vue) 工程目录： `ruoyi-front-vue/` 已移除。
- 多端目录重命名（涉及所有引用路径需更新）：
  - `ruoyi-front-react/` → `ruoyi-react-web/`
  - `ruoyi-rn/` → `ruoyi-rn-app/`
  - `ruoyi-app/` → `ruoyi-uni-app/`
  - `ruoyi-harmony/` → `ruoyi-harmony-app/`
- 若你有脚本/CI/本地命令依赖旧目录名，请按上表替换路径。
- VS Code/Cursor 启动配置已同步更新（React Web 与 RN 的 cwd 路径）。
- 文档中所有示例路径已同步更新；若你在外部文章/自动化文档引用旧路径，需要一并替换。

### 文档与工程维护
- 更新项目根 README 的启动、构建命令与项目结构树。
- 更新 docs/ 下的导航与 HarmonyOS 支持文档路径说明。
- 更新流式渲染文档中 Web 前端示例路径到新目录名。
- 调整子项目标识：
  - Web：更新 `ruoyi-react-web/package.json` 的 name
  - RN：更新 `ruoyi-rn-app/package.json` 的 name ，以及 `app.json` 的 slug/scheme

### 影响范围
- 仅影响仓库目录结构、文档与配置引用；不影响后端接口与业务逻辑。

## [4.2.0] - HarmonyOS 原生应用支持

- 新增 HarmonyOS 原生应用支持，基于 ArkTS 开发，目标 SDK 6.0.2
- 集成登录认证（用户名、密码、验证码），与后端 Spring Boot API 对接
- 实现主页面框架（首页、工作、我的），支持底部标签导航
- 使用 AppStorage 进行全局状态管理，支持 Token、用户信息、角色权限等
- 模块化架构：common（公共模块）、adaptiveLayout（自适应布局）、responsiveLayout（响应式布局）
- 使用 Hvigor 构建系统，支持多模块开发与依赖管理
- 支持网络请求、路由导航、资源管理等基础能力

## [4.1.1] - 统一主题与配置化优化

- 抽出 themeTokens 和 layoutConfig，让 AppProviders、全局样式和布局组件共用颜色/字体/断点，新增 useResponsiveLayout 钩子与 getLayoutWrapperClass 工具，布局逻辑更清晰。
- 将所有路由 meta 和 Navbar 菜单文案集中在 routeMeta.js，router/index.jsx 与 Navbar 统一读取，方便批量调整或国际化。
- 引入 requestConfig，把 axios 的 baseURL、超时、重复提交保护与提示文案都交给可通过 env 覆盖的配置，request.js 只负责消费配置。

## [4.1.0] - 2026-01-09

### 版本定位
- 基于成熟的 RuoYi 全栈架构，融合 Spring AI 原生组件，覆盖后端（Spring Boot 3.5 + MyBatis + Redis + MySQL + Quartz）、前端（React 18 + Ant Design + Vite + pnpm + Zustand）与移动端（uni-app / React Native），在单仓库内实现 Web + 移动的企业级管理系统开发。

### AI 能力集成
- 内嵌 Spring AI 1.1.2 示例，配置 DeepSeek/OpenAI API Key 即可启用智能代码生成、流式渲染等能力。
- 支持 Cursor AI 专属交互，优化自动补全、重构与文档生成流程。

### 开发与部署流程
- 推荐在 Cursor 中使用 `.vscode/launch.json` 所提供的调试配置，保持 AI 辅助开发体验一致。

### 规范驱动协同
- 全面集成 OpenSpec 快速提案与规范编写，和 AI 助手指令 `openspec/AGENTS.md` 达成一致的开发节奏。
- 项目结构清晰，各模块（`ruoyi-admin`, `ruoyi-system`, `ruoyi-common`, `ruoyi-quartz`, 前端/移动端）协同提供完整能力。

### 核心能力
- 覆盖用户权限、系统监控（在线用户 / 服务 / 缓存）、日志、定时任务、字典与参数管理等企业级能力。
