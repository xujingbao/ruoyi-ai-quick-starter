import { create } from 'zustand'

const WELCOME =
  '我是系统核心 **AI Agent**。默认可查询用户 / 配置 / 公告 / 定时任务（受你的权限约束）。需要文件沙箱时，请开启「沙箱」模式。'

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

/**
 * Global Agent Shell + shared session state.
 */
export const useAgentShellStore = create((set, get) => ({
  open: false,
  sessionId: '',
  toolMode: 'business',
  messages: [{ id: uid(), role: 'assistant', kind: 'text', content: WELCOME }],

  openShell: () => set({ open: true }),
  closeShell: () => set({ open: false }),
  toggleShell: () => set((s) => ({ open: !s.open })),

  setSessionId: (sessionId) => set({ sessionId: sessionId || '' }),
  setToolMode: (toolMode) => set({ toolMode: toolMode === 'full' ? 'full' : 'business' }),
  setMessages: (messages) =>
    set({ messages: typeof messages === 'function' ? messages(get().messages) : messages }),
  resetConversation: (content) =>
    set({
      messages: [
        {
          id: uid(),
          role: 'assistant',
          kind: 'text',
          content: content || '已新建会话。'
        }
      ]
    })
}))

export { uid, WELCOME }
