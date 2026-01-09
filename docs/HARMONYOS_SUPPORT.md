# HarmonyOS 支持

`ruoyi-harmony/` 是一个 ArkTS Stage 模型的 HarmonyOS/OpenHarmony 示例工程，包含 DevEco Studio 可直接打开的 EntryAbility、资源和测试模块，便于在本地验证 HarmonyOS 原生端能力。

## 项目结构概览

- `AppScope/`：应用包元数据（`app.json5`）、默认文本和图标资源，DevEco 根据此目录生成快捷入口。
- `entry/`：主模块，内含 `build-profile.json5`、`hvigorfile.ts`、`oh-package.json5`；`src/main/ets/` 包含 API、工具类、EntryAbility 和页面/视图以及 `resources/` 的多语言/图片/profile 文件。
- `entry/src/ohosTest/`：集成测试模块（测试用 Ability、runner、资源），可用于自动化验证。
- `hvigor/`、`hvigorfile.ts`、`oh-package*.json5`：hvigor 构建与打包配置，与 DevEco Studio 协同使用。

## 打开与运行

1. 启动 **DevEco Studio**，选择 `File → Open`，定位到 `ruoyi-harmony/` 目录。
2. IDE 会识别 `entry/` 模块。建议在 Project Explorer 中右键 `entry/src/main/module.json5`，确认 API/Ability 名等配置。
3. 选择目标设备（模拟器或真机），点击运行。DevEco 会调用 `hvigor` 执行构建任务，构建日志可以在 Run 控制台查看。

## SDK 与签名配置

- **目标 SDK**：`build-profile.json5` 的 `targetSdkVersion` 应与所安装的 OpenHarmony/HarmonyOS SDK 对齐（比如 OpenHarmony 8.0 对应 `apiVersion` 20）。在 DevEco Studio 的 SDK 设置里检查所需 API 版本是否已安装。
- **签名配置**：如果需要自动签名发布包，在 `ruoyi-harmony/build-profile.json5` 中添加 `signingConfigs`，指定 keystore 路径、别名、密码等，便于 `hvigor` 完成 `SignHap` 任务；否则构建会跳过签名但仍能生成 HAP。
- **hvigor 警告**：空 target 或未配置 signing 普遍会在构建日志中打印 WARN。根据提示调整 `build-profile.json5` 即可消除警告。

## 登录与个人中心

- HarmonyOS 模块实现了完整的 ArkTS 登录流程（`pages/Login.ets`），支持验证码刷新、登录校验、Token 获取以及用户信息拉取。
- 登录成功后，用户信息（User、Roles、Permissions）会通过 `AppStorage` 实现全局状态共享。
- 主页（`pages/Index.ets`）采用了原生的 `Tabs` 结构，包含“首页”、“工作”和“我的”三个 Tab，还原了移动端的标准交互体验。
- **个人中心**（`view/mine/Mine.ets`）：展示当前登录用户的头像占位、用户名及昵称，并提供“退出登录”功能，退出时会自动清除 `AppStorage` 并重定向至登录页。
- **工作台**（`view/Work.ets`）：展示模拟的业务功能入口，如任务、审批等。
- **接口联动**：所有请求通过 `api/login.ets` 的原生 `httpRequest` 发起，后端地址由 `constants/ApiConfig.ets` 统一管理。

## 编译 & 打包

可以在 DevEco Studio 中点击 Run/Build，再次验证：

```
/Applications/DevEco-Studio.app/Contents/tools/node/bin/node \ 
  /Applications/DevEco-Studio.app/Contents/tools/hvigor/bin/hvigorw.js --mode module \
  -p product=default -p module=entry@default assembleHap
```

日志中会依次执行 `CreateBuildProfile`、`CompileArkTS`、`PackageHap`、`SignHap` 等任务。若希望在终端构建，保持 DevEco 的 SDK 环境变量（如 `OPENHARMONY_SDK_HOME`）与 `hvigor` 配置一致。

## 资源与多语言

- `entry/src/main/resources/base/element`：包含 `color.json` 与 `string.json`，配合 `zh_CN`/`en_US` 子目录进行本地化。
- `entry/src/main/resources/base/media`：图标、Banner、用户头像等素材。
- `entry/src/main/resources/base/profile/main_pages.json`：Ability 页面定义，用于路由与导航。

## 相关提示

- 如需调试日志，可在 `entry/src/main/ets/utils` 中添加 `Logger` 调用，并使用 OpenHarmony Device Monitor 查看打印。
- HarmonyOS 模块与 Web/uni-app/React Native 项目共享后端接口，可通过统一 API（如 `ruoyi-admin` 提供）进行联调。

如需进一步指导（例如 keystore 生成或 SDK 版本选择），可参考 DevEco Studio 官方文档或告诉我想要的具体帮助。
