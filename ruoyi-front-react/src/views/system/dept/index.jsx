import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Select, Button, Table, Modal, Radio, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, SortAscendingOutlined } from '@ant-design/icons'
import { listDept, getDept, addDept, updateDept, delDept, listDeptExcludeChild } from '@/api/system/dept'
import { useDict } from '@/utils/dict'
import { parseTime, handleTree } from '@/utils/ruoyi'
import modal from '@/plugins/modal'
import auth from '@/plugins/auth'
import RightToolbar from '@/components/RightToolbar'
import { TreeSelect } from 'antd'
import './index.scss'

const Dept = () => {
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()

  const [deptList, setDeptList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [deptOptions, setDeptOptions] = useState([])
  const [isExpandAll, setIsExpandAll] = useState(true)
  const [refreshTable, setRefreshTable] = useState(true)

  const sys_normal_disable = useDict('sys_normal_disable')

  const [queryParams, setQueryParams] = useState({
    deptName: undefined,
    status: undefined
  })

  useEffect(() => {
    getList()
  }, [queryParams])

  // 查询部门列表
  const getList = async () => {
    setLoading(true)
    try {
      const response = await listDept(queryParams)
      const treeData = handleTree(response.data, 'deptId')
      setDeptList(treeData || [])
    } catch (error) {
      console.error('Failed to get dept list:', error)
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
  }

  // 重置
  const resetQuery = () => {
    queryForm.resetFields()
    setQueryParams({
      deptName: undefined,
      status: undefined
    })
    getList()
  }

  // 新增
  const handleAdd = async (row) => {
    reset()
    try {
      const response = await listDept()
      const treeData = handleTree(response.data, 'deptId')
      setDeptOptions(treeData || [])
    } catch (error) {
      console.error('Failed to get dept tree:', error)
    }
    
    if (row != undefined) {
      form.setFieldValue('parentId', row.deptId)
    }
    setOpen(true)
    setTitle('添加部门')
  }

  // 修改
  const handleUpdate = async (row) => {
    reset()
    if (!row || !row.deptId) {
      modal.msgWarning('请选择要修改的部门')
      return
    }

    try {
      const excludeResponse = await listDeptExcludeChild(row.deptId)
      const treeData = handleTree(excludeResponse.data, 'deptId')
      setDeptOptions(treeData || [])
      
      const deptResponse = await getDept(row.deptId)
      form.setFieldsValue(deptResponse.data)
      setOpen(true)
      setTitle('修改部门')
    } catch (error) {
      console.error('Failed to get dept:', error)
      modal.msgError('获取部门信息失败')
    }
  }

  // 删除
  const handleDelete = (row) => {
    Modal.confirm({
      title: '提示',
      content: `是否确认删除名称为"${row.deptName}"的数据项?`,
      onOk: async () => {
        try {
          await delDept(row.deptId)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to delete dept:', error)
        }
      }
    })
  }

  // 展开/折叠
  const toggleExpandAll = () => {
    setRefreshTable(false)
    setIsExpandAll(!isExpandAll)
    setTimeout(() => {
      setRefreshTable(true)
    }, 100)
  }

  // 表单重置
  const reset = () => {
    form.resetFields()
    form.setFieldsValue({
      deptId: undefined,
      parentId: undefined,
      deptName: undefined,
      orderNum: 0,
      leader: undefined,
      phone: undefined,
      email: undefined,
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
      if (values.deptId !== undefined) {
        await updateDept(values)
        modal.msgSuccess('修改成功')
      } else {
        await addDept(values)
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
    if (auth.hasPermiOr(['system:dept:edit'])) {
      handleUpdate(row)
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '部门名称',
      dataIndex: 'deptName',
      key: 'deptName',
      ellipsis: true,
      minWidth: 200
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      key: 'orderNum',
      align: 'center',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
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
      align: 'center',
      fixed: 'right',
      width: 210,
      render: (_, record) => (
        <Space size="small">
          {auth.hasPermiOr(['system:dept:edit']) && (
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
          {auth.hasPermiOr(['system:dept:add']) && (
            <Button
              type="link"
              icon={<PlusOutlined />}
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleAdd(record)
              }}
            >
              新增
            </Button>
          )}
          {record.parentId != 0 && auth.hasPermiOr(['system:dept:remove']) && (
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

  return (
    <div className="app-container">
      <Form
        form={queryForm}
        layout="inline"
        className="search-form"
        style={{ display: showSearch ? 'flex' : 'none', marginBottom: 16 }}
      >
        <Form.Item label="部门名称" name="deptName">
          <Input
            placeholder="请输入部门名称"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            placeholder="部门状态"
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
          {auth.hasPermiOr(['system:dept:add']) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
              新增
            </Button>
          )}
          <Button type="default" icon={<SortAscendingOutlined />} onClick={toggleExpandAll}>
            展开/折叠
          </Button>
          <RightToolbar
            showSearch={showSearch}
            columns={{}}
            onShowSearchChange={setShowSearch}
            onQueryTable={getList}
          />
        </Space>
      </div>

      {refreshTable && (
        <Table
          loading={loading}
          dataSource={deptList}
          columns={columns}
          rowKey="deptId"
          defaultExpandAllRows={isExpandAll}
          onRow={(record) => ({
            onDoubleClick: () => handleRowDblClick(record)
          })}
          pagination={false}
        />
      )}

      {/* 添加或修改部门对话框 */}
      <Modal
        title={title}
        open={open}
        onCancel={cancel}
        onOk={submitForm}
        width={600}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          {form.getFieldValue('parentId') !== 0 && (
            <Form.Item
              label="上级部门"
              name="parentId"
              rules={[{ required: true, message: '上级部门不能为空' }]}
            >
              <TreeSelect
                treeData={deptOptions}
                fieldNames={{ label: 'deptName', value: 'deptId', children: 'children' }}
                placeholder="选择上级部门"
                treeDefaultExpandAll
                allowClear
              />
            </Form.Item>
          )}
          <Form.Item
            label="部门名称"
            name="deptName"
            rules={[{ required: true, message: '部门名称不能为空' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <Form.Item
            label="显示排序"
            name="orderNum"
            rules={[{ required: true, message: '显示排序不能为空' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="负责人" name="leader">
            <Input placeholder="请输入负责人" maxLength={20} />
          </Form.Item>
          <Form.Item
            label="联系电话"
            name="phone"
            rules={[
              { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input placeholder="请输入联系电话" maxLength={11} />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
          >
            <Input placeholder="请输入邮箱" maxLength={50} />
          </Form.Item>
          <Form.Item label="部门状态" name="status">
            <Radio.Group>
              {sys_normal_disable.sys_normal_disable?.map(dict => (
                <Radio key={dict.value} value={dict.value}>
                  {dict.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Dept
