import { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, Button, Table, Modal, Space, Tooltip } from 'antd'
import { DeleteOutlined, DownloadOutlined, ReloadOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { list, delOperlog, cleanOperlog } from '@/api/monitor/operlog'
import { useDict } from '@/utils/dict'
import { parseTime, addDateRange } from '@/utils/ruoyi'
import { download } from '@/utils/request'
import dayjs from 'dayjs'
import modal from '@/plugins/modal'
import auth from '@/plugins/auth'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import DictTag from '@/components/DictTag'
import './index.scss'

const { RangePicker } = DatePicker

const Operlog = () => {
  const [queryForm] = Form.useForm()

  const [operlogList, setOperlogList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({})
  const [dateRange, setDateRange] = useState([])

  const { sys_oper_type = [], sys_common_status = [] } = useDict('sys_oper_type', 'sys_common_status')

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    operIp: undefined,
    title: undefined,
    operName: undefined,
    businessType: undefined,
    status: undefined,
    orderByColumn: 'operTime',
    isAsc: 'desc'
  })

  useEffect(() => {
    getList()
  }, [queryParams, dateRange])

  // 查询操作日志列表
  const getList = async () => {
    setLoading(true)
    try {
      const params = addDateRange(queryParams, dateRange)
      const response = await list(params)
      setOperlogList(response.rows || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to get operlog list:', error)
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
    setQueryParams(prev => ({
      ...prev,
      operIp: undefined,
      title: undefined,
      operName: undefined,
      businessType: undefined,
      status: undefined,
      orderByColumn: 'operTime',
      isAsc: 'desc',
      pageNum: 1
    }))
    getList()
  }

  // 分页变化
  const handlePagination = ({ page, limit }) => {
    setQueryParams(prev => ({
      ...prev,
      pageNum: page,
      pageSize: limit
    }))
  }

  // 表格选择变化
  const handleSelectionChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys)
  }

  // 排序变化
  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.field) {
      setQueryParams(prev => ({
        ...prev,
        orderByColumn: sorter.field,
        isAsc: sorter.order === 'ascend' ? 'asc' : 'desc'
      }))
    }
  }

  // 详细
  const handleView = (row) => {
    setForm(row)
    setOpen(true)
  }

  // 删除
  const handleDelete = (row) => {
    const operIds = row?.operId || selectedRowKeys
    Modal.confirm({
      title: '提示',
      content: `是否确认删除日志编号为"${operIds}"的数据项?`,
      onOk: async () => {
        try {
          await delOperlog(operIds)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to delete operlog:', error)
        }
      }
    })
  }

  // 清空
  const handleClean = () => {
    Modal.confirm({
      title: '提示',
      content: '是否确认清空所有操作日志数据项?',
      onOk: async () => {
        try {
          await cleanOperlog()
          modal.msgSuccess('清空成功')
          getList()
        } catch (error) {
          console.error('Failed to clean operlog:', error)
        }
      }
    })
  }

  // 导出
  const handleExport = () => {
    download('monitor/operlog/export', queryParams, `config_${new Date().getTime()}.xlsx`)
  }

  // 操作日志类型字典翻译
  const typeFormat = (row) => {
    const dict = sys_oper_type.sys_oper_type?.find(d => d.value === row.businessType)
    return dict ? dict.label : '-'
  }

  // 表格列定义
  const columns = [
    {
      title: '日志编号',
      dataIndex: 'operId',
      key: 'operId',
      align: 'center',
      width: 100
    },
    {
      title: '系统模块',
      dataIndex: 'title',
      key: 'title',
      align: 'left',
      ellipsis: true,
      minWidth: 150
    },
    {
      title: '操作类型',
      dataIndex: 'businessType',
      key: 'businessType',
      align: 'center',
      width: 120,
      render: (businessType) => (
        <DictTag options={sys_oper_type} value={businessType} />
      )
    },
    {
      title: '操作人员',
      dataIndex: 'operName',
      key: 'operName',
      align: 'left',
      ellipsis: true,
      minWidth: 120,
      sorter: true
    },
    {
      title: '操作地址',
      dataIndex: 'operIp',
      key: 'operIp',
      align: 'left',
      ellipsis: true,
      minWidth: 130
    },
    {
      title: '操作状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (status) => (
        <DictTag options={sys_common_status} value={status} />
      )
    },
    {
      title: '操作日期',
      dataIndex: 'operTime',
      key: 'operTime',
      align: 'center',
      width: 180,
      sorter: true,
      render: (text) => parseTime(text)
    },
    {
      title: '消耗时间',
      dataIndex: 'costTime',
      key: 'costTime',
      align: 'center',
      width: 110,
      ellipsis: true,
      sorter: true,
      render: (text) => `${text}毫秒`
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {auth.hasPermiOr(['monitor:operlog:query']) && (
            <Tooltip title="详细">
              <Button
                type="link"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleView(record)}
              >
                详细
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange
  }

  return (
    <div className="app-container">
      <Form
        form={queryForm}
        layout="inline"
        className="search-form"
        style={{ display: showSearch ? 'flex' : 'none', marginBottom: 16 }}
      >
        <Form.Item label="操作地址" name="operIp">
          <Input
            placeholder="请输入操作地址"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="系统模块" name="title">
          <Input
            placeholder="请输入系统模块"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="操作人员" name="operName">
          <Input
            placeholder="请输入操作人员"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="类型" name="businessType">
          <Select
            placeholder="操作类型"
            style={{ width: 200 }}
            allowClear
          >
            {sys_oper_type.sys_oper_type?.map(dict => (
              <Select.Option key={dict.value} value={dict.value}>
                {dict.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            placeholder="操作状态"
            style={{ width: 200 }}
            allowClear
          >
            {sys_common_status.map(dict => (
              <Select.Option key={dict.value} value={dict.value}>
                {dict.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="操作时间">
          <RangePicker
            value={dateRange.length ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
            onChange={(dates) => {
              setDateRange(dates ? [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')] : [])
            }}
            format="YYYY-MM-DD"
            style={{ width: 240 }}
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
          {auth.hasPermiOr(['monitor:operlog:remove']) && (
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
          {auth.hasPermiOr(['monitor:operlog:remove']) && (
            <Button
              type="default"
              danger
              icon={<DeleteOutlined />}
              onClick={handleClean}
            >
              清空
            </Button>
          )}
          {auth.hasPermiOr(['monitor:operlog:export']) && (
            <Button type="default" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
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
        dataSource={operlogList}
        columns={columns}
        rowSelection={rowSelection}
        rowKey="operId"
        onChange={handleTableChange}
        pagination={false}
      />

      <Pagination
        total={total}
        page={queryParams.pageNum}
        limit={queryParams.pageSize}
        onChange={handlePagination}
      />

      {/* 操作日志详细 */}
      <Modal
        title="操作日志详细"
        open={open}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="操作模块">
            {form.title} / {typeFormat(form)}
          </Form.Item>
          <Form.Item label="登录信息">
            {form.operName} / {form.operIp} / {form.operLocation}
          </Form.Item>
          <Form.Item label="请求地址">
            {form.operUrl}
          </Form.Item>
          <Form.Item label="请求方式">
            {form.requestMethod}
          </Form.Item>
          <Form.Item label="操作方法">
            {form.method}
          </Form.Item>
          <Form.Item label="请求参数">
            {form.operParam}
          </Form.Item>
          <Form.Item label="返回参数">
            {form.jsonResult}
          </Form.Item>
          <Form.Item label="操作状态">
            {form.status === 0 ? '正常' : form.status === 1 ? '失败' : '-'}
          </Form.Item>
          <Form.Item label="消耗时间">
            {form.costTime}毫秒
          </Form.Item>
          <Form.Item label="操作时间">
            {parseTime(form.operTime)}
          </Form.Item>
          {form.status === 1 && (
            <Form.Item label="异常信息">
              {form.errorMsg}
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default Operlog
