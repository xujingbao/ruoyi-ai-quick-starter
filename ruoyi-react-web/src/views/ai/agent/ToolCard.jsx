import { useMemo, useState } from 'react'
import { Empty, Table } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const TOOL_META = {
  sys_list_users: { verb: 'Listed users' },
  sys_get_config: { verb: 'Fetched config' },
  sys_list_notices: { verb: 'Listed notices' },
  sys_list_jobs: { verb: 'Listed jobs' },
  read: { verb: 'Read' },
  grep: { verb: 'Searched' },
  find: { verb: 'Globbed' },
  ls: { verb: 'Listed' }
}

const LABEL_MAP = {
  userId: 'ID',
  userName: '用户名',
  nickName: '昵称',
  deptName: '部门',
  phonenumber: '手机号',
  email: '邮箱',
  status: '状态',
  configKey: '配置键',
  configValue: '配置值',
  configName: '配置名',
  noticeId: 'ID',
  noticeTitle: '标题',
  noticeType: '类型',
  createBy: '创建人',
  createTime: '创建时间',
  jobId: 'ID',
  jobName: '任务名',
  jobGroup: '分组',
  cronExpression: 'Cron',
  invokeTarget: '调用目标',
  pattern: 'pattern',
  path: 'path',
  glob: 'glob',
  limit: 'limit',
  file: 'file'
}

const HIDDEN_COLS = new Set([
  'deptId',
  'userId',
  'noticeId',
  'jobId',
  'configId',
  'createBy',
  'updateBy',
  'remark',
  'params'
])

const HIDDEN_ARGS = new Set(['pageNum', 'pageSize'])

function formatValue(value) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function unwrapToolPayload(result) {
  if (result == null) return null
  if (typeof result === 'object' && result.kind === 'table' && Array.isArray(result.rows)) {
    return result
  }
  if (typeof result === 'string') {
    try {
      return JSON.parse(result)
    } catch {
      return null
    }
  }
  if (typeof result === 'object') {
    if (Array.isArray(result.content)) {
      const text = result.content.find((c) => c?.type === 'text')?.text
      if (typeof text === 'string') {
        try {
          return JSON.parse(text)
        } catch {
          return null
        }
      }
    }
    return result
  }
  return null
}

function extractRows(payload) {
  if (!payload || typeof payload !== 'object') return null
  if (payload.kind === 'table' && Array.isArray(payload.rows)) {
    return { rows: payload.rows, total: Number(payload.total ?? payload.rows.length) || 0 }
  }
  if (Array.isArray(payload.rows)) {
    return { rows: payload.rows, total: Number(payload.total ?? payload.rows.length) || 0 }
  }
  if (Array.isArray(payload.data)) {
    return { rows: payload.data, total: payload.data.length }
  }
  if (Array.isArray(payload)) {
    return { rows: payload, total: payload.length }
  }
  if (payload.configKey != null || payload.configValue != null) {
    return { rows: [payload], total: 1 }
  }
  return null
}

function buildColumns(rows) {
  if (!rows?.length) return []
  const sample = rows[0]
  const keys = Object.keys(sample).filter((k) => {
    if (HIDDEN_COLS.has(k)) return false
    const v = sample[k]
    return v == null || ['string', 'number', 'boolean'].includes(typeof v)
  })
  const preferred = Object.keys(LABEL_MAP)
  const ordered = [
    ...preferred.filter((k) => keys.includes(k)),
    ...keys.filter((k) => !preferred.includes(k))
  ].slice(0, 6)

  return ordered.map((key) => ({
    title: LABEL_MAP[key] || key,
    dataIndex: key,
    key,
    ellipsis: true,
    render: (val) => {
      if (key === 'status') {
        if (val === '0') return <span className="ai-agent-tool__ok">正常</span>
        if (val === '1') return '停用'
      }
      if (key === 'noticeType') {
        if (val === '1') return '通知'
        if (val === '2') return '公告'
      }
      return val == null || val === '' ? '-' : String(val)
    }
  }))
}

function parseArgs(args) {
  if (args == null) return null
  if (typeof args === 'object') return args
  if (typeof args === 'string') {
    try {
      return JSON.parse(args)
    } catch {
      return null
    }
  }
  return null
}

