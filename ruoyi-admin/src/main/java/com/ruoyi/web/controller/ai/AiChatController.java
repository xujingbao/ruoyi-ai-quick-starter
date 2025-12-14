package com.ruoyi.web.controller.ai;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.utils.SecurityUtils;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;

/**
 * AI 聊天流式接口
 * 
 * @author evan
 */
@RestController
@RequestMapping("/ai/chat")
public class AiChatController extends BaseController
{
    @Autowired(required = false)
    private ChatModel chatModel;

    /**
     * 流式聊天接口
     * 
     * @param request 请求参数
     * @return 流式响应
     */
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Log(title = "AI聊天", businessType = BusinessType.OTHER)
    public Flux<ChatResponse> streamChat(@Validated @RequestBody ChatRequest request)
    {
        // 在返回 Flux 之前验证用户认证（确保 SecurityContext 在主线程中可用）
        // 注意：不使用 @PreAuthorize，因为流式响应是异步的，会在响应提交后再次检查导致错误
        try
        {
            SecurityUtils.getLoginUser();
        }
        catch (Exception e)
        {
            logger.warn("流式接口认证失败: {}", e.getMessage());
            return Flux.error(new org.springframework.security.access.AccessDeniedException("未授权访问"));
        }

        try
        {
            logger.info("开始流式 AI 聊天，消息：{}", request.getMessage());

            List<Message> messages = new ArrayList<>();
            if (request.getSystemPrompt() != null && !request.getSystemPrompt().trim().isEmpty())
            {
                messages.add(new SystemMessage(request.getSystemPrompt()));
            }
            messages.add(new UserMessage(request.getMessage()));

            return chatModel.stream(new Prompt(messages))
                    .onErrorMap(error -> {
                        // 处理 DeepSeek API 401 错误，转换为友好的错误消息
                        if (error instanceof WebClientResponseException.Unauthorized)
                        {
                            logger.error("DeepSeek API Key 无效或已过期: {}", error.getMessage());
                            return new RuntimeException("DeepSeek API Key 无效或已过期，请检查配置");
                        }
                        return error;
                    })
                    .doOnError(error -> logger.error("AI 流式响应错误", error));
        }
        catch (Exception e)
        {
            logger.error("AI 流式调用异常", e);
            return Flux.error(e);
        }
    }
}

