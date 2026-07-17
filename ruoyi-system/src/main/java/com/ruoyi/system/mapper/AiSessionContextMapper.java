package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.AiSessionContext;

/**
 * AI Agent 会话元数据
 *
 * @author evan
 */
public interface AiSessionContextMapper
{
    AiSessionContext selectBySessionId(String sessionId);

    List<AiSessionContext> selectByUserId(Long userId);

    int insert(AiSessionContext context);

    int update(AiSessionContext context);
}
