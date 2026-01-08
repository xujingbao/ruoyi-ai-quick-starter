// 权限控制 - React Router v6 版本
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { message } from 'antd'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp, isPathMatch } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import { useUserStore } from '@/store/userStore'
import { useSettingsStore } from '@/store/settingsStore'
import { usePermissionStore } from '@/store/permissionStore'
import { constantRoutes, dynamicRoutes, filterAsyncRouter } from '@/router'
import { filterDynamicRoutes } from '@/store/permissionStore'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/register']

const isWhiteList = (path) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}

// 权限守卫 Hook
export const usePermission = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const userStore = useUserStore()
  const settingsStore = useSettingsStore()
  const permissionStore = usePermissionStore()

  useEffect(() => {
    NProgress.start()
    const token = getToken()
    
    if (token) {
      // 设置标题
      const route = location.pathname
      // 这里需要从路由配置中获取 title，暂时跳过
      
      // 已登录
      if (location.pathname === '/login') {
        navigate('/', { replace: true })
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
            permissionStore.generateRoutes(
              constantRoutes,
              dynamicRoutes,
              filterAsyncRouter,
              filterDynamicRoutes,
              null // React Router v6 不需要 router 参数
            ).then(() => {
              NProgress.done()
            })
          }).catch(err => {
            userStore.logOut().then(() => {
              message.error(err)
              navigate('/', { replace: true })
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
        navigate(`/login?redirect=${location.pathname}`, { replace: true })
        NProgress.done()
      }
    }
  }, [location.pathname, userStore, permissionStore, navigate])

  useEffect(() => {
    NProgress.done()
  })
}

export default usePermission
