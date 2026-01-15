import { useEffect, useMemo, useState } from 'react'
import { Form, Select, Input, Button, Table, Space, Tooltip, Modal } from 'antd'
import { SearchOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  listCacheName,
  listCacheKey,
  getCacheValue,
  clearCacheName,
  clearCacheKey
} from '@/api/monitor/cache'
import modal from '@/plugins/modal'
import RightToolbar from '@/components/RightToolbar'
import './index.scss'

const CacheList = () => {
  const [queryForm] = Form.useForm()
  const [cacheNames, setCacheNames] = useState([])
  const [cacheData, setCacheData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedName, setSelectedName] = useState()
  const [showSearch, setShowSearch] = useState(true)
  const [keyFilter, setKeyFilter] = useState('')

  useEffect(() => {
    loadCacheNames()
  }, [])

  const loadCacheNames = async () => {
    try {
      const res = await listCacheName()
      setCacheNames(res.data || [])
    } catch (error) {
      console.error('Failed to load cache names:', error)
    }
  }

  const loadCacheKeys = async (name) => {
    if (!name) {
      setCacheData([])
      return
    }
    setLoading(true)
    try {
      const keyRes = await listCacheKey(name)
      const keys = keyRes.data || []
      const values = await Promise.all(
        keys.map((key) =>
          getCacheValue(name, key)
            .then((res) => res.data || '')
            .catch(() => '')
        )
      )
      const rows = keys.map((key, index) => ({
        cacheName: name,
        cacheKey: key,
        cacheValue: values[index]
      }))
      setCacheData(rows)
    } catch (error) {
      console.error('Failed to load cache keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (value) => {
    setSelectedName(value)
    setKeyFilter('')
    queryForm.setFieldsValue({ cacheKey: undefined })
    loadCacheKeys(value)
  }

  const handleSearch = () => {
    const values = queryForm.getFieldsValue()
    setKeyFilter(values.cacheKey || '')
  }

  const handleRefresh = () => {
    if (selectedName) {
      loadCacheKeys(selectedName)
    }
    loadCacheNames()
  }

  const handleClearName = () => {
    if (!selectedName) {
      modal.msgWarning('请先选择缓存名称')
      return
    }
    Modal.confirm({
      title: '提示',
      content: `是否清空缓存名称 "${selectedName}" 的所有数据？`,
      onOk: async () => {
        try {
          await clearCacheName(selectedName)
          modal.msgSuccess('清空成功')
          handleRefresh()
        } catch (error) {
          console.error('Failed to clear cache name:', error)
        }
      }
    })
  }

  const handleClearKey = async (record) => {
    Modal.confirm({
      title: '提示',
      content: `是否清空键 "${record.cacheKey}"？`,
      onOk: async () => {
        try {
          await clearCacheKey(record.cacheKey)
          modal.msgSuccess('清空成功')
          if (selectedName) {
            loadCacheKeys(selectedName)
          }
        } catch (error) {
          console.error('Failed to clear cache key:', error)
        }
      }
    })
  }

  const filteredData = useMemo(() => {
    if (!keyFilter) return cacheData
    return cacheData.filter((item) => item.cacheKey.includes(keyFilter))
  }, [cacheData, keyFilter])

  const columns = [
    {
      title: '缓存名称',
      dataIndex: 'cacheName',
      key: 'cacheName',
      width: 200
    },
    {
      title: '缓存键名',
      dataIndex: 'cacheKey',
      key: 'cacheKey',
      ellipsis: true
    },
    {
      title: '缓存内容',
      dataIndex: 'cacheValue',
      key: 'cacheValue',
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleClearKey(record)}>
          清空键
        </Button>
      )
    }
  ]

  return (
    <div className="app-container cache-list-page">
      <Form
        form={queryForm}
        layout="inline"
        className="search-form"
        style={{ display: showSearch ? 'flex' : 'none', marginBottom: 16 }}
      >
        <Form.Item label="缓存名称" name="cacheName">
          <Select
            placeholder="请选择缓存名称"
            style={{ width: 240 }}
            options={cacheNames.map((name) => ({ label: name, value: name }))}
            allowClear
            onChange={handleNameChange}
          />
        </Form.Item>
        <Form.Item label="键名" name="cacheKey">
          <Input placeholder="请输入缓存键名" style={{ width: 240 }} onPressEnter={handleSearch} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={handleClearName}>
              清空名称
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <RightToolbar
        showSearch={showSearch}
        columns={{}}
        onShowSearchChange={setShowSearch}
        onQueryTable={() => handleRefresh()}
      />

      <Table
        loading={loading}
        dataSource={filteredData}
        columns={columns}
        rowKey={(record) => `${record.cacheName}-${record.cacheKey}`}
        pagination={false}
      />
    </div>
  )
}

export default CacheList
