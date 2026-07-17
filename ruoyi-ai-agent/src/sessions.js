import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import {
  AuthStorage,
  createAgentSession,
  DefaultResourceLoader,
  ModelRegistry,
  SessionManager
} from '@earendil-works/pi-coding-agent'
import { config, resolveToolMode, resolveToolNames } from './config.js'
import { createSystemTools } from './system-tools.js'

/** @type {Map<string, any>} */
const sessions = new Map()

function workspacePath(userId, sessionId) {
  return path.join(config.workspacesRoot, String(userId), sessionId)
}

/**
 * Ensure path stays under workspacesRoot (sandbox isolation).
 * @param {string} dir
 */
function assertUnderWorkspacesRoot(dir) {
  const resolved = path.resolve(dir)
  const root = path.resolve(config.workspacesRoot)
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new Error(`workspace path escapes sandbox root: ${dir}`)
  }
}

async function seedWorkspace(dir) {
  assertUnderWorkspacesRoot(dir)
  await fs.mkdir(dir, { recursive: true })
  const readme = path.join(dir, 'README.md')
  try {
    await fs.access(readme)
  } catch {
    await fs.writeFile(
      readme,
      `# Agent Workspace\n\nPer-session sandbox for RuoYi AI Agent.\nFilesystem tools are read-only and confined to this directory.\n`,
      'utf8'
    )
  }
}

function buildSystemPrompt(toolMode) {
  if (toolMode === 'full') {
    return [
      'You are the core AI Agent engine of the RuoYi management system.',
      'You can:',
      '1) Inspect ONLY the per-session sandbox with read/grep/find/ls (cwd is the workspace; do not escape it).',
      '2) Query the live system via tools: sys_list_users, sys_get_config, sys_list_notices, sys_list_jobs.',
      'All tools are read-only and enforce the signed-in user permissions.',
      'Prefer system tools for business questions; use sandbox tools only for workspace files.',
      'Be concise. Reply in the user language.'
    ].join(' ')
  }
  return [
    'You are the core AI Agent engine of the RuoYi management system.',
    'You can query the live system via tools: sys_list_users, sys_get_config, sys_list_notices, sys_list_jobs.',
    'You do NOT have filesystem/sandbox tools in this mode.',
    'All tools are read-only and enforce the signed-in user permissions.',
    'Be concise. Reply in the user language.'
  ].join(' ')
}

/**
 * @param {{
 *   userId: string|number,
 *   title?: string,
 *   accessToken?: string,
 *   sessionId?: string,
 *   toolMode?: string,
 *   workspace?: string
 * }} params
 */
export async function createSession(params) {
  const userId = String(params.userId)
  if (!userId) {
    throw new Error('userId is required')
  }

  const toolMode = resolveToolMode(params.toolMode)
  const sessionId = (params.sessionId || randomUUID().replace(/-/g, '')).replace(/[^a-zA-Z0-9_-]/g, '')
  if (!sessionId) {
    throw new Error('invalid sessionId')
  }

  const existing = sessions.get(sessionId)
  if (existing) {
    if (existing.userId !== userId) {
      throw new Error('session ownership mismatch')
    }
    if (params.accessToken) {
      existing.tokenRef.current = params.accessToken
    }
    return {
      sessionId,
      userId,
      workspace: existing.workspace,
      title: existing.title,
      model: `${config.providerId}/${config.modelId}`,
      tools: existing.tools,
      toolMode: existing.toolMode,
      restored: true
    }
  }

  const workspace = params.workspace && String(params.workspace).trim()
    ? path.resolve(String(params.workspace).trim())
    : workspacePath(userId, sessionId)
  assertUnderWorkspacesRoot(workspace)
  await seedWorkspace(workspace)

  const authStorage = AuthStorage.create(path.join(config.agentDir, 'auth.json'))
  if (config.apiKey) {
    authStorage.setRuntimeApiKey(config.providerId, config.apiKey)
  }

  const modelRegistry = ModelRegistry.create(
    authStorage,
    path.join(config.agentDir, 'models.json')
  )
  const model = modelRegistry.find(config.providerId, config.modelId)
  if (!model) {
    throw new Error(
      `Model not found: ${config.providerId}/${config.modelId}. Check AI_API_* env and models.json.`
    )
  }

  const tokenRef = { current: params.accessToken || '' }
  const systemTools = createSystemTools({
    getAccessToken: () => tokenRef.current,
    gatewayBaseUrl: config.gatewayBaseUrl,
    getCorrelationId: () => tokenRef.correlationId || ''
  })

  const loader = new DefaultResourceLoader({
    cwd: workspace,
    agentDir: config.agentDir,
    systemPromptOverride: () => buildSystemPrompt(toolMode)
  })
  await loader.reload()

  const toolNames = resolveToolNames(toolMode)

  const { session } = await createAgentSession({
    cwd: workspace,
    agentDir: config.agentDir,
    model,
    tools: toolNames,
    customTools: systemTools,
    sessionManager: SessionManager.inMemory(workspace),
    authStorage,
    modelRegistry,
    resourceLoader: loader
  })

  const record = {
    userId,
    workspace,
    title: params.title || 'New Agent Session',
    toolMode,
    tools: toolNames,
    session,
    tokenRef,
    dispose: () => {
      try {
        session.dispose()
      } catch {
        // ignore
      }
      sessions.delete(sessionId)
    }
  }
  sessions.set(sessionId, record)

  return {
    sessionId,
    userId,
    workspace,
    title: record.title,
    model: `${config.providerId}/${config.modelId}`,
    tools: toolNames,
    toolMode,
    restored: false
  }
}

