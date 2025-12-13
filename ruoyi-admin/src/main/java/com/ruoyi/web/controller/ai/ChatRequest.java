package com.ruoyi.web.controller.ai;

import jakarta.validation.constraints.NotBlank;

/**
 * AI 聊天请求参数
 * 
 * @author evan
 */
public class ChatRequest
{
    /**
     * 用户消息内容
     */
    @NotBlank(message = "消息内容不能为空")
    private String message;

    /**
     * 系统提示词（可选）
     */
    private String systemPrompt;

    /**
     * 温度参数（可选，0.0-2.0）
     */
    private Double temperature;

    public String getMessage()
    {
        return message;
    }

    public void setMessage(String message)
    {
        this.message = message;
    }

    public String getSystemPrompt()
    {
        return systemPrompt;
    }

    public void setSystemPrompt(String systemPrompt)
    {
        this.systemPrompt = systemPrompt;
    }

    public Double getTemperature()
    {
        return temperature;
    }

    public void setTemperature(Double temperature)
    {
        this.temperature = temperature;
    }
}

