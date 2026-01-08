import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/layout'

// 匹配 views 里面所有的 .jsx 文件
const modules = import.meta.glob('../views/**/*.jsx')

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用缓存时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 动态加载视图组件
export const loadView = (view) => {
  let res
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.jsx')[0]
    if (dir === view) {
      res = lazy(() => modules[path]())
    }
  }
  return res || lazy(() => Promise.resolve({ default: () => <div>Component not found: {view}</div> }))
}

// 公共路由
export const constantRoutes = [
  {
    path: '/redirect',
    Component: Layout,
    children: [
      {
        path: ':path',
        Component: lazy(() => import('@/views/redirect/index'))
      }
    ]
  },
  {
    path: '/login',
    Component: lazy(() => import('@/views/login/index')),
    handle: { meta: { hidden: true } }
  },
  {
    path: '/register',
    Component: lazy(() => import('@/views/register/index')),
    handle: { meta: { hidden: true } }
  },
  {
    path: '/401',
    Component: lazy(() => import('@/views/error/401')),
    handle: { meta: { hidden: true } }
  },
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: lazy(() => import('@/views/index')),
        handle: { meta: { title: '首页', icon: 'dashboard', affix: true } }
      }
    ]
  },
  {
    path: '/user',
    Component: Layout,
    handle: { meta: { hidden: true } },
    children: [
      {
        path: 'profile/:activeTab?',
        Component: lazy(() => import('@/views/system/user/profile/index')),
        handle: { meta: { title: '个人中心', icon: 'user' } }
      }
    ]
  },
  {
    path: '*',
    Component: lazy(() => import('@/views/error/404')),
    handle: { meta: { hidden: true } }
  }
]

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes = [
  {
    path: '/system/user-auth',
    Component: Layout,
    handle: { meta: { hidden: true, permissions: ['system:user:edit'] } },
    children: [
      {
        path: 'role/:userId',
        Component: lazy(() => import('@/views/system/user/authRole')),
        handle: { meta: { title: '分配角色', activeMenu: '/system/user' } }
      }
    ]
  },
  {
    path: '/system/role-auth',
    Component: Layout,
    handle: { meta: { hidden: true, permissions: ['system:role:edit'] } },
    children: [
      {
        path: 'user/:roleId',
        Component: lazy(() => import('@/views/system/role/authUser')),
        handle: { meta: { title: '分配用户', activeMenu: '/system/role' } }
      }
    ]
  },
  {
    path: '/system/dict-data',
    Component: Layout,
    handle: { meta: { hidden: true, permissions: ['system:dict:list'] } },
    children: [
      {
        path: 'index/:dictId',
        Component: lazy(() => import('@/views/system/dict/data')),
        handle: { meta: { title: '字典数据', activeMenu: '/system/dict' } }
      }
    ]
  },
  {
    path: '/monitor/job-log',
    Component: Layout,
    handle: { meta: { hidden: true, permissions: ['monitor:job:list'] } },
    children: [
      {
        path: 'index/:jobId',
        Component: lazy(() => import('@/views/monitor/job/log')),
        handle: { meta: { title: '调度日志', activeMenu: '/monitor/job' } }
      }
    ]
  }
  ,
  {
    path: '/monitor/cache-list',
    Component: Layout,
    handle: { meta: { hidden: true, permissions: ['monitor:cache:list'] } },
    children: [
      {
        path: 'index',
        Component: lazy(() => import('@/views/monitor/cacheList')),
        handle: { meta: { title: '缓存列表', activeMenu: '/monitor/cache' } }
      }
    ]
  },
  {
    path: '/monitor/druid',
    Component: Layout,
    handle: { meta: { hidden: true, permissions: ['monitor:druid:view'] } },
    children: [
      {
        path: 'index',
        Component: lazy(() => import('@/views/monitor/druid')),
        handle: { meta: { title: 'Druid监控', activeMenu: '/monitor/druid' } }
      }
    ]
  }
]

// 遍历后台传来的路由字符串，转换为组件对象
export function filterAsyncRouter(asyncRouterMap, lastRouter = false, type = false) {
  if (!asyncRouterMap || !Array.isArray(asyncRouterMap)) {
    console.warn('filterAsyncRouter: asyncRouterMap 不是数组', asyncRouterMap)
    return []
  }
  
  return asyncRouterMap.filter(route => {
    if (!route) return false
    
    if (type && route.children) {
      route.children = filterChildren(route.children)
    }
    
    // 处理组件
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        route.Component = Layout
      } else if (route.component === 'ParentView') {
        route.Component = lazy(() => import('@/components/ParentView'))
      } else if (route.component === 'InnerLink') {
        route.Component = lazy(() => import('@/layout/components/InnerLink'))
      } else {
        route.Component = loadView(route.component)
      }
    }
    
    // 递归处理子路由
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type)
    } else {
      delete route['children']
      delete route['redirect']
    }
    
    return true
  })
}

function filterChildren(childrenMap, lastRouter = false) {
  var children = []
  childrenMap.forEach(el => {
    el.path = lastRouter ? lastRouter.path + '/' + el.path : el.path
    if (el.children && el.children.length && el.component === 'ParentView') {
      children = children.concat(filterChildren(el.children, el))
    } else {
      children.push(el)
    }
  })
  return children
}

// 创建路由
export function createRouter(routes) {
  const finalRoutes = routes && routes.length > 0 ? routes : constantRoutes
  return createBrowserRouter(finalRoutes, {
    future: {
      v7_startTransition: true
    }
  })
}

// 默认路由（仅常量路由）
const router = createRouter(constantRoutes)
export default router

