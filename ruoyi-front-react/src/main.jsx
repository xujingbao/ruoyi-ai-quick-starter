import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import App from './App'
import '@/assets/styles/index.scss'
import 'nprogress/nprogress.css'

// 配置 dayjs 中文
dayjs.locale('zh-cn')

// 加载动画移除
window.addEventListener('load', () => {
  const loader = document.getElementById('loader-wrapper')
  if (loader) {
    loader.classList.add('loaded')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
