package com.ruoyi.system.domain;

import java.util.Date;

/**
 * AI Agent 会话元数据 ai_session_context
 *
 * @author evan
 */
public class AiSessionContext
{
    private String sessionId;

    private Long userId;

    /** JSON 字符串，写入 jsonb */
    private String contextData;

    private String summary;

    private Date createdAt;

    private Date updatedAt;

    public String getSessionId()
    {
        return sessionId;
    }

    public void setSessionId(String sessionId)
    {
        this.sessionId = sessionId;
    }

    public Long getUserId()
    {
        return userId;
    }

    public void setUserId(Long userId)
    {
        this.userId = userId;
    }

    public String getContextData()
    {
        return contextData;
    }

    public void setContextData(String contextData)
    {
        this.contextData = contextData;
    }

    public String getSummary()
    {
        return summary;
    }

    public void setSummary(String summary)
    {
        this.summary = summary;
    }

    public Date getCreatedAt()
    {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt)
    {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt()
    {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt)
    {
        this.updatedAt = updatedAt;
    }
}
