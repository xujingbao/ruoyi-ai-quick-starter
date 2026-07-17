import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * Agent message markdown with readable GFM tables.
 */
export default function AgentMarkdown({ children }) {
  return (
    <div className="ai-agent-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: ({ children: c }) => (
            <div className="ai-agent-md__table-wrap">
              <table>{c}</table>
            </div>
          ),
          a: ({ href, children: c }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {c}
            </a>
          )
        }}
      >
        {children || ''}
      </ReactMarkdown>
    </div>
  )
}
