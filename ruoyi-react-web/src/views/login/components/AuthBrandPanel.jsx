import {
  ApiOutlined,
  CloudServerOutlined,
  RobotOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'

const BRAND_HIGHLIGHTS = [
  {
    key: 'ai',
    icon: <RobotOutlined />,
    title: 'AI 智能助手',
    desc: '内置对话、代码生成与知识库能力',
  },
  {
    key: 'rapid',
    icon: <ApiOutlined />,
    title: '快速开发',
    desc: '开箱即用的权限、字典与代码生成',
  },
  {
    key: 'secure',
    icon: <SafetyCertificateOutlined />,
    title: '安全可靠',
    desc: '完善的认证鉴权与操作审计体系',
  },
  {
    key: 'ops',
    icon: <CloudServerOutlined />,
    title: '高效运维',
    desc: '系统监控、日志追踪与在线管理',
  },
]

/**
 * 登录页左侧品牌展示栏（参考 dv-payment 商户门户 AuthBrandPanel）。
 * @param {{ isCompact?: boolean }} props
 */
const AuthBrandPanel = ({ isCompact = false }) => {
  const className = `auth-brand-panel${isCompact ? ' auth-brand-panel--compact' : ''}`

  return (
    <div className={className}>
      <div className="auth-brand-panel__overlay" />
      <div className="auth-brand-panel__content">
        <div className="auth-brand-panel__title">
          面向团队的
          <br />
          AI 快速研发管理平台
        </div>
        <div className="auth-brand-panel__highlights">
          {BRAND_HIGHLIGHTS.map((item) => (
            <div key={item.key} className="auth-brand-panel__highlight">
              <div className="auth-brand-panel__highlight-icon">{item.icon}</div>
              <div>
                <div className="auth-brand-panel__highlight-title">{item.title}</div>
                <div className="auth-brand-panel__highlight-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuthBrandPanel
