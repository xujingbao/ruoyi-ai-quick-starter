import { create } from 'zustand'
import defaultSettings from '@/settings'

const { sideTheme, showSettings, topNav, tagsView, tagsIcon, fixedHeader, sidebarLogo, dynamicTitle, footerVisible, footerContent } = defaultSettings

const storageSetting = JSON.parse(localStorage.getItem('layout-setting') || '{}')

// 简单的暗黑模式切换（React 版本）
const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('dark-mode')
  if (stored !== null) {
    return stored === 'true'
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

const toggleDarkMode = (isDark) => {
  if (typeof document === 'undefined') return
  if (isDark) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('dark-mode', 'true')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('dark-mode', 'false')
  }
}

// 动态修改标题函数
const updateDynamicTitle = (title, dynamicTitleEnabled) => {
  if (typeof document === 'undefined') return
  if (dynamicTitleEnabled) {
    document.title = title + ' - ' + defaultSettings.title
  } else {
    document.title = defaultSettings.title
  }
}

export const useSettingsStore = create((set, get) => ({
  title: '',
  theme: storageSetting.theme || '#1d5ccc',
  sideTheme: storageSetting.sideTheme || sideTheme,
  showSettings: showSettings,
  topNav: storageSetting.topNav === undefined ? topNav : storageSetting.topNav,
  tagsView: storageSetting.tagsView === undefined ? tagsView : storageSetting.tagsView,
  tagsIcon: storageSetting.tagsIcon === undefined ? tagsIcon : storageSetting.tagsIcon,
  fixedHeader: storageSetting.fixedHeader === undefined ? fixedHeader : storageSetting.fixedHeader,
  sidebarLogo: storageSetting.sidebarLogo === undefined ? sidebarLogo : storageSetting.sidebarLogo,
  dynamicTitle: storageSetting.dynamicTitle === undefined ? dynamicTitle : storageSetting.dynamicTitle,
  footerVisible: storageSetting.footerVisible === undefined ? footerVisible : storageSetting.footerVisible,
  footerContent: footerContent,
  isDark: getInitialDarkMode(),
  
  // 修改布局设置
  changeSetting: (data) => {
    const { key, value } = data
    set((state) => {
      if (state.hasOwnProperty(key)) {
        const newState = { [key]: value }
        // 保存到 localStorage
        const layoutSetting = {
          ...storageSetting,
          ...newState
        }
        localStorage.setItem('layout-setting', JSON.stringify(layoutSetting))
        return newState
      }
      return state
    })
  },
  
  // 设置网页标题
  setTitle: (title) => {
    set((state) => {
      updateDynamicTitle(title, state.dynamicTitle)
      return { title }
    })
  },
  
  // 切换暗黑模式
  toggleTheme: () => {
    set((state) => {
      const newIsDark = !state.isDark
      toggleDarkMode(newIsDark)
      return { isDark: newIsDark }
    })
  }
}))
