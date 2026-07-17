import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Segmented, Select, Space, Typography } from 'antd'
import {
  HistoryOutlined,
  PlusOutlined,
  ReloadOutlined,
  RobotOutlined,
  StopOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Sender } from '@ant-design/x'
import {
  abortAgentSession,
  createAgentSession,
  getAgentSession,
  listAgentSessions,
  saveAgentMessages,
  streamAgentPrompt
} from '@/api/ai/agent'
import modal from '@/plugins/modal'
import { uid, useAgentShellStore } from '@/store/agentShellStore'
import AssistantTurn from './AssistantTurn'
import { groupThreadMessages } from './ToolProcessGroup'

const { Text, Title } = Typography

function pickSessionId(res) {
  if (!res) return ''
  if (typeof res === 'string') return res
  return (
    res.data?.sessionId ||
    res.sessionId ||
    res.data?.data?.sessionId ||
    ''
  )
}

function pickSessions(res) {
  const raw = res?.data ?? res?.rows ?? res
  return Array.isArray(raw) ? raw : []
}

function formatSessionTime(value) {
  if (!value) return ''
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${mm}-${dd} ${hh}:${mi}`
}

function isGenericSessionTitle(raw) {
  const t = (raw || '').trim()
  if (!t) return true
  if (t === 'Shell' || t === 'Workbench' || t === 'New Agent Session' || t === 'Agent Session') {
    return true
  }
  return /^会话(\s+\d{1,2}:\d{2})?$/.test(t)
}

function sessionLabel(h) {
  const id = String(h.sessionId || '').slice(0, 8)
  const time = formatSessionTime(h.updatedAt || h.createdAt)
  const raw = (h.summary || '').trim()
  const title = isGenericSessionTitle(raw) ? '新会话' : raw.slice(0, 16)
  // AI 主题优先：主题 · 时间
  if (!isGenericSessionTitle(raw)) {
    return time ? `${title} · ${time}` : title
  }
  if (time && id) return `${time} · ${id}`
  return id || title
}

function defaultSessionTitle() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `会话 ${hh}:${mi}`
}

function pickSessionPayload(res) {
  if (!res) return null
  if (res.data && (res.data.sessionId || res.data.messages)) return res.data
  if (res.sessionId || res.messages) return res
  return res.data?.data || null
}

/** Persistable snapshot; trim oversized tool payloads */
function serializeMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter((m) => m && (m.kind === 'text' || m.kind === 'tool' || m.role === 'user' || m.role === 'assistant'))
    .map((m) => {
      if (m.kind === 'tool') {
        let result = m.result
        try {
          const s = typeof result === 'string' ? result : JSON.stringify(result)
          if (s && s.length > 12000) {
            result = `${s.slice(0, 12000)}…`
          }
        } catch {
          result = null
        }
        return {
          id: m.id,
          role: 'tool',
          kind: 'tool',
          toolName: m.toolName,
          args: m.args,
          done: !!m.done,
          isError: !!m.isError,
          result
        }
      }
      return {
        id: m.id,
        role: m.role,
        kind: m.kind || 'text',
        content: m.content || ''
      }
    })
}

function normalizeLoadedMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null
  return raw.map((m, idx) => {
    if (m.kind === 'tool' || m.role === 'tool') {
      return {
        id: m.id || `tool_${idx}`,
        role: 'tool',
        kind: 'tool',
        toolName: m.toolName,
        args: m.args,
        done: m.done !== false,
        isError: !!m.isError,
        result: m.result ?? null
      }
    }
    return {
      id: m.id || `msg_${idx}`,
      role: m.role === 'user' ? 'user' : 'assistant',
      kind: 'text',
      content: m.content || ''
    }
  })
}

const QUICK_PROMPTS_BUSINESS = ['列出用户', '查询公告', '列出定时任务', '查询配置 sys.user.initPassword']
const QUICK_PROMPTS_FULL = [
  '列出用户',
  '查询公告',
  '列出定时任务',
  '沙箱里有哪些文件？'
]

/**
 * Shared agent conversation workbench.
 * @param {{ compact?: boolean, layout?: 'page'|'compact', autoStart?: boolean }} props
 */
export default function AgentWorkbench({
  compact = false,
  layout,
  autoStart = true
}) {
  const isPage = (layout || (compact ? 'compact' : 'page')) === 'page'
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [history, setHistory] = useState([])

  const sessionId = useAgentShellStore((s) => s.sessionId)
  const toolMode = useAgentShellStore((s) => s.toolMode)
  const messages = useAgentShellStore((s) => s.messages)
  const setSessionId = useAgentShellStore((s) => s.setSessionId)
  const setToolMode = useAgentShellStore((s) => s.setToolMode)
  const setMessages = useAgentShellStore((s) => s.setMessages)
  const resetConversation = useAgentShellStore((s) => s.resetConversation)

  const cancelRef = useRef(null)
  const listRef = useRef(null)
  const sessionIdRef = useRef(sessionId)
  sessionIdRef.current = sessionId

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const refreshHistory = useCallback(async () => {
    try {
      const res = await listAgentSessions()
      const list = pickSessions(res)
        .filter((h) => h?.sessionId)
        .slice(0, 15)
      setHistory(list)
    } catch {
      // ignore
    }
  }, [])

  const connect = useCallback(async (title, mode) => {
    setConnecting(true)
    setConnectError('')
    try {
      const res = await createAgentSession({
        title: title || defaultSessionTitle(),
        toolMode: mode || toolMode
      })
      const id = pickSessionId(res)
      if (!id) {
        const msg = res?.msg || '创建会话失败：未返回 sessionId'
        setConnectError(msg)
        modal.msgError(msg)
        return null
      }
      setSessionId(id)
      setConnectError('')
      refreshHistory()
      return id
    } catch (e) {
      const msg = e?.message || '创建会话失败，请确认侧车已启动（cd ruoyi-ai-agent && npm start）'
      setConnectError(msg)
      modal.msgError(msg)
      return null
    } finally {
      setConnecting(false)
    }
  }, [isPage, toolMode, setSessionId, refreshHistory])

  useEffect(() => {
    if (!autoStart) return undefined
    let cancelled = false
    ;(async () => {
      if (!sessionIdRef.current) {
        await connect()
      } else {
        refreshHistory()
      }
      if (cancelled) {
        // noop
      }
    })()
    return () => {
      cancelled = true
    }
  }, [autoStart, connect, refreshHistory])

  const newSession = async () => {
    if (loading || connecting) return
    const id = await connect(defaultSessionTitle())
    if (id) {
      resetConversation('已新建会话。')
    }
  }

  const switchToolMode = async (mode) => {
    const next = mode === 'full' ? 'full' : 'business'
    setToolMode(next)
    if (loading || connecting) return
    const id = await connect(defaultSessionTitle(), next)
    if (id) {
      resetConversation(
        next === 'full'
          ? '已切换到沙箱模式（系统工具 + 会话沙箱只读文件）。'
          : '已切换到业务模式（仅系统工具）。'
      )
    }
  }

  const persistMessages = useCallback(async (sid, msgs) => {
    if (!sid) return
    try {
      await saveAgentMessages(sid, serializeMessages(msgs))
    } catch {
      // ignore persist failures; chat still works in-memory
    }
  }, [])

  const resumeSession = async (id) => {
    if (!id || loading || connecting) return
    setConnecting(true)
    setConnectError('')
    try {
      setSessionId(id)
      const res = await getAgentSession(id)
      const payload = pickSessionPayload(res)
      if (payload?.toolMode) {
        setToolMode(payload.toolMode === 'full' ? 'full' : 'business')
      }
      const loaded = normalizeLoadedMessages(payload?.messages)
      if (loaded && loaded.length > 0) {
        setMessages(loaded)
      } else {
        resetConversation(
          `已打开历史会话 ${String(id).slice(0, 8)}…（此前未持久化消息，仅后续对话会保存）`
        )
      }
    } catch (e) {
      const msg = e?.message || '加载历史会话失败'
      setConnectError(msg)
      modal.msgError(msg)
      resetConversation(`无法加载会话 ${String(id).slice(0, 8)}…`)
    } finally {
      setConnecting(false)
    }
  }

  const stop = async () => {
    const active = sessionIdRef.current
    if (cancelRef.current) {
      cancelRef.current()
      cancelRef.current = null
    }
    if (active) {
      try {
        await abortAgentSession(active)
      } catch {
        // ignore
      }
    }
    setLoading(false)
  }

  const sendText = async (raw) => {
    const text = (raw ?? input).trim()
    if (!text || loading) return

    let activeSession = sessionId
    if (!activeSession) {
      activeSession = await connect()
      if (!activeSession) return
    }

    if (raw == null) setInput('')
    else setInput('')

    const assistantId = uid()
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: 'user', kind: 'text', content: text },
      { id: assistantId, role: 'assistant', kind: 'text', content: '' }
    ])
    setLoading(true)

    const ensureAssistant = (updater) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === assistantId)
        if (!exists) {
          return [...prev, { id: assistantId, role: 'assistant', kind: 'text', content: '' }]
        }
        return prev.map((m) => (m.id === assistantId ? updater(m) : m))
      })
    }

    const startStream = (sid) => {
      const { cancel } = streamAgentPrompt(
        sid,
        { message: text, toolMode },
        {
          onEvent: (type, payload) => {
            if (type === 'text_delta' && payload.delta) {
              ensureAssistant((m) => ({ ...m, content: (m.content || '') + payload.delta }))
              return
            }
            if (type === 'tool_start') {
              const toolMsg = {
                id: payload.toolCallId || uid(),
                role: 'tool',
                kind: 'tool',
                toolName: payload.toolName,
                args: payload.args,
                done: false,
                isError: false,
                result: null
              }
              setMessages((prev) => {
                const idx = prev.findIndex((m) => m.id === assistantId)
                if (idx === -1) return [...prev, toolMsg]
                return [...prev.slice(0, idx), toolMsg, ...prev.slice(idx)]
              })
              return
            }
            if (type === 'tool_end') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.kind === 'tool' && m.id === payload.toolCallId
                    ? {
                        ...m,
                        done: true,
                        isError: !!payload.isError,
                        result: payload.result
                      }
                    : m
                )
              )
            }
            if (type === 'session_title' && payload.title) {
              setHistory((prev) => {
                const next = prev.map((h) =>
                  h.sessionId === sid ? { ...h, summary: payload.title } : h
                )
                if (!next.some((h) => h.sessionId === sid)) {
                  next.unshift({
                    sessionId: sid,
                    summary: payload.title,
                    updatedAt: new Date().toISOString()
                  })
                }
                return next.slice(0, 15)
              })
              return
            }
            if (type === 'error') {
              modal.msgError(payload.message || 'Agent 错误')
              ensureAssistant((m) => ({
                ...m,
                content: m.content || payload.message || 'Agent 错误'
              }))
            }
          },
          onError: async (err) => {
            const msg = err?.message || '流式请求失败'
            if (/session not found|404/i.test(msg)) {
              const recreated = await connect()
              if (recreated) {
                startStream(recreated)
                return
              }
            }
            modal.msgError(msg)
            setLoading(false)
            cancelRef.current = null
          },
          onComplete: () => {
            setLoading(false)
            cancelRef.current = null
            refreshHistory()
            // flush latest store snapshot after React/zustand updates from this turn
            queueMicrotask(() => {
              const latest = useAgentShellStore.getState().messages
              persistMessages(sid, latest)
            })
          }
        }
      )
      cancelRef.current = async () => {
        cancel()
        try {
          await abortAgentSession(sid)
        } catch {
          // ignore
        }
      }
    }

    startStream(activeSession)
  }

  const engineReady = !!sessionId && !connecting
  const showQuick = isPage && messages.length <= 1 && !loading
  const quickPrompts = toolMode === 'full' ? QUICK_PROMPTS_FULL : QUICK_PROMPTS_BUSINESS

  const ctrlSize = isPage ? 'middle' : 'small'

  const actions = (
    <Space className="ai-agent-toolbar" size={8} wrap>
      <Segmented
        size={ctrlSize}
        value={toolMode}
        disabled={loading || connecting}
        onChange={switchToolMode}
        options={[
          { value: 'business', label: '业务' },
          { value: 'full', label: '沙箱' }
        ]}
      />
      {history.length > 0 && (
        <Select
          size={ctrlSize}
          className="ai-agent-toolbar__session"
          placeholder="历史会话"
          suffixIcon={<HistoryOutlined />}
          showSearch
          optionFilterProp="label"
          popupMatchSelectWidth={false}
          disabled={loading || connecting}
          value={history.some((h) => h.sessionId === sessionId) ? sessionId : undefined}
          onChange={resumeSession}
          options={history.map((h) => ({
            value: h.sessionId,
            label: sessionLabel(h)
          }))}
        />
      )}
      {!sessionId && (
        <Button size={ctrlSize} icon={<ReloadOutlined />} onClick={newSession} loading={connecting}>
          重连
        </Button>
      )}
      <Button
        type="primary"
        size={ctrlSize}
        icon={<PlusOutlined />}
        onClick={newSession}
        disabled={loading || connecting}
      >
        新会话
      </Button>
      <Button size={ctrlSize} icon={<StopOutlined />} danger disabled={!loading} onClick={stop}>
        停止
      </Button>
    </Space>
  )

  return (
    <div
      className={[
        'ai-agent-workbench',
        isPage ? 'ai-agent-workbench--page' : 'ai-agent-workbench--compact'
      ].join(' ')}
    >
      <header className="ai-agent-header">
        <div className="ai-agent-header__left">
          {isPage ? (
            <>
              <div className="ai-agent-header__title-row">
                <RobotOutlined className="ai-agent-header__icon" />
                <Title level={4} className="ai-agent-header__title">
                  AI Agent
                </Title>
              </div>
              <Text type="secondary" className="ai-agent-header__sub">
                {toolMode === 'full' ? '沙箱模式' : '业务模式'} · 会话{' '}
                {sessionId ? `${sessionId.slice(0, 8)}…` : '未连接'}
                {connectError ? ` · ${connectError}` : ''}
              </Text>
            </>
          ) : (
            connectError && (
              <Text type="danger" style={{ fontSize: 12 }}>
                {connectError}
              </Text>
            )
          )}
        </div>
        <div className="ai-agent-header__right">{actions}</div>
      </header>

      <div className="ai-agent-thread" ref={listRef}>
        <div className="ai-agent-thread__inner">
          {groupThreadMessages(messages).map((m) => {
            if (m.kind === 'assistant-turn') {
              const turnLoading =
                loading && (!m.assistant?.content || m.tools.some((t) => !t.done))
              return (
                <AssistantTurn
                  key={m.id}
                  tools={m.tools}
                  assistant={m.assistant}
                  loading={turnLoading || (loading && !m.assistant?.content)}
                />
              )
            }

            return (
              <div key={m.id} className="ai-agent-msg ai-agent-msg--user">
                <div className="ai-agent-msg__avatar" aria-hidden>
                  <UserOutlined />
                </div>
                <div className="ai-agent-msg__body">
                  <div className="ai-agent-msg__bubble">
                    <span className="ai-agent-msg__text">{m.content}</span>
                  </div>
                </div>
              </div>
            )
          })}

          {showQuick && (
            <div className="ai-agent-quick">
              <Text type="secondary" className="ai-agent-quick__label">
                试试这些
              </Text>
              <div className="ai-agent-quick__chips">
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="ai-agent-quick__chip"
                    disabled={!engineReady || loading}
                    onClick={() => sendText(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="ai-agent-composer">
        <Sender
          value={input}
          onChange={setInput}
          onSubmit={() => sendText()}
          loading={loading || connecting}
          disabled={loading}
          placeholder={
            connecting
              ? '正在连接引擎…'
              : engineReady
                ? '输入指令或问题，Enter 发送'
                : '引擎未连接，点「重连」或直接回车尝试'
          }
        />
      </footer>
    </div>
  )
}
