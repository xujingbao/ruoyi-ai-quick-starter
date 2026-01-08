# 流式渲染逻辑梳理

**版本信息：** RuoYi AI Quick Starter v4.1 新增功能

> 说明：本仓库 Web 前端已提供 `ruoyi-front-react`（React 18 + Ant Design）。
> 若你仍在使用 `ruoyi-front`（Vue 3 + Element Plus），文档中以 `.vue / markstream-vue` 为例的内容可作为历史实现参考。

## 整体流程

```
后端 (Spring AI) → SSE 流式响应 → 前端 (fetch + SSE 解析) → 文本累积 → MarkdownRender 流式渲染
```

## 1. 后端流式响应 (AiChatController.java)

### 1.1 接口定义
- **路径**: `/ai/chat/stream`
- **方法**: `POST`
- **返回类型**: `Flux<ChatResponse>`
- **Content-Type**: `text/event-stream` (SSE 格式)

### 1.2 处理流程
```java
1. 用户认证验证 (SecurityUtils.getLoginUser())
2. 参数验证 (消息内容不能为空)
3. 构建消息列表 (SystemMessage + UserMessage)
4. 创建 Prompt
5. 调用 chatModel.stream(prompt) 返回 Flux<ChatResponse>
```

### 1.3 响应格式
Spring AI 返回的每个 `ChatResponse` 包含：
- `result.output.text`: 增量文本片段（主要字段）
- `results[0].output.text`: 备用字段路径

**注意**: 每个数据块包含的是**增量文本片段**，不是完整累积文本。

## 2. 前端 SSE 解析 (chat.js)

### 2.0 React 版本文件位置

- `ruoyi-front-react/src/api/ai/chat.js`：`streamChat(data, onMessage, onError, onComplete)`（SSE 解析 + 增量文本回调）

### 2.1 请求发起
```javascript
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer {token}'
  },
  body: JSON.stringify({ message: '用户消息' })
})
```

### 2.2 流式数据读取
```javascript
1. 获取 ReadableStream (response.body.getReader())
2. 使用 TextDecoder 解码字节流
3. 维护 buffer 处理不完整的行
4. 按 '\n' 分割数据块
```

### 2.3 SSE 数据解析
```javascript
1. 识别 'data:' 开头的行（支持 'data:' 和 'data: ' 两种格式）
2. 提取 JSON 数据（移除 'data:' 前缀）
3. 解析 JSON 获取 ChatResponse
4. 提取增量文本：
   - 优先: jsonData.result.output.text
   - 备用: jsonData.results[0].output.text
5. 调用 onMessage(text) 传递增量文本
```

### 2.4 关键代码
```javascript
// 提取增量文本
const text = jsonData?.result?.output?.text ?? jsonData?.results?.[0]?.output?.text ?? ''

// 传递增量文本片段
if (onMessage && text) {
  onMessage(text)
}
```

## 3. 前端文本累积（React 示例）

### 3.1 状态管理
```javascript
const [aiChatContent, setAiChatContent] = useState('') // 累积的完整文本
const [aiChatLoading, setAiChatLoading] = useState(false) // 加载状态
```

### 3.2 文本累积逻辑
```javascript
streamChat(
  { message: aiChatMessage },
  (text) => {
    // 累积增量文本片段
    setAiChatContent((prev) => prev + (text || ''))
  },
  // onError, onComplete...
)
```

**关键点**: 
- 每个增量文本片段通过 `+=` 累积到 `aiChatContent`
- 空字符串也会累积（可能是换行符、空格等）

## 4. Markdown 渲染（React）

### 4.1 组件使用
React 侧可以使用 `react-markdown` 来渲染累积的 Markdown 内容（本项目已引入依赖）。

### 4.2 渲染机制
- React 通过 `setState` 触发重新渲染
- 每次收到增量文本时更新 `aiChatContent`
- Markdown 渲染组件接收完整文本并重新渲染（无需手动解析）

**优势**: 
- 高性能流式渲染
- 自动处理 Markdown 解析
- 支持实时更新

## 5. 完整数据流

```
1. 用户输入消息
   ↓
2. 前端调用 streamChat()
   ↓
3. 后端接收请求，调用 chatModel.stream()
   ↓
4. Spring AI 流式返回 ChatResponse (增量文本片段)
   ↓
5. 后端通过 SSE 格式发送: data:{"result":{"output":{"text":"增量文本"}}}
   ↓
6. 前端 fetch 接收 SSE 流
   ↓
7. chat.js 解析 SSE，提取增量文本
   ↓
8. 调用 onMessage(text) 传递增量文本
   ↓
9. React 累积文本: setAiChatContent(prev => prev + text)
   ↓
10. Markdown 组件接收新 content 重新渲染
   ↓
11. 页面展示更新后的 Markdown
```

## 6. 关键设计点

### 6.1 增量文本 vs 完整文本
- **后端返回**: 增量文本片段（如 "你"、"好"、"！"）
- **前端累积**: 通过 `+=` 累积成完整文本
- **渲染**: 组件接收完整文本并重新渲染

### 6.2 SSE 格式处理
- 支持 `data:` 和 `data: ` 两种格式
- 处理不完整的行（buffer 机制）
- 忽略 `[DONE]` 和空数据

### 6.3 错误处理
- 网络错误: `onError` 回调
- 解析错误: 静默忽略（可能是非 JSON 数据）
- 超时处理: 前端显示友好错误提示

## 7. 优化建议

1. **文本提取**: 只提取主要字段路径，简化代码
2. **错误处理**: 静默处理解析错误，避免影响用户体验
3. **状态管理**: 使用响应式变量，自动触发 UI 更新
4. **组件选择**: 使用 Markdown 渲染组件（如 `react-markdown`）渲染累积文本

## 8. 文件结构

```
后端:
  - AiChatController.java: 流式接口定义
  - ChatRequest.java: 请求参数 DTO

前端:
  - ruoyi-front-react/src/api/ai/chat.js: SSE 解析和文本提取（React 版本）
```
