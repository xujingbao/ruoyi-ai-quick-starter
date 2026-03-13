## ADDED Requirements

### Requirement: SysRoleServiceImpl NPE 防护
`insertRoleMenu` 和 `insertRoleDept` 方法 SHALL 在遍历 `menuIds`/`deptIds` 前进行 null 检查。

#### Scenario: menuIds 为 null 时不抛 NPE
- **WHEN** 新增角色时未设置菜单权限（menuIds 为 null）
- **THEN** 方法正常返回，不抛出 NullPointerException

### Requirement: 事务注解规范化
所有标注 `@Transactional` 的方法 SHALL 指定 `rollbackFor = Exception.class`。

#### Scenario: checked exception 触发回滚
- **WHEN** Service 方法中抛出 checked Exception
- **THEN** 事务正常回滚，数据不处于不一致状态

### Requirement: SysDeptServiceImpl.updateDept 增加事务
`updateDept` 方法 SHALL 标注 `@Transactional(rollbackFor = Exception.class)`。

#### Scenario: 更新部门中途失败回滚
- **WHEN** 更新部门的子级祖先路径时发生异常
- **THEN** 整个更新操作回滚

### Requirement: CaptchaController 验证码类型防护
当验证码类型既不是 `math` 也不是 `char` 时 SHALL 抛出 ServiceException 而非导致 NPE。

#### Scenario: 未知验证码类型
- **WHEN** 配置的 captchaType 为不支持的值
- **THEN** 返回明确的错误消息而非 500 NPE

### Requirement: CacheController 使用 SCAN 替代 KEYS
`CacheController` 的所有 Redis 键查询操作 SHALL 使用 SCAN 命令替代 KEYS 命令，并增加 null 检查。

#### Scenario: keys 返回 null 不抛 NPE
- **WHEN** Redis 无匹配键时 keys() 返回 null
- **THEN** 返回空集合而非抛出 NullPointerException

### Requirement: clearCacheAll 按前缀清理
`clearCacheAll` SHALL 仅删除应用自身前缀的 Redis 键，不删除其他应用的数据。

#### Scenario: 清理缓存不影响其他应用
- **WHEN** 管理员执行清理全部缓存操作
- **THEN** 仅删除 sys_config:、sys_dict:、login_tokens: 等已知前缀的键

### Requirement: SysUserOnlineController 使用分页查询
`SysUserOnlineController.list` SHALL 使用 SCAN + 分页替代全量加载所有 Token。

#### Scenario: 大量在线用户不导致 OOM
- **WHEN** 系统有上万个在线用户
- **THEN** 在线用户列表接口仍能正常响应，不导致内存溢出

### Requirement: CommonController 文件下载路径校验
`CommonController` 文件下载 SHALL 对拼接后的路径做 canonicalize 验证，确保在允许的下载目录内。

#### Scenario: 路径穿越被拦截
- **WHEN** 下载请求的 fileName 包含 `../`
- **THEN** 请求被拒绝

### Requirement: SysConfigServiceImpl.updateConfig NPE 防护
`updateConfig` 方法 SHALL 在 selectConfigById 返回 null 时抛出 ServiceException。

#### Scenario: 配置不存在时明确报错
- **WHEN** 更新一个已被删除的配置项
- **THEN** 返回"参数配置不存在"错误消息

### Requirement: SysDictTypeServiceImpl 返回空集合
`selectDictDataByType` 在无数据时 SHALL 返回空集合而非 null。

#### Scenario: 无匹配字典数据返回空列表
- **WHEN** 查询的字典类型无关联数据
- **THEN** 返回空 List 而非 null

### Requirement: SysUserMapper.xml INSERT 条件一致
`insertUser` 的列条件和值条件 SHALL 使用一致的判断逻辑（Long 类型统一用 `!= 0`）。

#### Scenario: INSERT 语句列值配对正确
- **WHEN** 插入用户数据
- **THEN** SQL 的 INSERT 列数与 VALUES 值数始终匹配

### Requirement: SysDeptController Long 比较修复
部门排除子节点的 Long 类型比较 SHALL 使用 `Objects.equals()` 而非 `intValue() ==`。

#### Scenario: 大 ID 正确比较
- **WHEN** 部门 ID 超过 Integer.MAX_VALUE
- **THEN** 排除逻辑仍然正确

### Requirement: AiChatController temperature 参数生效
`ChatRequest.temperature` SHALL 被应用到 Prompt 的 ChatOptions 中。

#### Scenario: temperature 影响生成结果
- **WHEN** 客户端传入 temperature=0.1
- **THEN** AI 模型使用 0.1 作为温度参数

### Requirement: AiChatController 不记录完整用户消息
AI 聊天接口的日志 SHALL 不记录完整用户消息内容，仅记录请求元数据。

#### Scenario: 日志不含用户消息
- **WHEN** 用户发送 AI 聊天请求
- **THEN** INFO 级别日志仅记录会话 ID 和消息长度，不记录消息内容

### Requirement: SysRoleController 角色修改刷新所有关联用户
角色权限修改后 SHALL 刷新所有持有该角色的在线用户的权限缓存。

#### Scenario: 其他在线用户权限同步更新
- **WHEN** 管理员修改角色 A 的权限
- **THEN** 所有在线且持有角色 A 的用户的权限缓存被更新

### Requirement: SysProfileController 密码修改增加验证
密码修改接口 SHALL 使用类型化的 DTO 替代 Map，包含 @NotBlank 和 @Size 校验。

#### Scenario: 空密码被拒绝
- **WHEN** 提交空的 newPassword
- **THEN** 返回参数校验错误

### Requirement: SysMenuServiceImpl Long 比较修复
`getChildPerms` 的 parentId 比较 SHALL 使用 `Objects.equals()` 替代 `==`。

#### Scenario: Long 值正确比较
- **WHEN** parentId 为 Long 包装类型
- **THEN** 使用 equals 方法比较而非引用比较
