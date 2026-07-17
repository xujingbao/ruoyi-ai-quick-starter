import request from '@/utils/request'
import { getToken } from '@/utils/auth'

const baseURL = import.meta.env.VITE_APP_BASE_API || '/dev-api'

export function agentHealth() {
  return request({
    url: '/ai/agent/health',
    method: 'get'
  })
}

export function createAgentSession(data = {}) {
  return request({
    url: '/ai/agent/sessions',
    method: 'post',
    data,
    headers: { repeatSubmit: false }
  })
}

export function listAgentSessions() {
  return request({
    url: '/ai/agent/sessions',
    method: 'get'
  })
}

export function getAgentSession(sessionId) {
  return request({
    url: `/ai/agent/sessions/${sessionId}`,
    method: 'get'
  })
}

export function saveAgentMessages(sessionId, messages) {
  return request({
    url: `/ai/agent/sessions/${sessionId}/messages`,
    method: 'put',
    data: { messages },
    headers: { repeatSubmit: false }
  })
}

export function abortAgentSession(sessionId) {
  return request({
    url: `/ai/agent/sessions/${sessionId}/abort`,
    method: 'post',
    headers: { repeatSubmit: false }
  })
}

/**
 * Stream agent prompt via SSE.
 * @returns {{ cancel: () => void }}
 */
export function streamAgentPrompt(sessionId, data, { onEvent, onError, onComplete } = {}) {
  const url = `${baseURL}/ai/agent/sessions/${sessionId}/prompt`
  const token = getToken()
  const abortController = new AbortController()
  let reader = null
  let isAborted = false

  const cancel = () => {
    isAborted = true
    abortController.abort()
    if (reader) {
      reader.cancel().catch(() => {})
    }
  }

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(data),
    signal: abortController.signal
  })
    .then(async (response) => {
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('登录已过期，请重新登录')
        }
        const text = await response.text().catch(() => '')
        throw new Error(text || `请求失败 (${response.status})`)
      }

      reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let eventName = 'message'

      const flushEvent = (rawData) => {
        if (!rawData || isAborted) return
        try {
          const payload = JSON.parse(rawData)
          onEvent?.(payload.type || eventName, payload)
        } catch {
          onEvent?.(eventName, { type: eventName, raw: rawData })
        }
      }

      const pump = () => {
        if (isAborted) return
        reader.read().then(({ done, value }) => {
          if (done) {
            onComplete?.()
            return
          }
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n')
          buffer = parts.pop() || ''
          for (const line of parts) {
            const trimmed = line.trimEnd()
            if (!trimmed) {
              eventName = 'message'
              continue
            }
            if (trimmed.startsWith('event:')) {
              eventName = trimmed.slice(6).trim()
              continue
            }
            if (trimmed.startsWith('data:')) {
              const dataStr = trimmed.startsWith('data: ')
                ? trimmed.slice(6)
                : trimmed.slice(5)
              flushEvent(dataStr)
            }
          }
          pump()
        }).catch((err) => {
          if (!isAborted) onError?.(err)
        })
      }
      pump()
    })
    .catch((err) => {
      if (!isAborted) onError?.(err)
    })

  return { cancel }
}
