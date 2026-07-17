package com.ruoyi.system.service;

import java.util.List;
import java.util.Map;
import com.ruoyi.system.domain.AiSessionContext;

/**
 * AI Agent 会话元数据服务
 *
 * @author evan
 */
public interface IAiSessionContextService
{
    AiSessionContext selectBySessionId(String sessionId);

    List<AiSessionContext> selectByUserId(Long userId);

    void upsertSession(String sessionId, Long userId, String title, String workspace);

    void upsertSession(String sessionId, Long userId, String title, String workspace, String toolMode);

    /** 仅更新会话主题（summary），保留 workspace / toolMode / messages */
    void updateSummary(String sessionId, Long userId, String summary);

    /** 保存前端对话消息列表（JSON 数组字符串）到 context_data.messages */
    void updateMessages(String sessionId, Long userId, String messagesJson);

    List<Map<String, Object>> resolveMessages(AiSessionContext meta);

    String resolveWorkspace(AiSessionContext meta);

    String resolveToolMode(AiSessionContext meta);
}
