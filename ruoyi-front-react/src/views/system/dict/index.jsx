import { useState, useEffect } from 'react'
import { Form, Input, Select, DatePicker, Button, Table, Modal, Radio, Space, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { listType, getType, addType, updateType, delType, refreshCache } from '@/api/system/dict/type'
import { useDict } from '@/utils/dict'
import { useDictStore } from '@/store/dictStore'
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

const Dict = () => {
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()

  const [typeList, setTypeList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [dateRange, setDateRange] = useState([])

  const sys_normal_disable = useDict('sys_normal_disable')
  const dictStore = useDictStore()

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    dictName: undefined,
    dictType: undefined,
    status: undefined
  })

  useEffect(() => {
    getList()
  }, [queryParams, dateRange])

  // 查询字典类型列表
  const getList = async () => {
    setLoading(true)
    try {
      const params = addDateRange(queryParams, dateRange)
      const response = await listType(params)
      setTypeList(response.rows || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to get dict type list:', error)
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
      dictName: undefined,
      dictType: undefined,
      status: undefined,
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

  // 新增
  const handleAdd = () => {
    reset()
    setOpen(true)
    setTitle('添加字典类型')
  }

  // 修改
  const handleUpdate = async (row) => {
    reset()
    const dictId = row?.dictId || (selectedRowKeys.length === 1 ? selectedRowKeys[0] : null)
    
    if (!dictId) {
      modal.msgWarning('请选择要修改的字典类型')
      return
    }

    try {
      const response = await getType(dictId)
      form.setFieldsValue(response.data)
      setOpen(true)
      setTitle('修改字典类型')
    } catch (error) {
      console.error('Failed to get dict type:', error)
      modal.msgError('获取字典类型失败')
    }
  }

  // 删除
  const handleDelete = (row) => {
    const dictIds = row?.dictId || selectedRowKeys
    Modal.confirm({
      title: '提示',
      content: `是否确认删除字典编号为"${dictIds}"的数据项?`,
      onOk: async () => {
        try {
          await delType(dictIds)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to delete dict type:', error)
        }
      }
    })
  }

  // 导出
  const handleExport = () => {
    download('system/dict/type/export', queryParams, `dict_type_${new Date().getTime()}.xlsx`)
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
      dictId: undefined,
      dictName: undefined,
      dictType: undefined,
      status: '0',
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
      if (values.dictId !== undefined) {
        await updateType(values)
        modal.msgSuccess('修改成功')
      } else {
        await addType(values)
        modal.msgSuccess('新增成功')
      }
      setOpen(false)
      getList()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  // 双击行
  const handleRowDblClick = (row) => {
    handleUpdate(row)
  }

  // 表格列定义
  const columns = [
    {
      title: '字典编号',
      dataIndex: 'dictId',
      key: 'dictId',
      align: 'center'
    },
    {
      title: '字典名称',
      dataIndex: 'dictName',
      key: 'dictName',
      align: 'center',
      ellipsis: true
    },
    {
      title: '字典类型',
      dataIndex: 'dictType',
      key: 'dictType',
      align: 'center',
      ellipsis: true,
      render: (text, record) => (
        <Link to={`/system/dict-data/index/${record.dictId}`} className="link-type">
          {text}
        </Link>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        const dict = sys_normal_disable.sys_normal_disable?.find(d => d.value === status)
        return dict ? dict.label : '-'
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      align: 'center',
      ellipsis: true
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 180,
      render: (text) => parseTime(text)
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {auth.hasPermiOr(['system:dict:edit']) && (
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
          )}
          {auth.hasPermiOr(['system:dict:remove']) && (
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
        <Form.Item label="字典名称" name="dictName">
          <Input
            placeholder="请输入字典名称"
            style={{ width: 240 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="字典类型" name="dictType">
          <Input
            placeholder="请输入字典类型"
            style={{ width: 240 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            placeholder="字典状态"
            style={{ width: 240 }}
            allowClear
          >
            {sys_normal_disable.sys_normal_disable?.map(dict => (
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
          {auth.hasPermiOr(['system:dict:add']) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          )}
          {auth.hasPermiOr(['system:dict:edit']) && (
            <Button
              type="default"
              icon={<EditOutlined />}
              disabled={selectedRowKeys.length !== 1}
              onClick={() => handleUpdate({ dictId: selectedRowKeys[0] })}
            >
              修改
            </Button>
          )}
          {auth.hasPermiOr(['system:dict:remove']) && (
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
          {auth.hasPermiOr(['system:dict:export']) && (
            <Button type="default" icon={<DownloadOutlined />} onClick={handleExport}>
              导出
            </Button>
          )}
          {auth.hasPermiOr(['system:dict:remove']) && (
            <Button type="default" danger icon={<ReloadOutlined />} onClick={handleRefreshCache}>
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
        dataSource={typeList}
        columns={columns}
        rowSelection={rowSelection}
        rowKey="dictId"
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

      {/* 添加或修改字典类型对话框 */}
      <Modal
        title={title}
        open={open}
        onCancel={cancel}
        onOk={submitForm}
        width={500}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            label="字典名称"
            name="dictName"
            rules={[{ required: true, message: '字典名称不能为空' }]}
          >
            <Input
              placeholder="请输入字典名称"
              maxLength={100}
              showCount
            />
          </Form.Item>
          <Form.Item
            label="字典类型"
            name="dictType"
            rules={[{ required: true, message: '字典类型不能为空' }]}
          >
            <Input
              placeholder="请输入字典类型"
              maxLength={100}
              showCount
            />
          </Form.Item>
          <div className="form-tip">字典类型在系统中必须唯一</div>
          <Form.Item label="状态" name="status">
            <Radio.Group>
              {sys_normal_disable.sys_normal_disable?.map(dict => (
                <Radio key={dict.value} value={dict.value}>
                  {dict.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea placeholder="请输入内容" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Dict
