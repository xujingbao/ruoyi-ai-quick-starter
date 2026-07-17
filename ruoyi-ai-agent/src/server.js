import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { assertBindSafe, config } from './config.js'
import { ensureProviderConfig } from './provider-setup.js'
import {
  bindAccessToken,
  createSession,
  ensureSession,
  getSession,
  listSessionsForUser,
  toClientEvent
} from './sessions.js'
import { needsTitleSummary, summarizeSessionTitle } from './title.js'

const app = new Hono()

app.use('/v1/*', async (c, next) => {
  // health stays public for local ops probes but still requires token when non-loopback
  const path = c.req.path
  const isHealth = path === '/v1/health'
  if (isHealth && config.isLoopback) {
    await next()
    return
  }
  const token = c.req.header('X-AI-Agent-Token') || ''
  if (!config.internalToken || token !== config.internalToken) {
    return c.json({ error: 'unauthorized' }, 401)
  }
  await next()
})

app.get('/v1/health', (c) =>
  c.json({
    status: 'ok',
    provider: config.providerId,
    model: config.modelId,
    toolMode: config.defaultToolMode,
    tools: config.defaultToolMode === 'full'
      ? [...config.sandboxTools, ...config.systemToolNames]
      : [...config.systemToolNames],
    sandboxTools: config.sandboxTools,
    systemTools: config.systemToolNames,
    gatewayBaseUrl: config.gatewayBaseUrl,
    bind: `${config.host}:${config.port}`,
    auth: 'token'
  })
)

app.post('/v1/sessions', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (body.userId == null || body.userId === '') {
    return c.json({ error: 'userId is required' }, 400)
  }
  try {
    const created = await createSession({
      userId: body.userId,
      title: body.title,
      accessToken: body.accessToken,
      sessionId: body.sessionId,
      toolMode: body.toolMode,
      workspace: body.workspace
    })
    return c.json(created, created.restored ? 200 : 201)
  } catch (err) {
    console.error('create session failed', err)
    return c.json({ error: err?.message || 'create session failed' }, 500)
  }
})

app.post('/v1/sessions/ensure', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (body.userId == null || body.userId === '' || !body.sessionId) {
    return c.json({ error: 'userId and sessionId are required' }, 400)
  }
  try {
    const ensured = await ensureSession({
      userId: body.userId,
      sessionId: body.sessionId,
      title: body.title,
      accessToken: body.accessToken,
      toolMode: body.toolMode,
      workspace: body.workspace
    })
    return c.json(ensured)
  } catch (err) {
    console.error('ensure session failed', err)
    return c.json({ error: err?.message || 'ensure session failed' }, 500)
  }
})

app.get('/v1/sessions', (c) => {
  const userId = c.req.query('userId')
  if (!userId) {
    return c.json({ error: 'userId is required' }, 400)
  }
  return c.json({ sessions: listSessionsForUser(userId) })
})

app.post('/v1/sessions/:id/prompt', async (c) => {
  const sessionId = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const message = (body.message || '').trim()
  if (!message) {
    return c.json({ error: 'message is required' }, 400)
  }

  let record = getSession(sessionId)
  if (!record && body.userId != null && body.userId !== '') {
    try {
      await ensureSession({
        userId: body.userId,
        sessionId,
        title: body.title,
        accessToken: body.accessToken,
        toolMode: body.toolMode,
        workspace: body.workspace
      })
      record = getSession(sessionId)
    } catch (err) {
      console.error('auto-ensure failed', err)
    }
  }
  if (!record) {
    return c.json({ error: 'session not found' }, 404)
  }

  const expectedUserId = body.userId != null ? String(body.userId) : null
  if (expectedUserId && expectedUserId !== record.userId) {
    return c.json({ error: 'session ownership mismatch' }, 403)
  }

  const correlationId = body.correlationId || c.req.header('X-Correlation-Id') || ''
  bindAccessToken(sessionId, body.accessToken, correlationId)

  if (!config.apiKey || config.apiKey === 'your-api-key-here') {
    return c.json({
      error: 'AI_API_KEY 未配置。请 export AI_API_KEY=sk-xxx 后重启侧车。'
    }, 503)
  }

  return streamSSE(c, async (stream) => {
    let closed = false
    let sawText = false
    let assistantText = ''
    const unsubscribe = record.session.subscribe((event) => {
      if (closed) return
      const payload = toClientEvent(event)
      if (payload.type === 'text_delta' && payload.delta) {
        sawText = true
        assistantText += payload.delta
        if (assistantText.length > 800) {
          assistantText = assistantText.slice(0, 800)
        }
      }
      stream.writeSSE({
        event: payload.type,
        data: JSON.stringify(payload)
      }).catch(() => {
        closed = true
      })
    })

    try {
      await stream.writeSSE({
        event: 'session',
        data: JSON.stringify({
          type: 'session',
          sessionId,
          workspace: record.workspace,
          toolMode: record.toolMode,
          correlationId
        })
      })
      await record.session.prompt(message)
      if (!sawText && !closed) {
        await stream.writeSSE({
          event: 'error',
          data: JSON.stringify({
            type: 'error',
            message: '模型未返回内容，请检查 AI_API_KEY / AI_API_BASE_URL / AI_MODEL 是否有效。'
          })
        }).catch(() => {})
      }

      // First meaningful turn: AI-summarize session topic
      if (!closed && sawText && needsTitleSummary(record.title)) {
        try {
          const title = await summarizeSessionTitle(message, assistantText)
          if (title) {
            record.title = title
            await stream.writeSSE({
              event: 'session_title',
              data: JSON.stringify({ type: 'session_title', sessionId, title })
            }).catch(() => {})
          }
        } catch (err) {
          console.warn('session title summarize skipped', err?.message || err)
        }
      }

      await stream.writeSSE({
        event: 'done',
        data: JSON.stringify({ type: 'done', title: record.title })
      })
    } catch (err) {
      console.error('prompt failed', err)
      if (!closed) {
        await stream.writeSSE({
          event: 'error',
          data: JSON.stringify({
            type: 'error',
            message: err?.message || 'prompt failed'
          })
        }).catch(() => {})
      }
    } finally {
      unsubscribe()
      closed = true
    }
  })
})

app.post('/v1/sessions/:id/abort', async (c) => {
  const sessionId = c.req.param('id')
  const record = getSession(sessionId)
  if (!record) {
    return c.json({ error: 'session not found' }, 404)
  }
  const body = await c.req.json().catch(() => ({}))
  if (body.userId != null && String(body.userId) !== record.userId) {
    return c.json({ error: 'session ownership mismatch' }, 403)
  }
  try {
    await record.session.abort()
    return c.json({ ok: true })
  } catch (err) {
    return c.json({ error: err?.message || 'abort failed' }, 500)
  }
})

assertBindSafe()
await ensureProviderConfig()

if (!config.apiKey || config.apiKey === 'your-api-key-here') {
  console.warn('[ruoyi-ai-agent] AI_API_KEY is missing or placeholder; prompts will fail until configured.')
}

serve(
  {
    fetch: app.fetch,
    hostname: config.host,
    port: config.port
  },
  (info) => {
    console.log(
      `[ruoyi-ai-agent] listening on http://${config.host}:${info.port} model=${config.providerId}/${config.modelId} toolMode=${config.defaultToolMode}`
    )
  }
)
