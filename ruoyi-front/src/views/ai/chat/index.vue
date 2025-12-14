<template>
  <div class="app-container">
    <el-card shadow="never" class="chat-card">
      <template #header>
        <div class="card-header">
          <div class="card-title">
            <el-icon class="title-icon"><ChatDotRound /></el-icon>
            <span>AI 对话助手</span>
          </div>
          <el-button 
            text 
            type="danger" 
            size="small" 
            @click="clearChat" 
            :disabled="aiChatLoading || messages.length === 0"
            class="clear-btn"
          >
            <el-icon><Delete /></el-icon>
            <span>清空对话</span>
          </el-button>
        </div>
      </template>

      <div class="chat-container">
        <!-- 对话消息列表 -->
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-content">
              <el-icon class="empty-icon"><ChatLineRound /></el-icon>
              <p class="empty-text">开始与 AI 对话吧！</p>
              <p class="empty-hint">输入您的问题，AI 将为您提供帮助</p>
            </div>
          </div>
          
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            class="message-item"
            :class="{ 'user-message': msg.role === 'user', 'ai-message': msg.role === 'assistant' }"
          >
            <div class="message-avatar">
              <el-icon v-if="msg.role === 'user'"><User /></el-icon>
              <el-icon v-else><Service /></el-icon>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <div v-if="msg.role === 'user'" class="message-text">{{ msg.content }}</div>
                <div v-else class="message-text">
                  <MarkdownRender 
                    :custom-id="`ai-message-${index}`"
                    :content="msg.content" 
                  />
                </div>
                <div v-if="msg.role === 'assistant' && msg.loading" class="message-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>AI 正在思考...</span>
                </div>
                <!-- AI 消息操作按钮 -->
                <div v-if="msg.role === 'assistant' && !msg.loading && msg.content" class="message-actions">
                  <el-button 
                    text 
                    size="small" 
                    @click="copyMessage(msg.content)"
                    class="action-btn"
                    :icon="DocumentCopy"
                    title="复制"
                  />
                  <el-button 
                    text 
                    size="small" 
                    @click="regenerateMessage(index)"
                    :disabled="aiChatLoading"
                    class="action-btn"
                    :icon="Refresh"
                    title="重新生成"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div class="input-container-wrapper">
            <div class="input-container">
              <el-input
                v-model="aiChatMessage"
                type="textarea"
                :rows="3"
                placeholder="给 AI 发送消息"
                @keydown.enter.exact.prevent="sendAiMessage"
                :disabled="aiChatLoading"
                resize="none"
                class="message-input"
                maxlength="2000"
              />
              <div class="input-actions">
                <div class="feature-buttons">
                  <el-button 
                    text 
                    size="small" 
                    class="feature-btn"
                    :icon="Lightning"
                  >
                    <span>深度思考</span>
                  </el-button>
                  <el-button 
                    text 
                    size="small" 
                    class="feature-btn"
                    :icon="Search"
                  >
                    <span>互联网搜索</span>
                  </el-button>
                </div>
                <div class="action-buttons">
                  <el-button 
                    text 
                    size="small" 
                    class="attach-btn"
                    :icon="Paperclip"
                    title="附件"
                  />
                  <el-button 
                    type="primary" 
                    circle
                    @click="sendAiMessage" 
                    :loading="aiChatLoading" 
                    :disabled="!aiChatMessage.trim() || aiChatLoading"
                    class="send-button"
                    :icon="!aiChatLoading ? Promotion : undefined"
                    title="发送"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="AiChat">
import { ref, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Loading, Delete, Promotion, Service, ChatLineRound, User, DocumentCopy, Refresh, Lightning, Search, Paperclip } from '@element-plus/icons-vue'
import { streamChat } from '@/api/ai/chat'

// 消息列表
const messages = ref([])
const aiChatMessage = ref('')
const aiChatLoading = ref(false)
const messagesContainer = ref(null)
let abortStream = null

