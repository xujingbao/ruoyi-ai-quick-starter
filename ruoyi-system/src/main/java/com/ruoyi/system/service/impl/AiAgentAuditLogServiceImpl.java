package com.ruoyi.system.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.domain.AiAgentAuditLog;
import com.ruoyi.system.mapper.AiAgentAuditLogMapper;
import com.ruoyi.system.service.IAiAgentAuditLogService;

/**
 * AI Agent 工具审计实现
 *
 * @author evan
 */
@Service
public class AiAgentAuditLogServiceImpl implements IAiAgentAuditLogService
{
    private static final Logger log = LoggerFactory.getLogger(AiAgentAuditLogServiceImpl.class);

    @Autowired
    private AiAgentAuditLogMapper aiAgentAuditLogMapper;

    @Override
    public void record(String correlationId, Long userId, String sessionId, String toolName,
        String status, int durationMs, String detail)
    {
        try
        {
            AiAgentAuditLog row = new AiAgentAuditLog();
            row.setCorrelationId(StringUtils.isNotEmpty(correlationId) ? correlationId : null);
            row.setUserId(userId);
            row.setSessionId(sessionId);
            row.setToolName(toolName);
            row.setStatus(status);
            row.setDurationMs(durationMs);
            if (detail != null && detail.length() > 1000)
            {
                detail = detail.substring(0, 1000);
            }
            row.setDetail(detail);
            aiAgentAuditLogMapper.insert(row);
        }
        catch (Exception e)
        {
            log.warn("AI Agent audit write failed: {}", e.getMessage());
        }
    }
}
