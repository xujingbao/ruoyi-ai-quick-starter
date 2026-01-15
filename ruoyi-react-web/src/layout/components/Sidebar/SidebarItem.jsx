import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Menu } from 'antd'
import { getIconComponent } from '@/utils/icon'
import { isExternal } from '@/utils/validate'
import { getNormalPath } from '@/utils/ruoyi'
import AppLink from './Link'
import './SidebarItem.scss'

const SidebarItem = ({ item, isNest = false, basePath = '' }) => {
  const location = useLocation()

  if (item.hidden) {
    return null
  }

  const onlyOneChild = useMemo(() => {
    let child = {}
    const hasOneShowingChild = (children = [], parent) => {
      if (!children) {
        children = []
      }
      const showingChildren = children.filter(item => {
        if (item.hidden) {
          return false
        }
        child = item
        return true
      })

      if (showingChildren.length === 1) {
        return true
      }

      if (showingChildren.length === 0) {
        child = { ...parent, path: '', noShowingChildren: true }
        return true
      }

      return false
    }

    hasOneShowingChild(item.children, item)
    return child
  }, [item])

  const resolvePath = (routePath, routeQuery) => {
    if (isExternal(routePath)) {
      return routePath
    }
    if (isExternal(basePath)) {
      return basePath
    }
    if (routeQuery) {
      let query = JSON.parse(routeQuery)
      return { path: getNormalPath(basePath + '/' + routePath), query: query }
    }
    return getNormalPath(basePath + '/' + routePath)
  }

  const hasOneShowing = useMemo(() => {
    if (!item.children || item.children.length === 0) {
      return false
    }
    const showingChildren = item.children.filter(child => !child.hidden)
    return showingChildren.length === 1 && (!onlyOneChild.children || onlyOneChild.noShowingChildren) && !item.alwaysShow
  }, [item, onlyOneChild])

  if (hasOneShowing && onlyOneChild.meta) {
    const path = resolvePath(onlyOneChild.path, onlyOneChild.query)
    const icon = onlyOneChild.meta.icon || (item.meta && item.meta.icon)
    const IconComponent = icon ? getIconComponent(icon) : null

    return (
      <Menu.Item key={typeof path === 'string' ? path : path.path}>
        <AppLink to={path}>
          {IconComponent && <IconComponent />}
          <span className="menu-title">{onlyOneChild.meta.title}</span>
        </AppLink>
      </Menu.Item>
    )
  }

  const path = resolvePath(item.path)
  const icon = item.meta && item.meta.icon
  const IconComponent = icon ? getIconComponent(icon) : null

  return (
    <Menu.SubMenu
      key={typeof path === 'string' ? path : path.path}
      title={
        <>
          {IconComponent && <IconComponent />}
          <span className="menu-title">{item.meta?.title}</span>
        </>
      }
      className={isNest ? 'nest-menu' : ''}
    >
      {item.children?.map((child, index) => (
        <SidebarItem
          key={child.path + index}
          item={child}
          isNest={true}
          basePath={resolvePath(child.path)}
        />
      ))}
    </Menu.SubMenu>
  )
}

export default SidebarItem
