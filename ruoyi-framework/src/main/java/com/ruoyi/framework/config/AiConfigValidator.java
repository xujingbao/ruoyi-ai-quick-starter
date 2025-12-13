package com.ruoyi.framework.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

/**
 * Spring AI 配置验证器
 * 在应用启动后检查 API Key 配置，提供友好的警告信息
 * 
 * @author evan
 */
@Component
public class AiConfigValidator implements ApplicationListener<ApplicationReadyEvent>
{
    private static final Logger log = LoggerFactory.getLogger(AiConfigValidator.class);

    @Value("${spring.ai.openai.api-key:}")
    private String apiKey;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event)
    {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("sk-your-api-key-here"))
        {
            log.warn("⚠️  DeepSeek API Key 未配置，AI 功能不可用。请在 application-dev.yml 中配置 api-key");
        }
    }
}
