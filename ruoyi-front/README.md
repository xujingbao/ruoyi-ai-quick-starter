# RuoYi Frontend

基于 Vue 3 + Element Plus + Vite 的前端项目。

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Element Plus** - Vue 3 组件库
- **Vite** - 前端构建工具
- **pnpm** - 包管理器
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP 客户端

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 访问地址：http://localhost:80
```

### 构建

```bash
# 构建测试环境
pnpm build:stage

# 构建生产环境
pnpm build:prod
```

### 预览

```bash
# 预览生产构建
pnpm preview
```

## 项目结构

```
ruoyi-front/
├── src/
│   ├── api/              # API 接口
│   ├── assets/           # 静态资源
│   ├── components/      # 公共组件
│   ├── directive/        # 自定义指令
│   ├── layout/           # 布局组件
│   ├── plugins/          # 插件
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── utils/            # 工具函数
│   └── views/            # 页面组件
├── vite/                 # Vite 配置
├── vite.config.js        # Vite 配置文件
└── package.json          # 项目配置
```

## 配置说明

### 环境变量

项目支持多环境配置，可在 `vite.config.js` 中配置不同环境的变量。

### API 配置

API 基础地址配置在 `src/utils/request.js` 中，可通过环境变量进行配置。

### 路由配置

路由配置位于 `src/router/index.js`，支持动态路由和权限控制。

## 开发规范

- 使用 ESLint 进行代码检查
- 遵循 Vue 3 Composition API 规范
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

## 参考文档

- [Vue 3 文档](https://cn.vuejs.org)
- [Element Plus 文档](https://element-plus.org/zh-CN)
- [Vite 文档](https://cn.vitejs.dev)
- [pnpm 文档](https://pnpm.io/zh)
