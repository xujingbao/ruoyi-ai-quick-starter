import { useEffect, useMemo } from 'react'
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useSettingsStore } from '@/store/settingsStore'
import AntdAppBridge from '@/plugins/AntdAppBridge'
import { handleThemeStyle } from '@/utils/theme'

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

export default function AppProviders({ children }) {
  const { isDark, theme } = useSettingsStore()

  // 同步自定义暗色 class（用于项目自定义样式）
  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!isDark)
  }, [isDark])

  // 同步主题色到 CSS 变量（用于项目自定义样式/侧边栏等）
  useEffect(() => {
    if (theme) handleThemeStyle(theme)
  }, [theme])

  const antdThemeConfig = useMemo(() => {
    return {
      algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: theme || '#409EFF',
        fontFamily: APP_FONT_FAMILY,
        fontSize: 14,
        lineHeight: 1.5
      }
    }
  }, [isDark, theme])

  return (
    <ConfigProvider locale={zhCN} theme={antdThemeConfig}>
      <AntdApp>
        <AntdAppBridge>{children}</AntdAppBridge>
      </AntdApp>
    </ConfigProvider>
  )
}

