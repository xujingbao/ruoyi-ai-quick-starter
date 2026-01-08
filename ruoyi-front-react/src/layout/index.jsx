import { useEffect, useRef, startTransition } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
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
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import AppMain from './components/AppMain'
import TagsView from './components/TagsView'
import Settings from './components/Settings'
import './index.scss'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const sidebar = useAppStore((state) => state.sidebar)
  const device = useAppStore((state) => state.device)
  const needTagsView = useSettingsStore((state) => state.tagsView)
  const fixedHeader = useSettingsStore((state) => state.fixedHeader)
  const theme = useSettingsStore((state) => state.theme)
  const toggleDevice = useAppStore((state) => state.toggleDevice)
  const closeSideBar = useAppStore((state) => state.closeSideBar)
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  const settingRef = useRef(null)

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
    let mounted = true
    
    const handleResize = () => {
      if (!mounted) return
      
      const WIDTH = 992
      const currentWidth = window.innerWidth
      const isMobile = currentWidth - 1 < WIDTH
      const currentDevice = useAppStore.getState().device
      const currentSidebar = useAppStore.getState().sidebar
      
      // 只在状态真正需要改变时才更新
      if (isMobile && currentDevice !== 'mobile') {
        toggleDevice('mobile')
        if (currentSidebar.opened) {
          closeSideBar({ withoutAnimation: true })
        }
      } else if (!isMobile && currentDevice !== 'desktop') {
        toggleDevice('desktop')
      }
    }

    // 延迟执行初始检查，避免在渲染时立即触发状态更新
    const timer = setTimeout(() => {
      if (mounted) {
        handleResize()
        window.addEventListener('resize', handleResize)
      }
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [toggleDevice, closeSideBar])

  useEffect(() => {
    NProgress.done()
  })

  const classObj = {
    hideSidebar: !sidebar.opened,
    openSidebar: sidebar.opened,
    withoutAnimation: sidebar.withoutAnimation,
    mobile: device === 'mobile'
  }

  const closeSideBarOnClick = useAppStore((state) => state.closeSideBar)

  const handleClickOutside = () => {
    closeSideBarOnClick({ withoutAnimation: false })
  }

  const setLayout = () => {
    if (settingRef.current) {
      settingRef.current.openSetting()
    }
  }

  return (
    <div 
      className={`app-wrapper ${classObj.hideSidebar ? 'hideSidebar' : ''} ${classObj.openSidebar ? 'openSidebar' : ''} ${classObj.withoutAnimation ? 'withoutAnimation' : ''} ${classObj.mobile ? 'mobile' : ''}`}
      style={{ '--current-color': theme }}
    >
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
      </div>
    </div>
  )
}

export default Layout
