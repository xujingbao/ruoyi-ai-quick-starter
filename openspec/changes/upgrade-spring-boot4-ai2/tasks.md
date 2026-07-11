## 1. Dependency upgrades

- [x] 1.1 Update root `pom.xml`: Spring Boot `4.0.7`, Spring AI `2.0.0`, MyBatis `4.0.1`, PageHelper `4.1.1`, Druid `1.2.28` + `druid-spring-boot-4-starter`, springdoc `3.0.3`
- [x] 1.2 Switch `ruoyi-framework` Druid artifact to `druid-spring-boot-4-starter`
- [x] 1.3 Adjust Jackson dependency coordinates in `ruoyi-common` if Boot 4 / Jackson 3 requires it

## 2. Boot 4 / Jackson 3 source fixes

- [x] 2.1 Fix `RuoYiApplication` `DataSourceAutoConfiguration` import for Boot 4 package move
- [x] 2.2 Migrate `ApplicationConfig` from `Jackson2ObjectMapperBuilderCustomizer` to Boot 4 Jackson 3 customizer API
- [x] 2.3 Confirm `DruidConfig` Boot4 autoconfigure imports match `druid-spring-boot-4-starter`
- [x] 2.4 Fix any remaining Boot 4 / Jackson 3 compile errors across modules

## 3. Spring AI 2.0 adaptation

- [x] 3.1 Verify `AiChatController` / `OpenAiChatOptions` / `ChatModel.stream` compile under Spring AI 2.0
- [x] 3.2 Adjust `spring.ai.*` config keys only if Upgrade Notes require flattening/renames for used properties

## 4. Docs and verify

- [x] 4.1 Update `VERSIONS.md`, `README.md`, `openspec/project.md` tech stack versions
- [x] 4.2 Run `mvn -DskipTests compile` and resolve remaining build errors
