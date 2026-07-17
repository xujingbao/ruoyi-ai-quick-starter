import { useEffect, useState } from 'react'
import { Drawer, Typography } from 'antd'
import { useAgentShellStore } from '@/store/agentShellStore'
import AgentWorkbench from '@/views/ai/agent/AgentWorkbench'
import '@/views/ai/agent/index.scss'
import './index.scss'

const { Text } = Typography

/**
 * Global Agent Shell — primary interaction surface for the AI-native product.
 */
export default function AgentShell() {
  const open = useAgentShellStore((s) => s.open)
  const closeShell = useAgentShellStore((s) => s.closeShell)
  const toggleShell = useAgentShellStore((s) => s.toggleShell)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    const onKey = (e) => {
      const key = (e.key || '').toLowerCase()
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault()
        toggleShell()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleShell])

  return (
    <Drawer
      className="agent-shell-drawer"
      title={
        <div className="agent-shell-title">
          <span>AI Agent</span>
          <Text type="secondary" className="agent-shell-hint">
            ⌘/Ctrl + K
          </Text>
        </div>
      }
      placement="right"
      width={960}
      open={open}
      onClose={closeShell}
      destroyOnClose={false}
      styles={{ body: { padding: 12, display: 'flex', flexDirection: 'column', height: '100%' } }}
    >
      {mounted && (
        <div style={{ display: open ? 'flex' : 'none', flex: 1, flexDirection: 'column', minHeight: 0 }}>
          <AgentWorkbench compact />
        </div>
      )}
    </Drawer>
  )
}
