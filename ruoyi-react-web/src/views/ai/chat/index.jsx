import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, InputNumber, Space, Switch, Button, Typography } from 'antd'
import { DeleteOutlined, StopOutlined } from '@ant-design/icons'
import { Bubble, Sender } from '@ant-design/x'
import ReactMarkdown from 'react-markdown'
import { chat, streamChat } from '@/api/ai/chat'
import modal from '@/plugins/modal'
import './index.scss'

const { Text } = Typography

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export default function AiChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: uid(),
      role: 'assistant',
      content: '你好，我是 AI 聊天测试页。你可以在这里验证 **流式输出** 与 **普通输出** 是否正常。'
    }
  ])
  const [useStream, setUseStream] = useState(true)
  const [temperature, setTemperature] = useState(0.7)
  const [loading, setLoading] = useState(false)

  const cancelRef = useRef(null)
  const listRef = useRef(null)

  const canSend = useMemo(() => !!input.trim() && !loading, [input, loading])

  // 自动滚动到底部
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const clearChat = () => {
    if (loading) return
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        content: '已清空。继续输入问题进行测试。'
      }
    ])
  }

  const stop = () => {
    if (cancelRef.current) {
      cancelRef.current()
      cancelRef.current = null
    }
    setLoading(false)
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    const userMsg = { id: uid(), role: 'user', content: text }
    const assistantId = uid()
    const assistantMsg = { id: assistantId, role: 'assistant', content: '' }
    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setLoading(true)

    const payload = {
      message: text,
      temperature
    }

    // 非流式：直接请求
    if (!useStream) {
      try {
        const res = await chat(payload)
        const msg = res?.body?.message || res?.message || res?.data?.message || ''
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: msg || '(无返回)' } : m))
        )
      } catch (e) {
        modal.msgError(e?.message || '请求失败')
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: '请求失败，请查看后端日志。' } : m))
        )
      } finally {
        setLoading(false)
      }
      return
    }

    // 流式：边读边追加
    try {
      cancelRef.current = streamChat(
        payload,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: (m.content || '') + (chunk || '') } : m))
          )
        },
        (e) => {
          modal.msgError(e?.message || '流式请求失败')
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: (m.content || '') + '\n\n(流式中断)' } : m))
          )
        },
        () => {
          cancelRef.current = null
          setLoading(false)
        }
      )
    } catch (e) {
      cancelRef.current = null
      setLoading(false)
      modal.msgError(e?.message || '流式请求失败')
    }
  }

  return (
    <div className="app-container ai-chat-page">
      <Card
        className="ai-chat-card"
        title="AI 聊天测试"
        extra={
          <Space size={12} wrap>
            <Space size={8}>
              <Text type="secondary">流式</Text>
              <Switch checked={useStream} onChange={setUseStream} disabled={loading} />
            </Space>
            <Space size={8}>
              <Text type="secondary">Temperature</Text>
              <InputNumber
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onChange={(v) => setTemperature(typeof v === 'number' ? v : 0.7)}
                disabled={loading}
                style={{ width: 96 }}
              />
            </Space>
            <Button icon={<DeleteOutlined />} onClick={clearChat} disabled={loading}>
              清空
            </Button>
            <Button icon={<StopOutlined />} onClick={stop} disabled={!loading}>
              停止
            </Button>
          </Space>
        }
      >
        <div className="ai-chat-list" ref={listRef}>
          <div className="ai-chat-list-inner">
            {messages.map((m) => {
              const placement = m.role === 'user' ? 'end' : 'start'
              const content =
                m.role === 'assistant' ? (
                  <div className="ai-chat-markdown">
                    <ReactMarkdown>{m.content || (loading ? '...' : '')}</ReactMarkdown>
                  </div>
                ) : (
                  <span>{m.content}</span>
                )

              return (
                <div key={m.id} className="ai-chat-item">
                  <Bubble placement={placement} content={content} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="ai-chat-sender">
          <Sender
            value={input}
            onChange={setInput}
            onSubmit={send}
            loading={loading}
            placeholder="输入内容，回车发送（Shift+Enter 换行）"
            // 仅在请求中禁用输入；空输入不影响输入，只是不发送
            disabled={loading}
          />
        </div>
      </Card>
    </div>
  )
}

