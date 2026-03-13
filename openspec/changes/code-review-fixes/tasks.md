## 1. P0 — 安全漏洞修复（Critical）

- [x] 1.1 升级 jjwt 依赖到 0.12.x，更新 pom.xml 版本号和 groupId
- [x] 1.2 重写 TokenService：使用新 jjwt API（Keys.hmacShaKeyFor / Jwts.builder().signWith(key) / Jwts.parser().verifyWith(key)），Token 增加 exp claim，token 前缀处理改用 substring
- [x] 1.3 application.yml 中 token.secret 改为 `${JWT_SECRET:Base64编码的64字节默认开发密钥}`
- [x] 1.4 application-dev.yml 中 AI api-key 改为 `${SPRING_AI_OPENAI_API_KEY}`
- [x] 1.5 BaseEntity.params 的 setParams 方法增加 @JsonIgnore，DataScopeAspect 增加 dataScope 清除逻辑
- [x] 1.6 FileUploadUtils 增加路径规范化校验（getCanonicalPath + startsWith）和 magic bytes 文件头检测
- [x] 1.7 SysUser.password 增加 @JsonProperty(access = WRITE_ONLY)
- [x] 1.8 GlobalExceptionHandler 的 RuntimeException/Exception handler 返回通用消息，不返回 e.getMessage()

## 2. P1 — 安全加固（High）

- [x] 2.1 三套环境配置凭据外部化：DB 密码改为 `${DB_PASSWORD:password}`（dev 有默认值，test/prod 无默认值），Redis 密码同理
- [x] 2.2 application-prod.yml 关闭 Druid statViewServlet（enabled: false），dev/test 加强密码
- [x] 2.3 ResourcesConfig CORS 配置改为从 ruoyi.cors.allowed-origins 读取白名单
- [x] 2.4 UserDetailsServiceImpl 统一登录错误消息为"用户名或密码错误"
- [x] 2.5 SysLoginService 非 BadCredentialsException 返回通用消息
- [x] 2.6 JobInvokeUtil 改为白名单机制，禁用 Class.forName 调用路径
- [x] 2.7 升级 Apache POI 到最新稳定版
- [x] 2.8 IpUtils 修复 internalIp 缺失的 break 语句，X-Forwarded-For 取最后一个非内网 IP
- [x] 2.9 CacheController.clearCacheAll 改为按已知前缀清理

## 3. P2 — 后端代码质量修复

- [x] 3.1 所有 @Transactional 补充 rollbackFor = Exception.class（SysUserServiceImpl、SysRoleServiceImpl 等）
- [x] 3.2 SysDeptServiceImpl.updateDept 增加 @Transactional(rollbackFor = Exception.class)
- [x] 3.3 SysRoleServiceImpl.insertRoleMenu / insertRoleDept 增加 menuIds/deptIds null 检查
- [x] 3.4 CaptchaController 增加 captchaType else 分支抛 ServiceException
- [x] 3.5 CacheController 所有 keys() 调用增加 null 检查，改用 SCAN
- [x] 3.6 SysUserOnlineController 增加 keys null 检查
- [x] 3.7 CommonController 文件下载增加路径 canonicalize 校验
- [x] 3.8 SysConfigServiceImpl.updateConfig 增加 null 检查
- [x] 3.9 SysDictTypeServiceImpl.selectDictDataByType 返回空集合替代 null
- [x] 3.10 SysUserMapper.xml insertUser 列条件与值条件统一
- [x] 3.11 SysDeptController Long 比较改用 Objects.equals()
- [x] 3.12 SysMenuServiceImpl.getChildPerms parentId 比较改用 Objects.equals()
- [x] 3.13 AiChatController temperature 参数应用到 ChatOptions
- [x] 3.14 AiChatController 日志不记录完整用户消息
- [x] 3.15 SysRoleController 角色修改后刷新所有关联在线用户权限
- [x] 3.16 SysProfileController 密码修改改用类型化 DTO + @NotBlank/@Size 校验

## 4. P2 — 前端代码质量修复

- [x] 4.1 request.js 请求拦截器 error 回调增加 return
- [x] 4.2 request.js 所有 Promise.reject 传入 Error 对象替代字符串
- [x] 4.3 dictStore.getDict 修复 `&&` 为 `||`
- [x] 4.4 Editor/index.jsx 消除双 useEffect 循环，onChange 直接在 Quill handler 中调用
- [x] 4.5 user/index.jsx 拆分子组件（UserFormModal、UserImportModal），主文件 < 800 行
- [x] 4.6 role/index.jsx 拆分子组件（RoleFormModal、RoleDataScopeModal），主文件 < 800 行
- [x] 4.7 user/index.jsx 和 role/index.jsx 中 row.status 直接变异改为不可变更新
- [x] 4.8 user/index.jsx 导入结果 dangerouslySetInnerHTML 改为纯文本
- [x] 4.9 login/index.jsx redirect 参数校验（以 / 开头且不含 //）
- [x] 4.10 App.jsx roles 依赖改为 JSON.stringify(roles) 检测内容变化
- [x] 4.11 App.jsx RouterProvider 外层包裹 ErrorBoundary
- [x] 4.12 Navbar fullscreen 状态监听 fullscreenchange 事件

## 5. P2 — 配置优化与依赖升级

- [x] 5.1 application-prod.yml 日志级别改为 info，关闭 DevTools
- [x] 5.2 XSS 过滤 urlPatterns 改为 /*
- [x] 5.3 所有环境 Druid Wall multi-statement-allow 改为 false
- [x] 5.4 Swagger 在生产环境通过 springdoc 配置禁用
- [x] 5.5 替换 UserAgentUtils 为 Yauaa 或其他活跃维护库 — 暂保留，标记为技术债务
- [x] 5.6 移除 pom.xml 未使用的 swagger.version 属性
- [x] 5.7 javax.xml.bind 移除（jjwt 0.12.x 不再需要）
- [x] 5.8 SecurityConfig 移除 MODE_INHERITABLETHREADLOCAL

## 6. P2 — SQL Schema 优化

- [x] 6.1 ry-demo-postgresql.sql 添加索引：sys_user(user_name)、sys_user(dept_id)、sys_dict_data(dict_type)、sys_config(config_key)
- [x] 6.2 ai-postgresql.sql 添加 ai_session_context(user_id) 索引
- [x] 6.3 ai-postgresql.sql IVFFlat 索引改为 HNSW
- [x] 6.4 ry-demo-postgresql.sql serial 统一改为 bigserial
- [x] 6.5 quartz-postgresql.sql 移除重复 COMMIT
- [x] 6.6 RyTask 改用 SLF4J Logger 替代 System.out.println

## 7. P3 — 工具类修复

- [x] 7.1 FileUtils.setFileDownloadHeader User-Agent null 检查
- [x] 7.2 FileUtils.getFileExtendName 字节数组长度边界检查
- [x] 7.3 FileUploadUtils.isAllowedExtension 数组比较改用 Arrays.equals()
