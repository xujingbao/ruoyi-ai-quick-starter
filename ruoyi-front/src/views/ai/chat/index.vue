<template>
  <div class="app-container">
    <el-card shadow="never" class="chat-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon style="margin-right: 8px;"><ChatDotRound /></el-icon>
            AI 对话助手
          </span>
          <el-button 
            text 
            type="danger" 
            size="small" 
            @click="clearChat" 
            :disabled="aiChatLoading || messages.length === 0"
          >
            <el-icon style="margin-right: 4px;"><Delete /></el-icon>
            清空对话
          </el-button>
        </div>
      </template>

      <div class="chat-container">
        <!-- 对话消息列表 -->
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-state">
            <el-icon class="empty-icon"><ChatLineRound /></el-icon>
            <p class="empty-text">开始与 AI 对话吧！</p>
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
              </div>
            </div>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <div class="input-wrapper">
            <el-input
              v-model="aiChatMessage"
              type="textarea"
              :rows="3"
              placeholder="输入消息，按 Ctrl+Enter 发送..."
              @keydown.ctrl.enter="sendAiMessage"
              :disabled="aiChatLoading"
              resize="none"
              class="message-input"
            />
            <el-button 
              type="primary" 
              @click="sendAiMessage" 
              :loading="aiChatLoading" 
              :disabled="!aiChatMessage.trim()"
              class="send-button"
            >
              <el-icon v-if="!aiChatLoading"><Promotion /></el-icon>
              <span v-else>发送中</span>
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="AiChat">
import { ref, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatDotRound, Loading, Delete, Promotion, Service, ChatLineRound, User } from '@element-plus/icons-vue'
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
}

.chat-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .card-title {
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
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
  padding: 20px;
  background: #f5f7fa;
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #909399;
    
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .empty-text {
      font-size: 16px;
      margin: 0;
    }
  }
  
  .message-item {
    display: flex;
    margin-bottom: 20px;
    animation: fadeIn 0.3s ease-in;
    
    &.user-message {
      flex-direction: row-reverse;
      
      .message-avatar {
        background: #409eff;
        color: #fff;
      }
      
      .message-bubble {
        background: #409eff;
        color: #fff;
        border-radius: 12px 12px 4px 12px;
      }
    }
    
    &.ai-message {
      .message-avatar {
        background: #e4e7ed;
        color: #606266;
      }
      
      .message-bubble {
        background: #ffffff;
        color: #303133;
        border-radius: 12px 12px 12px 4px;
      }
    }
    
    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin: 0 12px;
      font-size: 18px;
    }
    
    .message-content {
      flex: 1;
      max-width: 70%;
      min-width: 0;
      
      .message-bubble {
        padding: 12px 16px;
        word-wrap: break-word;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        .message-text {
          line-height: 1.6;
          
          :deep(pre) {
            background: rgba(0, 0, 0, 0.05);
            padding: 8px 12px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 8px 0;
          }
          
          :deep(code) {
            background: rgba(0, 0, 0, 0.05);
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
          }
          
          :deep(blockquote) {
            border-left: 3px solid rgba(0, 0, 0, 0.2);
            padding-left: 12px;
            margin: 8px 0;
            opacity: 0.8;
          }
          
          :deep(p) {
            margin: 4px 0;
          }
          
          :deep(ul), :deep(ol) {
            margin: 8px 0;
            padding-left: 20px;
          }
        }
        
        .message-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #909399;
          font-size: 14px;
          margin-top: 8px;
        }
      }
    }
  }
}

.chat-input-area {
  border-top: 1px solid #e4e7ed;
  padding: 16px 20px;
  background: #ffffff;
  
  .input-wrapper {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    
    .message-input {
      flex: 1;
      
      :deep(.el-textarea__inner) {
        border-radius: 8px;
        resize: none;
      }
    }
    
    .send-button {
      height: 80px;
      padding: 0 24px;
      border-radius: 8px;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 暗色模式适配
.dark {
  .chat-messages {
    background: #1d1e1f;
    
    .empty-state {
      color: #909399;
    }
    
    .message-item {
      &.ai-message {
        .message-avatar {
          background: #4c4d4f;
          color: #e5eaf3;
        }
        
        .message-bubble {
          background: #2d2d2d;
          color: #e5eaf3;
          
          .message-text {
            :deep(pre) {
              background: rgba(255, 255, 255, 0.1);
            }
            
            :deep(code) {
              background: rgba(255, 255, 255, 0.1);
            }
          }
        }
      }
    }
  }
  
  .chat-input-area {
    background: #1d1e1f;
    border-top-color: #4c4d4f;
  }
}
</style>
