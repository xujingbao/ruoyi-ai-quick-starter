import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(__dirname, '..')
const repoRoot = path.resolve(packageRoot, '..')

function normalizeBaseUrl(raw) {
  const base = (raw || 'https://api.deepseek.com').replace(/\/+$/, '')
  return base.endsWith('/v1') ? base : `${base}/v1`
}

const sandboxTools = ['read', 'grep', 'find', 'ls']
const systemToolNames = [
  'sys_list_users',
  'sys_get_config',
  'sys_list_notices',
  'sys_list_jobs'
]

/** @type {'business' | 'full'} */
const defaultToolMode =
  (process.env.AI_AGENT_TOOL_MODE || 'business').toLowerCase() === 'full' ? 'full' : 'business'

const host = process.env.AI_AGENT_HOST || '127.0.0.1'
const allowRemote = process.env.AI_AGENT_ALLOW_REMOTE === '1'
const loopbackHosts = new Set(['127.0.0.1', 'localhost', '::1'])

export const config = {
  host,
  port: Number(process.env.AI_AGENT_PORT || 19090),
  allowRemote,
  isLoopback: loopbackHosts.has(host),
  packageRoot,
  repoRoot,
  agentDir: path.join(packageRoot, '.pi-agent'),
  workspacesRoot: path.join(repoRoot, 'data', 'ai-workspaces'),
  apiBaseUrl: normalizeBaseUrl(process.env.AI_API_BASE_URL),
  apiKey: process.env.AI_API_KEY || '',
  modelId: process.env.AI_MODEL || 'deepseek-chat',
  providerId: 'ruoyi',
  gatewayBaseUrl: (process.env.AI_AGENT_GATEWAY_URL || 'http://127.0.0.1:8080').replace(/\/+$/, ''),
  /** Shared secret with Spring admin (`X-AI-Agent-Token`) */
  internalToken: process.env.AI_AGENT_INTERNAL_TOKEN || 'ruoyi-ai-agent-dev-token',
  defaultToolMode,
  sandboxTools,
  systemToolNames
}

export function assertBindSafe() {
  if (!config.isLoopback && !config.allowRemote) {
    throw new Error(
      `Refuse to bind ${config.host}: set AI_AGENT_HOST=127.0.0.1 or AI_AGENT_ALLOW_REMOTE=1`
    )
  }
  if (!config.isLoopback) {
    console.warn(
      `[ruoyi-ai-agent] WARNING: binding ${config.host} (non-loopback). Keep AI_AGENT_INTERNAL_TOKEN strong.`
    )
  }
}

/**
 * @param {'business'|'full'|string|undefined} mode
 */
export function resolveToolMode(mode) {
  if (mode === 'full' || mode === 'business') return mode
  return config.defaultToolMode
}

/**
 * @param {'business'|'full'} mode
 */
export function resolveToolNames(mode) {
  return mode === 'full' ? [...sandboxTools, ...systemToolNames] : [...systemToolNames]
}
