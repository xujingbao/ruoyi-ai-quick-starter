import { Type } from 'typebox'
import { defineTool } from '@earendil-works/pi-coding-agent'
import { config } from './config.js'

/**
 * Build system tools that call Spring Tool Bus with the user's JWT.
 *
 * @param {{
 *   accessToken?: string,
 *   getAccessToken?: () => string,
 *   getCorrelationId?: () => string,
 *   gatewayBaseUrl?: string
 * }} ctx
 */
export function createSystemTools(ctx) {
  const gatewayBaseUrl = (ctx.gatewayBaseUrl || config.gatewayBaseUrl || 'http://127.0.0.1:8080').replace(/\/+$/, '')

  function currentToken() {
    if (typeof ctx.getAccessToken === 'function') {
      return ctx.getAccessToken() || ''
    }
    return ctx.accessToken || ''
  }

  function currentCorrelationId() {
    if (typeof ctx.getCorrelationId === 'function') {
      return ctx.getCorrelationId() || ''
    }
    return ''
  }

  async function invoke(path, query) {
    const token = currentToken()
    if (!token) {
      return {
        content: [{ type: 'text', text: 'No access token bound to this session. Recreate the session via the gateway.' }],
        details: { error: 'missing_token' }
      }
    }
    const url = new URL(`${gatewayBaseUrl}${path}`)
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null && v !== '') {
          url.searchParams.set(k, String(v))
        }
      }
    }
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json'
    }
    const cid = currentCorrelationId()
    if (cid) {
      headers['X-Correlation-Id'] = cid
    }
    const res = await fetch(url, {
      method: 'GET',
      headers
    })
    const text = await res.text()
    let body
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
    if (!res.ok) {
      return {
        content: [{
          type: 'text',
          text: `Tool bus error ${res.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`
        }],
        details: { status: res.status, body }
      }
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(body, null, 2) }],
      details: { status: res.status }
    }
  }

  const listUsers = defineTool({
    name: 'sys_list_users',
    label: 'List Users',
    description: 'List system users (read-only). Optional userName / phonenumber / status filters.',
    parameters: Type.Object({
      userName: Type.Optional(Type.String({ description: 'Username keyword' })),
      phonenumber: Type.Optional(Type.String({ description: 'Phone number' })),
      status: Type.Optional(Type.String({ description: '0=normal 1=disabled' })),
      pageNum: Type.Optional(Type.Number({ description: 'Page number, default 1' })),
      pageSize: Type.Optional(Type.Number({ description: 'Page size, default 10' }))
    }),
    execute: async (_id, params) =>
      invoke('/ai/agent/tools/users', {
        userName: params.userName,
        phonenumber: params.phonenumber,
        status: params.status,
        pageNum: params.pageNum ?? 1,
        pageSize: params.pageSize ?? 10
      })
  })

  const getConfig = defineTool({
    name: 'sys_get_config',
    label: 'Get Config',
    description: 'Get a system config value by configKey (read-only).',
    parameters: Type.Object({
      configKey: Type.String({ description: 'Config key, e.g. sys.user.initPassword' })
    }),
    execute: async (_id, params) =>
      invoke(`/ai/agent/tools/config/${encodeURIComponent(params.configKey)}`)
  })

  const listNotices = defineTool({
    name: 'sys_list_notices',
    label: 'List Notices',
    description: 'List system notices/announcements (read-only).',
    parameters: Type.Object({
      noticeTitle: Type.Optional(Type.String({ description: 'Title keyword' })),
      pageNum: Type.Optional(Type.Number()),
      pageSize: Type.Optional(Type.Number())
    }),
    execute: async (_id, params) =>
      invoke('/ai/agent/tools/notices', {
        noticeTitle: params.noticeTitle,
        pageNum: params.pageNum ?? 1,
        pageSize: params.pageSize ?? 10
      })
  })

  const listJobs = defineTool({
    name: 'sys_list_jobs',
    label: 'List Jobs',
    description: 'List Quartz scheduled jobs (read-only).',
    parameters: Type.Object({
      jobName: Type.Optional(Type.String({ description: 'Job name keyword' })),
      status: Type.Optional(Type.String({ description: '0=normal 1=pause' })),
      pageNum: Type.Optional(Type.Number()),
      pageSize: Type.Optional(Type.Number())
    }),
    execute: async (_id, params) =>
      invoke('/ai/agent/tools/jobs', {
        jobName: params.jobName,
        status: params.status,
        pageNum: params.pageNum ?? 1,
        pageSize: params.pageSize ?? 10
      })
  })

  return [listUsers, getConfig, listNotices, listJobs]
}

export const SYSTEM_TOOL_NAMES = [
  'sys_list_users',
  'sys_get_config',
  'sys_list_notices',
  'sys_list_jobs'
]
