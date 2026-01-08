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

// 全局字体（与 SCSS 变量保持一致的系统字体栈）
const APP_FONT_FAMILY = [
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  '"Noto Sans"',
  '"Liberation Sans"',
  '"PingFang SC"',
  '"Hiragino Sans GB"',
  '"Microsoft YaHei"',
  '"微软雅黑"',
  '"Source Han Sans CN"',
  '"WenQuanYi Micro Hei"',
  'sans-serif'
].join(', ')

// 加载动画移除
window.addEventListener('load', () => {
  const loader = document.getElementById('loader-wrapper')
  if (loader) {
    loader.classList.add('loaded')
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          fontFamily: APP_FONT_FAMILY,
          fontSize: 14,
          lineHeight: 1.5
        }
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>
)
