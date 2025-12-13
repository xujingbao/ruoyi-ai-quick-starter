# Spring AI 集成文档

## 概述

本文档记录了在若依项目中集成 Spring AI 1.1.2 的完整过程，包括依赖配置、问题排查和解决方案。

## 技术栈

- **Spring Boot**: 3.5.4
- **Spring AI**: 1.1.2
- **Java**: 17
- **AI 提供商**: DeepSeek（兼容 OpenAI API）

## 集成步骤

### 1. 添加 Spring AI BOM

在根 `pom.xml` 的 `<properties>` 中添加版本属性：

```xml
<properties>
    <spring-ai.version>1.1.2</spring-ai.version>
</properties>
```

在 `<dependencyManagement>` 中添加 Spring AI BOM：

```xml
<dependencyManagement>
    <dependencies>
        <!-- Spring AI BOM -->
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>${spring-ai.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 2. 添加依赖

在 `ruoyi-framework/pom.xml` 中添加依赖：

```xml
<dependencies>
    <!-- SpringBoot Web容器 (MVC 模式，用于传统 REST API) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- SpringBoot WebFlux 支持流式响应 (用于 AI 聊天流式接口)
         注意：虽然应用类型为 SERVLET，但 Spring Boot 3.x 支持在 SERVLET 模式下
         处理返回 Flux/Mono 的响应式端点，无需移除 spring-boot-starter-web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>
    
    <!-- Spring AI OpenAI Starter (兼容 DeepSeek) -->
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-model-openai</artifactId>
    </dependency>
</dependencies>
```

**⚠️ 重要说明**：
- 项目同时使用 `spring-boot-starter-web`（MVC）和 `spring-boot-starter-webflux`（响应式）
- Spring Boot 3.x 支持在 SERVLET 模式下处理返回 `Flux`/`Mono` 的响应式端点
- 在 `application-dev.yml` 中已显式配置 `spring.main.web-application-type: servlet` 以确保 MVC 为主模式
- 流式响应接口（返回 `Flux<ChatResponse>`）会自动使用 WebFlux 处理，无需额外配置

### 3. 配置应用类型和 AI 提供商

**3.1 应用类型配置**（在主配置文件 `application.yml` 中）：

```yaml
spring:
  # 应用类型配置：设置为 SERVLET 以支持 MVC，同时保留 WebFlux 的响应式功能
  # Spring Boot 3.x 支持在 SERVLET 模式下处理返回 Flux/Mono 的控制器方法
  main:
    web-application-type: servlet
```

**3.2 Spring AI 配置**（在环境配置文件 `application-dev.yml` 中）：

```yaml
spring:
  # Spring AI 配置
  ai:
    openai:
      base-url: https://api.deepseek.com
      api-key: sk-your-api-key-here
      chat:
        options:
          model: deepseek-chat
          temperature: 0.7
```

**配置说明**：
- 在 `application-dev.yml` 中直接配置 `api-key`
- 将 `sk-your-api-key-here` 替换为你的实际 DeepSeek API Key
- 如果 API Key 未配置或使用默认占位符，应用仍可正常启动，但 AI 功能不可用
- 启动后会显示配置提示

## 常见问题

### 问题 1: Maven 依赖找不到

**错误信息**:
```
Could not find artifact org.springframework.ai:spring-ai-openai-spring-boot-starter:jar:1.1.2
```

**原因**: Spring AI 1.1.x 版本更改了 artifact 名称。

**解决方案**:
- 使用 `spring-ai-starter-model-openai` 替代 `spring-ai-openai-spring-boot-starter`
- 确保 Maven Central 仓库可访问（在 `~/.m2/settings.xml` 中配置）

### 问题 2: Maven Central 仓库访问问题

**错误信息**:
```
Could not find artifact ... in aliyun
```

**解决方案**:
在 `~/.m2/settings.xml` 中配置镜像，排除 central：

```xml
<mirrors>
    <mirror>
        <id>aliyun</id>
        <mirrorOf>*,!central</mirrorOf>
        <name>Aliyun Maven</name>
        <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
</mirrors>
```

### 问题 3: API 版本不兼容

**错误信息**:
```
ChatClient.call() method not found
```

**原因**: Spring AI 1.1.2 使用 `ChatModel` 替代 `ChatClient`。

**解决方案**:
- 使用 `ChatModel` 替代 `ChatClient`
- 使用 `chatModel.call(prompt)` 替代 `chatClient.call(message)`
- 使用 `chatModel.stream(prompt)` 进行流式调用

### 问题 4: WebMVC 和 WebFlux 共存

**问题描述**:
同时添加 `spring-boot-starter-web` 和 `spring-boot-starter-webflux` 时，Spring Boot 默认使用 MVC 模式。

**解决方案**:
1. **显式配置应用类型**（已在主配置文件 `application.yml` 中配置，所有环境都会继承）:
   ```yaml
   spring:
     main:
       web-application-type: servlet
   ```

2. **原理说明**:
   - Spring Boot 3.x 支持在 SERVLET 模式下处理返回 `Flux`/`Mono` 的响应式端点
   - 流式响应接口（返回 `Flux<ChatResponse>`）会自动使用 WebFlux 处理
   - 传统 MVC 接口继续使用 Servlet 模式，互不干扰

3. **验证**:
   - 流式接口 `/ai/chat/stream` 返回 `Flux<ChatResponse>`，应正常工作
   - 其他 MVC 接口应继续正常工作

### 问题 5: API Key 未配置

**问题描述**:
当 `api-key` 未配置或使用默认占位符时，AI 功能不可用。

**解决方案**:
- 在 `application-dev.yml` 中直接配置 `api-key: sk-your-actual-api-key`
- `AiConfigValidator` 会在启动后检查 API Key 配置并显示警告
- 应用可正常启动，但 AI 功能不可用

## API 使用示例

### 流式调用

```java
@Autowired
private ChatModel chatModel;

public Flux<ChatResponse> streamChat(String message) {
    Prompt prompt = new Prompt(new UserMessage(message));
    return chatModel.stream(prompt);
}
```

### 非流式调用

```java
@Autowired
private ChatModel chatModel;

public String chat(String message) {
    Prompt prompt = new Prompt(new UserMessage(message));
    ChatResponse response = chatModel.call(prompt);
    return response.getResult().getOutput().getText();
}
```

## 参考资源

- [Spring AI 官方文档](https://docs.spring.io/spring-ai/reference/)
- [Spring AI GitHub Releases](https://github.com/spring-projects/spring-ai/releases)
