import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown, Tooltip, Modal } from 'antd'
import { SunOutlined, MoonOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store/appStore'
import { useUserStore } from '@/store/userStore'
import { useSettingsStore } from '@/store/settingsStore'
import Hamburger from '@/components/Hamburger'
import { navbarMenuConfig } from '@/config/routeMeta'
import './index.scss'

const Navbar = ({ onSetLayout }) => {
  const navigate = useNavigate()
  const appStore = useAppStore()
  const userStore = useUserStore()
  const settingsStore = useSettingsStore()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleSideBar = () => {
    appStore.toggleSideBar()
  }

  const handleCommand = (command) => {
    switch (command) {
      case 'setLayout':
        onSetLayout?.()
        break
      case 'logout':
        logout()
        break
      default:
        break
    }
  }

  const logout = () => {
    Modal.confirm({
      title: '提示',
      content: '确定注销并退出系统吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        userStore.logOut().then(() => {
          window.location.href = '/login'
        })
      }
    })
  }

  const toggleTheme = () => {
    settingsStore.toggleTheme()
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const menuItems = navbarMenuConfig.reduce((result, item) => {
    if (item.type === 'divider') {
      result.push({ type: 'divider' })
      return result
    }
    if (item.requiresSettings && !settingsStore.showSettings) {
      return result
    }
    const label = item.path ? (
      <a href={item.path} onClick={(e) => { e.preventDefault(); navigate(item.path) }}>
        {item.label}
      </a>
    ) : (
      <span>{item.label}</span>
    )
    result.push({ key: item.key, label })
    return result
  }, [])

  return (
    <div className="navbar">
      <Hamburger
        id="hamburger-container"
        isActive={appStore.sidebar.opened}
        onClick={toggleSideBar}
        className="hamburger-container"
      />
      
      <div className="right-menu">
        {appStore.device !== 'mobile' && (
          <>
            <Tooltip title="主题模式" placement="bottom">
              <div className="right-menu-item hover-effect theme-switch-wrapper" onClick={toggleTheme}>
                {settingsStore.isDark ? (
                  <SunOutlined className="theme-icon" />
                ) : (
                  <MoonOutlined className="theme-icon" />
                )}
              </div>
            </Tooltip>

            <Tooltip title="全屏" placement="bottom">
              <div className="right-menu-item hover-effect" onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              </div>
            </Tooltip>
          </>
        )}

        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key }) => handleCommand(key)
          }}
          trigger={['hover']}
          placement="bottomRight"
        >
          <div className="avatar-container right-menu-item hover-effect">
            <div className="avatar-wrapper">
              <img src={userStore.avatar} className="user-avatar" alt="avatar" />
              <div className="user-info">
                <span className="user-nickname">{userStore.nickName}</span>
                {userStore.deptName && (
                  <span className="user-dept">{userStore.deptName}</span>
                )}
              </div>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}

export default Navbar
