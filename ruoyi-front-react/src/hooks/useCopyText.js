import { useRef, useState } from 'react'
import { message } from 'antd'

/**
 * 复制文本到剪贴板 Hook
 */
export function useCopyText() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      // 使用现代 Clipboard API
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        message.success('复制成功')
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {
        message.error('复制失败')
      })
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        message.success('复制成功')
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        message.error('复制失败')
      }
      document.body.removeChild(textArea)
    }
  }

  return { copyToClipboard, copied }
}
