# RuoYi RN

基于 Expo 框架开发的 React Native 移动应用，参考 ruoyi-app 实现。

## 技术栈

- **框架**: Expo ~51.0.0
- **路由**: expo-router ~3.5.0
- **状态管理**: Redux Toolkit
- **HTTP 客户端**: Axios
- **存储**: AsyncStorage + Expo SecureStore

## 项目结构

```
ruoyi-rn/
├── src/
│   ├── app/              # 页面路由（expo-router）
│   │   ├── _layout.js    # 根布局
│   │   ├── index.js      # 首页
│   │   └── login.js      # 登录页
│   ├── api/              # API 接口
│   │   └── login.js      # 登录相关接口
│   ├── store/            # 状态管理
│   │   ├── index.js      # Store 配置
│   │   └── modules/      # Store 模块
│   │       └── user.js   # 用户状态
│   ├── utils/            # 工具类
│   │   ├── auth.js      # Token 管理
│   │   ├── request.js   # HTTP 请求封装
│   │   ├── storage.js   # 本地存储
│   │   ├── constant.js  # 常量定义
│   │   └── errorCode.js # 错误码
│   └── config.js        # 应用配置
├── assets/              # 静态资源
├── app.json            # Expo 配置
├── package.json        # 依赖配置
└── babel.config.js    # Babel 配置
```

## 安装依赖

```bash
cd ruoyi-rn
npm install
# 或
pnpm install
```

## 运行项目

```bash
# 启动开发服务器
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 功能特性

- ✅ 登录页面（参考 ruoyi-app）
- ✅ 图形验证码
- ✅ Token 管理（使用 SecureStore）
- ✅ 用户状态管理（Redux Toolkit）
- ✅ API 请求封装（参考 ruoyi-app）

## 配置说明

在 `src/config.js` 中配置后端 API 地址：

```javascript
export default {
  baseUrl: 'http://172.16.18.9:8080', // 修改为你的后端地址
  // ...
}
```

## 注意事项

1. 首次运行前需要安装依赖
2. 确保后端 API 地址配置正确
3. iOS 需要配置 Info.plist 允许 HTTP 请求（开发环境）
4. Android 需要配置网络安全策略（开发环境）