function briefFromArgs(args) {
  const obj = parseArgs(args)
  if (!obj || typeof obj !== 'object') return ''
  const prefer = ['pattern', 'file', 'path', 'glob', 'userName', 'configKey', 'jobName', 'noticeTitle']
  for (const k of prefer) {
    if (obj[k] != null && obj[k] !== '') {
      const v = String(obj[k])
      return v.length > 56 ? `${v.slice(0, 56)}…` : v
    }
  }
  const first = Object.entries(obj).find(
    ([k, v]) => v != null && v !== '' && !HIDDEN_ARGS.has(k) && k !== 'limit'
  )
  if (!first) return ''
  const v = String(first[1])
  return v.length > 56 ? `${v.slice(0, 56)}…` : v
}

function argLines(args) {
  const obj = parseArgs(args)
  if (!obj || typeof obj !== 'object') return []
  return Object.entries(obj)
    .filter(([k, v]) => v != null && v !== '' && !HIDDEN_ARGS.has(k))
    .slice(0, 10)
    .map(([k, v]) => ({
      key: k,
      label: LABEL_MAP[k] || k,
      value: typeof v === 'string' ? v : formatValue(v)
    }))
}

function extractPlainText(result) {
  if (result == null) return ''
  if (typeof result === 'string') {
    return result.length > 1200 ? `${result.slice(0, 1200)}…` : result
  }
  if (typeof result === 'object' && Array.isArray(result.content)) {
    const text = result.content.find((c) => c?.type === 'text')?.text
    if (typeof text === 'string') {
      return text.length > 1200 ? `${text.slice(0, 1200)}…` : text
    }
  }
  try {
    const s = JSON.stringify(result, null, 2)
    return s.length > 1200 ? `${s.slice(0, 1200)}…` : s
  } catch {
    return ''
  }
}

/**
 * Cursor-style tool row: verb + target, click to expand details.
 */
export default function ToolCard({ tool }) {
  const status = tool.isError ? 'error' : tool.done ? 'done' : 'running'
  const [expanded, setExpanded] = useState(false)

  const meta = TOOL_META[tool.toolName] || { verb: tool.toolName || 'Tool' }
  const hint = briefFromArgs(tool.args)
  const lines = useMemo(() => argLines(tool.args), [tool.args])

  const tableData = useMemo(() => {
    const payload = unwrapToolPayload(tool.result)
    return extractRows(payload)
  }, [tool.result])

  const columns = useMemo(
    () => (tableData?.rows?.length ? buildColumns(tableData.rows) : []),
    [tableData]
  )

  const hasTable = !!tableData

  return (
    <div className={`ai-agent-tool ai-agent-tool--${status} ${expanded ? 'is-open' : ''}`}>
      <button
        type="button"
        className="ai-agent-tool__bar"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className={`ai-agent-tool__caret ${expanded ? 'is-open' : ''}`} aria-hidden>
          ▸
        </span>
        {status === 'running' && <LoadingOutlined className="ai-agent-tool__spin" />}
        <span className="ai-agent-tool__verb">{meta.verb}</span>
        {hint ? (
          <span className="ai-agent-tool__target" title={hint}>
            {hint}
          </span>
        ) : null}
        {status === 'error' ? <span className="ai-agent-tool__err">Error</span> : null}
      </button>

      {expanded && (
        <div className="ai-agent-tool__body">
          {lines.length > 0 && (
            <div className="ai-agent-tool__args">
              {lines.map((l) => (
                <div key={l.key} className="ai-agent-tool__arg">
                  <span className="ai-agent-tool__arg-k">{l.label}</span>
                  <span className="ai-agent-tool__arg-v">{l.value}</span>
                </div>
              ))}
            </div>
          )}

          {status === 'running' && <div className="ai-agent-tool__pending">Running…</div>}

          {hasTable && tool.done && !tool.isError && (
            <div className="ai-agent-tool__scroll">
              {tableData.rows.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No results" />
              ) : (
                <Table
                  size="small"
                  rowKey={(row, idx) =>
                    String(row.userId ?? row.configId ?? row.noticeId ?? row.jobId ?? idx)
                  }
                  columns={columns}
                  dataSource={tableData.rows}
                  pagination={false}
                  scroll={{ x: true, y: 180 }}
                />
              )}
            </div>
          )}

          {!hasTable && tool.done && (
            <pre className="ai-agent-tool__raw">
              {extractPlainText(tool.result) || formatValue(tool.result) || '(empty)'}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
