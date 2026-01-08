import { create } from 'zustand'
import auth from '@/plugins/auth'
import { getRouters } from '@/api/menu'

export const usePermissionStore = create((set, get) => ({
  routes: [],
  addRoutes: [],
  defaultRoutes: [],
  topbarRouters: [],
  sidebarRouters: [],
  
  setRoutes: (routes) => {
    set((state) => ({
      addRoutes: routes,
      routes: state.routes.concat(routes)
    }))
  },
  
  setDefaultRoutes: (routes) => {
    set({ defaultRoutes: routes })
  },
  
  setTopbarRoutes: (routes) => {
    set({ topbarRouters: routes })
  },
  
  setSidebarRouters: (routes) => {
    set({ sidebarRouters: routes })
  },
  
  generateRoutes: (constantRoutes, dynamicRoutes, filterAsyncRouter, filterDynamicRoutes, router) => {
    return new Promise((resolve, reject) => {
      // 向后端请求路由数据
      getRouters().then(res => {
        const sdata = JSON.parse(JSON.stringify(res.data))
        const rdata = JSON.parse(JSON.stringify(res.data))
        const defaultData = JSON.parse(JSON.stringify(res.data))
        const sidebarRoutes = filterAsyncRouter(sdata)
        const rewriteRoutes = filterAsyncRouter(rdata, false, true)
        const defaultRoutes = filterAsyncRouter(defaultData)
        const asyncRoutes = filterDynamicRoutes(dynamicRoutes)
        
        // React Router v6 使用不同的方式添加路由
        // asyncRoutes.forEach(route => { router.addRoute(route) })
        
        const finalSidebarRouters = constantRoutes.concat(sidebarRoutes)
        
        set({
          addRoutes: rewriteRoutes,
          routes: constantRoutes.concat(rewriteRoutes),
          sidebarRouters: finalSidebarRouters,
          defaultRoutes: sidebarRoutes,
          topbarRouters: defaultRoutes
        })
        
        resolve(rewriteRoutes)
      }).catch(err => {
        console.error('获取路由数据失败:', err)
        reject(err)
      })
    })
  }
}))

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes) {
  const res = []
  routes.forEach(route => {
    if (route.permissions) {
      if (auth.hasPermiOr(route.permissions)) {
        res.push(route)
      }
    } else if (route.roles) {
      if (auth.hasRoleOr(route.roles)) {
        res.push(route)
      }
    }
  })
  return res
}
