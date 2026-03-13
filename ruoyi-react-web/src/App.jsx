import { useEffect, useState, Suspense, Component } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Spin } from 'antd'
import { useSettingsStore } from './store/settingsStore'
import { usePermissionStore } from './store/permissionStore'
import { useUserStore } from './store/userStore'
import { getToken } from './utils/auth'
import { handleThemeStyle } from './utils/theme'
import { constantRoutes, createRouter, dynamicRoutes, filterAsyncRouter } from './router'
import { filterDynamicRoutes } from './store/permissionStore'

class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h2>页面加载失败</h2>
          <button
            style={{ marginTop: 16, padding: '8px 24px', cursor: 'pointer' }}
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const theme = useSettingsStore((state) => state.theme)
  const roles = useUserStore((state) => state.roles)
  const getInfo = useUserStore((state) => state.getInfo)
  const generateRoutes = usePermissionStore((state) => state.generateRoutes)
  const [router, setRouter] = useState(() => createRouter(constantRoutes))
  const [routesReady, setRoutesReady] = useState(false)

  useEffect(() => {
    // 初始化主题样式
    handleThemeStyle(theme)
  }, [theme])

  // 初始化路由，确保刷新后动态路由就绪
  useEffect(() => {
    const token = getToken()

    if (!token) {
      setRouter(createRouter(constantRoutes))
      setRoutesReady(true)
      return
    }

    const loadRoutes = async () => {
      try {
        // 优先获取用户角色
        if (!roles || roles.length === 0) {
          await getInfo()
        }

        await generateRoutes(
          constantRoutes,
          dynamicRoutes,
          filterAsyncRouter,
          filterDynamicRoutes,
          null
        )

        const nextRoutes = usePermissionStore.getState().routes
        const finalRoutes = nextRoutes && nextRoutes.length > 0 ? nextRoutes : constantRoutes
        setRouter(createRouter(finalRoutes))
      } catch (err) {
        console.error('初始化路由失败，使用常量路由:', err)
        setRouter(createRouter(constantRoutes))
      } finally {
        setRoutesReady(true)
      }
    }

    loadRoutes()
    // 只在首次和角色变化时运行，避免引用整个 store 对象导致无限重跑
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(roles)])

  if (!routesReady) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#999' }}>加载中...</div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <Spin size="large" />
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
    </ErrorBoundary>
  )
}

export default App
