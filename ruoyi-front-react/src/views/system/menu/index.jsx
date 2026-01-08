import { useState, useEffect, useRef } from 'react'
import { Form, Input, InputNumber, Select, Button, Table, Modal, Radio, Popover, Tooltip, Space } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, SortAscendingOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { listMenu, getMenu, addMenu, updateMenu, delMenu } from '@/api/system/menu'
import { useDict } from '@/utils/dict'
import { parseTime, handleTree } from '@/utils/ruoyi'
import { getIconComponent } from '@/utils/icon'
import modal from '@/plugins/modal'
import auth from '@/plugins/auth'
import RightToolbar from '@/components/RightToolbar'
import IconSelect from '@/components/IconSelect'
import { TreeSelect } from 'antd'
import './index.scss'

const { TextArea } = Input

const Menu = () => {
  const [form] = Form.useForm()
  const [queryForm] = Form.useForm()
  const iconSelectRef = useRef(null)

  const [menuList, setMenuList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(true)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [menuOptions, setMenuOptions] = useState([])
  const [isExpandAll, setIsExpandAll] = useState(false)
  const [refreshTable, setRefreshTable] = useState(true)

  const sys_show_hide = useDict('sys_show_hide')
  const sys_normal_disable = useDict('sys_normal_disable')

  const [queryParams, setQueryParams] = useState({
    menuName: undefined,
    visible: undefined
  })

  useEffect(() => {
    getList()
  }, [queryParams])

  // 查询菜单列表
  const getList = async () => {
    setLoading(true)
    try {
      const response = await listMenu(queryParams)
      const treeData = handleTree(response.data, 'menuId')
      setMenuList(treeData || [])
    } catch (error) {
      console.error('Failed to get menu list:', error)
    } finally {
      setLoading(false)
    }
  }

  // 查询菜单下拉树结构
  const getTreeselect = async () => {
    try {
      const response = await listMenu()
      const menu = { menuId: 0, menuName: '主类目', children: [] }
      menu.children = handleTree(response.data, 'menuId')
      setMenuOptions([menu])
    } catch (error) {
      console.error('Failed to get menu tree:', error)
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
      menuName: undefined,
      visible: undefined
    })
    getList()
  }

  // 新增
  const handleAdd = async (row) => {
    reset()
    await getTreeselect()
    if (row != null && row.menuId) {
      form.setFieldValue('parentId', row.menuId)
    } else {
      form.setFieldValue('parentId', 0)
    }
    setOpen(true)
    setTitle('添加菜单')
  }

  // 修改
  const handleUpdate = async (row) => {
    reset()
    if (!row || !row.menuId) {
      modal.msgWarning('请选择要修改的菜单')
      return
    }

    await getTreeselect()
    try {
      const response = await getMenu(row.menuId)
      form.setFieldsValue(response.data)
      setOpen(true)
      setTitle('修改菜单')
    } catch (error) {
      console.error('Failed to get menu:', error)
      modal.msgError('获取菜单信息失败')
    }
  }

  // 删除
  const handleDelete = (row) => {
    Modal.confirm({
      title: '提示',
      content: `是否确认删除名称为"${row.menuName}"的数据项?`,
      onOk: async () => {
        try {
          await delMenu(row.menuId)
          modal.msgSuccess('删除成功')
          getList()
        } catch (error) {
          console.error('Failed to delete menu:', error)
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
      menuId: undefined,
      parentId: 0,
      menuName: undefined,
      icon: undefined,
      menuType: 'M',
      orderNum: undefined,
      isFrame: '1',
      isCache: '0',
      visible: '0',
      status: '0'
    })
    if (iconSelectRef.current) {
      iconSelectRef.current.reset()
    }
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
      if (values.menuId !== undefined && values.menuId !== null && values.menuId !== '') {
        await updateMenu(values)
        modal.msgSuccess('修改成功')
      } else {
        await addMenu(values)
        modal.msgSuccess('新增成功')
      }
      setOpen(false)
      getList()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  // 选择图标
  const selectedIcon = (name) => {
    form.setFieldValue('icon', name)
  }

  // 展示下拉图标
  const showSelectIcon = () => {
    if (iconSelectRef.current) {
      iconSelectRef.current.reset()
    }
  }

  // 双击行
  const handleRowDblClick = (row) => {
    if (auth.hasPermiOr(['system:menu:edit'])) {
      handleUpdate(row)
    }
  }

  // 表格列定义
  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'menuName',
      key: 'menuName',
      ellipsis: true,
      width: 160
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      align: 'center',
      width: 100,
      render: (icon) => {
        if (!icon || icon === '#') return '-'
        const IconComponent = getIconComponent(icon)
        return IconComponent ? <IconComponent /> : '-'
      }
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      key: 'orderNum',
      width: 60
    },
    {
      title: '权限标识',
      dataIndex: 'perms',
      key: 'perms',
      ellipsis: true
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      key: 'component',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
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
      width: 160,
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
          {auth.hasPermiOr(['system:menu:edit']) && (
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
          {auth.hasPermiOr(['system:menu:add']) && (
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
          {auth.hasPermiOr(['system:menu:remove']) && (
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
        <Form.Item label="菜单名称" name="menuName">
          <Input
            placeholder="请输入菜单名称"
            style={{ width: 200 }}
            onPressEnter={handleQuery}
            allowClear
          />
        </Form.Item>
        <Form.Item label="状态" name="visible">
          <Select
            placeholder="菜单状态"
            style={{ width: 200 }}
            allowClear
          >
            {sys_show_hide.sys_show_hide?.map(dict => (
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
          {auth.hasPermiOr(['system:menu:add']) && (
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
          dataSource={menuList}
          columns={columns}
          rowKey="menuId"
          defaultExpandAllRows={isExpandAll}
          onRow={(record) => ({
            onDoubleClick: () => handleRowDblClick(record)
          })}
          pagination={false}
        />
      )}

      {/* 添加或修改菜单对话框 */}
      <Modal
        title={title}
        open={open}
        onCancel={cancel}
        onOk={submitForm}
        width={680}
        destroyOnHidden
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          {/* 关键：编辑时需要带上 menuId，否则 submitForm 会误判为新增 */}
          <Form.Item name="menuId" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="上级菜单" name="parentId">
            <TreeSelect
              treeData={menuOptions}
              fieldNames={{ label: 'menuName', value: 'menuId', children: 'children' }}
              placeholder="选择上级菜单"
              treeDefaultExpandAll
              allowClear
            />
          </Form.Item>
          <Form.Item
            label="菜单类型"
            name="menuType"
            rules={[{ required: true, message: '菜单类型不能为空' }]}
          >
            <Radio.Group>
              <Radio value="M">目录</Radio>
              <Radio value="C">菜单</Radio>
              <Radio value="F">按钮</Radio>
            </Radio.Group>
          </Form.Item>
          {form.getFieldValue('menuType') !== 'F' && (
            <Form.Item label="菜单图标" name="icon">
              <Popover
                placement="bottom"
                title="选择图标"
                content={
                  <IconSelect
                    ref={iconSelectRef}
                    activeIcon={form.getFieldValue('icon')}
                    onSelected={selectedIcon}
                  />
                }
                trigger="click"
              >
                <Input
                  value={form.getFieldValue('icon')}
                  placeholder="点击选择图标"
                  readOnly
                  onFocus={showSelectIcon}
                  prefix={
                    form.getFieldValue('icon') ? (
                      (() => {
                        const IconComponent = getIconComponent(form.getFieldValue('icon'))
                        return IconComponent ? <IconComponent /> : <SearchOutlined />
                      })()
                    ) : (
                      <SearchOutlined />
                    )
                  }
                />
              </Popover>
            </Form.Item>
          )}
          <Form.Item
            label="显示排序"
            name="orderNum"
            rules={[{ required: true, message: '菜单顺序不能为空' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="菜单名称"
            name="menuName"
            rules={[{ required: true, message: '菜单名称不能为空' }]}
          >
            <Input placeholder="请输入菜单名称" />
          </Form.Item>
          {form.getFieldValue('menuType') === 'C' && (
            <Form.Item
              label={
                <span>
                  <Tooltip title="默认不填则和路由地址相同：如地址为：`user`，则名称为`User`（注意：因为router会删除名称相同路由，为避免名字的冲突，特殊情况下请自定义，保证唯一性）">
                    <QuestionCircleOutlined style={{ marginRight: 4 }} />
                  </Tooltip>
                  路由名称
                </span>
              }
              name="routeName"
            >
              <Input placeholder="请输入路由名称" />
            </Form.Item>
          )}
          {form.getFieldValue('menuType') !== 'F' && (
            <Form.Item
              label={
                <span>
                  <Tooltip title="选择是外链则路由地址需要以`http(s)://`开头">
                    <QuestionCircleOutlined style={{ marginRight: 4 }} />
                  </Tooltip>
                  是否外链
                </span>
              }
              name="isFrame"
            >
              <Radio.Group>
                <Radio value="0">是</Radio>
                <Radio value="1">否</Radio>
              </Radio.Group>
            </Form.Item>
          )}
          {form.getFieldValue('menuType') !== 'F' && (
            <Form.Item
              label={
                <span>
                  <Tooltip title="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头">
                    <QuestionCircleOutlined style={{ marginRight: 4 }} />
                  </Tooltip>
                  路由地址
                </span>
              }
              name="path"
              rules={[{ required: true, message: '路由地址不能为空' }]}
            >
              <Input placeholder="请输入路由地址" />
            </Form.Item>
          )}
          {form.getFieldValue('menuType') === 'C' && (
            <Form.Item
              label={
                <span>
                  <Tooltip title="访问的组件路径，如：`system/user/index`，默认在`views`目录下">
                    <QuestionCircleOutlined style={{ marginRight: 4 }} />
                  </Tooltip>
                  组件路径
                </span>
              }
              name="component"
            >
              <Input placeholder="请输入组件路径" />
            </Form.Item>
          )}
          {form.getFieldValue('menuType') !== 'M' && (
            <Form.Item
              label={
                <span>
                  <Tooltip title="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)">
                    <QuestionCircleOutlined style={{ marginRight: 4 }} />
                  </Tooltip>
                  权限字符
                </span>
              }
              name="perms"
            >
              <Input placeholder="请输入权限标识" maxLength={100} />
            </Form.Item>
          )}
          {form.getFieldValue('menuType') === 'C' && (
            <Form.Item
              label={
                <span>
                  <Tooltip title='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`'>
                    <QuestionCircleOutlined style={{ marginRight: 4 }} />
                  </Tooltip>
                  路由参数
                </span>
              }
              name="query"
            >
              <Input placeholder="请输入路由参数" maxLength={255} />
            </Form.Item>
          )}
          {form.getFieldValue('menuType') === 'C' && (
            <Form.Item
              label={
                <span>
                  <Tooltip title="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致">
                    <QuestionCircleOutlined style={{ marginRight: 4 }} />
                  </Tooltip>
                  是否缓存
                </span>
              }
              name="isCache"
            >
              <Radio.Group>
                <Radio value="0">缓存</Radio>
                <Radio value="1">不缓存</Radio>
              </Radio.Group>
            </Form.Item>
          )}
          {form.getFieldValue('menuType') !== 'F' && (
            <Form.Item
              label={
                <span>
                  <Tooltip title="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问">
                    <QuestionCircleOutlined style={{ marginRight: 4 }} />
                  </Tooltip>
                  显示状态
                </span>
              }
              name="visible"
            >
              <Radio.Group>
                {sys_show_hide.sys_show_hide?.map(dict => (
                  <Radio key={dict.value} value={dict.value}>
                    {dict.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          )}
          <Form.Item
            label={
              <span>
                <Tooltip title="选择停用则路由将不会出现在侧边栏，也不能被访问">
                  <QuestionCircleOutlined style={{ marginRight: 4 }} />
                </Tooltip>
                菜单状态
              </span>
            }
            name="status"
          >
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

export default Menu
