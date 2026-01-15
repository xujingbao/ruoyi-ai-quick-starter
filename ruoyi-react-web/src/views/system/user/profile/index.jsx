import { useState, useEffect } from 'react'
import { Row, Col, Card, Tabs } from 'antd'
import { UserOutlined, PhoneOutlined, MailOutlined, ApartmentOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons'
import { getUserProfile } from '@/api/system/user'
import UserAvatar from './userAvatar'
import UserInfo from './userInfo'
import ResetPwd from './resetPwd'
import { useSearchParams } from 'react-router-dom'
import './index.scss'

const UserProfile = () => {
  const [searchParams] = useSearchParams()
  const [selectedTab, setSelectedTab] = useState('userinfo')
  const [user, setUser] = useState({})
  const [roleGroup, setRoleGroup] = useState('')
  const [postGroup, setPostGroup] = useState('')

  useEffect(() => {
    const activeTab = searchParams.get('activeTab')
    if (activeTab) {
      setSelectedTab(activeTab)
    }
    getUser()
  }, [searchParams])

  const getUser = async () => {
    try {
      const response = await getUserProfile()
      setUser(response.data || {})
      setRoleGroup(response.roleGroup || '')
      setPostGroup(response.postGroup || '')
    } catch (error) {
      console.error('Failed to get user profile:', error)
    }
  }

  const tabItems = [
    {
      key: 'userinfo',
      label: '基本资料',
      children: <UserInfo user={user} />
    },
    {
      key: 'resetPwd',
      label: '修改密码',
      children: <ResetPwd />
    }
  ]

  return (
    <div className="app-container no-card profile-container">
      <Row gutter={20}>
        <Col xs={24} sm={24} md={6}>
          <Card className="profile-card info-card" hoverable>
            <div className="card-header">
              <span className="card-title">个人信息</span>
            </div>
            <div className="profile-content">
              <div className="avatar-container">
                <UserAvatar />
              </div>
              <ul className="info-list">
                <li className="info-item">
                  <div className="info-label">
                    <UserOutlined className="info-icon" />
                    <span>用户名称</span>
                  </div>
                  <div className="info-value">{user.userName || '-'}</div>
                </li>
                <li className="info-item">
                  <div className="info-label">
                    <PhoneOutlined className="info-icon" />
                    <span>手机号码</span>
                  </div>
                  <div className="info-value">{user.phonenumber || '-'}</div>
                </li>
                <li className="info-item">
                  <div className="info-label">
                    <MailOutlined className="info-icon" />
                    <span>用户邮箱</span>
                  </div>
                  <div className="info-value">{user.email || '-'}</div>
                </li>
                <li className="info-item">
                  <div className="info-label">
                    <ApartmentOutlined className="info-icon" />
                    <span>所属部门</span>
                  </div>
                  <div className="info-value">
                    {user.dept ? `${user.dept.deptName} / ${postGroup}` : '-'}
                  </div>
                </li>
                <li className="info-item">
                  <div className="info-label">
                    <TeamOutlined className="info-icon" />
                    <span>所属角色</span>
                  </div>
                  <div className="info-value">{roleGroup || '-'}</div>
                </li>
                <li className="info-item">
                  <div className="info-label">
                    <CalendarOutlined className="info-icon" />
                    <span>创建日期</span>
                  </div>
                  <div className="info-value">{user.createTime || '-'}</div>
                </li>
              </ul>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={18}>
          <Card className="profile-card form-card" hoverable>
            <div className="card-header">
              <span className="card-title">基本资料</span>
            </div>
            <Tabs
              activeKey={selectedTab}
              onChange={setSelectedTab}
              className="profile-tabs"
              items={tabItems}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default UserProfile
