import request from '@/utils/request'
import { getToken } from '@/utils/auth'

// AI 普通聊天接口
export function chat(data) {
  return request({
    url: '/ai/chat/chat',
    method: 'post',
    data: data,
    timeout: 60000 // 60秒超时，AI 响应可能需要较长时间
  })
}

// AI 流式聊天接口（SSE）
export function streamChat(data, onMessage, onError, onComplete) {
  const baseURL = import.meta.env.VITE_APP_BASE_API || ''
  const url = `${baseURL}/ai/chat/stream`
  const token = getToken()
  const abortController = new AbortController()
  let reader = null
  let isAborted = false
  
  // 取消函数
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
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(data),
    signal: abortController.signal
  }).then(response => {
    // 处理 HTTP 错误状态码
    if (!response.ok) {
      // 401 未授权，403 禁止访问
      if (response.status === 401 || response.status === 403) {
        throw new Error('登录已过期，请重新登录')
      }
      // 其他错误
      throw new Error(`请求失败 (${response.status}): ${response.statusText}`)
    }
    
    reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    function readStream() {
      if (isAborted) return
      
      reader.read().then(({ done, value }) => {
        if (done) {
          onComplete?.()
          return
        }
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed?.startsWith('data:')) continue
          
          try {
            const jsonStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed.slice(5)
            if (jsonStr === '[DONE]' || !jsonStr) continue
            
            const json = JSON.parse(jsonStr)
            const text = json?.result?.output?.text ?? json?.results?.[0]?.output?.text ?? ''
            
            if (text && onMessage) {
              onMessage(text)
            }
          } catch {
            // 忽略解析错误（可能是非 JSON 数据）
          }
        }
        
        readStream()
      }).catch(error => {
        if (error.name !== 'AbortError' && onError) {
          onError(error)
        }
      })
    }
    
    readStream()
  }).catch(error => {
    if (error.name !== 'AbortError' && onError) {
      onError(error)
    }
  })
  
  return cancel
}
