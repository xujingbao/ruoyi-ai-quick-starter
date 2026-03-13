import { useState, useEffect, useRef } from 'react'
import { Row, Col, Form, Input, Select, DatePicker, Button, Table, Switch, Modal, Space, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined, KeyOutlined, CheckCircleOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { 
  listUser, 
  getUser, 
  addUser, 
  updateUser, 
  delUser, 
  resetUserPwd, 
  changeUserStatus, 
  deptTreeSelect 
} from '@/api/system/user'
import { getConfigKey } from '@/api/system/config'
import { useDict } from '@/utils/dict'
import { useAppStore } from '@/store/appStore'
import auth from '@/plugins/auth'
import { parseTime, addDateRange } from '@/utils/ruoyi'
import { download } from '@/utils/request'
import { getToken } from '@/utils/auth'
import modal from '@/plugins/modal'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import UserFormModal from './UserFormModal'
import UserImportModal from './UserImportModal'
import { Tree, Input as TreeInput } from 'antd'
import './index.scss'

const { RangePicker } = DatePicker

const User = () => {
  const navigate = useNavigate()
  const appStore = useAppStore()
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const deptTreeRef = useRef(null)

  const [userList, setUserList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [title, setTitle] = useState('')
  const [dateRange, setDateRange] = useState([])
  const [deptName, setDeptName] = useState('')
  const [deptOptions, setDeptOptions] = useState([])
  const [enabledDeptOptions, setEnabledDeptOptions] = useState([])
  const [initPassword, setInitPassword] = useState('')
  const [postOptions, setPostOptions] = useState([])
  const [roleOptions, setRoleOptions] = useState([])
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [updateSupport, setUpdateSupport] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)

  const sys_normal_disable = useDict('sys_normal_disable')
  const sys_user_sex = useDict('sys_user_sex')

  const [columns, setColumns] = useState({
    userId: { label: '用户编号', visible: true },
    userName: { label: '用户名称', visible: true },
    nickName: { label: '用户昵称', visible: true },
    deptName: { label: '部门', visible: true },
    phonenumber: { label: '手机号码', visible: true },
    status: { label: '状态', visible: true },
    createTime: { label: '创建时间', visible: true }
  })

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined
  })

  useEffect(() => {
    getDeptTree()
    getList()
    getConfigKey('sys.user.initPassword').then(response => {
      setInitPassword(response.msg)
    })
  }, [])

  useEffect(() => {
    getList()
  }, [queryParams])

  // 过滤禁用的部门
  const filterDisabledDept = (deptList) => {
    return deptList.filter(dept => {
      if (dept.disabled) {
        return false
      }
      if (dept.children && dept.children.length) {
        dept.children = filterDisabledDept(dept.children)
      }
      return true
    })
  }

  // 查询部门下拉树结构
  const getDeptTree = async () => {
    try {
      const response = await deptTreeSelect()
      setDeptOptions(response.data || [])
      setEnabledDeptOptions(filterDisabledDept(JSON.parse(JSON.stringify(response.data || []))))
    } catch (error) {
      console.error('Failed to get dept tree:', error)
    }
  }

  // 查询用户列表
  const getList = async () => {
    setLoading(true)
    try {
      const params = addDateRange(queryParams, dateRange)
      const response = await listUser(params)
      setUserList(response.rows || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to get user list:', error)
    } finally {
      setLoading(false)
    }
  }

  // 部门树过滤
  const filterNode = (node) => {
    if (!deptName) return true
    return node.label.indexOf(deptName) !== -1
  }

  // 部门树节点点击
  const handleNodeClick = (selectedKeys, info) => {
    if (info.node) {
      setQueryParams(prev => ({
        ...prev,
        deptId: info.node.id,
        pageNum: 1
      }))
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
      userName: undefined,
      phonenumber: undefined,
      status: undefined,
      deptId: undefined,
      pageNum: 1
    }))
    if (deptTreeRef.current) {
      deptTreeRef.current.setSelectedKeys([])
    }
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
  const handleAdd = async () => {
    reset()
    try {
      const response = await getUser()
      setPostOptions(response.posts || [])
      setRoleOptions(response.roles || [])
      setOpen(true)
      setTitle('添加用户')
      setIsEdit(false)
      form.setFieldsValue({
        password: initPassword,
        status: '0'
      })
    } catch (error) {
      console.error('Failed to get user data:', error)
    }
  }

  // 修改
  const handleUpdate = async (row) => {
    reset()
    const userId = row?.userId || (selectedRowKeys.length === 1 ? selectedRowKeys[0] : null)
    
    if (!userId) {
      modal.msgWarning('请选择要修改的用户')
      return
    }

    try {
      const response = await getUser(userId)
      form.setFieldsValue({
        ...response.data,
        postIds: response.postIds || [],
        roleIds: response.roleIds || []
      })
      setPostOptions(response.posts || [])
      setRoleOptions(response.roles || [])
      setOpen(true)
      setTitle('修改用户')
      setIsEdit(true)
      form.setFieldValue('password', '')
    } catch (error) {
      console.error('Failed to get user:', error)
      modal.msgError('获取用户信息失败')
    }
  }

  // 删除
  const handleDelete = (row) => {
    const userIds = row?.userId || selectedRowKeys
    Modal.confirm({
      title: '提示',
      content: `是否确认删除用户编号为"${userIds}"的数据项？`,
      onOk: async () => {
        try {
          await delUser(userIds)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to delete user:', error)
        }
      }
    })
  }

  // 状态修改
  const handleStatusChange = (row) => {
    const text = row.status === '0' ? '启用' : '停用'
    Modal.confirm({
      title: '提示',
      content: `确认要"${text}""${row.userName}"用户吗?`,
      onOk: async () => {
        try {
          await changeUserStatus(row.userId, row.status)
          modal.msgSuccess(`${text}成功`)
          getList()
        } catch (error) {
          setUserList(prev => prev.map(u =>
            u.userId === row.userId ? { ...u, status: u.status === '0' ? '1' : '0' } : u
          ))
          console.error('Failed to change status:', error)
        }
      },
      onCancel: () => {
        setUserList(prev => prev.map(u =>
          u.userId === row.userId ? { ...u, status: u.status === '0' ? '1' : '0' } : u
        ))
      }
    })
  }

  // 重置密码
  const handleResetPwd = (row) => {
    Modal.confirm({
      title: '重置密码',
      content: (
        <Input.Password
          placeholder={`请输入"${row.userName}"的新密码`}
          id="resetPwdInput"
        />
      ),
      onOk: async () => {
        const input = document.getElementById('resetPwdInput')
        const password = input?.value
        if (!password || password.length < 5 || password.length > 20) {
          modal.msgError('用户密码长度必须介于 5 和 20 之间')
          return Promise.reject()
        }
        if (/<|>|"|'|\||\\/.test(password)) {
          modal.msgError('不能包含非法字符：< > " \' \\ |')
          return Promise.reject()
        }
        try {
          await resetUserPwd(row.userId, password)
          modal.msgSuccess(`修改成功，新密码是：${password}`)
        } catch (error) {
          console.error('Failed to reset password:', error)
          return Promise.reject()
        }
      }
    })
  }

  // 分配角色
  const handleAuthRole = (row) => {
    navigate(`/system/user-auth/role/${row.userId}`)
  }

  // 导出
  const handleExport = () => {
    download('system/user/export', queryParams, `user_${new Date().getTime()}.xlsx`)
  }

  // 导入
  const handleImport = () => {
    setUploadOpen(true)
    setSelectedFile(null)
  }

  // 下载模板
  const importTemplate = () => {
    download('system/user/importTemplate', {}, `user_template_${new Date().getTime()}.xlsx`)
  }

  // 文件上传前
  const beforeUpload = (file) => {
    const isExcel = file.name.toLowerCase().endsWith('.xls') || file.name.toLowerCase().endsWith('.xlsx')
    if (!isExcel) {
      modal.msgError('仅允许导入xls、xlsx格式文件')
      return false
    }
    setSelectedFile(file)
    return false
  }

  // 文件上传
  const handleUpload = async () => {
    if (!selectedFile) {
      modal.msgError('请选择后缀为 "xls"或"xlsx" 的文件')
      return
    }
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_BASE_API || '/dev-api'}/system/user/importData?updateSupport=${updateSupport}`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + getToken()
        },
        body: formData
      })
      
      const result = await response.json()
      setUploadOpen(false)
      setUploading(false)
      setSelectedFile(null)
      
      Modal.info({
        title: '导入结果',
        content: result.msg,
        width: 600
      })
      
      getList()
    } catch (error) {
      console.error('Failed to upload:', error)
      modal.msgError('上传失败')
      setUploading(false)
    }
  }

  // 表单重置
  const reset = () => {
    form.resetFields()
    form.setFieldsValue({
      // 这里不要用 undefined：Antd Form 对 undefined 赋值有时会被忽略，导致上一次编辑的值“残留”
      userId: null,
      deptId: null,
      userName: '',
      nickName: '',
      password: '',
      phonenumber: '',
      email: '',
      sex: null,
      status: '0',
      remark: '',
      postIds: [],
      roleIds: []
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
      // 统一做下 trim，避免“看起来没改但带空格”触发后端唯一性校验
      const normalized = {
        ...values,
        userName: typeof values.userName === 'string' ? values.userName.trim() : values.userName,
        nickName: typeof values.nickName === 'string' ? values.nickName.trim() : values.nickName,
        phonenumber: typeof values.phonenumber === 'string' ? values.phonenumber.trim() : values.phonenumber,
        email: typeof values.email === 'string' ? values.email.trim() : values.email,
        remark: typeof values.remark === 'string' ? values.remark.trim() : values.remark
      }
      if (normalized.userId !== undefined && normalized.userId !== null && normalized.userId !== '') {
        // 修改：不提交 password 字段（编辑时表单也不显示该字段）
        // 兼容后端对 password 的不同处理策略
        // eslint-disable-next-line no-unused-vars
        const { password, ...payload } = normalized
        await updateUser(payload)
        modal.msgSuccess('修改成功')
      } else {
        await addUser(normalized)
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
    if (row.userId === 1) {
      modal.msgWarning('不允许修改管理员用户')
      return
    }
    handleUpdate(row)
  }

  // 表格列定义
  const tableColumns = [
    {
      title: '用户编号',
      dataIndex: 'userId',
      key: 'userId',
      align: 'center',
      width: 80,
      hidden: !columns.userId.visible
    },
    {
      title: '用户名称',
      dataIndex: 'userName',
      key: 'userName',
      align: 'center',
      ellipsis: true,
      hidden: !columns.userName.visible
    },
    {
      title: '用户昵称',
      dataIndex: 'nickName',
      key: 'nickName',
      align: 'center',
      ellipsis: true,
      hidden: !columns.nickName.visible
    },
    {
      title: '部门',
      dataIndex: ['dept', 'deptName'],
      key: 'deptName',
      align: 'center',
      ellipsis: true,
      hidden: !columns.deptName.visible
    },
    {
      title: '手机号码',
      dataIndex: 'phonenumber',
      key: 'phonenumber',
      align: 'center',
      width: 120,
      hidden: !columns.phonenumber.visible
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      hidden: !columns.status.visible,
      render: (_, record) => (
        <Switch
          checked={record.status === '0'}
          onChange={(checked) => {
            const updatedRecord = { ...record, status: checked ? '0' : '1' }
            handleStatusChange(updatedRecord)
          }}
          checkedChildren="启用"
          unCheckedChildren="停用"
        />
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 160,
      hidden: !columns.createTime.visible,
      render: (text) => parseTime(text)
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        if (record.userId === 1) return null
        return (
          <Space size="small">
            {auth.hasPermiOr(['system:user:edit']) && (
              <Tooltip title="修改">
                <Button
                  type="link"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpdate(record)
                  }}
                />
              </Tooltip>
            )}
            {auth.hasPermiOr(['system:user:remove']) && (
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
                />
              </Tooltip>
            )}
            {auth.hasPermiOr(['system:user:resetPwd']) && (
              <Tooltip title="重置密码">
                <Button
                  type="link"
                  icon={<KeyOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleResetPwd(record)
                  }}
                />
              </Tooltip>
            )}
            {auth.hasPermiOr(['system:user:edit']) && (
              <Tooltip title="分配角色">
                <Button
                  type="link"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAuthRole(record)
                  }}
                />
              </Tooltip>
            )}
          </Space>
        )
      }
    }
  ].filter(col => !col.hidden)

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange
  }

  return (
    <div className="app-container">
      <Row gutter={20}>
        <div style={{ display: 'flex', width: '100%', height: 'calc(100vh - 200px)' }}>
          {/* 部门数据 */}
          <div style={{ width: '16%', minWidth: '200px', borderRight: '1px solid #f0f0f0' }}>
            <div className="dept-search-container">
              <TreeInput
                placeholder="请输入部门名称"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                allowClear
              />
            </div>
            <div className="dept-tree-container">
              <Tree
                ref={deptTreeRef}
                treeData={deptOptions}
                fieldNames={{ title: 'label', key: 'id', children: 'children' }}
                defaultExpandAll
                onSelect={handleNodeClick}
                filterTreeNode={filterNode}
                showLine
              />
            </div>
          </div>
          {/* 用户数据 */}
          <div className="user-content" style={{ flex: 1 }}>
            <Form
              form={queryForm}
              layout="inline"
              className="search-form"
              style={{ display: showSearch ? 'flex' : 'none', marginBottom: 16 }}
            >
              <Form.Item label="用户名称" name="userName">
                <Input
                  placeholder="请输入用户名称"
                  style={{ width: 240 }}
                  onPressEnter={handleQuery}
                  allowClear
                />
              </Form.Item>
              <Form.Item label="手机号码" name="phonenumber">
                <Input
                  placeholder="请输入手机号码"
                  style={{ width: 240 }}
                  onPressEnter={handleQuery}
                  allowClear
                />
              </Form.Item>
              <Form.Item label="状态" name="status">
                <Select
                  placeholder="用户状态"
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

            <Row gutter={10} style={{ marginBottom: 16 }}>
              <Col>
                {auth.hasPermiOr(['system:user:add']) && (
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    新增
                  </Button>
                )}
              </Col>
              <Col>
                {auth.hasPermiOr(['system:user:edit']) && (
                  <Button
                    type="default"
                    icon={<EditOutlined />}
                    disabled={selectedRowKeys.length !== 1}
                    onClick={() => handleUpdate({ userId: selectedRowKeys[0] })}
                  >
                    修改
                  </Button>
                )}
              </Col>
              <Col>
                {auth.hasPermiOr(['system:user:remove']) && (
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
              </Col>
              <Col>
                {auth.hasPermiOr(['system:user:import']) && (
                  <Button type="default" icon={<UploadOutlined />} onClick={handleImport}>
                    导入
                  </Button>
                )}
              </Col>
              <Col>
                {auth.hasPermiOr(['system:user:export']) && (
                  <Button type="default" icon={<DownloadOutlined />} onClick={handleExport}>
                    导出
                  </Button>
                )}
              </Col>
              <Col flex="auto">
                <RightToolbar
                  showSearch={showSearch}
                  columns={columns}
                  onShowSearchChange={setShowSearch}
                  onQueryTable={getList}
                />
              </Col>
            </Row>

            <Table
              loading={loading}
              dataSource={userList}
              columns={tableColumns}
              className="user-table"
              rowSelection={rowSelection}
              rowKey="userId"
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
          </div>
        </div>
      </Row>

      <UserFormModal
        open={open}
        title={title}
        isEdit={isEdit}
        onCancel={cancel}
        onOk={submitForm}
        form={form}
        enabledDeptOptions={enabledDeptOptions}
        postOptions={postOptions}
        roleOptions={roleOptions}
        sysNormalDisable={sys_normal_disable.sys_normal_disable}
        sysUserSex={sys_user_sex.sys_user_sex}
      />

      <UserImportModal
        open={uploadOpen}
        onCancel={() => {
          setUploadOpen(false)
          setSelectedFile(null)
        }}
        onOk={handleUpload}
        uploading={uploading}
        selectedFile={selectedFile}
        onFileChange={beforeUpload}
        onFileRemove={() => setSelectedFile(null)}
        updateSupport={updateSupport}
        onUpdateSupportChange={(e) => setUpdateSupport(e.target.checked ? 1 : 0)}
        onImportTemplate={importTemplate}
      />
    </div>
  )
}

export default User
