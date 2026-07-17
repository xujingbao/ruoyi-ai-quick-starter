package com.ruoyi.web.controller.ai;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Pi Agent 侧车 HTTP 客户端
 *
 * @author evan
 */
@Component
public class AiAgentClient
{
    private final WebClient webClient;
    private final AiAgentProperties properties;

    public AiAgentClient(AiAgentProperties properties)
    {
        this.properties = properties;
        WebClient.Builder builder = WebClient.builder().baseUrl(properties.getBaseUrl());
        if (properties.getInternalToken() != null && !properties.getInternalToken().isBlank())
        {
            builder.defaultHeader("X-AI-Agent-Token", properties.getInternalToken());
        }
        this.webClient = builder.build();
    }

    public Mono<Map<String, Object>> health()
    {
        return webClient.get()
            .uri("/v1/health")
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .timeout(Duration.ofSeconds(3))
            .onErrorMap(this::mapUnavailable);
    }

    public Mono<Map<String, Object>> createSession(Long userId, String title, String accessToken, String toolMode)
    {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        if (title != null && !title.isBlank())
        {
            body.put("title", title);
        }
        if (accessToken != null && !accessToken.isBlank())
        {
            body.put("accessToken", accessToken);
        }
        body.put("toolMode", resolveToolMode(toolMode));
        return webClient.post()
            .uri("/v1/sessions")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .timeout(Duration.ofSeconds(30))
            .onErrorMap(this::mapUnavailable);
    }

    public Mono<Map<String, Object>> ensureSession(Long userId, String sessionId, String title,
        String accessToken, String toolMode, String workspace)
    {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        body.put("sessionId", sessionId);
        if (title != null && !title.isBlank())
        {
            body.put("title", title);
        }
        if (accessToken != null && !accessToken.isBlank())
        {
            body.put("accessToken", accessToken);
        }
        body.put("toolMode", resolveToolMode(toolMode));
        if (workspace != null && !workspace.isBlank())
        {
            body.put("workspace", workspace);
        }
        return webClient.post()
            .uri("/v1/sessions/ensure")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .timeout(Duration.ofSeconds(30))
            .onErrorMap(this::mapUnavailable);
    }

    public Flux<ServerSentEvent<String>> prompt(String sessionId, Long userId, String message,
        String accessToken, String toolMode, String workspace, String correlationId, String title)
    {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        body.put("message", message);
        if (accessToken != null && !accessToken.isBlank())
        {
            body.put("accessToken", accessToken);
        }
        body.put("toolMode", resolveToolMode(toolMode));
        if (workspace != null && !workspace.isBlank())
        {
            body.put("workspace", workspace);
        }
        if (title != null && !title.isBlank())
        {
            body.put("title", title);
        }
        if (correlationId != null && !correlationId.isBlank())
        {
            body.put("correlationId", correlationId);
        }
        return webClient.post()
            .uri("/v1/sessions/{id}/prompt", sessionId)
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.TEXT_EVENT_STREAM)
            .headers(h -> {
                if (correlationId != null && !correlationId.isBlank())
                {
                    h.set("X-Correlation-Id", correlationId);
                }
            })
            .bodyValue(body)
            .retrieve()
            .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
            .onErrorMap(this::mapUnavailable);
    }

    public Mono<Map<String, Object>> abort(String sessionId, Long userId)
    {
        Map<String, Object> body = new HashMap<>();
        if (userId != null)
        {
            body.put("userId", userId);
        }
        return webClient.post()
            .uri("/v1/sessions/{id}/abort", sessionId)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
            .timeout(Duration.ofSeconds(10))
            .onErrorMap(this::mapUnavailable);
    }

    private String resolveToolMode(String toolMode)
    {
        if ("full".equalsIgnoreCase(toolMode))
        {
            return "full";
        }
        if ("business".equalsIgnoreCase(toolMode))
        {
            return "business";
        }
        String configured = properties.getToolMode();
        return "full".equalsIgnoreCase(configured) ? "full" : "business";
    }

    private Throwable mapUnavailable(Throwable error)
    {
        if (error instanceof WebClientRequestException)
        {
            return new IllegalStateException("AI Agent 侧车不可用，请先在 ruoyi-ai-agent 执行 npm start", error);
        }
        if (error instanceof WebClientResponseException ex)
        {
            String detail = ex.getResponseBodyAsString();
            return new IllegalStateException(
                "AI Agent 侧车错误 (" + ex.getStatusCode().value() + "): "
                    + (detail == null || detail.isBlank() ? ex.getMessage() : detail),
                error);
        }
        return error;
    }
}
