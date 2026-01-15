import { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, Button, Table, Modal, Radio, Space, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { listConfig, getConfig, addConfig, updateConfig, delConfig, refreshCache } from '@/api/system/config'
import { useDict } from '@/utils/dict'
import { parseTime, addDateRange } from '@/utils/ruoyi'
import { download } from '@/utils/request'
import dayjs from 'dayjs'
import modal from '@/plugins/modal'
import auth from '@/plugins/auth'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import './index.scss'

const { RangePicker } = DatePicker
const { TextArea } = Input

const Config = () => {
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()

  const [configList, setConfigList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dateRange, setDateRange] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const sys_yes_no = useDict('sys_yes_no')

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    configName: undefined,
    configKey: undefined,
    configType: undefined,
    orderByColumn: 'createTime',
    isAsc: 'desc'
  })

  useEffect(() => {
    getList()
  }, [queryParams, dateRange])

  // 查询参数列表
  const getList = async () => {
    setLoading(true)
    try {
      const params = addDateRange(queryParams, dateRange)
      const response = await listConfig(params)
      setConfigList(response.rows || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to get config list:', error)
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
      configName: undefined,
      configKey: undefined,
      configType: undefined,
      orderByColumn: 'createTime',
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

  // 新增
  const handleAdd = () => {
    reset()
    setOpen(true)
    setTitle('添加参数')
  }

  // 修改
  const handleUpdate = async (row) => {
    reset()
    const configId = row?.configId || (selectedRowKeys.length === 1 ? selectedRowKeys[0] : null)
    
    if (!configId) {
      modal.msgWarning('请选择要修改的参数')
      return
    }

    try {
      const response = await getConfig(configId)
      form.setFieldsValue(response.data)
      setOpen(true)
      setTitle('修改参数')
    } catch (error) {
      console.error('Failed to get config:', error)
      modal.msgError('获取参数信息失败')
    }
  }

  // 删除
  const handleDelete = (row) => {
    const configIds = row?.configId || selectedRowKeys
    Modal.confirm({
      title: '提示',
      content: `是否确认删除参数编号为"${configIds}"的数据项?`,
      onOk: async () => {
        try {
          await delConfig(configIds)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to delete config:', error)
        }
      }
    })
  }

  // 导出
  const handleExport = () => {
    download('system/config/export', queryParams, `config_${new Date().getTime()}.xlsx`)
  }

  // 刷新缓存
  const handleRefreshCache = async () => {
    try {
      await refreshCache()
      modal.msgSuccess('刷新成功')
    } catch (error) {
      console.error('Failed to refresh cache:', error)
    }
  }

  // 表单重置
  const reset = () => {
    form.resetFields()
    form.setFieldsValue({
      configId: undefined,
      configName: undefined,
      configKey: undefined,
      configValue: undefined,
      configType: 'Y',
      remark: undefined
    })
  }

  // 取消
  const cancel = () => {
    setOpen(false)
    reset()
  }

  // 提交表单
  const submitForm = async () => {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      if (values.configId !== undefined && values.configId !== null && values.configId !== '') {
        await updateConfig(values)
        modal.msgSuccess('修改成功')
      } else {
        await addConfig(values)
        modal.msgSuccess('新增成功')
      }
      setOpen(false)
      getList()
    } catch (error) {
      console.error('Validation failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // 双击行
  const handleRowDblClick = (row) => {
    if (auth.hasPermiOr(['system:config:edit'])) {
      handleUpdate(row)
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '参数名称',
      dataIndex: 'configName',
      key: 'configName',
      align: 'left',
      ellipsis: true,
      minWidth: 150
    },
    {
      title: '参数键名',
      dataIndex: 'configKey',
      key: 'configKey',
      align: 'left',
      ellipsis: true,
      minWidth: 180
    },
    {
      title: '参数键值',
      dataIndex: 'configValue',
      key: 'configValue',
      align: 'left',
      ellipsis: true,
      minWidth: 200,
      render: (text) => <span className="config-value">{text || '-'}</span>
    },
    {
      title: '系统内置',
      dataIndex: 'configType',
      key: 'configType',
      align: 'center',
      width: 100,
      render: (configType) => {
        const dict = sys_yes_no.sys_yes_no?.find(d => d.value === configType)
        return dict ? dict.label : '-'
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      align: 'left',
      ellipsis: true,
      minWidth: 150,
      render: (text) => text || '-'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 180,
      sorter: true,
      render: (text) => parseTime(text)
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      align: 'center',
      width: 180,
      sorter: true,
      render: (text) => parseTime(text) || '-'
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {auth.hasPermiOr(['system:config:edit']) && (
            <Tooltip title="修改">
              <Button
                type="link"
                icon={<EditOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleUpdate(record)
                }}
              >
                修改
              </Button>
            </Tooltip>
          )}
          {auth.hasPermiOr(['system:config:remove']) && (
            <Tooltip title="删除">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(record)
                }}
              >
                删除
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
        <Form.Item label="参数名称" name="configName">
          <Input
            placeholder="请输入参数名称"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="参数键名" name="configKey">
          <Input
            placeholder="请输入参数键名"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="系统内置" name="configType">
          <Select
            placeholder="请选择"
            style={{ width: 120 }}
            allowClear
          >
            {sys_yes_no.sys_yes_no?.map(dict => (
              <Select.Option key={dict.value} value={dict.value}>
                {dict.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="创建时间">
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
          {auth.hasPermiOr(['system:config:add']) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          )}
          {auth.hasPermiOr(['system:config:edit']) && (
            <Button
              type="default"
              icon={<EditOutlined />}
              disabled={selectedRowKeys.length !== 1}
              onClick={() => handleUpdate({ configId: selectedRowKeys[0] })}
            >
              修改
            </Button>
          )}
          {auth.hasPermiOr(['system:config:remove']) && (
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
          {auth.hasPermiOr(['system:config:export']) && (
            <Button type="default" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          )}
          {auth.hasPermiOr(['system:config:remove']) && (
            <Button type="default" icon={<ReloadOutlined />} onClick={handleRefreshCache}>
              刷新缓存
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
        dataSource={configList}
        columns={columns}
        rowSelection={rowSelection}
        rowKey="configId"
        onChange={handleTableChange}
        onRow={(record) => ({
          onDoubleClick: () => handleRowDblClick(record)
        })}
        pagination={false}
      />

      <Pagination
        total={total}
        page={queryParams.pageNum}
        limit={queryParams.pageSize}
        onChange={handlePagination}
      />

      {/* 添加或修改参数配置对话框 */}
      <Modal
        title={title}
        open={open}
        onCancel={cancel}
        onOk={submitForm}
        confirmLoading={submitting}
        width={680}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          {/* 关键：编辑时需要带上 configId，否则 submitForm 会误判为新增 */}
          <Form.Item name="configId" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="参数名称"
            name="configName"
            rules={[{ required: true, message: '参数名称不能为空' }]}
          >
            <Input
              placeholder="请输入参数名称，用于显示"
              maxLength={100}
              showCount
            />
          </Form.Item>
          <Form.Item
            label="参数键名"
            name="configKey"
            rules={[{ required: true, message: '参数键名不能为空' }]}
          >
            <Input
              placeholder="请输入参数键名，用于代码调用"
              maxLength={100}
              showCount
            />
          </Form.Item>
          <div className="form-tip">参数键名在系统中必须唯一</div>
          <Form.Item
            label="参数键值"
            name="configValue"
            rules={[{ required: true, message: '参数键值不能为空' }]}
          >
            <TextArea
              placeholder="请输入参数键值"
              rows={5}
              maxLength={500}
              showCount
            />
          </Form.Item>
          <Form.Item label="系统内置" name="configType">
            <Radio.Group>
              {sys_yes_no.sys_yes_no?.map(dict => (
                <Radio key={dict.value} value={dict.value}>
                  {dict.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <div className="form-tip">系统内置参数不允许删除</div>
          <Form.Item label="备注" name="remark">
            <TextArea
              placeholder="请输入备注信息，用于说明参数的用途"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Config
