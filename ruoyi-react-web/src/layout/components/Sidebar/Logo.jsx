import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSettingsStore } from '@/store/settingsStore'
import variables from '@/assets/styles/variables.module.scss'
import logoImg from '@/assets/logo/logo.svg'
import './Logo.scss'

const Logo = ({ collapse }) => {
  const settingsStore = useSettingsStore()
  const sideTheme = settingsStore.sideTheme
  const isDark = settingsStore.isDark
  const title = import.meta.env.VITE_APP_TITLE || '若依管理系统'

  // 获取Logo背景色（与菜单背景色完全一致）
  const getLogoBackground = useMemo(() => {
    if (isDark) {
      return 'var(--sidebar-bg)'
    }
    return sideTheme === 'theme-dark' ? variables.menuBg : variables.menuLightBg
  }, [isDark, sideTheme])

  // 获取Logo文字颜色（与Vue版本一致：深色主题使用#fff，浅色主题使用menuLightText）
  const getLogoTextColor = useMemo(() => {
    if (isDark) {
      return 'var(--sidebar-text)'
    }
    return sideTheme === 'theme-dark' ? '#fff' : variables.menuLightText
  }, [isDark, sideTheme])

  return (
    <div 
      className={`sidebar-logo-container ${collapse ? 'collapse' : ''}`}
      style={{ 
        backgroundColor: getLogoBackground
      }}
    >
      <Link to="/" className="sidebar-logo-link" style={{ color: getLogoTextColor }}>
        <img src={logoImg} alt="logo" className="sidebar-logo" />
        {!collapse && <h1 className="sidebar-title" style={{ color: getLogoTextColor }}>{title}</h1>}
      </Link>
    </div>
  )
}

export default Logo
