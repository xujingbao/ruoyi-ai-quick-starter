import { useEffect, useMemo } from 'react'
import { App as AntdApp, ConfigProvider, theme as antdTheme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useSettingsStore } from '@/store/settingsStore'
import AntdAppBridge from '@/plugins/AntdAppBridge'
import { handleThemeStyle } from '@/utils/theme'
import themeTokens from '@/config/themeTokens'
import layoutConfig from '@/config/layoutConfig'

export default function AppProviders({ children }) {
  const { isDark, theme } = useSettingsStore()

  useEffect(() => {
    const root = document.documentElement
    const vars = {
      '--app-bg': themeTokens.colors.appBackground,
      '--app-surface': themeTokens.colors.appSurface,
      '--app-surface-2': themeTokens.colors.appSurfaceAlt,
      '--app-text': themeTokens.colors.appText,
      '--app-text-secondary': themeTokens.colors.appTextSecondary,
      '--app-border': themeTokens.colors.appBorder,
      '--navbar-hover': themeTokens.colors.navbarHover,
      '--menu-hover': themeTokens.colors.menuHover,
      '--menu-active-text': themeTokens.colors.menuActiveText,
      '--tags-bg': themeTokens.colors.appSurface,
      '--tags-item-bg': themeTokens.colors.appSurface,
      '--layout-sidebar-width': layoutConfig.sidebarWidth,
      '--layout-drawer-opacity': layoutConfig.drawerOpacity,
      '--layout-mobile-breakpoint': `${layoutConfig.mobileBreakpoint}px`,
      '--drawer-bg': layoutConfig.drawerBackground
    }
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }, [])

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
        colorPrimary: theme || themeTokens.palette.primary,
        colorLink: theme || themeTokens.palette.primary,
        fontFamily: themeTokens.fonts.body,
        fontSize: parseInt(themeTokens.typography.fontSizeBase, 10),
        lineHeight: themeTokens.typography.lineHeightBase
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