// 发送消息
function sendAiMessage() {
  const message = aiChatMessage.value.trim()
  if (!message) {
    ElMessage.warning('请输入消息内容')
    return
  }
  
  if (aiChatLoading.value) {
    return
  }
  
  // 取消之前的请求
  if (abortStream) {
    abortStream()
  }
  
  // 添加用户消息
  messages.value.push({
    role: 'user',
    content: message,
    timestamp: new Date()
  })
  
  // 添加 AI 消息占位符（正在加载）
  const aiMessageIndex = messages.value.length
  messages.value.push({
    role: 'assistant',
    content: '',
    loading: true,
    timestamp: new Date()
  })
  
  // 清空输入框
  aiChatMessage.value = ''
  
  // 滚动到底部
  scrollToBottom()
  
  aiChatLoading.value = true
  
  abortStream = streamChat(
    { message },
    (text) => {
      // 更新最后一条 AI 消息的内容
      if (messages.value[aiMessageIndex]) {
        messages.value[aiMessageIndex].content += text || ''
        messages.value[aiMessageIndex].loading = false
      }
      // 自动滚动到底部
      nextTick(() => scrollToBottom())
    },
    (error) => {
      // 移除加载中的消息
      if (messages.value[aiMessageIndex]) {
        messages.value[aiMessageIndex].loading = false
      }
      
      let errorMsg = 'AI 聊天失败'
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('超时')) {
          errorMsg = '请求超时，AI 响应时间过长，请稍后重试'
        } else if (error.message.includes('登录') || error.message.includes('授权') || error.message.includes('未授权')) {
          errorMsg = '登录已过期，请重新登录'
        } else if (error.message.includes('API Key') || error.message.includes('无效') || error.message.includes('过期')) {
          errorMsg = error.message
        } else {
          errorMsg = error.message
        }
      }
      
      // 更新错误消息
      if (messages.value[aiMessageIndex]) {
        messages.value[aiMessageIndex].content = `❌ ${errorMsg}`
      }
      
      ElMessage.error(errorMsg)
      aiChatLoading.value = false
      abortStream = null
    },
    () => {
      // 完成时移除加载状态
      if (messages.value[aiMessageIndex]) {
        messages.value[aiMessageIndex].loading = false
      }
      aiChatLoading.value = false
      abortStream = null
      scrollToBottom()
    }
  )
}

// 清空对话
function clearChat() {
  if (abortStream) {
    abortStream()
    abortStream = null
  }
  messages.value = []
  aiChatMessage.value = ''
  aiChatLoading.value = false
}

// 复制消息内容
async function copyMessage(content) {
  try {
    // 优先使用现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(content)
      ElMessage.success('已复制到剪贴板')
    } else {
      // 降级方案：使用传统方法
      const textarea = document.createElement('textarea')
      textarea.value = content
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        ElMessage.success('已复制到剪贴板')
      } catch (err) {
        ElMessage.error('复制失败，请手动复制')
      }
      document.body.removeChild(textarea)
    }
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 重新生成消息
function regenerateMessage(aiMessageIndex) {
  if (aiChatLoading.value) {
    return
  }
  
  // 找到对应的用户消息（AI 消息的前一条）
  if (aiMessageIndex === 0) {
    ElMessage.warning('没有可重新生成的消息')
    return
  }
  
  const userMessage = messages.value[aiMessageIndex - 1]
  if (!userMessage || userMessage.role !== 'user') {
    ElMessage.warning('未找到对应的用户消息')
    return
  }
  
  // 取消之前的请求
  if (abortStream) {
    abortStream()
    abortStream = null
  }
  
  // 保存用户消息内容
  const userMessageContent = userMessage.content
  
  // 移除当前的 AI 消息，并在同一位置插入新的加载中的 AI 消息
  messages.value.splice(aiMessageIndex, 1, {
    role: 'assistant',
    content: '',
    loading: true,
    timestamp: new Date()
  })
  
  // 滚动到底部
  scrollToBottom()
  
  aiChatLoading.value = true
  
  // 重新发送用户消息
  abortStream = streamChat(
    { message: userMessageContent },
    (text) => {
      // 更新 AI 消息的内容
      const currentAiMessage = messages.value[aiMessageIndex]
      if (currentAiMessage && currentAiMessage.role === 'assistant') {
        currentAiMessage.content += text || ''
        currentAiMessage.loading = false
      }
      // 自动滚动到底部
      nextTick(() => scrollToBottom())
    },
    (error) => {
      // 移除加载中的消息
      const currentAiMessage = messages.value[aiMessageIndex]
      if (currentAiMessage && currentAiMessage.role === 'assistant') {
        currentAiMessage.loading = false
      }
      
      let errorMsg = 'AI 聊天失败'
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('超时')) {
          errorMsg = '请求超时，AI 响应时间过长，请稍后重试'
        } else if (error.message.includes('登录') || error.message.includes('授权') || error.message.includes('未授权')) {
          errorMsg = '登录已过期，请重新登录'
        } else if (error.message.includes('API Key') || error.message.includes('无效') || error.message.includes('过期')) {
          errorMsg = error.message
        } else {
          errorMsg = error.message
        }
      }
      
      // 更新错误消息
      if (currentAiMessage && currentAiMessage.role === 'assistant') {
        currentAiMessage.content = `❌ ${errorMsg}`
      }
      
      ElMessage.error(errorMsg)
      aiChatLoading.value = false
      abortStream = null
    },
    () => {
      // 完成时移除加载状态
      const currentAiMessage = messages.value[aiMessageIndex]
      if (currentAiMessage && currentAiMessage.role === 'assistant') {
        currentAiMessage.loading = false
      }
      aiChatLoading.value = false
      abortStream = null
      scrollToBottom()
    }
  )
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(() => messages.value.length, () => {
  scrollToBottom()
})

