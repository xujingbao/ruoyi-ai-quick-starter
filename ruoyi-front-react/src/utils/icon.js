import * as AntdIcons from '@ant-design/icons'

/**
 * 图标映射函数 - 将图标名称转换为 Ant Design 图标组件
 * @param {string} iconName - 图标名称（kebab-case 格式）
 * @returns {Component|null} - Ant Design 图标组件
 */
export function getIconComponent(iconName) {
  if (!iconName || iconName === '#') return null
  
  // 将 kebab-case 转换为 PascalCase
  const iconKey = iconName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')
  
  // 尝试直接匹配
  if (AntdIcons[iconKey]) {
    return AntdIcons[iconKey]
  }
  
  // 常见图标映射表
  const iconMap = {
    // 用户相关
    'user': 'UserOutlined',
    'peoples': 'TeamOutlined',
    'phone': 'PhoneOutlined',
    'email': 'MailOutlined',
    'password': 'LockOutlined',
    'validCode': 'KeyOutlined',
    
    // 系统相关
    'system': 'SettingOutlined',
    'config': 'SettingOutlined',
    'menu': 'MenuOutlined',
    'dashboard': 'DashboardOutlined',
    'monitor': 'MonitorOutlined',
    'tool': 'ToolOutlined',
    
    // 数据相关
    'dict': 'DatabaseOutlined',
    'data': 'DatabaseOutlined',
    'log': 'FileTextOutlined',
    'operlog': 'FileTextOutlined',
    'logininfor': 'UserOutlined',
    
    // 组织相关
    'dept': 'ApartmentOutlined',
    'post': 'IdcardOutlined',
    'role': 'TeamOutlined',
    'tree': 'ClusterOutlined',
    
    // 功能相关
    'job': 'ClockCircleOutlined',
    'online': 'UserOutlined',
    'cache': 'HddOutlined',
    'server': 'MonitorOutlined',
    'notice': 'BellOutlined',
    
    // UI 相关
    'table': 'TableOutlined',
    'form': 'FormOutlined',
    'component': 'AppstoreOutlined',
    'chart': 'BarChartOutlined',
    'example': 'AppstoreOutlined',
    'nested': 'MenuOutlined',
    
    // AI 相关
    'robot': 'RobotOutlined',
    'message': 'MessageOutlined',
    'chat': 'WechatOutlined',
    
    // 其他
    'documentation': 'FileTextOutlined',
    'guide': 'BookOutlined',
    'search': 'SearchOutlined',
    'github': 'GithubOutlined',
    'question': 'QuestionCircleOutlined',
    'size': 'ColumnWidthOutlined',
    'fullscreen': 'FullscreenOutlined',
    'exit-fullscreen': 'FullscreenExitOutlined',
    'sunny': 'SunOutlined',
    'moon': 'MoonOutlined',
    'date': 'CalendarOutlined',
    'enter': 'RightOutlined'
  }
  
  const mappedIcon = iconMap[iconName] || 'MenuOutlined'
  return AntdIcons[mappedIcon] || AntdIcons['MenuOutlined']
}

/**
 * 获取所有可用的 Ant Design 图标名称列表
 * @returns {Array} 图标名称数组
 */
export function getAvailableIcons() {
  return Object.keys(AntdIcons).filter(key => 
    key !== 'default' && typeof AntdIcons[key] !== 'string' && key.endsWith('Outlined')
  )
}
