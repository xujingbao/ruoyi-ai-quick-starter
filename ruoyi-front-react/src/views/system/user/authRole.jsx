import { useState, useEffect, useRef } from 'react'
import { Form, Input, Table, Button, Space } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { getAuthRole, updateAuthRole } from '@/api/system/user'
import { parseTime } from '@/utils/ruoyi'
import modal from '@/plugins/modal'
import { useTagsViewStore } from '@/store/tagsViewStore'
import Pagination from '@/components/Pagination'
import './index.scss'

const AuthRole = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const tagsViewStore = useTagsViewStore()
  const [form] = Form.useForm()
  const roleTableRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [roles, setRoles] = useState([])
  const [userInfo, setUserInfo] = useState({
    nickName: undefined,
    userName: undefined,
    userId: undefined
  })

  useEffect(() => {
    if (userId) {
      getData()
    }
  }, [userId])

  const getData = async () => {
    setLoading(true)
    try {
      const response = await getAuthRole(userId)
      setUserInfo(response.user || {})
      const rolesList = response.roles || []
      setRoles(rolesList)
      setTotal(rolesList.length)
      
      // 设置已选中的角色
      const selectedIds = rolesList.filter(row => row.flag).map(row => row.roleId)
      setSelectedRowKeys(selectedIds)
    } catch (error) {
      console.error('Failed to get auth role:', error)
    } finally {
      setLoading(false)
    }
  }

  // 检查角色是否可选
  const checkSelectable = (record) => {
    return record.status === '0'
  }

  // 表格选择变化
  const handleSelectionChange = (selectedRowKeys) => {
    setSelectedRowKeys(selectedRowKeys)
  }

  // 行点击
  const handleRowClick = (record) => {
    if (checkSelectable(record)) {
      const newSelectedKeys = [...selectedRowKeys]
      const index = newSelectedKeys.indexOf(record.roleId)
      if (index > -1) {
        newSelectedKeys.splice(index, 1)
      } else {
        newSelectedKeys.push(record.roleId)
      }
      setSelectedRowKeys(newSelectedKeys)
    }
  }

  // 分页变化
  const handlePagination = ({ page, limit }) => {
    setPageNum(page)
    setPageSize(limit)
  }

  // 提交
  const submitForm = async () => {
    const rIds = selectedRowKeys.join(',')
    try {
      await updateAuthRole({ userId: userInfo.userId, roleIds: rIds })
      modal.msgSuccess('授权成功')
      close()
    } catch (error) {
      console.error('Failed to update auth role:', error)
    }
  }

  // 关闭
  const close = () => {
    const view = tagsViewStore.visitedViews.find(v => v.path === '/system/user')
    if (view) {
      navigate('/system/user')
    } else {
      navigate(-1)
    }
  }

  // 分页数据
  const paginatedRoles = roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 80,
      align: 'center',
      render: (_, __, index) => (pageNum - 1) * pageSize + index + 1
    },
    {
      title: '角色编号',
      dataIndex: 'roleId',
      key: 'roleId',
      align: 'center'
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
      align: 'center'
    },
    {
      title: '权限字符',
      dataIndex: 'roleKey',
      key: 'roleKey',
      align: 'center'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      align: 'center',
      width: 180,
      render: (text) => parseTime(text)
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectionChange,
    getCheckboxProps: (record) => ({
      disabled: !checkSelectable(record)
    }),
    preserveSelectedRowKeys: true
  }

  return (
    <div className="app-container">
      <h4 className="form-header">基本信息</h4>
      <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label="用户昵称">
          <Input value={userInfo.nickName} disabled />
        </Form.Item>
        <Form.Item label="登录账号">
          <Input value={userInfo.userName} disabled />
        </Form.Item>
      </Form>

      <h4 className="form-header">角色信息</h4>
      <Table
        ref={roleTableRef}
        loading={loading}
        rowKey="roleId"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={paginatedRoles}
        onRow={(record) => ({
          onClick: () => handleRowClick(record)
        })}
        pagination={false}
      />

      <Pagination
        total={total}
        page={pageNum}
        limit={pageSize}
        onChange={handlePagination}
      />

      <div className="form-actions">
        <Space>
          <Button type="primary" onClick={submitForm}>
            提交
          </Button>
          <Button onClick={close}>
            返回
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default AuthRole