// 组件卸载时清理
onUnmounted(() => {
  if (abortStream) {
    abortStream()
  }
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page, #f5f7fa);
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter, #e4e7ed);
  background: var(--el-bg-color, #ffffff);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }
  
  :deep(.el-card__header) {
    padding: 18px 24px;
    border-bottom: 1px solid var(--el-border-color-lighter, #e4e7ed);
    background: var(--el-bg-color, #ffffff);
    border-radius: 16px 16px 0 0;
  }
  
  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
    background: var(--el-bg-color, #ffffff);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .card-title {
    font-size: 17px;
    font-weight: 600;
    color: var(--el-text-color-primary, #303133);
    display: flex;
    align-items: center;
    gap: 10px;
    
    .title-icon {
      font-size: 20px;
      color: var(--el-color-primary, #409eff);
    }
  }
  
  .clear-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 6px;
    transition: all 0.2s;
    font-size: 13px;
    
    &:hover:not(:disabled) {
      background-color: var(--el-color-danger-light-9, #fef0f0);
      color: var(--el-color-danger, #f56c6c);
    }
  }
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: var(--el-fill-color-lighter, #f5f7fa);
  
  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color, #dcdfe6);
    border-radius: 3px;
    transition: background 0.2s;
    
    &:hover {
      background: var(--el-border-color-darker, #c0c4cc);
    }
  }
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    
    .empty-content {
      text-align: center;
      color: var(--el-text-color-secondary, #909399);
      
      .empty-icon {
        font-size: 72px;
        margin-bottom: 20px;
        opacity: 0.4;
        color: var(--el-color-primary-light-5, #a0cfff);
      }
      
      .empty-text {
        font-size: 18px;
        font-weight: 500;
        margin: 0 0 8px 0;
        color: var(--el-text-color-regular, #606266);
      }
      
      .empty-hint {
        font-size: 14px;
        margin: 0;
        opacity: 0.7;
      }
    }
  }
  
  .message-item {
    display: flex;
    margin-bottom: 24px;
    animation: fadeIn 0.3s ease-in;
    
    &.user-message {
      flex-direction: row-reverse;
      
      .message-avatar {
        background: linear-gradient(135deg, var(--el-color-primary, #409eff) 0%, var(--el-color-primary-light-3, #79bbff) 100%);
        color: #fff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
      }
      
      .message-bubble {
        background: var(--el-color-primary, #409eff);
        color: #fff;
        border-radius: 18px 18px 4px 18px;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      }
    }
    
    &.ai-message {
      .message-avatar {
        background: var(--el-fill-color, #f0f2f5);
        color: var(--el-text-color-regular, #606266);
        border: 1px solid var(--el-border-color-lighter, #e4e7ed);
      }
      
      .message-bubble {
        background: var(--el-bg-color, #ffffff);
        color: var(--el-text-color-primary, #303133);
        border-radius: 18px 18px 18px 4px;
        border: 1px solid var(--el-border-color-lighter, #e4e7ed);
      }
    }
    
    .message-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin: 0 12px;
      font-size: 20px;
      transition: all 0.2s;
    }
    
    .message-content {
      flex: 1;
      max-width: 75%;
      min-width: 0;
      
      .message-bubble {
        padding: 14px 18px;
        word-wrap: break-word;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        
        .message-text {
          line-height: 1.7;
          font-size: 14px;
          
          :deep(pre) {
            background: rgba(0, 0, 0, 0.06);
            padding: 12px 16px;
            border-radius: 6px;
            overflow-x: auto;
            margin: 12px 0;
            border: 1px solid rgba(0, 0, 0, 0.08);
          }
          
          :deep(code) {
            background: rgba(0, 0, 0, 0.06);
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.9em;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          }
          
          :deep(blockquote) {
            border-left: 3px solid rgba(0, 0, 0, 0.2);
            padding-left: 16px;
            margin: 12px 0;
            opacity: 0.85;
            font-style: italic;
          }
          
          :deep(p) {
            margin: 6px 0;
            
            &:first-child {
              margin-top: 0;
            }
            
            &:last-child {
              margin-bottom: 0;
            }
          }
          
          :deep(ul), :deep(ol) {
            margin: 12px 0;
            padding-left: 24px;
            
            li {
              margin: 4px 0;
            }
          }
          
          :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
            margin: 16px 0 8px 0;
            font-weight: 600;
            
            &:first-child {
              margin-top: 0;
            }
          }
          
          :deep(table) {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
            
            th, td {
              border: 1px solid rgba(0, 0, 0, 0.1);
              padding: 8px 12px;
              text-align: left;
            }
            
            th {
              background: rgba(0, 0, 0, 0.05);
              font-weight: 600;
            }
          }
        }
        
        .message-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--el-text-color-secondary, #909399);
          font-size: 14px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--el-border-color-lighter, #e4e7ed);
        }
        
        .message-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--el-border-color-lighter, #e4e7ed);
          
          .action-btn {
            padding: 6px;
            min-width: auto;
            width: 28px;
            height: 28px;
            color: var(--el-text-color-regular, #606266);
            transition: all 0.2s;
            border-radius: 4px;
            
            :deep(.el-icon) {
              font-size: 16px;
            }
            
            &:hover:not(:disabled) {
              color: var(--el-color-primary, #409eff);
              background-color: var(--el-color-primary-light-9, #ecf5ff);
            }
            
            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
          }
        }
      }
    }
  }
}

.chat-input-area {
  border-top: 1px solid var(--el-border-color-lighter, #e4e7ed);
  padding: 20px 24px;
  background: var(--el-bg-color, #ffffff);
  
  .input-container-wrapper {
    width: 100%;
    
    .input-container {
      position: relative;
      background: var(--el-bg-color, #ffffff);
      border: 1px solid var(--el-border-color-lighter, #e4e7ed);
      border-radius: 12px;
      padding: 12px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        border-color: var(--el-border-color, #dcdfe6);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }
      
      &:focus-within {
        border-color: var(--el-color-primary, #409eff);
        box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1), 0 2px 8px rgba(64, 158, 255, 0.08);
      }
      
      .message-input {
        width: 100%;
        border: none;
        background: transparent;
        
        :deep(.el-textarea__inner) {
          border: none;
          border-radius: 0;
          resize: none;
          padding: 8px 0;
          font-size: 14px;
          line-height: 1.6;
          min-height: 60px;
          background: transparent;
          color: var(--el-text-color-primary, #303133);
          box-shadow: none;
          
          &::placeholder {
            color: var(--el-text-color-placeholder, #a8abb2);
            font-size: 14px;
          }
          
          &:hover:not(:disabled) {
            border: none;
            box-shadow: none;
          }
          
          &:focus {
            border: none;
            box-shadow: none;
            outline: none;
          }
          
          &:disabled {
            background: transparent;
            cursor: not-allowed;
            opacity: 0.6;
          }
        }
        
        :deep(.el-input__count) {
          display: none;
        }
      }
      
      .input-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid var(--el-border-color-lighter, #e4e7ed);
        
        .feature-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .feature-btn {
            height: 32px;
            padding: 0 16px;
            border-radius: 9999px;
            border: 1px solid var(--el-border-color-lighter, #e4e7ed);
            background: var(--el-bg-color, #ffffff);
            color: var(--el-text-color-primary, #303133);
            font-size: 13px;
            font-weight: 400;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
            
            :deep(.el-icon) {
              font-size: 16px;
            }
            
            &:hover {
              border-color: var(--el-border-color, #dcdfe6);
              background: var(--el-fill-color-light, #f5f7fa);
            }
          }
        }
        
        .action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .attach-btn {
            width: 32px;
            height: 32px;
            padding: 0;
            min-width: auto;
            color: var(--el-text-color-regular, #606266);
            transition: all 0.2s;
            
            :deep(.el-icon) {
              font-size: 18px;
            }
            
            &:hover {
              color: var(--el-color-primary, #409eff);
              background-color: var(--el-color-primary-light-9, #ecf5ff);
            }
          }
          
          .send-button {
            width: 32px;
            height: 32px;
            padding: 0;
            min-width: auto;
            background: var(--el-color-primary, #409eff);
            border: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 6px rgba(64, 158, 255, 0.25);
            
            :deep(.el-icon) {
              font-size: 16px;
              color: #ffffff;
            }
            
            &:hover:not(:disabled) {
              background: var(--el-color-primary-light-3, #79bbff);
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.35);
              transform: translateY(-1px);
            }
            
            &:active:not(:disabled) {
              transform: translateY(0);
              box-shadow: 0 2px 6px rgba(64, 158, 255, 0.25);
            }
            
            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
              box-shadow: none;
            }
            
            &.is-loading {
              cursor: wait;
            }
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 暗色模式适配
.dark {
  .chat-card {
    border-color: var(--el-border-color-dark, #4c4d4f);
    background: var(--el-bg-color-overlay, #1d1e1f);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
    
    :deep(.el-card__header) {
      border-bottom-color: var(--el-border-color-dark, #4c4d4f);
      background: var(--el-bg-color-overlay, #1d1e1f);
    }
    
    :deep(.el-card__body) {
      background: var(--el-bg-color-overlay, #1d1e1f);
    }
  }
  
  .chat-messages {
    background: var(--el-bg-color-page, #1d1e1f);
    
    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color-dark, #4c4d4f);
      
      &:hover {
        background: var(--el-text-color-placeholder, #6c6e72);
      }
    }
    
    .empty-state {
      .empty-content {
        .empty-icon {
          color: var(--el-color-primary-dark-2, #66b1ff);
        }
      }
    }
    
    .message-item {
      &.user-message {
        .message-avatar {
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
        }
        
        .message-bubble {
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
        }
      }
      
      &.ai-message {
        .message-avatar {
          background: var(--el-fill-color-dark, #4c4d4f);
          border-color: var(--el-border-color-dark, #4c4d4f);
        }
        
        .message-bubble {
          background: var(--el-bg-color-overlay, #2d2d2d);
          border-color: var(--el-border-color-dark, #4c4d4f);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          
          .message-text {
            :deep(pre) {
              background: rgba(255, 255, 255, 0.08);
              border-color: rgba(255, 255, 255, 0.1);
            }
            
            :deep(code) {
              background: rgba(255, 255, 255, 0.08);
            }
            
            :deep(blockquote) {
              border-left-color: rgba(255, 255, 255, 0.3);
            }
            
            :deep(table) {
              th, td {
                border-color: rgba(255, 255, 255, 0.15);
              }
              
              th {
                background: rgba(255, 255, 255, 0.05);
              }
            }
          }
          
          .message-loading {
            border-top-color: var(--el-border-color-dark, #4c4d4f);
          }
          
          .message-actions {
            border-top-color: var(--el-border-color-dark, #4c4d4f);
            
            .action-btn {
              color: var(--el-text-color-regular, #a8abb2);
              
              &:hover:not(:disabled) {
                color: var(--el-color-primary-dark-2, #66b1ff);
                background-color: rgba(64, 158, 255, 0.1);
              }
            }
          }
        }
      }
    }
  }
  
  .chat-input-area {
    background: var(--el-bg-color-overlay, #1d1e1f);
    border-top-color: var(--el-border-color-dark, #4c4d4f);
    
    .input-container-wrapper {
      .input-container {
        background: var(--el-bg-color-overlay, #1d1e1f);
        border-color: var(--el-border-color-dark, #4c4d4f);
        
        &:hover {
          border-color: var(--el-border-color-dark, #4c4d4f);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        
        &:focus-within {
          border-color: var(--el-color-primary, #409eff);
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2), 0 2px 8px rgba(64, 158, 255, 0.15);
        }
        
        .message-input {
          :deep(.el-textarea__inner) {
            color: var(--el-text-color-primary, #e5eaf3);
            background: transparent;
            
            &::placeholder {
              color: var(--el-text-color-placeholder, #6c6e72);
            }
            
            &:disabled {
              background: transparent;
            }
          }
        }
        
        .input-actions {
          border-top-color: var(--el-border-color-dark, #4c4d4f);
          
          .feature-buttons {
            .feature-btn {
              background: var(--el-bg-color-overlay, #1d1e1f);
              border-color: var(--el-border-color-dark, #4c4d4f);
              color: var(--el-text-color-primary, #e5eaf3);
              
              &:hover {
                border-color: var(--el-border-color-dark, #4c4d4f);
                background: var(--el-fill-color-dark, #2d2d2d);
              }
            }
          }
          
          .action-buttons {
            .attach-btn {
              color: var(--el-text-color-regular, #a8abb2);
              
              &:hover {
                color: var(--el-color-primary-dark-2, #66b1ff);
                background-color: rgba(64, 158, 255, 0.1);
              }
            }
            
            .send-button {
              box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
              
              &:hover:not(:disabled) {
                box-shadow: 0 4px 8px rgba(64, 158, 255, 0.4);
              }
            }
          }
        }
      }
    }
  }
}
</style>
