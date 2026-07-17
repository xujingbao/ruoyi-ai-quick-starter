import AgentWorkbench from './AgentWorkbench'
import './index.scss'

/**
 * /ai/agent 全页工作台
 */
export default function AiAgent() {
  return (
    <div className="ai-agent-page">
      <AgentWorkbench layout="page" />
    </div>
  )
}
