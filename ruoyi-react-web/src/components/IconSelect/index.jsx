import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import * as AntdIcons from '@ant-design/icons'
import { getIconComponent } from '@/utils/icon'
import './index.scss'

const IconSelect = forwardRef(({ activeIcon, onSelected }, ref) => {
  const [iconName, setIconName] = useState('')
  const [iconList, setIconList] = useState([])

  // 将 PascalCase 转换为 kebab-case
  const toKebabCase = (str) => {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  }

  // 获取所有 Ant Design 图标
  useEffect(() => {
    const icons = []
    for (const key in AntdIcons) {
      if (key !== 'default' && typeof AntdIcons[key] !== 'string' && key.endsWith('Outlined')) {
        const component = AntdIcons[key]
        const originalName = key
        const kebabName = toKebabCase(key.replace('Outlined', ''))
        icons.push({
          name: kebabName,
          originalName: originalName,
          component: component
        })
      }
    }
    const sortedIcons = icons.sort((a, b) => a.name.localeCompare(b.name))
    setIconList(sortedIcons)
  }, [])

  // 过滤图标
  useEffect(() => {
    if (!iconName) {
      const icons = []
      for (const key in AntdIcons) {
        if (key !== 'default' && typeof AntdIcons[key] !== 'string' && key.endsWith('Outlined')) {
          const component = AntdIcons[key]
          const originalName = key
          const kebabName = toKebabCase(key.replace('Outlined', ''))
          icons.push({
            name: kebabName,
            originalName: originalName,
            component: component
          })
        }
      }
      setIconList(icons.sort((a, b) => a.name.localeCompare(b.name)))
      return
    }

    const searchText = iconName.toLowerCase()
    const icons = []
    for (const key in AntdIcons) {
      if (key !== 'default' && typeof AntdIcons[key] !== 'string' && key.endsWith('Outlined')) {
        const component = AntdIcons[key]
        const originalName = key
        const kebabName = toKebabCase(key.replace('Outlined', ''))
        if (kebabName.toLowerCase().includes(searchText) || originalName.toLowerCase().includes(searchText)) {
          icons.push({
            name: kebabName,
            originalName: originalName,
            component: component
          })
        }
      }
    }
    setIconList(icons.sort((a, b) => a.name.localeCompare(b.name)))
  }, [iconName])

  const selectedIcon = (name) => {
    if (onSelected) {
      onSelected(name)
    }
  }

  const isActive = (name) => {
    if (!activeIcon) return false
    if (activeIcon === name) return true
    const activeKebab = toKebabCase(activeIcon)
    return activeKebab === name
  }

  const reset = () => {
    setIconName('')
  }

  useImperativeHandle(ref, () => ({
    reset
  }))

  const IconComponent = getIconComponent

  return (
    <div className="icon-body">
      <Input
        value={iconName}
        onChange={(e) => setIconName(e.target.value)}
        placeholder="请输入图标名称搜索"
        allowClear
        prefix={<SearchOutlined />}
        className="icon-search"
      />
      <div className="icon-list">
        <div className="list-container">
          {iconList.map((item, index) => {
            const Icon = item.component
            return (
              <div
                key={index}
                className="icon-item-wrapper"
                onClick={() => selectedIcon(item.name)}
              >
                <div className={`icon-item ${isActive(item.name) ? 'active' : ''}`}>
                  <Icon className="icon" />
                  <div className="icon-text">
                    <span className="icon-name">{item.name}</span>
                    {item.originalName !== item.name && (
                      <span className="icon-original-name">{item.originalName}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
})

IconSelect.displayName = 'IconSelect'

export default IconSelect
