import { useState, useEffect, useRef } from 'react'
import { Form, Input, InputNumber, Select, DatePicker, Button, Table, Switch, Modal, Radio, Checkbox, Tree, Space, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, DatabaseOutlined, UserOutlined, QuestionCircleOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { 
  listRole, 
  getRole, 
  addRole, 
  updateRole, 
  delRole, 
  changeRoleStatus, 
  dataScope, 
  deptTreeSelect 
} from '@/api/system/role'
import { treeselect as menuTreeselect, roleMenuTreeselect } from '@/api/system/menu'
import { useDict } from '@/utils/dict'
import { parseTime, addDateRange } from '@/utils/ruoyi'
import { download } from '@/utils/request'
import modal from '@/plugins/modal'
import auth from '@/plugins/auth'
import Pagination from '@/components/Pagination'
import RightToolbar from '@/components/RightToolbar'
import './index.scss'

const { RangePicker } = DatePicker
const { TextArea } = Input

const Role = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [dataScopeForm] = Form.useForm()
  const [queryForm] = Form.useForm()
  const menuTreeRef = useRef(null)
  const deptTreeRef = useRef(null)

  // Tree 状态（受控），用于回显/全选/半选/展开折叠
  const [menuCheckedKeys, setMenuCheckedKeys] = useState([])
  const [menuHalfCheckedKeys, setMenuHalfCheckedKeys] = useState([])
  const [menuExpandedKeys, setMenuExpandedKeys] = useState([])
  const [deptCheckedKeys, setDeptCheckedKeys] = useState([])
  const [deptHalfCheckedKeys, setDeptHalfCheckedKeys] = useState([])
  const [deptExpandedKeys, setDeptExpandedKeys] = useState([])

  // 同步引用：避免“勾选后立即保存”读到旧 state
  const menuCheckedKeysRef = useRef([])
  const menuHalfCheckedKeysRef = useRef([])
  const deptCheckedKeysRef = useRef([])
  const deptHalfCheckedKeysRef = useRef([])

  const [roleList, setRoleList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [openDataScope, setOpenDataScope] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [title, setTitle] = useState('')
  const [dateRange, setDateRange] = useState([])
  const [menuOptions, setMenuOptions] = useState([])
  const [menuExpand, setMenuExpand] = useState(false)
  const [menuNodeAll, setMenuNodeAll] = useState(false)
  const [deptExpand, setDeptExpand] = useState(true)
  const [deptNodeAll, setDeptNodeAll] = useState(false)
  const [deptOptions, setDeptOptions] = useState([])

  const sys_normal_disable = useDict('sys_normal_disable')

  // 监听表单字段（确保切换“父子联动/权限范围”时组件能及时刷新）
  const menuCheckStrictlyValue = Form.useWatch('menuCheckStrictly', form)
  const deptCheckStrictlyValue = Form.useWatch('deptCheckStrictly', dataScopeForm)
  const dataScopeValue = Form.useWatch('dataScope', dataScopeForm)

  const dataScopeOptions = [
    { value: '1', label: '全部数据权限' },
    { value: '2', label: '自定数据权限' },
    { value: '3', label: '本部门数据权限' },
    { value: '4', label: '本部门及以下数据权限' },
    { value: '5', label: '仅本人数据权限' }
  ]

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    roleName: undefined,
    roleKey: undefined,
    status: undefined
  })

  useEffect(() => {
    getList()
  }, [queryParams, dateRange])

  // 查询角色列表
  const getList = async () => {
    setLoading(true)
    try {
      const params = addDateRange(queryParams, dateRange)
      const response = await listRole(params)
      setRoleList(response.rows || [])
      setTotal(response.total || 0)
    } catch (error) {
      console.error('Failed to get role list:', error)
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
      roleName: undefined,
      roleKey: undefined,
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
  const handleAdd = async () => {
    reset()
    await getMenuTreeselect()
    setOpen(true)
    setTitle('添加角色')
    setIsEdit(false)
  }

  // 修改
  const handleUpdate = async (row) => {
    reset()
    const roleId = row?.roleId || (selectedRowKeys.length === 1 ? selectedRowKeys[0] : null)
    
    if (!roleId) {
      modal.msgWarning('请选择要修改的角色')
      return
    }

    try {
      const roleResponse = await getRole(roleId)
      const menuResponse = await roleMenuTreeselect(roleId)
      
      form.setFieldsValue({
        ...roleResponse.data,
        roleSort: Number(roleResponse.data.roleSort)
      })
      setMenuOptions(menuResponse.menus || [])
      // 关键：权限回显（Antd Tree 需要受控 checkedKeys）
      setMenuCheckedKeys(normalizeCascadeCheckedKeys(menuResponse.menus || [], menuResponse.checkedKeys || []))
      setMenuHalfCheckedKeys([])
      // 提交仍保留后端返回的原始 keys，避免“打开不改直接保存”丢权限
      menuCheckedKeysRef.current = menuResponse.checkedKeys || []
      menuHalfCheckedKeysRef.current = []
      
      setOpen(true)
      setTitle('修改角色')
      setIsEdit(true)
    } catch (error) {
      console.error('Failed to get role:', error)
      modal.msgError('获取角色信息失败')
    }
  }

  // 删除
  const handleDelete = (row) => {
    const roleIds = row?.roleId || selectedRowKeys
    Modal.confirm({
      title: '提示',
      content: `是否确认删除角色编号为"${roleIds}"的数据项?`,
      onOk: async () => {
        try {
          await delRole(roleIds)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to delete role:', error)
        }
      }
    })
  }

  // 状态修改
  const handleStatusChange = (row) => {
    const text = row.status === '0' ? '启用' : '停用'
    Modal.confirm({
      title: '提示',
      content: `确认要"${text}""${row.roleName}"角色吗?`,
      onOk: async () => {
        try {
          await changeRoleStatus(row.roleId, row.status)
          modal.msgSuccess(`${text}成功`)
          getList()
        } catch (error) {
          row.status = row.status === '0' ? '1' : '0'
          console.error('Failed to change status:', error)
        }
      },
      onCancel: () => {
        row.status = row.status === '0' ? '1' : '0'
      }
    })
  }

  // 分配用户
  const handleAuthUser = (row) => {
    navigate(`/system/role-auth/user/${row.roleId}`)
  }

  // 数据权限
  const handleDataScope = async (row) => {
    resetDataScope()
    try {
      const roleResponse = await getRole(row.roleId)
      const deptResponse = await deptTreeSelect(row.roleId)
      
      dataScopeForm.setFieldsValue(roleResponse.data)
      setDeptOptions(deptResponse.depts || [])
      setDeptCheckedKeys(deptResponse.checkedKeys || [])
      setDeptHalfCheckedKeys([])
      deptCheckedKeysRef.current = deptResponse.checkedKeys || []
      deptHalfCheckedKeysRef.current = []
      setOpenDataScope(true)
      setTitle('分配数据权限')
    } catch (error) {
      console.error('Failed to get role data scope:', error)
    }
  }

  // 导出
  const handleExport = () => {
    download('system/role/export', queryParams, `role_${new Date().getTime()}.xlsx`)
  }

  // 查询菜单树结构
  const getMenuTreeselect = async () => {
    try {
      const response = await menuTreeselect()
      setMenuOptions(response.data || [])
    } catch (error) {
      console.error('Failed to get menu tree:', error)
    }
  }

  const collectTreeKeys = (nodes) => {
    const keys = []
    const walk = (list) => {
      ;(list || []).forEach((n) => {
        keys.push(n.id)
        if (n.children && n.children.length) walk(n.children)
      })
    }
    walk(nodes)
    return keys
  }

  /**
   * Normalize checked keys for Antd Tree in cascade mode:
   * If a parent key exists but not all descendants are selected,
   * do NOT keep the parent in `checkedKeys`, otherwise Antd will auto-check all children.
   */
  const normalizeCascadeCheckedKeys = (treeData, checkedKeys) => {
    const raw = Array.isArray(checkedKeys) ? checkedKeys : []
    const rawSet = new Set(raw)
    const result = []

    const dfs = (node) => {
      const children = node?.children || []
      const hasChildren = children.length > 0
      const selfChecked = rawSet.has(node.id)

      if (!hasChildren) {
        if (selfChecked) result.push(node.id)
        return selfChecked
      }

      let allChildrenFullyChecked = true
      for (const child of children) {
        const childFully = dfs(child)
        if (!childFully) allChildrenFullyChecked = false
      }

      const fullyChecked = selfChecked && allChildrenFullyChecked
      if (fullyChecked) result.push(node.id)
      return fullyChecked
    }

    ;(treeData || []).forEach(dfs)
    return Array.from(new Set(result))
  }

  // 表单重置
  const reset = () => {
    setMenuCheckedKeys([])
    setMenuHalfCheckedKeys([])
    setMenuExpandedKeys([])
    setDeptCheckedKeys([])
    setDeptHalfCheckedKeys([])
    setDeptExpandedKeys([])
    menuCheckedKeysRef.current = []
    menuHalfCheckedKeysRef.current = []
    deptCheckedKeysRef.current = []
    deptHalfCheckedKeysRef.current = []
    setMenuExpand(false)
    setMenuNodeAll(false)
    setDeptExpand(true)
    setDeptNodeAll(false)
    form.resetFields()
    form.setFieldsValue({
      roleId: undefined,
      roleName: undefined,
      roleKey: undefined,
      roleSort: 0,
      status: '0',
      menuIds: [],
      deptIds: [],
      menuCheckStrictly: true,
      deptCheckStrictly: true,
      remark: undefined,
      dataScope: '1'
    })
  }

  // 数据权限表单重置
  const resetDataScope = () => {
    setDeptCheckedKeys([])
    setDeptHalfCheckedKeys([])
    setDeptExpandedKeys([])
    deptCheckedKeysRef.current = []
    deptHalfCheckedKeysRef.current = []
    setDeptExpand(true)
    setDeptNodeAll(false)
    dataScopeForm.resetFields()
    dataScopeForm.setFieldsValue({
      dataScope: '1'
    })
  }

  // 取消
  const cancel = () => {
    setOpen(false)
    reset()
  }

  // 取消数据权限
  const cancelDataScope = () => {
    setOpenDataScope(false)
    resetDataScope()
  }

  // 树权限（展开/折叠）
  const handleCheckedTreeExpand = (checked, type) => {
    if (type === 'menu') {
      setMenuExpand(checked)
      setMenuExpandedKeys(checked ? collectTreeKeys(menuOptions) : [])
    } else if (type === 'dept') {
      setDeptExpand(checked)
      setDeptExpandedKeys(checked ? collectTreeKeys(deptOptions) : [])
    }
  }

  // 树权限（全选/全不选）
  const handleCheckedTreeNodeAll = (checked, type) => {
    if (type === 'menu') {
      setMenuNodeAll(checked)
      setMenuCheckedKeys(checked ? collectTreeKeys(menuOptions) : [])
      setMenuHalfCheckedKeys([])
      menuCheckedKeysRef.current = checked ? collectTreeKeys(menuOptions) : []
      menuHalfCheckedKeysRef.current = []
    } else if (type === 'dept') {
      setDeptNodeAll(checked)
      setDeptCheckedKeys(checked ? collectTreeKeys(deptOptions) : [])
      setDeptHalfCheckedKeys([])
      deptCheckedKeysRef.current = checked ? collectTreeKeys(deptOptions) : []
      deptHalfCheckedKeysRef.current = []
    }
  }

  // 树权限（父子联动）
  const handleCheckedTreeConnect = (checked, type) => {
    if (type === 'menu') {
      // checked=true 表示开启“父子联动”(级联)：Antd Tree 需要 checkStrictly=false
      form.setFieldValue('menuCheckStrictly', checked)
    } else if (type === 'dept') {
      dataScopeForm.setFieldValue('deptCheckStrictly', checked)
    }
  }

  // 获取所有菜单节点数据
  const getMenuAllCheckedKeys = () => {
    return Array.from(new Set([...(menuCheckedKeysRef.current || []), ...(menuHalfCheckedKeysRef.current || [])]))
  }

  // 获取所有部门节点数据
  const getDeptAllCheckedKeys = () => {
    return Array.from(new Set([...(deptCheckedKeysRef.current || []), ...(deptHalfCheckedKeysRef.current || [])]))
  }

  // 提交表单
  const submitForm = async () => {
    try {
      const values = await form.validateFields()
      values.menuIds = getMenuAllCheckedKeys()
      
      if (values.roleId !== undefined && values.roleId !== null && values.roleId !== '') {
        await updateRole(values)
        modal.msgSuccess('修改成功')
      } else {
        await addRole(values)
        modal.msgSuccess('新增成功')
      }
      setOpen(false)
      getList()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  // 提交数据权限
  const submitDataScope = async () => {
    try {
      const values = dataScopeForm.getFieldsValue()
      if (values.dataScope === '2') {
        values.deptIds = getDeptAllCheckedKeys()
      } else {
        values.deptIds = []
      }
      
      await dataScope(values)
      modal.msgSuccess('修改成功')
      setOpenDataScope(false)
      getList()
    } catch (error) {
      console.error('Failed to submit data scope:', error)
    }
  }

  // 数据权限范围变化
  const dataScopeSelectChange = (value) => {
    if (value !== '2') {
      setDeptCheckedKeys([])
      setDeptHalfCheckedKeys([])
      deptCheckedKeysRef.current = []
      deptHalfCheckedKeysRef.current = []
    }
  }

  // 双击行
  const handleRowDblClick = (row) => {
    if (row.roleId !== 1 && auth.hasPermiOr(['system:role:edit'])) {
      handleUpdate(row)
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '角色编号',
      dataIndex: 'roleId',
      key: 'roleId',
      width: 120
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
      ellipsis: true,
      width: 150
    },
    {
      title: '权限字符',
      dataIndex: 'roleKey',
      key: 'roleKey',
      ellipsis: true,
      width: 150
    },
    {
      title: '显示顺序',
      dataIndex: 'roleSort',
      key: 'roleSort',
      width: 100
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Switch
          checked={record.status === '0'}
          onChange={(checked) => {
            record.status = checked ? '0' : '1'
            handleStatusChange(record)
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
      render: (text) => parseTime(text)
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 200,
      render: (_, record) => {
        if (record.roleId === 1) return null
        return (
          <Space size="small">
            {auth.hasPermiOr(['system:role:edit']) && (
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
            {auth.hasPermiOr(['system:role:remove']) && (
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
            {auth.hasPermiOr(['system:role:edit']) && (
              <Tooltip title="数据权限">
                <Button
                  type="link"
                  icon={<DatabaseOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDataScope(record)
                  }}
                />
              </Tooltip>
            )}
            {auth.hasPermiOr(['system:role:edit']) && (
              <Tooltip title="分配用户">
                <Button
                  type="link"
                  icon={<UserOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAuthUser(record)
                  }}
                />
              </Tooltip>
            )}
          </Space>
        )
      }
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
        <Form.Item label="角色名称" name="roleName">
          <Input
            placeholder="请输入角色名称"
            style={{ width: 240 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="权限字符" name="roleKey">
          <Input
            placeholder="请输入权限字符"
            style={{ width: 240 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="状态" name="status">
          <Select
            placeholder="角色状态"
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
          {auth.hasPermiOr(['system:role:add']) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增
            </Button>
          )}
          {auth.hasPermiOr(['system:role:edit']) && (
            <Button
              type="default"
              icon={<EditOutlined />}
              disabled={selectedRowKeys.length !== 1}
              onClick={() => handleUpdate({ roleId: selectedRowKeys[0] })}
            >
              修改
            </Button>
          )}
          {auth.hasPermiOr(['system:role:remove']) && (
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
          {auth.hasPermiOr(['system:role:export']) && (
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
        dataSource={roleList}
        columns={columns}
        rowSelection={rowSelection}
        rowKey="roleId"
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

      {/* 添加或修改角色对话框 */}
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
          {/* 关键：编辑时需要带上 roleId，否则 submitForm 会误判为新增 */}
          <Form.Item name="roleId" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="角色名称"
            name="roleName"
            rules={[{ required: true, message: '角色名称不能为空' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            label={
              <span>
                <Tooltip title="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)">
                  <QuestionCircleOutlined style={{ marginRight: 4 }} />
                </Tooltip>
                权限字符
              </span>
            }
            name="roleKey"
            rules={[{ required: true, message: '权限字符不能为空' }]}
          >
            <Input placeholder="请输入权限字符" />
          </Form.Item>
          <Form.Item
            label="角色顺序"
            name="roleSort"
            rules={[{ required: true, message: '角色顺序不能为空' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Radio.Group>
              {sys_normal_disable.sys_normal_disable?.map(dict => (
                <Radio key={dict.value} value={dict.value}>
                  {dict.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item label="菜单权限">
            <Space style={{ marginBottom: 8 }}>
              <Checkbox
                checked={menuExpand}
                onChange={(e) => handleCheckedTreeExpand(e.target.checked, 'menu')}
              >
                展开/折叠
              </Checkbox>
              <Checkbox
                checked={menuNodeAll}
                onChange={(e) => handleCheckedTreeNodeAll(e.target.checked, 'menu')}
              >
                全选/全不选
              </Checkbox>
              <Checkbox
                checked={menuCheckStrictlyValue !== false}
                onChange={(e) => handleCheckedTreeConnect(e.target.checked, 'menu')}
              >
                父子联动
              </Checkbox>
            </Space>
            <Tree
              ref={menuTreeRef}
              checkable
              treeData={menuOptions}
              fieldNames={{ title: 'label', key: 'id', children: 'children' }}
              // menuCheckStrictlyValue=true 表示“父子联动(级联)”，因此 checkStrictly 要取反
              checkStrictly={!(menuCheckStrictlyValue !== false)}
              expandedKeys={menuExpandedKeys}
              onExpand={(keys) => setMenuExpandedKeys(keys)}
              checkedKeys={
                // 严格模式(checkStrictly=true) 需要对象；级联模式用数组即可
                !(menuCheckStrictlyValue !== false)
                  ? { checked: menuCheckedKeys, halfChecked: menuHalfCheckedKeys }
                  : menuCheckedKeys
              }
              onCheck={(checked, info) => {
                if (Array.isArray(checked)) {
                  setMenuCheckedKeys(checked)
                  setMenuHalfCheckedKeys(info?.halfCheckedKeys || [])
                  menuCheckedKeysRef.current = checked
                  menuHalfCheckedKeysRef.current = info?.halfCheckedKeys || []
                } else {
                  const nextChecked = checked?.checked || []
                  const nextHalf = checked?.halfChecked || info?.halfCheckedKeys || []
                  setMenuCheckedKeys(nextChecked)
                  setMenuHalfCheckedKeys(nextHalf)
                  menuCheckedKeysRef.current = nextChecked
                  menuHalfCheckedKeysRef.current = nextHalf
                }
              }}
              style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #d9d9d9', padding: '8px' }}
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <TextArea placeholder="请输入内容" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 分配数据权限对话框 */}
      <Modal
        title={title}
        open={openDataScope}
        onCancel={cancelDataScope}
        onOk={submitDataScope}
        width={500}
        destroyOnHidden
      >
        <Form
          form={dataScopeForm}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item label="角色名称" name="roleName">
            <Input disabled />
          </Form.Item>
          <Form.Item label="权限字符" name="roleKey">
            <Input disabled />
          </Form.Item>
          <Form.Item label="权限范围" name="dataScope">
            <Select onChange={dataScopeSelectChange}>
              {dataScopeOptions.map(item => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {dataScopeValue === '2' && (
            <Form.Item label="数据权限">
              <Space style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={deptExpand}
                  onChange={(e) => handleCheckedTreeExpand(e.target.checked, 'dept')}
                >
                  展开/折叠
                </Checkbox>
                <Checkbox
                  checked={deptNodeAll}
                  onChange={(e) => handleCheckedTreeNodeAll(e.target.checked, 'dept')}
                >
                  全选/全不选
                </Checkbox>
              <Checkbox
                checked={deptCheckStrictlyValue !== false}
                onChange={(e) => handleCheckedTreeConnect(e.target.checked, 'dept')}
              >
                父子联动
              </Checkbox>
              </Space>
              <Tree
                ref={deptTreeRef}
                checkable
                treeData={deptOptions}
                fieldNames={{ title: 'label', key: 'id', children: 'children' }}
                // deptCheckStrictlyValue=true 表示“父子联动(级联)”，因此 checkStrictly 要取反
                checkStrictly={!(deptCheckStrictlyValue !== false)}
                expandedKeys={deptExpandedKeys}
                onExpand={(keys) => setDeptExpandedKeys(keys)}
                checkedKeys={
                  !(deptCheckStrictlyValue !== false)
                    ? { checked: deptCheckedKeys, halfChecked: deptHalfCheckedKeys }
                    : deptCheckedKeys
                }
                onCheck={(checked, info) => {
                  if (Array.isArray(checked)) {
                    setDeptCheckedKeys(checked)
                    setDeptHalfCheckedKeys(info?.halfCheckedKeys || [])
                    deptCheckedKeysRef.current = checked
                    deptHalfCheckedKeysRef.current = info?.halfCheckedKeys || []
                  } else {
                    const nextChecked = checked?.checked || []
                    const nextHalf = checked?.halfChecked || info?.halfCheckedKeys || []
                    setDeptCheckedKeys(nextChecked)
                    setDeptHalfCheckedKeys(nextHalf)
                    deptCheckedKeysRef.current = nextChecked
                    deptHalfCheckedKeysRef.current = nextHalf
                  }
                }}
                style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #d9d9d9', padding: '8px' }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default Role
