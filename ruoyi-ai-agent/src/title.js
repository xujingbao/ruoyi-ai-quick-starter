import { config } from './config.js'

const GENERIC =
  /^(会话(\s+\d{1,2}:\d{2})?|Shell|Workbench|New Agent Session|Agent Session)$/i

/**
 * Whether the current title still needs AI summarization.
 * @param {string|undefined} title
 */
export function needsTitleSummary(title) {
  if (!title || !String(title).trim()) return true
  return GENERIC.test(String(title).trim())
}

/**
 * Call OpenAI-compatible chat completions for a short session title.
 * @param {string} userMessage
 * @param {string} [assistantText]
 * @returns {Promise<string>}
 */
export async function summarizeSessionTitle(userMessage, assistantText = '') {
  const user = String(userMessage || '').trim().slice(0, 400)
  const assistant = String(assistantText || '').trim().slice(0, 400)
  if (!user) return ''

  if (!config.apiKey || config.apiKey === 'your-api-key-here') {
    return fallbackTitle(user)
  }

  const url = `${config.apiBaseUrl.replace(/\/+$/, '')}/chat/completions`
  const body = {
    model: config.modelId,
    temperature: 0.2,
    max_tokens: 40,
    messages: [
      {
        role: 'system',
        content:
          '你是会话标题助手。根据用户问题与助手回答，用简体中文生成不超过16个字的主题标题。' +
          '只输出标题本身，不要引号、标点装饰、前缀或解释。'
      },
      {
        role: 'user',
        content: `用户：${user}\n助手：${assistant || '（暂无完整回复）'}`
      }
    ]
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (!res.ok) {
      console.warn('title summarize http', res.status)
      return fallbackTitle(user)
    }
    const json = await res.json()
    const text = json?.choices?.[0]?.message?.content
    const cleaned = cleanTitle(text)
    return cleaned || fallbackTitle(user)
  } catch (err) {
    console.warn('title summarize failed', err?.message || err)
    return fallbackTitle(user)
  }
}

function cleanTitle(raw) {
  if (!raw || typeof raw !== 'string') return ''
  let t = raw.trim().split('\n')[0].trim()
  t = t.replace(/^["'「『]|["'」』]$/g, '').trim()
  t = t.replace(/^(标题|主题)\s*[:：]\s*/u, '').trim()
  if (t.length > 16) t = `${t.slice(0, 16)}…`
  return t
}

function fallbackTitle(userMessage) {
  const t = String(userMessage || '').replace(/\s+/g, ' ').trim()
  if (!t) return '新会话'
  return t.length > 16 ? `${t.slice(0, 16)}…` : t
}
