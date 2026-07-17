import { useEffect, useMemo, useRef, useState } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import ToolCard from './ToolCard'

/**
 * Cursor-style tool exploration block.
 */
export default function ToolProcessGroup({ tools }) {
  const running = tools.some((t) => !t.done)
  const errorCount = tools.filter((t) => t.isError).length
  const doneCount = tools.filter((t) => t.done).length
  const userTouched = useRef(false)
  const [open, setOpen] = useState(running)

  useEffect(() => {
    if (userTouched.current) return
    if (running) setOpen(true)
    else if (doneCount === tools.length && tools.length > 0) setOpen(false)
  }, [running, doneCount, tools.length])

  const label = useMemo(() => {
    if (running) {
      const current = tools.find((t) => !t.done)
      const verb =
        {
          grep: 'Searching',
          read: 'Reading',
          find: 'Globbing',
          ls: 'Listing',
          sys_list_users: 'Listing users',
          sys_get_config: 'Fetching config',
          sys_list_notices: 'Listing notices',
          sys_list_jobs: 'Listing jobs'
        }[current?.toolName] || 'Working'
      return verb
    }
    if (tools.length === 1) {
      return 'Used 1 tool'
    }
    if (errorCount > 0) {
      return `Explored · ${tools.length} tools · ${errorCount} failed`
    }
    return `Explored · ${tools.length} tools`
  }, [running, tools, errorCount])

  return (
    <div className={`ai-agent-process ${open ? 'is-open' : ''} ${running ? 'is-running' : ''}`}>
      <button
        type="button"
        className="ai-agent-process__bar"
        onClick={() => {
          userTouched.current = true
          setOpen((v) => !v)
        }}
        aria-expanded={open}
      >
        <span className={`ai-agent-process__caret ${open ? 'is-open' : ''}`} aria-hidden>
          ▸
        </span>
        {running ? <LoadingOutlined className="ai-agent-process__spin" /> : null}
        <span className="ai-agent-process__label">{label}</span>
      </button>

      {open && (
        <div className="ai-agent-process__list">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Group tools + following assistant reply into one Cursor-like turn.
 */
export function groupThreadMessages(messages) {
  const out = []
  for (const m of messages) {
    if (m.kind === 'tool') {
      const last = out[out.length - 1]
      if (last?.kind === 'assistant-turn') {
        last.tools.push(m)
      } else {
        out.push({
          kind: 'assistant-turn',
          id: `at_${m.id}`,
          tools: [m],
          assistant: null
        })
      }
    } else if (m.role === 'assistant') {
      const last = out[out.length - 1]
      if (last?.kind === 'assistant-turn' && !last.assistant) {
        last.assistant = m
        last.id = m.id
      } else {
        out.push({
          kind: 'assistant-turn',
          id: m.id,
          tools: [],
          assistant: m
        })
      }
    } else {
      out.push(m)
    }
  }
  return out
}
