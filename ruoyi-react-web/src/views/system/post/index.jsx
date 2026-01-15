import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Select, Button, Table, Modal, Radio, Space, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { listPost, getPost, addPost, updatePost, delPost } from '@/api/system/post'
import { useDict } from '@/utils/dict'
import { parseTime, addDateRange } from '@/utils/ruoyi'
import { download } from '@/utils/request'
import modal from '@/plugins/modal'
import auth from '@/plugins/auth'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import './index.scss'

const { TextArea } = Input

const Post = () => {
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()

  const [postList, setPostList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const sys_normal_disable = useDict('sys_normal_disable')

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    postCode: undefined,
    postName: undefined,
    status: undefined
  })

  useEffect(() => {
    getList()
  }, [queryParams])

  // 查询岗位列表
  const getList = async () => {
    setLoading(true)
    try {
      const response = await listPost(queryParams)
      setPostList(response.rows || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to get post list:', error)
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
      postCode: undefined,
      postName: undefined,
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
    setTitle('添加岗位')
  }

  // 修改
  const handleUpdate = async (row) => {
    reset()
    const postId = row?.postId || (selectedRowKeys.length === 1 ? selectedRowKeys[0] : null)
    
    if (!postId) {
      modal.msgWarning('请选择要修改的岗位')
      return
    }

    try {
      const response = await getPost(postId)
      form.setFieldsValue(response.data)
      setOpen(true)
      setTitle('修改岗位')
    } catch (error) {
      console.error('Failed to get post:', error)
      modal.msgError('获取岗位信息失败')
    }
  }

  // 删除
  const handleDelete = (row) => {
    const postIds = row?.postId || selectedRowKeys
    Modal.confirm({
      title: '提示',
      content: `是否确认删除岗位编号为"${postIds}"的数据项?`,
      onOk: async () => {
        try {
          await delPost(postIds)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to delete post:', error)
        }
      }
    })
  }

  // 导出
  const handleExport = () => {
    download('system/post/export', queryParams, `post_${new Date().getTime()}.xlsx`)
  }

  // 表单重置
  const reset = () => {
    form.resetFields()
    form.setFieldsValue({
      postId: undefined,
      postName: undefined,
      postCode: undefined,
      postSort: 0,
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
      if (values.postId !== undefined && values.postId !== null && values.postId !== '') {
        await updatePost(values)
        modal.msgSuccess('修改成功')
      } else {
        await addPost(values)
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
    if (auth.hasPermiOr(['system:post:edit'])) {
      handleUpdate(row)
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '岗位编号',
      dataIndex: 'postId',
      key: 'postId',
      align: 'center'
    },
    {
      title: '岗位编码',
      dataIndex: 'postCode',
      key: 'postCode',
      align: 'center'
    },
    {
      title: '岗位名称',
      dataIndex: 'postName',
      key: 'postName',
      align: 'center'
    },
    {
      title: '岗位排序',
      dataIndex: 'postSort',
      key: 'postSort',
      align: 'center'
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
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {auth.hasPermiOr(['system:post:edit']) && (
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
          {auth.hasPermiOr(['system:post:remove']) && (
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
        <Form.Item label="岗位编码" name="postCode">
          <Input
            placeholder="请输入岗位编码"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="岗位名称" name="postName">
          <Input
            placeholder="请输入岗位名称"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            placeholder="岗位状态"
            style={{ width: 200 }}
            allowClear
          >
            {sys_normal_disable.sys_normal_disable?.map(dict => (
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
          {auth.hasPermiOr(['system:post:add']) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          )}
          {auth.hasPermiOr(['system:post:edit']) && (
            <Button
              type="default"
              icon={<EditOutlined />}
              disabled={selectedRowKeys.length !== 1}
              onClick={() => handleUpdate({ postId: selectedRowKeys[0] })}
            >
              修改
            </Button>
          )}
          {auth.hasPermiOr(['system:post:remove']) && (
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
          {auth.hasPermiOr(['system:post:export']) && (
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
        dataSource={postList}
        columns={columns}
        rowSelection={rowSelection}
        rowKey="postId"
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

      {/* 添加或修改岗位对话框 */}
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
          {/* 关键：编辑时需要带上 postId，否则 submitForm 会误判为新增 */}
          <Form.Item name="postId" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="岗位名称"
            name="postName"
            rules={[{ required: true, message: '岗位名称不能为空' }]}
          >
            <Input
              placeholder="请输入岗位名称"
              maxLength={50}
              showCount
            />
          </Form.Item>
          <Form.Item
            label="岗位编码"
            name="postCode"
            rules={[{ required: true, message: '岗位编码不能为空' }]}
          >
            <Input
              placeholder="请输入岗位编码"
              maxLength={64}
              showCount
            />
          </Form.Item>
          <div className="form-tip">岗位编码在系统中必须唯一</div>
          <Form.Item
            label="岗位顺序"
            name="postSort"
            rules={[{ required: true, message: '岗位顺序不能为空' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="岗位状态"
            name="status"
            rules={[{ required: true, message: '岗位状态不能为空' }]}
          >
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

export default Post
