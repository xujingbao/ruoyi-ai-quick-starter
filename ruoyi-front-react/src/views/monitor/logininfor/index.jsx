import { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, Button, Table, Modal, Space, Tooltip } from 'antd'
import { DeleteOutlined, ReloadOutlined, SearchOutlined, UnlockOutlined } from '@ant-design/icons'
import { list, delLogininfor, cleanLogininfor, unlockLogininfor } from '@/api/monitor/logininfor'
import { useDict } from '@/utils/dict'
import { addDateRange, parseTime } from '@/utils/ruoyi'
import dayjs from 'dayjs'
import modal from '@/plugins/modal'
import auth from '@/plugins/auth'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import './index.scss'

const { RangePicker } = DatePicker

const Logininfor = () => {
  const [queryForm] = Form.useForm()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [total, setTotal] = useState(0)
  const [dateRange, setDateRange] = useState([])

  const { sys_common_status } = useDict('sys_common_status')

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    ipaddr: undefined,
    userName: undefined,
    status: undefined
  })

  useEffect(() => {
    getList()
  }, [queryParams, dateRange])

  // 查询登录日志
  const getList = async () => {
    setLoading(true)
    try {
      const params = addDateRange(queryParams, dateRange)
      const res = await list(params)
      setData(res.rows || [])
      setTotal(res.total || 0)
    } catch (error) {
      console.error('Failed to fetch logininfor:', error)
    } finally {
      setLoading(false)
    }
  }

  // 搜索
  const handleQuery = () => {
    const values = queryForm.getFieldsValue()
    setQueryParams(prev => ({
      ...prev,
      ...values,
      pageNum: 1
    }))
  }

  // 重置
  const resetQuery = () => {
    setDateRange([])
    queryForm.resetFields()
    setQueryParams({
      pageNum: 1,
      pageSize: 10,
      ipaddr: undefined,
      userName: undefined,
      status: undefined
    })
    getList()
  }

  // 分页
  const handlePagination = ({ page, limit }) => {
    setQueryParams(prev => ({
      ...prev,
      pageNum: page,
      pageSize: limit
    }))
  }

  // 表格选择
  const handleSelectionChange = (keys) => setSelectedRowKeys(keys)

  // 删除
  const handleDelete = (row) => {
    const infoIds = row?.infoId || selectedRowKeys
    if (!infoIds || (Array.isArray(infoIds) && infoIds.length === 0)) {
      modal.msgWarning('请选择要删除的记录')
      return
    }
    Modal.confirm({
      title: '提示',
      content: `是否确认删除登录日志编号为"${infoIds}"的数据项？`,
      onOk: async () => {
        try {
          await delLogininfor(infoIds)
          modal.msgSuccess('删除成功')
          getList()
          setSelectedRowKeys([])
        } catch (error) {
          console.error('Failed to delete logininfor:', error)
        }
      }
    })
  }

  // 清空
  const handleClean = () => {
    Modal.confirm({
      title: '提示',
      content: '是否确认清空所有登录日志？',
      onOk: async () => {
        try {
          await cleanLogininfor()
          modal.msgSuccess('清空成功')
          getList()
          setSelectedRowKeys([])
        } catch (error) {
          console.error('Failed to clean logininfor:', error)
        }
      }
    })
  }

  // 解锁
  const handleUnlock = (row) => {
    const userName = row?.userName
    if (!userName) {
      modal.msgWarning('未找到要解锁的用户')
      return
    }
    Modal.confirm({
      title: '提示',
      content: `是否确认解锁用户 "${userName}"？`,
      onOk: async () => {
        try {
          await unlockLogininfor(userName)
          modal.msgSuccess('解锁成功')
          getList()
        } catch (error) {
          console.error('Failed to unlock user:', error)
        }
      }
    })
  }

  const columns = [
    {
      title: '访问编号',
      dataIndex: 'infoId',
      key: 'infoId',
      width: 100
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'userName',
      ellipsis: true
    },
    {
      title: '登录地址',
      dataIndex: 'ipaddr',
      key: 'ipaddr',
      ellipsis: true
    },
    {
      title: '登录地点',
      dataIndex: 'loginLocation',
      key: 'loginLocation',
      ellipsis: true
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      ellipsis: true
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text) => <DictTag options={sys_common_status} value={text} />
    },
    {
      title: '提示消息',
      dataIndex: 'msg',
      key: 'msg',
      ellipsis: true
    },
    {
      title: '访问时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
      render: (text) => parseTime(text)
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          {auth.hasPermiOr(['monitor:logininfor:unlock']) && (
            <Tooltip title="解锁">
              <Button
                type="link"
                icon={<UnlockOutlined />}
                size="small"
                onClick={() => handleUnlock(record)}
              />
            </Tooltip>
          )}
          {auth.hasPermiOr(['monitor:logininfor:remove']) && (
            <Tooltip title="删除">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="app-container logininfor-page">
      <Form
        form={queryForm}
        layout="inline"
        className="search-form"
        style={{ display: showSearch ? 'flex' : 'none', marginBottom: 16 }}
      >
        <Form.Item label="登录地址" name="ipaddr">
          <Input
            placeholder="请输入登录地址"
            style={{ width: 240 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="用户名称" name="userName">
          <Input
            placeholder="请输入用户名称"
            style={{ width: 240 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            placeholder="登录状态"
            style={{ width: 240 }}
            allowClear
          >
            {sys_common_status?.map(dict => (
              <Select.Option key={dict.value} value={dict.value}>
                {dict.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="登录时间">
          <RangePicker
            value={dateRange.length ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
            onChange={(dates) => {
              setDateRange(dates ? [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')] : [])
            }}
            format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery}>
            搜索
          </Button>
          <Button icon={<ReloadOutlined />} onClick={resetQuery} style={{ marginLeft: 8 }}>
            重置
          </Button>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16 }}>
        <Space>
          {auth.hasPermiOr(['monitor:logininfor:remove']) && (
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              disabled={!selectedRowKeys.length}
              onClick={() => handleDelete()}
            >
              删除
            </Button>
          )}
          {auth.hasPermiOr(['monitor:logininfor:remove']) && (
            <Button type="default" onClick={handleClean}>
              清空
            </Button>
          )}
          <RightToolbar
            showSearch={showSearch}
            columns={{}}
            onShowSearchChange={setShowSearch}
            onQueryTable={getList}
          />
        </Space>
      </div>

      <Table
        loading={loading}
        dataSource={data}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: handleSelectionChange
        }}
        rowKey="infoId"
        pagination={false}
      />

      <Pagination
        total={total}
        page={queryParams.pageNum}
        limit={queryParams.pageSize}
        onChange={handlePagination}
      />
    </div>
  )
}

export default Logininfor
