import { useState, forwardRef, useImperativeHandle } from 'react'
import { Drawer, Switch, ColorPicker, Button, Divider, message } from 'antd'
import { SaveOutlined, ReloadOutlined, CheckOutlined } from '@ant-design/icons'
import { useAppStore } from '@/store/appStore'
import { useSettingsStore } from '@/store/settingsStore'
import { usePermissionStore } from '@/store/permissionStore'
import { handleThemeStyle } from '@/utils/theme'
import modal from '@/plugins/modal'
import './index.scss'

const Settings = forwardRef((props, ref) => {
  const [showSettings, setShowSettings] = useState(false)
  const settingsStore = useSettingsStore()
  const appStore = useAppStore()
  const permissionStore = usePermissionStore()
  
  const [theme, setTheme] = useState(settingsStore.theme)
  const [sideTheme, setSideTheme] = useState(settingsStore.sideTheme)
  
  const predefineColors = ["#409EFF", "#ff4500", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#1e90ff", "#c71585"]

  useImperativeHandle(ref, () => ({
    openSetting: () => {
      setShowSettings(true)
    }
  }))

  const topNavChange = (val) => {
    if (!val) {
      appStore.toggleSideBarHide(false)
      permissionStore.setSidebarRouters(permissionStore.defaultRoutes)
    }
  }

  const dynamicTitleChange = () => {
    settingsStore.setTitle(settingsStore.title)
  }

  const themeChange = (val) => {
    const color = typeof val === 'string' ? val : val.toHexString()
    setTheme(color)
    settingsStore.changeSetting({ key: 'theme', value: color })
    handleThemeStyle(color)
  }

  const handleTheme = (val) => {
    setSideTheme(val)
    settingsStore.changeSetting({ key: 'sideTheme', value: val })
  }

  const saveSetting = () => {
    modal.loading("正在保存到本地，请稍候...")
    let layoutSetting = {
      "topNav": settingsStore.topNav,
      "tagsView": settingsStore.tagsView,
      "tagsIcon": settingsStore.tagsIcon,
      "fixedHeader": settingsStore.fixedHeader,
      "sidebarLogo": settingsStore.sidebarLogo,
      "dynamicTitle": settingsStore.dynamicTitle,
      "footerVisible": settingsStore.footerVisible,
      "sideTheme": settingsStore.sideTheme,
      "theme": settingsStore.theme
    }
    localStorage.setItem("layout-setting", JSON.stringify(layoutSetting))
    setTimeout(() => {
      modal.closeLoading()
      message.success('保存成功')
    }, 1000)
  }

  const resetSetting = () => {
    modal.loading("正在清除设置缓存并刷新，请稍候...")
    localStorage.removeItem("layout-setting")
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <Drawer
      title={null}
      placement="right"
      open={showSettings}
      onClose={() => setShowSettings(false)}
      width={300}
      maskClosable={false}
      styles={{ body: { padding: '20px' } }}
    >
      <div className="setting-drawer-title">
        <h3 className="drawer-title">主题风格设置</h3>
      </div>
      <div className="setting-drawer-block-checbox">
        <div 
          className="setting-drawer-block-checbox-item" 
          onClick={() => handleTheme('theme-dark')}
        >
          <div style={{ width: 48, height: 48, background: '#304156' }}></div>
          {sideTheme === 'theme-dark' && (
            <div className="setting-drawer-block-checbox-selectIcon">
              <CheckOutlined style={{ color: theme }} />
            </div>
          )}
        </div>
        <div 
          className="setting-drawer-block-checbox-item" 
          onClick={() => handleTheme('theme-light')}
        >
          <div style={{ width: 48, height: 48, background: '#fff', border: '1px solid #e4e7ed' }}></div>
          {sideTheme === 'theme-light' && (
            <div className="setting-drawer-block-checbox-selectIcon">
              <CheckOutlined style={{ color: theme }} />
            </div>
          )}
        </div>
      </div>
      <div className="drawer-item">
        <span>主题颜色</span>
        <span className="comp-style">
          <ColorPicker 
            value={theme} 
            presets={[{ label: '预设颜色', colors: predefineColors }]}
            onChange={themeChange}
          />
        </span>
      </div>
      <Divider />

      <h3 className="drawer-title">系统布局配置</h3>

      <div className="drawer-item">
        <span>开启 TopNav</span>
        <span className="comp-style">
          <Switch 
            checked={settingsStore.topNav} 
            onChange={(val) => {
              settingsStore.changeSetting({ key: 'topNav', value: val })
              topNavChange(val)
            }}
          />
        </span>
      </div>

      <div className="drawer-item">
        <span>开启 Tags-Views</span>
        <span className="comp-style">
          <Switch 
            checked={settingsStore.tagsView}
            onChange={(val) => settingsStore.changeSetting({ key: 'tagsView', value: val })}
          />
        </span>
      </div>

      <div className="drawer-item">
        <span>显示页签图标</span>
        <span className="comp-style">
          <Switch 
            checked={settingsStore.tagsIcon}
            disabled={!settingsStore.tagsView}
            onChange={(val) => settingsStore.changeSetting({ key: 'tagsIcon', value: val })}
          />
        </span>
      </div>

      <div className="drawer-item">
        <span>固定 Header</span>
        <span className="comp-style">
          <Switch 
            checked={settingsStore.fixedHeader}
            onChange={(val) => settingsStore.changeSetting({ key: 'fixedHeader', value: val })}
          />
        </span>
      </div>

      <div className="drawer-item">
        <span>显示 Logo</span>
        <span className="comp-style">
          <Switch 
            checked={settingsStore.sidebarLogo}
            onChange={(val) => settingsStore.changeSetting({ key: 'sidebarLogo', value: val })}
          />
        </span>
      </div>

      <div className="drawer-item">
        <span>动态标题</span>
        <span className="comp-style">
          <Switch 
            checked={settingsStore.dynamicTitle}
            onChange={(val) => {
              settingsStore.changeSetting({ key: 'dynamicTitle', value: val })
              dynamicTitleChange()
            }}
          />
        </span>
      </div>

      <div className="drawer-item">
        <span>底部版权</span>
        <span className="comp-style">
          <Switch 
            checked={settingsStore.footerVisible}
            onChange={(val) => settingsStore.changeSetting({ key: 'footerVisible', value: val })}
          />
        </span>
      </div>

      <Divider />

      <Button type="primary" icon={<SaveOutlined />} onClick={saveSetting} style={{ marginRight: 8 }}>
        保存配置
      </Button>
      <Button icon={<ReloadOutlined />} onClick={resetSetting}>
        重置配置
      </Button>
    </Drawer>
  )
})

Settings.displayName = 'Settings'

export default Settings
