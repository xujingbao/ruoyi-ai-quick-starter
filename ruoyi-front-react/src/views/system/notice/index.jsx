import { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Table, Modal, Radio, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { listNotice, getNotice, addNotice, updateNotice, delNotice } from '@/api/system/notice'
import { useDict } from '@/utils/dict'
import { parseTime } from '@/utils/ruoyi'
import modal from '@/plugins/modal'
import auth from '@/plugins/auth'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import Editor from '@/components/Editor'
import './index.scss'

const Notice = () => {
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()

  const [noticeList, setNoticeList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const sys_notice_status = useDict('sys_notice_status')
  const sys_notice_type = useDict('sys_notice_type')

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    noticeTitle: undefined,
    createBy: undefined,
    noticeType: undefined
  })

  useEffect(() => {
    getList()
  }, [queryParams])

  // 查询公告列表
  const getList = async () => {
    setLoading(true)
    try {
      const response = await listNotice(queryParams)
      setNoticeList(response.rows || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to get notice list:', error)
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
    queryForm.resetFields()
    setQueryParams(prev => ({
      ...prev,
      noticeTitle: undefined,
      createBy: undefined,
      noticeType: undefined,
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
    setTitle('添加公告')
  }

  // 修改
  const handleUpdate = async (row) => {
    reset()
    const noticeId = row?.noticeId || (selectedRowKeys.length === 1 ? selectedRowKeys[0] : null)
    
    if (!noticeId) {
      modal.msgWarning('请选择要修改的公告')
      return
    }

    try {
      const response = await getNotice(noticeId)
      form.setFieldsValue(response.data)
      setOpen(true)
      setTitle('修改公告')
    } catch (error) {
      console.error('Failed to get notice:', error)
      modal.msgError('获取公告信息失败')
    }
  }

  // 删除
  const handleDelete = (row) => {
    const noticeIds = row?.noticeId || selectedRowKeys
    Modal.confirm({
      title: '提示',
      content: `是否确认删除公告编号为"${noticeIds}"的数据项？`,
      onOk: async () => {
        try {
          await delNotice(noticeIds)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to delete notice:', error)
        }
      }
    })
  }

  // 表单重置
  const reset = () => {
    form.resetFields()
    form.setFieldsValue({
      noticeId: undefined,
      noticeTitle: undefined,
      noticeType: undefined,
      noticeContent: undefined,
      status: '0'
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
      if (values.noticeId !== undefined) {
        await updateNotice(values)
        modal.msgSuccess('修改成功')
      } else {
        await addNotice(values)
        modal.msgSuccess('新增成功')
      }
      setOpen(false)
      getList()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'noticeId',
      key: 'noticeId',
      align: 'center',
      width: 100
    },
    {
      title: '公告标题',
      dataIndex: 'noticeTitle',
      key: 'noticeTitle',
      align: 'center',
      ellipsis: true,
      onHeaderCell: () => ({ className: 'col-nowrap', style: { whiteSpace: 'nowrap' } }),
      onCell: () => ({ className: 'col-nowrap', style: { whiteSpace: 'nowrap' } })
    },
    {
      title: '公告类型',
      dataIndex: 'noticeType',
      key: 'noticeType',
      align: 'center',
      width: 100,
      render: (noticeType) => {
        const dict = sys_notice_type.sys_notice_type?.find(d => d.value === noticeType)
        return dict ? dict.label : '-'
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (status) => {
        const dict = sys_notice_status.sys_notice_status?.find(d => d.value === status)
        return dict ? dict.label : '-'
      }
    },
    {
      title: '创建者',
      dataIndex: 'createBy',
      key: 'createBy',
      align: 'center',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 120,
      ellipsis: true,
      onHeaderCell: () => ({ className: 'col-nowrap', style: { whiteSpace: 'nowrap' } }),
      onCell: () => ({ className: 'col-nowrap', style: { whiteSpace: 'nowrap' } }),
      render: (text) => parseTime(text, '{y}-{m}-{d}')
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {auth.hasPermiOr(['system:notice:edit']) && (
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleUpdate(record)}
            >
              修改
            </Button>
          )}
          {auth.hasPermiOr(['system:notice:remove']) && (
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record)}
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
        <Form.Item label="公告标题" name="noticeTitle">
          <Input
            placeholder="请输入公告标题"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="操作人员" name="createBy">
          <Input
            placeholder="请输入操作人员"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="类型" name="noticeType">
          <Select
            placeholder="公告类型"
            style={{ width: 200 }}
            allowClear
          >
            {sys_notice_type.sys_notice_type?.map(dict => (
              <Select.Option key={dict.value} value={dict.value}>
                {dict.label}
              </Select.Option>
            ))}
          </Select>
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
          {auth.hasPermiOr(['system:notice:add']) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          )}
          {auth.hasPermiOr(['system:notice:edit']) && (
            <Button
              type="default"
              icon={<EditOutlined />}
              disabled={selectedRowKeys.length !== 1}
              onClick={() => handleUpdate({ noticeId: selectedRowKeys[0] })}
            >
              修改
            </Button>
          )}
          {auth.hasPermiOr(['system:notice:remove']) && (
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
        dataSource={noticeList}
        columns={columns}
        className="notice-table"
        rowSelection={rowSelection}
        rowKey="noticeId"
        pagination={false}
      />

      <Pagination
        total={total}
        page={queryParams.pageNum}
        limit={queryParams.pageSize}
        onChange={handlePagination}
      />

      {/* 添加或修改公告对话框 */}
      <Modal
        title={title}
        open={open}
        onCancel={cancel}
        onOk={submitForm}
        width={780}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            label="公告标题"
            name="noticeTitle"
            rules={[{ required: true, message: '公告标题不能为空' }]}
          >
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item
            label="公告类型"
            name="noticeType"
            rules={[{ required: true, message: '公告类型不能为空' }]}
          >
            <Select placeholder="请选择">
              {sys_notice_type.sys_notice_type?.map(dict => (
                <Select.Option key={dict.value} value={dict.value}>
                  {dict.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Radio.Group>
              {sys_notice_status.sys_notice_status?.map(dict => (
                <Radio key={dict.value} value={dict.value}>
                  {dict.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="内容" name="noticeContent">
            <Editor
              value={form.getFieldValue('noticeContent')}
              onChange={(value) => form.setFieldValue('noticeContent', value)}
              minHeight={192}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Notice
