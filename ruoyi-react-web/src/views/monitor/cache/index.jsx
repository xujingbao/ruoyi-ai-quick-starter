import { useEffect, useState } from 'react'
import { Card, Row, Col, Select, Button, Form, Input, Space } from 'antd'
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons'
import { getCache, listCacheName, listCacheKey, getCacheValue, clearCacheAll, clearCacheName, clearCacheKey } from '@/api/monitor/cache'
import './index.scss'

const Cache = () => {
  const [cache, setCache] = useState({})
  const [cacheNames, setCacheNames] = useState([])
  const [cacheKeys, setCacheKeys] = useState([])
  const [selectedCacheName, setSelectedCacheName] = useState()
  const [selectedCacheKey, setSelectedCacheKey] = useState()
  const [cacheValue, setCacheValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    initData()
  }, [])

  const initData = async () => {
    setLoading(true)
    try {
      const base = await getCache()
      setCache(base.data || {})
      const names = await listCacheName()
      setCacheNames(names.data || [])
      setCacheKeys([])
      setSelectedCacheName(undefined)
      setSelectedCacheKey(undefined)
      setCacheValue('')
    } finally {
      setLoading(false)
    }
  }

  const handleCacheNameChange = async (value) => {
    setSelectedCacheName(value)
    setSelectedCacheKey(undefined)
    setCacheValue('')
    if (value) {
      const res = await listCacheKey(value)
      setCacheKeys(res.data || [])
    } else {
      setCacheKeys([])
    }
  }

  const handleCacheKeyChange = async (value) => {
    setSelectedCacheKey(value)
    if (selectedCacheName && value) {
      const res = await getCacheValue(selectedCacheName, value)
      setCacheValue(res.data || '')
    } else {
      setCacheValue('')
    }
  }

  const handleRefresh = () => {
    initData()
  }

  const handleClearAll = async () => {
    await clearCacheAll()
    handleRefresh()
  }

  const handleClearName = async () => {
    if (!selectedCacheName) return
    await clearCacheName(selectedCacheName)
    handleRefresh()
  }

  const handleClearKey = async () => {
    if (!selectedCacheKey) return
    await clearCacheKey(selectedCacheKey)
    handleCacheNameChange(selectedCacheName)
  }

  return (
    <div className="app-container cache-page">
      <Row gutter={16}>
        <Col span={8}>
          <Card
            title="系统信息"
            extra={<Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>刷新</Button>}
          >
            <p>Redis版本：{cache.redis_version || '-'}</p>
            <p>运行模式：{cache.redis_mode || '-'}</p>
            <p>端口：{cache.tcp_port || '-'}</p>
            <p>客户端数：{cache.connected_clients || '-'}</p>
            <p>内存使用：{cache.used_memory_human || '-'}</p>
            <p>运行时间：{cache.uptime_in_days || '-'} 天</p>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="缓存管理" extra={
            <Space>
              <Button icon={<DeleteOutlined />} onClick={handleClearAll}>清空全部</Button>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>刷新</Button>
            </Space>
          }>
            <Form layout="inline" style={{ marginBottom: 16 }}>
              <Form.Item label="缓存名称">
                <Select
                  style={{ width: 240 }}
                  value={selectedCacheName}
                  onChange={handleCacheNameChange}
                  allowClear
                  placeholder="请选择缓存名称"
                  options={cacheNames.map(name => ({ label: name, value: name }))}
                />
              </Form.Item>
              <Form.Item label="缓存键名">
                <Select
                  style={{ width: 240 }}
                  value={selectedCacheKey}
                  onChange={handleCacheKeyChange}
                  allowClear
                  placeholder="请选择缓存键名"
                  options={cacheKeys.map(key => ({ label: key, value: key }))}
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button icon={<DeleteOutlined />} onClick={handleClearName} disabled={!selectedCacheName}>清空名称</Button>
                  <Button icon={<DeleteOutlined />} onClick={handleClearKey} disabled={!selectedCacheKey}>清空键值</Button>
                </Space>
              </Form.Item>
            </Form>
            <Form layout="vertical">
              <Form.Item label="缓存内容">
                <Input.TextArea
                  value={cacheValue}
                  rows={12}
                  readOnly
                />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Cache
