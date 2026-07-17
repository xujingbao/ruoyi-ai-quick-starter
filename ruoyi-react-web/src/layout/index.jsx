import { useEffect, useRef, startTransition } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { message } from 'antd'
import NProgress from 'nprogress'
import { getToken } from '@/utils/auth'
import { isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import { useAppStore } from '@/store/appStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { usePermissionStore } from '@/store/permissionStore'
import { constantRoutes, dynamicRoutes, filterAsyncRouter } from '@/router'
import { filterDynamicRoutes } from '@/store/permissionStore'
import layoutConfig from '@/config/layoutConfig'
import { useResponsiveLayout } from './hooks/useResponsiveLayout'
import { getLayoutWrapperClass } from './utils/getLayoutClassNames'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import AppMain from './components/AppMain'
import TagsView from './components/TagsView'
import Settings from './components/Settings'
import AgentShell from '@/components/AgentShell'
import './index.scss'

NProgress.configure({ showSpinner: false })

const isWhiteList = (path) => {
  return layoutConfig.whiteList.some(pattern => isPathMatch(pattern, path))
}

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const sidebar = useAppStore((state) => state.sidebar)
  const device = useAppStore((state) => state.device)
  const needTagsView = useSettingsStore((state) => state.tagsView)
  const fixedHeader = useSettingsStore((state) => state.fixedHeader)
  const theme = useSettingsStore((state) => state.theme)
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const settingRef = useRef(null)

  useResponsiveLayout()

  // 权限检查和路由初始化
  useEffect(() => {
    NProgress.start()
    const token = getToken()
    
    if (token) {
      // 已登录
      if (location.pathname === '/login') {
        startTransition(() => {
          navigate('/', { replace: true })
        })
        NProgress.done()
      } else if (isWhiteList(location.pathname)) {
        // 白名单路由
        NProgress.done()
      } else {
        // 检查用户信息
        if (userStore.roles.length === 0) {
          isRelogin.show = true
          // 判断当前用户是否已拉取完user_info信息
          userStore.getInfo().then(() => {
            isRelogin.show = false
            // 生成路由
            if (permissionStore.sidebarRouters.length === 0) {
              permissionStore.generateRoutes(
                constantRoutes,
                dynamicRoutes,
                filterAsyncRouter,
                filterDynamicRoutes,
                null
              ).then(() => {
                NProgress.done()
              })
            } else {
              NProgress.done()
            }
          }).catch(err => {
            userStore.logOut().then(() => {
              message.error(err)
              startTransition(() => {
                navigate('/', { replace: true })
              })
            })
          })
        } else {
          // 如果路由还没有生成，生成路由
          if (permissionStore.sidebarRouters.length === 0) {
            permissionStore.generateRoutes(
              constantRoutes,
              dynamicRoutes,
              filterAsyncRouter,
              filterDynamicRoutes,
              null
            ).then(() => {
              NProgress.done()
            })
          } else {
            NProgress.done()
          }
        }
      }
    } else {
      // 没有token
      if (isWhiteList(location.pathname)) {
        // 在免登录白名单，直接进入
        NProgress.done()
      } else {
        startTransition(() => {
          navigate(`/login?redirect=${location.pathname}`, { replace: true })
        })
        NProgress.done()
      }
    }
  }, [location.pathname])

  useEffect(() => {
    NProgress.done()
  })

  const closeSideBarOnClick = useAppStore((state) => state.closeSideBar)

  const handleClickOutside = () => {
    closeSideBarOnClick({ withoutAnimation: false })
  }

  const wrapperClass = getLayoutWrapperClass({ sidebar, device })

  const setLayout = () => {
    if (settingRef.current) {
      settingRef.current.openSetting()
    }
  }

  return (
    <div className={wrapperClass} style={{ '--current-color': theme }}>
      {device === 'mobile' && sidebar.opened && (
        <div className="drawer-bg" onClick={handleClickOutside} />
      )}
      {!sidebar.hide && <Sidebar className="sidebar-container" />}
      <div className={`main-container ${needTagsView ? 'hasTagsView' : ''} ${sidebar.hide ? 'sidebarHide' : ''}`}>
        <div className={fixedHeader ? 'fixed-header' : ''}>
          <Navbar onSetLayout={setLayout} />
          {needTagsView && <TagsView />}
        </div>
        <AppMain />
        <Settings ref={settingRef} />
        <AgentShell />
      </div>
    </div>
  )
}

export default Layout
