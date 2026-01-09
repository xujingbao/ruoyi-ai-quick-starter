const routeMetaMap = {
  '/redirect': { hidden: true },
  '/login': { hidden: true },
  '/register': { hidden: true },
  '/401': { hidden: true },
  '/404': { hidden: true },
  '*': { hidden: true },
  '/user': { hidden: true },
  '/': { title: '首页', icon: 'dashboard', affix: true },
  '/user/profile/:activeTab?': { title: '个人中心', icon: 'user' },
  '/system/user-auth': { hidden: true, permissions: ['system:user:edit'] },
  '/system/user-auth/role/:userId': { title: '分配角色', activeMenu: '/system/user' },
  '/system/role-auth': { hidden: true, permissions: ['system:role:edit'] },
  '/system/role-auth/user/:roleId': { title: '分配用户', activeMenu: '/system/role' },
  '/system/dict-data': { hidden: true, permissions: ['system:dict:list'] },
  '/system/dict-data/index/:dictId': { title: '字典数据', activeMenu: '/system/dict' },
  '/monitor/job-log': { hidden: true, permissions: ['monitor:job:list'] },
  '/monitor/job-log/index/:jobId': { title: '调度日志', activeMenu: '/monitor/job' },
  '/monitor/cache-list': { hidden: true, permissions: ['monitor:cache:list'] },
  '/monitor/cache-list/index': { title: '缓存列表', activeMenu: '/monitor/cache' },
  '/monitor/druid': { hidden: true, permissions: ['monitor:druid:view'] },
  '/monitor/druid/index': { title: 'Druid监控', activeMenu: '/monitor/druid' }
}

export const navbarMenuConfig = [
  {
    key: 'profile',
    label: '个人中心',
    path: '/user/profile'
  },
  {
    key: 'setLayout',
    label: '布局设置',
    requiresSettings: true
  },
  {
    type: 'divider'
  },
  {
    key: 'logout',
    label: '退出登录'
  }
]

export function getRouteMeta(path, fallback = {}) {
  if (routeMetaMap[path]) {
    return { ...routeMetaMap[path] }
  }
  return fallback
}

export default routeMetaMap
