package com.ruoyi.web.controller.ai;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.domain.model.LoginUser;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.common.utils.ServletUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.domain.AiSessionContext;
import com.ruoyi.system.service.IAiSessionContextService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotBlank;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * AI Agent 网关（代理 Pi 侧车）
 *
 * @author evan
 */
@RestController
@RequestMapping("/ai/agent")
public class AiAgentController extends BaseController
{
    @Autowired
    private AiAgentClient aiAgentClient;

    @Autowired
    private AiAgentProperties aiAgentProperties;

    @Autowired
    private IAiSessionContextService aiSessionContextService;

    @GetMapping("/health")
    public AjaxResult health()
    {
        requireLogin();
        try
        {
            Map<String, Object> body = aiAgentClient.health().block();
            return success(body);
        }
        catch (Exception e)
        {
            logger.warn("AI Agent health failed: {}", e.getMessage());
            return error(e.getMessage());
        }
    }

    @PostMapping("/sessions")
    @Log(title = "AI Agent", businessType = BusinessType.OTHER)
    public AjaxResult createSession(@RequestBody(required = false) Map<String, Object> body)
    {
        LoginUser loginUser = requireLogin();
        String title = body != null && body.get("title") != null ? String.valueOf(body.get("title")) : "New Agent Session";
        String toolMode = body != null && body.get("toolMode") != null
            ? String.valueOf(body.get("toolMode"))
            : aiAgentProperties.getToolMode();
        try
        {
            Map<String, Object> created = aiAgentClient
                .createSession(loginUser.getUserId(), title, resolveAccessToken(), toolMode)
                .block();
            if (created == null || created.get("sessionId") == null)
            {
                return error("创建会话失败");
            }
            String sessionId = String.valueOf(created.get("sessionId"));
            String workspace = created.get("workspace") != null ? String.valueOf(created.get("workspace")) : "";
            String mode = created.get("toolMode") != null ? String.valueOf(created.get("toolMode")) : toolMode;
            aiSessionContextService.upsertSession(sessionId, loginUser.getUserId(), title, workspace, mode);
            return success(created);
        }
        catch (Exception e)
        {
            logger.error("创建 AI Agent 会话失败", e);
            return error(e.getMessage());
        }
    }

    @GetMapping("/sessions")
    public AjaxResult listSessions()
    {
        LoginUser loginUser = requireLogin();
        List<AiSessionContext> list = aiSessionContextService.selectByUserId(loginUser.getUserId());
        // 列表不回传完整消息，避免体积过大
        for (AiSessionContext row : list)
        {
            row.setContextData(null);
        }
        return success(list);
    }

    @GetMapping("/sessions/{sessionId}")
    public AjaxResult getSession(@PathVariable("sessionId") String sessionId)
    {
        LoginUser loginUser = requireLogin();
        AiSessionContext meta = aiSessionContextService.selectBySessionId(sessionId);
        if (meta == null || meta.getUserId() == null || !meta.getUserId().equals(loginUser.getUserId()))
        {
            return error("无权访问该会话");
        }
        Map<String, Object> body = new HashMap<>();
        body.put("sessionId", meta.getSessionId());
        body.put("summary", meta.getSummary());
        body.put("toolMode", aiSessionContextService.resolveToolMode(meta));
        body.put("workspace", aiSessionContextService.resolveWorkspace(meta));
        body.put("messages", aiSessionContextService.resolveMessages(meta));
        body.put("updatedAt", meta.getUpdatedAt());
        body.put("createdAt", meta.getCreatedAt());
        return success(body);
    }

    @PutMapping("/sessions/{sessionId}/messages")
    public AjaxResult saveMessages(
        @PathVariable("sessionId") String sessionId,
        @RequestBody(required = false) Map<String, Object> body)
    {
        LoginUser loginUser = requireLogin();
        AiSessionContext meta = aiSessionContextService.selectBySessionId(sessionId);
        if (meta == null || meta.getUserId() == null || !meta.getUserId().equals(loginUser.getUserId()))
        {
            return error("无权访问该会话");
        }
        Object messages = body != null ? body.get("messages") : null;
        String json;
        try
        {
            json = messages == null
                ? "[]"
                : new tools.jackson.databind.ObjectMapper().writeValueAsString(messages);
        }
        catch (Exception e)
        {
            return error("消息格式无效");
        }
        aiSessionContextService.updateMessages(sessionId, loginUser.getUserId(), json);
        return success();
    }

