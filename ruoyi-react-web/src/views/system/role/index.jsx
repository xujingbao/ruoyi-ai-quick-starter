import { useState, useEffect, useRef } from 'react'
import { Form, Input, Select, DatePicker, Button, Table, Switch, Modal, Space, Tooltip } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, DatabaseOutlined, UserOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
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
import RoleFormModal from './RoleFormModal'
import RoleDataScopeModal from './RoleDataScopeModal'
import './index.scss'

const { RangePicker } = DatePicker

const Role = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [dataScopeForm] = Form.useForm()
  const [queryForm] = Form.useForm()

  const [menuCheckedKeys, setMenuCheckedKeys] = useState([])
  const [menuHalfCheckedKeys, setMenuHalfCheckedKeys] = useState([])
  const [menuExpandedKeys, setMenuExpandedKeys] = useState([])
  const [deptCheckedKeys, setDeptCheckedKeys] = useState([])
  const [deptHalfCheckedKeys, setDeptHalfCheckedKeys] = useState([])
  const [deptExpandedKeys, setDeptExpandedKeys] = useState([])

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

  const handleQuery = () => {
    const values = queryForm.getFieldsValue()
    setQueryParams(prev => ({
      ...prev,
      ...values,
      pageNum: 1
    }))
  }

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

  const handlePagination = ({ page, limit }) => {
    setQueryParams(prev => ({
      ...prev,
      pageNum: page,
      pageSize: limit
    }))
  }

  const handleSelectionChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys)
  }

  const handleAdd = async () => {
    reset()
    await getMenuTreeselect()
    setOpen(true)
    setTitle('添加角色')
    setIsEdit(false)
  }

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
      setMenuCheckedKeys(normalizeCascadeCheckedKeys(menuResponse.menus || [], menuResponse.checkedKeys || []))
      setMenuHalfCheckedKeys([])
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
          setRoleList(prev => prev.map(r =>
            r.roleId === row.roleId ? { ...r, status: r.status === '0' ? '1' : '0' } : r
          ))
          console.error('Failed to change status:', error)
        }
      },
      onCancel: () => {
        setRoleList(prev => prev.map(r =>
          r.roleId === row.roleId ? { ...r, status: r.status === '0' ? '1' : '0' } : r
        ))
      }
    })
  }

  const handleAuthUser = (row) => {
    navigate(`/system/role-auth/user/${row.roleId}`)
  }

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

  const handleExport = () => {
    download('system/role/export', queryParams, `role_${new Date().getTime()}.xlsx`)
  }

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

  const cancel = () => {
    setOpen(false)
    reset()
  }

  const cancelDataScope = () => {
    setOpenDataScope(false)
    resetDataScope()
  }

  const handleCheckedTreeExpand = (checked, type) => {
    if (type === 'menu') {
      setMenuExpand(checked)
      setMenuExpandedKeys(checked ? collectTreeKeys(menuOptions) : [])
    } else if (type === 'dept') {
      setDeptExpand(checked)
      setDeptExpandedKeys(checked ? collectTreeKeys(deptOptions) : [])
    }
  }

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

  const handleCheckedTreeConnect = (checked, type) => {
    if (type === 'menu') {
      form.setFieldValue('menuCheckStrictly', checked)
    } else if (type === 'dept') {
      dataScopeForm.setFieldValue('deptCheckStrictly', checked)
    }
  }

  const getMenuAllCheckedKeys = () => {
    return Array.from(new Set([...(menuCheckedKeysRef.current || []), ...(menuHalfCheckedKeysRef.current || [])]))
  }

  const getDeptAllCheckedKeys = () => {
    return Array.from(new Set([...(deptCheckedKeysRef.current || []), ...(deptHalfCheckedKeysRef.current || [])]))
  }

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

  const dataScopeSelectChange = (value) => {
    if (value !== '2') {
      setDeptCheckedKeys([])
      setDeptHalfCheckedKeys([])
      deptCheckedKeysRef.current = []
      deptHalfCheckedKeysRef.current = []
    }
  }

  const handleRowDblClick = (row) => {
    if (row.roleId !== 1 && auth.hasPermiOr(['system:role:edit'])) {
      handleUpdate(row)
    }
  }

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

      <RoleFormModal
        open={open}
        title={title}
        onCancel={cancel}
        onOk={submitForm}
        form={form}
        menuOptions={menuOptions}
        menuCheckedKeys={menuCheckedKeys}
        menuHalfCheckedKeys={menuHalfCheckedKeys}
        menuExpandedKeys={menuExpandedKeys}
        menuExpand={menuExpand}
        menuNodeAll={menuNodeAll}
        menuCheckStrictlyValue={menuCheckStrictlyValue}
        onMenuCheck={(checked, info) => {
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
        onMenuExpand={(keys) => setMenuExpandedKeys(keys)}
        onCheckedTreeExpand={handleCheckedTreeExpand}
        onCheckedTreeNodeAll={handleCheckedTreeNodeAll}
        onCheckedTreeConnect={handleCheckedTreeConnect}
        sysNormalDisable={sys_normal_disable.sys_normal_disable}
      />

      <RoleDataScopeModal
        open={openDataScope}
        title={title}
        onCancel={cancelDataScope}
        onOk={submitDataScope}
        form={dataScopeForm}
        dataScopeOptions={dataScopeOptions}
        dataScopeValue={dataScopeValue}
        deptOptions={deptOptions}
        deptCheckedKeys={deptCheckedKeys}
        deptHalfCheckedKeys={deptHalfCheckedKeys}
        deptExpandedKeys={deptExpandedKeys}
        deptExpand={deptExpand}
        deptNodeAll={deptNodeAll}
        deptCheckStrictlyValue={deptCheckStrictlyValue}
        onDeptCheck={(checked, info) => {
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
        onDeptExpand={(keys) => setDeptExpandedKeys(keys)}
        onCheckedTreeExpand={handleCheckedTreeExpand}
        onCheckedTreeNodeAll={handleCheckedTreeNodeAll}
        onCheckedTreeConnect={handleCheckedTreeConnect}
        onDataScopeSelectChange={dataScopeSelectChange}
      />
    </div>
  )
}

export default Role
