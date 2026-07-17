package com.ruoyi.system.service;

/**
 * AI Agent 工具审计
 *
 * @author evan
 */
public interface IAiAgentAuditLogService
{
    void record(String correlationId, Long userId, String sessionId, String toolName,
        String status, int durationMs, String detail);
}
