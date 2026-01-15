import { useEffect, useState } from 'react'
import { Card, Descriptions, Row, Col, Button, Progress } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { getServer } from '@/api/monitor/server'
import './index.scss'

const Server = () => {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(false)
  const [showAllDisks, setShowAllDisks] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getServer()
      setData(res.data || {})
    } catch (error) {
      console.error('Failed to load server info:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const renderCard = (title, items) => (
    <Card title={title} size="small" style={{ marginBottom: 16 }}>
      <Descriptions column={1} size="small" bordered>
        {items.map(item => (
          <Descriptions.Item key={item.label} label={item.label}>
            {item.value ?? '-'}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Card>
  )

  const cpu = data.cpu || {}
  const mem = data.mem || {}
  const sys = data.sys || {}
  const jvm = data.jvm || {}
  const sysFiles = data.sysFiles || []
  const formatWithUnit = (value, unit = '') =>
    value !== undefined && value !== null ? `${value}${unit}` : '-'
  const formatPercent = value => {
    const num = Number(value)
    return Number.isFinite(num) ? `${num}%` : '-'
  }

  const primaryDisk = sysFiles[0] || {}
  const maxDiskUsage = sysFiles.reduce((max, file) => {
    const usage = Number(file?.usage)
    return Number.isFinite(usage) ? Math.max(max, usage) : max
  }, 0)

  const diskEntries = sysFiles.map(file => ({
    dirName: file.dirName ?? '-',
    type: file.sysTypeName ?? '-',
    total: file.total ?? '-',
    used: file.used ?? '-',
    free: file.free ?? '-',
    usagePercent: Number.isFinite(Number(file.usage)) ? Number(file.usage) : 0
  }))

  const summaryItems = [
    {
      title: 'CPU 使用率',
      value: formatPercent(cpu.used),
      percent: Number(cpu.used) || 0,
      detail: `核心数 ${cpu.cpuNum ?? '-'}`
    },
    {
      title: '内存 使用率',
      value: formatPercent(mem.usage),
      percent: Number(mem.usage) || 0,
      detail: `已用 ${formatWithUnit(mem.used, ' GB')} / 总计 ${formatWithUnit(mem.total, ' GB')}`
    },
    {
      title: 'JVM 内存占用',
      value: formatPercent(jvm.usage),
      percent: Number(jvm.usage) || 0,
      detail: `已用 ${formatWithUnit(jvm.total, ' MB')} / 最大 ${formatWithUnit(jvm.max, ' MB')}`
    },
    {
      title: '磁盘 使用率',
      value: formatPercent(maxDiskUsage),
      percent: maxDiskUsage,
      detail: primaryDisk.dirName
        ? `${primaryDisk.dirName} (${primaryDisk.sysTypeName ?? '-'})`
        : '暂无磁盘数据'
    }
  ]

  const maxVisibleDisks = 3
  const visibleDiskEntries = showAllDisks
    ? diskEntries
    : diskEntries.slice(0, maxVisibleDisks)

  return (
    <div className="app-container server-page">
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>刷新</Button>
      </Row>
      <Row gutter={[16, 16]} className="summary-row">
        {summaryItems.map(item => (
          <Col key={item.title} xs={24} sm={12} md={6}>
            <Card size="small" className="summary-card">
              <div className="summary-card__title">{item.title}</div>
              <div className="summary-card__value">{item.value}</div>
              <div className="summary-card__detail">{item.detail}</div>
              <Progress
                percent={Math.min(Math.max(item.percent, 0), 100)}
                strokeWidth={4}
                size="small"
                showInfo={false}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={16}>
        <Col xs={24} xl={12}>
          {renderCard('CPU', [
            { label: '核心数', value: cpu.cpuNum },
            { label: '系统使用率', value: `${cpu.sys ?? '-'}%` },
            { label: '用户使用率', value: `${cpu.used ?? '-'}%` },
            { label: '当前空闲率', value: `${cpu.free ?? '-'}%` }
          ])}
          {renderCard('内存', [
            { label: '总内存', value: `${mem.total ?? '-'} GB` },
            { label: '已用内存', value: `${mem.used ?? '-'} GB` },
            { label: '剩余内存', value: `${mem.free ?? '-'} GB` },
            { label: '使用率', value: `${mem.usage ?? '-'}%` }
          ])}
          {renderCard('系统信息', [
            { label: '服务器名称', value: sys.computerName },
            { label: '服务器IP', value: sys.computerIp },
            { label: '操作系统', value: sys.osName },
            { label: '系统架构', value: sys.osArch }
          ])}
        </Col>
        <Col xs={24} xl={12}>
          {renderCard('Java虚拟机', [
            { label: '名称', value: jvm.name },
            { label: '版本', value: jvm.version },
            { label: '启动时间', value: jvm.startTime },
            { label: '运行时间', value: jvm.runTime },
            { label: '安装路径', value: jvm.home },
            { label: '项目路径', value: jvm.userDir },
            { label: '最大内存', value: `${jvm.max ?? '-'} MB` },
            { label: '已用内存', value: `${jvm.total ?? '-'} MB` },
            { label: '空闲内存', value: `${jvm.free ?? '-'} MB` },
            { label: '使用率', value: `${jvm.usage ?? '-'}%` }
          ])}
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24}>
          <Card title="磁盘状态" size="small" className="disk-card">
            {diskEntries.length ? (
              <>
                <div className="disk-card__list">
                  {visibleDiskEntries.map(({ dirName, type, total, used, free, usagePercent }) => (
                    <div className="disk-card__item" key={`${dirName}-${type}`}>
                      <div className="disk-card__item-title">
                        <span>{dirName}</span>
                        <span className="disk-card__item-type">{type}</span>
                      </div>
                      <div className="disk-card__item-progress">
                        <Progress
                          percent={Math.min(Math.max(usagePercent, 0), 100)}
                          strokeWidth={4}
                          size="small"
                          showInfo={false}
                        />
                        <span className="disk-card__item-usage">{formatPercent(usagePercent)}</span>
                      </div>
                      <div className="disk-card__item-meta">
                        <span>总计 <strong>{total}</strong></span>
                        <span>已用 <strong>{used}</strong></span>
                        <span>可用 <strong>{free}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
                {diskEntries.length > maxVisibleDisks && (
                  <div className="disk-card__footer">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => setShowAllDisks(v => !v)}
                    >
                      {showAllDisks ? '收起更多磁盘' : `显示全部 (${diskEntries.length})`}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="disk-card__empty">暂无磁盘数据</div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Server
