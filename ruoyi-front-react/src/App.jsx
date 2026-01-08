import { useEffect, Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { Spin } from 'antd'
import { useSettingsStore } from './store/settingsStore'
import { handleThemeStyle } from './utils/theme'
import router from './router'

function App() {
  const settingsStore = useSettingsStore()

  useEffect(() => {
    // 初始化主题样式
    handleThemeStyle(settingsStore.theme)
  }, [settingsStore.theme])

  return (
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
  )
}

export default App
