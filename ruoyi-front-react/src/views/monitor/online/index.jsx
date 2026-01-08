import { useState, useEffect } from 'react'
import { Form, Input, Button, Table, Space, Modal } from 'antd'
import { SearchOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons'
import { forceLogout, list as initData } from '@/api/monitor/online'
import { parseTime } from '@/utils/ruoyi'
import modal from '@/plugins/modal'
import auth from '@/plugins/auth'
import Pagination from '@/components/Pagination'
import './index.scss'

const Online = () => {
  const [queryForm] = Form.useForm()

  const [onlineList, setOnlineList] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [queryParams, setQueryParams] = useState({
    ipaddr: undefined,
    userName: undefined
  })

  useEffect(() => {
    getList()
  }, [queryParams, pageNum, pageSize])

  // 查询在线用户列表
  const getList = async () => {
    setLoading(true)
    try {
      const response = await initData(queryParams)
      setOnlineList(response.rows || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to get online list:', error)
    } finally {
      setLoading(false)
    }
  }

  // 搜索
  const handleQuery = () => {
    const values = queryForm.getFieldsValue()
    setQueryParams(prev => ({
      ...prev,
      ...values
    }))
    setPageNum(1)
  }

  // 重置
  const resetQuery = () => {
    queryForm.resetFields()
    setQueryParams({
      ipaddr: undefined,
      userName: undefined
    })
    setPageNum(1)
    getList()
  }

  // 分页变化
  const handlePagination = ({ page, limit }) => {
    setPageNum(page)
    setPageSize(limit)
  }

  // 强退
  const handleForceLogout = (row) => {
    Modal.confirm({
      title: '提示',
      content: `是否确认强退名称为"${row.userName}"的用户?`,
      onOk: async () => {
        try {
          await forceLogout(row.tokenId)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to force logout:', error)
        }
      }
    })
  }

  // 表格列定义
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => (pageNum - 1) * pageSize + index + 1
    },
    {
      title: '会话编号',
      dataIndex: 'tokenId',
      key: 'tokenId',
      align: 'center',
      ellipsis: true
    },
    {
      title: '登录名称',
      dataIndex: 'userName',
      key: 'userName',
      align: 'center',
      ellipsis: true
    },
    {
      title: '所属部门',
      dataIndex: 'deptName',
      key: 'deptName',
      align: 'center',
      ellipsis: true
    },
    {
      title: '主机',
      dataIndex: 'ipaddr',
      key: 'ipaddr',
      align: 'center',
      ellipsis: true
    },
    {
      title: '登录地点',
      dataIndex: 'loginLocation',
      key: 'loginLocation',
      align: 'center',
      ellipsis: true
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      key: 'os',
      align: 'center',
      ellipsis: true
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      key: 'browser',
      align: 'center',
      ellipsis: true
    },
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      align: 'center',
      width: 180,
      render: (text) => parseTime(text)
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          {auth.hasPermiOr(['monitor:online:forceLogout']) && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleForceLogout(record)}
            >
              强退
            </Button>
          )}
        </Space>
      )
    }
  ]

  // 分页后的数据
  const paginatedData = onlineList.slice((pageNum - 1) * pageSize, pageNum * pageSize)

  return (
    <div className="app-container">
      <Form
        form={queryForm}
        layout="inline"
        className="search-form"
        style={{ marginBottom: 16 }}
      >
        <Form.Item label="登录地址" name="ipaddr">
          <Input
            placeholder="请输入登录地址"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="用户名称" name="userName">
          <Input
            placeholder="请输入用户名称"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
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

      <Table
        loading={loading}
        dataSource={paginatedData}
        columns={columns}
        rowKey="tokenId"
        pagination={false}
      />

      <Pagination
        total={total}
        page={pageNum}
        limit={pageSize}
        onChange={handlePagination}
      />
    </div>
  )
}

export default Online
