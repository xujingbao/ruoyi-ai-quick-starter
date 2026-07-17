package com.ruoyi.web.controller.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Pi Agent 侧车配置
 *
 * @author evan
 */
@Component
@ConfigurationProperties(prefix = "ruoyi.ai.agent")
public class AiAgentProperties
{
    /** 侧车 base URL，默认本机 */
    private String baseUrl = "http://127.0.0.1:19090";

    /** 与侧车共享的内部令牌（请求头 X-AI-Agent-Token） */
    private String internalToken = "ruoyi-ai-agent-dev-token";

    /** 默认工具模式：business=仅系统工具，full=系统+沙箱 */
    private String toolMode = "business";

    public String getBaseUrl()
    {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl)
    {
        this.baseUrl = baseUrl;
    }

    public String getInternalToken()
    {
        return internalToken;
    }

    public void setInternalToken(String internalToken)
    {
        this.internalToken = internalToken;
    }

    public String getToolMode()
    {
        return toolMode;
    }

    public void setToolMode(String toolMode)
    {
        this.toolMode = toolMode;
    }
}
