package com.ruoyi.system.service.impl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.domain.AiSessionContext;
import com.ruoyi.system.mapper.AiSessionContextMapper;
import com.ruoyi.system.service.IAiSessionContextService;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;

/**
 * AI Agent 会话元数据服务实现
 *
 * @author evan
 */
@Service
public class AiSessionContextServiceImpl implements IAiSessionContextService
{
    private static final int MAX_MESSAGES = 200;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private AiSessionContextMapper aiSessionContextMapper;

    @Override
    public AiSessionContext selectBySessionId(String sessionId)
    {
        return aiSessionContextMapper.selectBySessionId(sessionId);
    }

    @Override
    public List<AiSessionContext> selectByUserId(Long userId)
    {
        return aiSessionContextMapper.selectByUserId(userId);
    }

    @Override
    public void upsertSession(String sessionId, Long userId, String title, String workspace)
    {
        upsertSession(sessionId, userId, title, workspace, null);
    }

    @Override
    public void upsertSession(String sessionId, Long userId, String title, String workspace, String toolMode)
    {
        AiSessionContext existing = aiSessionContextMapper.selectBySessionId(sessionId);
        ObjectNode ctx = readContext(existing);

        if (StringUtils.isNotEmpty(workspace))
        {
            ctx.put("workspace", workspace);
        }
        else if (!ctx.hasNonNull("workspace"))
        {
            ctx.put("workspace", "");
        }

        String mode = toolMode;
        if (StringUtils.isEmpty(mode))
        {
            mode = textOr(ctx, "toolMode", "business");
        }
        if (!"full".equalsIgnoreCase(mode))
        {
            mode = "business";
        }
        ctx.put("toolMode", mode);
        ctx.put("runtime", "pi");
        if (StringUtils.isNotEmpty(title))
        {
            ctx.put("title", title);
        }
        else if (!ctx.hasNonNull("title"))
        {
            ctx.put("title", "新会话");
        }
        if (!ctx.has("messages") || !ctx.get("messages").isArray())
        {
            ctx.putArray("messages");
        }

        persist(existing, sessionId, userId, ctx, StringUtils.isNotEmpty(title) ? title : textOr(ctx, "title", "新会话"));
    }

    @Override
    public void updateSummary(String sessionId, Long userId, String summary)
    {
        if (StringUtils.isEmpty(sessionId) || StringUtils.isEmpty(summary) || userId == null)
        {
            return;
        }
        AiSessionContext existing = aiSessionContextMapper.selectBySessionId(sessionId);
        if (existing == null || existing.getUserId() == null || !existing.getUserId().equals(userId))
        {
            return;
        }
        ObjectNode ctx = readContext(existing);
        ctx.put("title", summary.trim());
        persist(existing, sessionId, userId, ctx, summary.trim());
    }

    @Override
    public void updateMessages(String sessionId, Long userId, String messagesJson)
    {
        if (StringUtils.isEmpty(sessionId) || userId == null)
        {
            return;
        }
        AiSessionContext existing = aiSessionContextMapper.selectBySessionId(sessionId);
        if (existing == null || existing.getUserId() == null || !existing.getUserId().equals(userId))
        {
            return;
        }
        ObjectNode ctx = readContext(existing);
        try
        {
            JsonNode arr = objectMapper.readTree(StringUtils.isEmpty(messagesJson) ? "[]" : messagesJson);
            if (!arr.isArray())
            {
                arr = objectMapper.createArrayNode();
            }
            ArrayNode trimmed = objectMapper.createArrayNode();
            int from = Math.max(0, arr.size() - MAX_MESSAGES);
            for (int i = from; i < arr.size(); i++)
            {
                trimmed.add(arr.get(i));
            }
            ctx.set("messages", trimmed);
        }
        catch (Exception e)
        {
            ctx.putArray("messages");
        }
        String summary = existing.getSummary();
        if (StringUtils.isEmpty(summary))
        {
            summary = textOr(ctx, "title", "新会话");
        }
        persist(existing, sessionId, userId, ctx, summary);
    }

    @Override
    public List<Map<String, Object>> resolveMessages(AiSessionContext meta)
    {
        if (meta == null || StringUtils.isEmpty(meta.getContextData()))
        {
            return Collections.emptyList();
        }
        try
        {
            JsonNode root = objectMapper.readTree(meta.getContextData());
            JsonNode messages = root.get("messages");
            if (messages == null || !messages.isArray())
            {
                return Collections.emptyList();
            }
            return objectMapper.convertValue(messages, new TypeReference<List<Map<String, Object>>>() {});
        }
        catch (Exception e)
        {
            return new ArrayList<>();
        }
    }

    @Override
    public String resolveWorkspace(AiSessionContext meta)
    {
        return textOr(readContext(meta), "workspace", "");
    }

    @Override
    public String resolveToolMode(AiSessionContext meta)
    {
        String mode = textOr(readContext(meta), "toolMode", "business");
        return "full".equalsIgnoreCase(mode) ? "full" : "business";
    }

    private void persist(AiSessionContext existing, String sessionId, Long userId, ObjectNode ctx, String summary)
    {
        String contextData;
        try
        {
            contextData = objectMapper.writeValueAsString(ctx);
        }
        catch (Exception e)
        {
            contextData = "{\"runtime\":\"pi\",\"messages\":[]}";
        }
        if (existing == null)
        {
            AiSessionContext row = new AiSessionContext();
            row.setSessionId(sessionId);
            row.setUserId(userId);
            row.setContextData(contextData);
            row.setSummary(summary);
            aiSessionContextMapper.insert(row);
            return;
        }
        existing.setContextData(contextData);
        existing.setSummary(summary);
        aiSessionContextMapper.update(existing);
    }

    private ObjectNode readContext(AiSessionContext existing)
    {
        if (existing == null || StringUtils.isEmpty(existing.getContextData()))
        {
            ObjectNode node = objectMapper.createObjectNode();
            node.putArray("messages");
            return node;
        }
        try
        {
            JsonNode root = objectMapper.readTree(existing.getContextData());
            if (root != null && root.isObject())
            {
                return (ObjectNode) root;
            }
        }
        catch (Exception ignored)
        {
            // fall through
        }
        ObjectNode node = objectMapper.createObjectNode();
        node.putArray("messages");
        return node;
    }

    private static String textOr(ObjectNode ctx, String field, String defaultValue)
    {
        if (ctx == null || !ctx.hasNonNull(field))
        {
            return defaultValue;
        }
        String v = ctx.get(field).asText();
        return StringUtils.isEmpty(v) ? defaultValue : v;
    }
}