    @PostMapping(value = "/sessions/{sessionId}/prompt", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Log(title = "AI Agent", businessType = BusinessType.OTHER)
    public Flux<ServerSentEvent<String>> prompt(
        @PathVariable("sessionId") String sessionId,
        @Validated @RequestBody AgentPromptRequest request)
    {
        LoginUser loginUser;
        try
        {
            loginUser = requireLogin();
        }
        catch (Exception e)
        {
            return Flux.error(new org.springframework.security.access.AccessDeniedException("未授权访问"));
        }

        AiSessionContext meta = aiSessionContextService.selectBySessionId(sessionId);
        if (meta == null || meta.getUserId() == null || !meta.getUserId().equals(loginUser.getUserId()))
        {
            return Flux.error(new org.springframework.security.access.AccessDeniedException("无权访问该会话"));
        }

        Long userId = loginUser.getUserId();
        String accessToken = resolveAccessToken();
        String title = meta.getSummary() != null ? meta.getSummary() : "Agent Session";
        String workspace = aiSessionContextService.resolveWorkspace(meta);
        String toolMode = request.getToolMode() != null && !request.getToolMode().isBlank()
            ? request.getToolMode()
            : aiSessionContextService.resolveToolMode(meta);
        String correlationId = UUID.randomUUID().toString().replace("-", "");

        Mono<Map<String, Object>> ensure = aiAgentClient.ensureSession(
            userId, sessionId, title, accessToken, toolMode, workspace);

        final String[] latestTitle = { title };

        return ensure.thenMany(
            aiAgentClient.prompt(sessionId, userId, request.getMessage(), accessToken, toolMode,
                workspace, correlationId, title)
        )
            .doOnNext(sse -> {
                if (sse == null || !"session_title".equals(sse.event()) || sse.data() == null)
                {
                    return;
                }
                try
                {
                    String summarized = extractJsonField(sse.data(), "title");
                    if (StringUtils.isNotEmpty(summarized))
                    {
                        latestTitle[0] = summarized;
                        aiSessionContextService.updateSummary(sessionId, userId, summarized);
                    }
                }
                catch (Exception ex)
                {
                    logger.warn("保存 AI 会话主题失败: {}", ex.getMessage());
                }
            })
            .doOnComplete(() -> {
                try
                {
                    aiSessionContextService.upsertSession(sessionId, userId, latestTitle[0], workspace, toolMode);
                }
                catch (Exception ex)
                {
                    logger.warn("更新会话元数据失败: {}", ex.getMessage());
                }
            })
            .onErrorResume(err -> Flux.just(
                ServerSentEvent.<String>builder()
                    .event("error")
                    .data("{\"type\":\"error\",\"message\":\"" + escapeJson(err.getMessage()) + "\"}")
                    .build()
            ));
    }

    @PostMapping("/sessions/{sessionId}/abort")
    public AjaxResult abort(@PathVariable("sessionId") String sessionId)
    {
        LoginUser loginUser = requireLogin();
        AiSessionContext meta = aiSessionContextService.selectBySessionId(sessionId);
        if (meta == null || meta.getUserId() == null || !meta.getUserId().equals(loginUser.getUserId()))
        {
            return error("无权访问该会话");
        }
        try
        {
            Map<String, Object> result = aiAgentClient.abort(sessionId, loginUser.getUserId()).block();
            return success(result != null ? result : Map.of("ok", true));
        }
        catch (Exception e)
        {
            return error(e.getMessage());
        }
    }

    private LoginUser requireLogin()
    {
        return SecurityUtils.getLoginUser();
    }

    private String resolveAccessToken()
    {
        try
        {
            HttpServletRequest request = ServletUtils.getRequest();
            if (request == null)
            {
                return null;
            }
            String header = request.getHeader("Authorization");
            if (StringUtils.isNotEmpty(header) && header.startsWith("Bearer "))
            {
                return header.substring(7).trim();
            }
            return header;
        }
        catch (Exception e)
        {
            return null;
        }
    }

    private static String escapeJson(String message)
    {
        if (message == null)
        {
            return "";
        }
        return message
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n");
    }

    /** 轻量提取 JSON 字符串字段，避免引入完整 JSON 解析依赖路径 */
    private static String extractJsonField(String json, String field)
    {
        if (StringUtils.isEmpty(json) || StringUtils.isEmpty(field))
        {
            return null;
        }
        String key = "\"" + field + "\"";
        int idx = json.indexOf(key);
        if (idx < 0)
        {
            return null;
        }
        int colon = json.indexOf(':', idx + key.length());
        if (colon < 0)
        {
            return null;
        }
        int start = json.indexOf('"', colon + 1);
        if (start < 0)
        {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = start + 1; i < json.length(); i++)
        {
            char ch = json.charAt(i);
            if (ch == '\\' && i + 1 < json.length())
            {
                sb.append(json.charAt(++i));
                continue;
            }
            if (ch == '"')
            {
                break;
            }
            sb.append(ch);
        }
        String value = sb.toString().trim();
        return value.isEmpty() ? null : value;
    }

    /**
     * Agent prompt 请求体
     */
    public static class AgentPromptRequest
    {
        @NotBlank(message = "消息内容不能为空")
        private String message;

        private String toolMode;

        public String getMessage()
        {
            return message;
        }

        public void setMessage(String message)
        {
            this.message = message;
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
}
