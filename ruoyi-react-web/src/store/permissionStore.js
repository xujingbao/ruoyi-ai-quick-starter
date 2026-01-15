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
        
        // React Router v6 不能动态 addRoute，需合并后重建 router
        // 这些 dynamicRoutes 通常是“隐藏页”（如 /system/dict-data/index/:dictId）
        const finalRewriteRoutes = rewriteRoutes.concat(asyncRoutes)
        
        const finalSidebarRouters = constantRoutes.concat(sidebarRoutes)
        
        set({
          addRoutes: finalRewriteRoutes,
          routes: constantRoutes.concat(finalRewriteRoutes),
          sidebarRouters: finalSidebarRouters,
          defaultRoutes: sidebarRoutes,
          topbarRouters: defaultRoutes
        })
        
        resolve(finalRewriteRoutes)
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
    const permissions = route.permissions || route.handle?.meta?.permissions
    const roles = route.roles || route.handle?.meta?.roles

    if (permissions) {
      if (auth.hasPermiOr(permissions)) {
        res.push(route)
      }
    } else if (roles) {
      if (auth.hasRoleOr(roles)) {
        res.push(route)
      }
    }
  })
  return res
}
