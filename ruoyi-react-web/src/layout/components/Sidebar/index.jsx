import { useMemo, startTransition } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu } from 'antd'
import { useAppStore } from '@/store/appStore'
import { useSettingsStore } from '@/store/settingsStore'
import { usePermissionStore } from '@/store/permissionStore'
import variables from '@/assets/styles/variables.module.scss'
import { getIconComponent } from '@/utils/icon'
import { isExternal } from '@/utils/validate'
import { getNormalPath } from '@/utils/ruoyi'
import Logo from './Logo'
import './index.scss'

const Sidebar = ({ className }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const sidebarRouters = usePermissionStore((state) => state.sidebarRouters)
  const showLogo = useSettingsStore((state) => state.sidebarLogo)
  const sideTheme = useSettingsStore((state) => state.sideTheme)
  const theme = useSettingsStore((state) => state.theme)
  const isDark = useSettingsStore((state) => state.isDark)
  const isCollapse = !useAppStore((state) => state.sidebar.opened)

  // 获取菜单背景色
  const getMenuBackground = useMemo(() => {
    if (isDark) {
      return 'var(--sidebar-bg)'
    }
    return sideTheme === 'theme-dark' ? variables.menuBg : variables.menuLightBg
  }, [isDark, sideTheme])

  // 获取菜单文字颜色
  const getMenuTextColor = useMemo(() => {
    if (isDark) {
      return 'var(--sidebar-text)'
    }
    return sideTheme === 'theme-dark' ? variables.menuText : variables.menuLightText
  }, [isDark, sideTheme])

  const activeMenu = useMemo(() => {
    const path = location.pathname
    // 这里需要从路由配置中获取 activeMenu，暂时使用 path
    return path
  }, [location.pathname])

  // 将路由转换为菜单项
  const menuItems = useMemo(() => {
    if (sidebarRouters.length === 0) {
      return []
    }

    // 获取路由的 meta 信息
    const getRouteMeta = (route) => route.handle?.meta || route.meta || {}
    
    // 检查路由是否隐藏
    const isRouteHidden = (route) => {
      const meta = getRouteMeta(route)
      return meta.hidden || route.hidden
    }
    
    // 获取可见的子路由
    const getVisibleChildren = (route) => {
      return (route.children || []).filter(child => !isRouteHidden(child))
    }
    
    // 解析路径
    const resolvePath = (routePath, routeQuery, isIndex, basePath) => {
      if (isIndex) return basePath || '/'
      if (isExternal(routePath)) return routePath
      if (isExternal(basePath)) return basePath
      if (routeQuery) {
        try {
          const query = JSON.parse(routeQuery)
          return { path: getNormalPath(basePath + '/' + routePath), query }
        } catch {
          return getNormalPath(basePath + '/' + routePath)
        }
      }
      if (!basePath && !routePath) return '/'
      return getNormalPath(basePath + '/' + routePath)
    }
    
    // 创建菜单标签（带导航）
    const createMenuLabel = (title, path) => (
      <a 
        href={path}
        onClick={(e) => {
          e.preventDefault()
          if (isExternal(path)) {
            window.open(path)
          } else if (path) {
            startTransition(() => navigate(path))
          }
        }}
      >
        {title}
      </a>
    )
    
    // 创建单个子路由菜单项
    const createSingleChildItem = (child, parentIcon, basePath, index) => {
      const childMeta = getRouteMeta(child)
      const childPath = resolvePath(child.path || '', child.query, child.index, basePath)
      const finalPath = typeof childPath === 'string' ? childPath : (childPath?.path || '')
      const childTitle = childMeta.title || child.title || ''
      
      if (!childTitle) return null
      
      const childIcon = childMeta.icon || child.icon || parentIcon
      const IconComponent = childIcon && childIcon !== '#' ? getIconComponent(childIcon) : null
      const childKey = typeof childPath === 'string' ? childPath : (childPath?.path || `child-${index}`)
      
      return {
        key: childKey,
        icon: IconComponent ? <IconComponent /> : null,
        label: createMenuLabel(childTitle, finalPath)
      }
    }

    const convert = (routes, basePath = '') => {
      if (!routes || !Array.isArray(routes)) return []
      
      // 过滤路由：隐藏的路由如果有可见子路由则保留（个人中心路由除外）
      const filtered = routes.filter(route => {
        if (!route) return false
        if (route.path === '/user') return false // 个人中心路由完全跳过
        
        const isHidden = isRouteHidden(route)
        if (!isHidden) return true
        
        // 隐藏路由：检查是否有可见的子路由
        return getVisibleChildren(route).length > 0
      })
      
      return filtered.map((route, index) => {
        const meta = getRouteMeta(route)
        const path = resolvePath(route.path || '', route.query, route.index, basePath)
        const key = typeof path === 'string' ? path : (path?.path || route.path || `route-${index}`)
        const icon = meta.icon || route.icon
        const IconComponent = icon && icon !== '#' ? getIconComponent(icon) : null
        const children = getVisibleChildren(route)
        const hasOneShowing = children.length === 1 && !route.alwaysShow
        const isHidden = isRouteHidden(route)
        
        // 获取标题：优先使用父路由的 title，如果没有则从子路由获取
        let title = meta.title || route.title
        if (!title && children.length > 0) {
          const firstChildMeta = getRouteMeta(children[0])
          title = firstChildMeta.title || children[0].title
        }
        
        // 如果路由被隐藏且有子路由，显示子路由
        if (isHidden && children.length > 0) {
          if (hasOneShowing) {
            return createSingleChildItem(children[0], icon, typeof path === 'string' ? path : path.path, index)
          }
          if (children.length > 1) {
            const finalPath = typeof path === 'string' ? path : path.path
            const parentTitle = meta.title || route.title
            const firstChildMeta = getRouteMeta(children[0])
            const displayTitle = parentTitle || firstChildMeta.title || children[0].title || '菜单'
            return {
              key,
              icon: IconComponent ? <IconComponent /> : null,
              label: displayTitle,
              children: convert(children, finalPath)
            }
          }
        }
        
        // 如果没有 title 且没有子路由，跳过
        if (!title && children.length === 0) return null
        
        // 单个子路由：直接显示子路由
        if (hasOneShowing) {
          return createSingleChildItem(children[0], icon, typeof path === 'string' ? path : path.path, index)
        }
        
        // 多个子路由：显示子路由列表
        if (children.length > 0) {
          const finalPath = typeof path === 'string' ? path : path.path
          const displayTitle = title || (getRouteMeta(children[0]).title || children[0].title) || '菜单'
          return {
            key,
            icon: IconComponent ? <IconComponent /> : null,
            label: displayTitle,
            children: convert(children, finalPath)
          }
        }
        
        // 单路由：没有子路由
        const finalPath = typeof path === 'string' ? path : path.path
        return {
          key,
          icon: IconComponent ? <IconComponent /> : null,
          label: createMenuLabel(title, finalPath)
        }
      }).filter(item => item !== null)
    }

    return convert(sidebarRouters)
  }, [sidebarRouters, navigate])

  return (
    <aside 
      className={`${className} ${showLogo ? 'has-logo' : ''}`}
      style={{ backgroundColor: getMenuBackground }}
    >
      {showLogo && <Logo collapse={isCollapse} />}
      <div className="scrollbar-wrapper">
        {menuItems.length > 0 ? (
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            style={{ 
              border: 'none',
              height: '100%',
              width: '100%',
              backgroundColor: getMenuBackground,
              color: getMenuTextColor
            }}
            theme={sideTheme === 'theme-dark' ? 'dark' : 'light'}
            inlineCollapsed={isCollapse}
            items={menuItems}
            onClick={({ key }) => {
              // 点击处理已经在 label 中的 a 标签处理了
            }}
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: getMenuTextColor }}>
            菜单加载中...
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
