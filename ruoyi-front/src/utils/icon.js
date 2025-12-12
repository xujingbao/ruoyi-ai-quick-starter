import * as ElementPlusIconsVue from '@element-plus/icons-vue'

/**
 * 图标映射函数 - 将图标名称转换为 Element Plus 图标组件
 * @param {string} iconName - 图标名称（kebab-case 格式）
 * @returns {Component|null} - Element Plus 图标组件
 */
export function getIconComponent(iconName) {
  if (!iconName || iconName === '#') return null
  
  // 将 kebab-case 转换为 PascalCase
  const iconKey = iconName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')
  
  // 尝试直接匹配
  if (ElementPlusIconsVue[iconKey]) {
    return ElementPlusIconsVue[iconKey]
  }
  
  // 常见图标映射表
  const iconMap = {
    // 用户相关
    'user': 'User',
    'peoples': 'UserFilled',
    'phone': 'Phone',
    'email': 'Message',
    'password': 'Lock',
    'validCode': 'Key',
    
    // 系统相关
    'system': 'Setting',
    'config': 'Setting',
    'menu': 'Menu',
    'dashboard': 'Odometer',
    'monitor': 'Monitor',
    'tool': 'Tools',
    
    // 数据相关
    'dict': 'Collection',
    'data': 'Collection',
    'log': 'Document',
    'operlog': 'Document',
    'logininfor': 'User',
    
    // 组织相关
    'dept': 'OfficeBuilding',
    'post': 'Postcard',
    'role': 'UserFilled',
    'tree': 'Connection',
    
    // 功能相关
    'job': 'Timer',
    'online': 'User',
    'cache': 'Box',
    'server': 'Monitor',
    'notice': 'Bell',
    
    // UI 相关
    'table': 'Grid',
    'form': 'EditPen',
    'component': 'Grid',
    'chart': 'DataAnalysis',
    'example': 'Box',
    'nested': 'Menu',
    
    // 其他
    'documentation': 'Document',
    'guide': 'Guide',
    'search': 'Search',
    'github': 'Link',
    'question': 'QuestionFilled',
    'size': 'Operation',
    'fullscreen': 'FullScreen',
    'exit-fullscreen': 'Aim',
    'sunny': 'Sunny',
    'moon': 'Moon',
    'date': 'Calendar',
    'enter': 'Right'
  }
  
  const mappedIcon = iconMap[iconName] || 'Menu'
  return ElementPlusIconsVue[mappedIcon] || ElementPlusIconsVue['Menu']
}

/**
 * 获取所有可用的 Element Plus 图标名称列表
 * @returns {Array} 图标名称数组
 */
export function getAvailableIcons() {
  return Object.keys(ElementPlusIconsVue).filter(key => 
    key !== 'default' && typeof ElementPlusIconsVue[key] !== 'string'
  )
}

