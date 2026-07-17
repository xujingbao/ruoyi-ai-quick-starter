import { RobotOutlined } from '@ant-design/icons'
import AgentMarkdown from './AgentMarkdown'
import ToolProcessGroup from './ToolProcessGroup'

/**
 * One Cursor-like assistant turn: tools then answer, single avatar.
 */
export default function AssistantTurn({ tools = [], assistant, loading }) {
  const content = assistant?.content || ''
  const showThinking = !content && loading
  const hasTools = tools.length > 0

  if (!hasTools && !content && !showThinking) return null

  return (
    <div className="ai-agent-msg ai-agent-msg--agent ai-agent-msg--turn">
      <div className="ai-agent-msg__avatar" aria-hidden>
        <RobotOutlined />
      </div>
      <div className="ai-agent-msg__body">
        {hasTools && <ToolProcessGroup tools={tools} />}
        {showThinking && <div className="ai-agent-msg__thinking">Thinking…</div>}
        {content ? (
          <div className="ai-agent-msg__answer">
            <AgentMarkdown>{content}</AgentMarkdown>
          </div>
        ) : null}
      </div>
    </div>
  )
}