/**
 * Ensure live session exists (recreate after sidecar restart).
 */
export async function ensureSession(params) {
  return createSession(params)
}

export function bindAccessToken(sessionId, accessToken, correlationId) {
  const record = sessions.get(sessionId)
  if (!record) return false
  if (accessToken) {
    record.tokenRef.current = accessToken
  }
  if (correlationId) {
    record.tokenRef.correlationId = correlationId
  }
  return true
}

export function getSession(sessionId) {
  return sessions.get(sessionId)
}

export function listSessionsForUser(userId) {
  const uid = String(userId)
  return [...sessions.entries()]
    .filter(([, v]) => v.userId === uid)
    .map(([sessionId, v]) => ({
      sessionId,
      userId: v.userId,
      workspace: v.workspace,
      title: v.title,
      toolMode: v.toolMode
    }))
}

/**
 * @param {unknown} event
 */
export function toClientEvent(event) {
  if (!event || typeof event !== 'object') {
    return { type: 'unknown', raw: event }
  }
  const e = /** @type {Record<string, any>} */ (event)
  switch (e.type) {
    case 'message_update':
      if (e.assistantMessageEvent?.type === 'text_delta') {
        return { type: 'text_delta', delta: e.assistantMessageEvent.delta || '' }
      }
      if (e.assistantMessageEvent?.type === 'thinking_delta') {
        return { type: 'thinking_delta', delta: e.assistantMessageEvent.delta || '' }
      }
      return { type: 'message_update', detail: e.assistantMessageEvent?.type }
    case 'tool_execution_start':
      return {
        type: 'tool_start',
        toolCallId: e.toolCallId,
        toolName: e.toolName,
        args: e.args
      }
    case 'tool_execution_update':
      return {
        type: 'tool_update',
        toolCallId: e.toolCallId,
        toolName: e.toolName,
        partialResult: summarize(e.partialResult)
      }
    case 'tool_execution_end':
      return {
        type: 'tool_end',
        toolCallId: e.toolCallId,
        toolName: e.toolName,
        isError: !!e.isError,
        result: summarizeToolResult(e.result)
      }
    case 'agent_start':
    case 'agent_end':
    case 'turn_start':
    case 'turn_end':
    case 'message_start':
    case 'message_end':
      return { type: e.type }
    default:
      return { type: e.type || 'event' }
  }
}

function summarize(value) {
  if (value == null) return null
  if (typeof value === 'string') {
    return value.length > 2000 ? `${value.slice(0, 2000)}…` : value
  }
  try {
    const s = JSON.stringify(value)
    return s.length > 2000 ? `${s.slice(0, 2000)}…` : JSON.parse(s)
  } catch {
    return String(value)
  }
}

function summarizeToolResult(result) {
  const table = extractTablePayload(result)
  if (table) {
    return {
      kind: 'table',
      total: table.total,
      rows: table.rows.slice(0, 50).map(slimRow)
    }
  }
  return summarize(result)
}

function extractTablePayload(result) {
  const body = coerceJsonBody(result)
  if (!body || typeof body !== 'object') return null
  if (Array.isArray(body.rows)) {
    return { rows: body.rows, total: Number(body.total ?? body.rows.length) || body.rows.length }
  }
  if (Array.isArray(body.data)) {
    return { rows: body.data, total: body.data.length }
  }
  if (Array.isArray(body)) {
    return { rows: body, total: body.length }
  }
  return null
}

function coerceJsonBody(result) {
  if (result == null) return null
  if (typeof result === 'string') {
    try {
      return JSON.parse(result)
    } catch {
      return null
    }
  }
  if (typeof result === 'object') {
    if (Array.isArray(result.content)) {
      const text = result.content.find((c) => c?.type === 'text')?.text
      if (typeof text === 'string') {
        try {
          return JSON.parse(text)
        } catch {
          return null
        }
      }
    }
    return result
  }
  return null
}

function slimRow(row) {
  if (!row || typeof row !== 'object') return row
  const out = {}
  for (const [k, v] of Object.entries(row)) {
    if (v == null) continue
    if (typeof v === 'object') {
      if (k === 'dept' && v.deptName) out.deptName = v.deptName
      continue
    }
    if (typeof v === 'string' && v.length > 200) {
      out[k] = `${v.slice(0, 200)}…`
    } else {
      out[k] = v
    }
  }
  return out
}
