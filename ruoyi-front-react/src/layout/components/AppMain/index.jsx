import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Spin } from 'antd'
import './index.scss'

const AppMain = () => {
  return (
    <div className="app-main">
      <Suspense fallback={
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      }>
        <Outlet />
      </Suspense>
    </div>
  )
}

export default AppMain
