## ADDED Requirements

### Requirement: request.js 拦截器错误正确传播
请求拦截器的 error 回调 SHALL `return Promise.reject(error)` 而非静默丢弃。

#### Scenario: 拦截器错误传播到调用方
- **WHEN** 请求拦截器发生错误
- **THEN** 错误被正确传播，调用方的 catch 可以捕获

### Requirement: dictStore.getDict 逻辑修复
`getDict` 方法的空值检查 SHALL 使用 `||`（OR）替代 `&&`（AND），修复恒假条件。

#### Scenario: null key 返回 null
- **WHEN** 调用 getDict(null)
- **THEN** 返回 null 而非尝试遍历字典数组

#### Scenario: 空字符串 key 返回 null
- **WHEN** 调用 getDict("")
- **THEN** 返回 null

### Requirement: Editor 组件消除无限循环
Editor 组件 SHALL 不使用双 useEffect 形成反馈循环，onChange 回调 SHALL 在 Quill 的 onChange 处理器中直接调用。

#### Scenario: value 变更不触发无限更新
- **WHEN** 父组件更新 Editor 的 value prop
- **THEN** Editor 更新内容后不触发额外的 re-render 循环

### Requirement: 用户管理页面不超过 800 行
`views/system/user/index.jsx` SHALL 拆分为多个子组件，主文件不超过 800 行。

#### Scenario: 用户页面主文件行数合规
- **WHEN** 统计 user/index.jsx 的代码行数
- **THEN** 不超过 800 行

### Requirement: 角色管理页面不超过 800 行
`views/system/role/index.jsx` SHALL 拆分为多个子组件，主文件不超过 800 行。

#### Scenario: 角色页面主文件行数合规
- **WHEN** 统计 role/index.jsx 的代码行数
- **THEN** 不超过 800 行

### Requirement: React state 不可变更新
所有状态更新 SHALL 使用不可变方式（setState/set 函数），不直接修改 state 对象的属性。

#### Scenario: 状态变更触发 re-render
- **WHEN** 用户状态切换失败需要回滚
- **THEN** 通过 setUserList 不可变更新触发 UI 重新渲染

### Requirement: 用户导入结果 XSS 防护
导入结果消息渲染 SHALL 使用 DOMPurify 净化 HTML 或使用纯文本展示，不直接使用 dangerouslySetInnerHTML。

#### Scenario: 恶意 HTML 被净化
- **WHEN** 导入 Excel 的结果消息包含 `<script>alert(1)</script>`
- **THEN** script 标签被移除，不执行

### Requirement: 登录重定向参数校验
登录后的 redirect 参数 SHALL 验证为以 `/` 开头的相对路径且不包含 `//`，防止开放重定向。

#### Scenario: 外部 URL 重定向被阻止
- **WHEN** 登录页 URL 包含 `?redirect=https://evil.com`
- **THEN** 重定向到首页 `/` 而非外部 URL

### Requirement: App.jsx roles 依赖检测内容变化
App.jsx 的路由生成 effect SHALL 在 roles 内容变化时重新执行，不仅在长度变化时。

#### Scenario: 角色内容变更触发路由刷新
- **WHEN** 用户角色从 ['admin'] 变为 ['user']（长度不变）
- **THEN** 路由重新生成

### Requirement: App.jsx 包裹 ErrorBoundary
`RouterProvider` SHALL 被 ErrorBoundary 包裹，懒加载失败时显示恢复 UI。

#### Scenario: 懒加载失败显示恢复界面
- **WHEN** 网络错误导致懒加载路由组件失败
- **THEN** 显示带有重试按钮的错误恢复界面

### Requirement: Fullscreen 状态同步浏览器事件
全屏切换 SHALL 监听 `fullscreenchange` 事件同步状态，而非仅依赖 click 回调。

#### Scenario: Esc 退出全屏后图标正确
- **WHEN** 用户在全屏状态按 Esc 键退出
- **THEN** 全屏图标状态正确更新为"进入全屏"

### Requirement: request.js 错误类型一致
所有 Promise.reject 调用 SHALL 传入 Error 对象而非字符串。

#### Scenario: catch 可访问 error.message
- **WHEN** API 请求失败被 catch 捕获
- **THEN** error 对象有 message 属性
