# RuoYi App

基于 uni-app 开发的跨平台移动端应用，支持小程序、H5、Android 和 iOS。

## 技术栈

- **uni-app** - 跨平台应用框架
- **uni-ui** - uni-app 官方 UI 组件库
- **Vue 3** - 渐进式 JavaScript 框架
- **Pinia** - 状态管理

## 功能特性

- ✅ 用户登录/注册
- ✅ 个人信息管理
- ✅ 头像上传
- ✅ 密码修改
- ✅ 工作台
- ✅ 常见问题
- ✅ 关于我们
- ✅ 与后端系统完美对接

## 快速开始

### 环境要求

- HBuilderX 或 VS Code
- Node.js 20.19+ 或 22.12+
- 微信开发者工具（小程序开发）

### 安装依赖

```bash
# 使用 HBuilderX 导入项目，会自动安装依赖
# 或使用 npm/pnpm 安装
npm install
# 或
pnpm install
```

### 配置

修改 `config.js` 中的后端 API 地址：

```javascript
// config.js
const baseUrl = 'http://localhost:8080'  // 修改为实际后端地址
```

### 运行

**HBuilderX 运行：**
1. 使用 HBuilderX 打开项目
2. 选择运行 → 运行到浏览器/小程序/App

**命令行运行：**
```bash
# H5
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# App
npm run dev:app
```

### 构建

```bash
# H5 构建
npm run build:h5

# 微信小程序构建
npm run build:mp-weixin

# App 构建
npm run build:app
```

## 项目结构

```
ruoyi-app/
├── api/                  # API 接口
├── components/           # 公共组件
├── pages/                # 页面
│   ├── common/          # 通用页面
│   ├── index.vue        # 首页
│   ├── login.vue        # 登录页
│   ├── mine/            # 我的页面
│   └── work/            # 工作台
├── plugins/              # 插件
├── static/               # 静态资源
├── store/                # 状态管理
├── utils/                # 工具函数
├── uni_modules/         # uni-app 插件
├── config.js             # 配置文件
├── manifest.json         # 应用配置
└── pages.json            # 页面配置
```

## 平台支持

- ✅ 微信小程序
- ✅ H5
- ✅ Android App
- ✅ iOS App

## 开发指南

### 页面开发

1. 在 `pages` 目录下创建页面文件
2. 在 `pages.json` 中注册页面路由
3. 使用 uni-app 提供的组件和 API

### API 调用

使用 `utils/request.js` 封装的请求方法：

```javascript
import request from '@/utils/request'

// GET 请求
request.get('/api/user/info')

// POST 请求
request.post('/api/user/login', { username, password })
```

### 状态管理

使用 Pinia 进行状态管理，store 文件位于 `store/` 目录。

## 参考文档

- [uni-app 文档](https://uniapp.dcloud.net.cn)
- [uni-ui 文档](https://uniapp.dcloud.net.cn/component/uniui/uni-ui.html)
- [Vue 3 文档](https://cn.vuejs.org)
