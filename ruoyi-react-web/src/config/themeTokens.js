const themeTokens = {
  colors: {
    appBackground: '#f5f7fa',
    appSurface: '#ffffff',
    appSurfaceAlt: '#f8fbff',
    appText: 'rgba(0, 0, 0, 0.88)',
    appTextSecondary: 'rgba(0, 0, 0, 0.65)',
    appBorder: 'rgba(5, 5, 5, 0.06)',
    navbarHover: 'rgba(0, 0, 0, 0.025)',
    menuHover: 'rgba(0, 0, 0, 0.06)',
    menuActiveText: 'var(--ant-color-primary, #1677ff)',
    drawerBackdrop: '#000'
  },
  darkColors: {
    appBackground: '#0f0f0f',
    appSurface: '#141414',
    appSurfaceAlt: '#1f1f1f',
    appText: 'rgba(255, 255, 255, 0.88)',
    appTextSecondary: 'rgba(255, 255, 255, 0.65)',
    appBorder: 'rgba(255, 255, 255, 0.12)',
    navbarHover: 'rgba(255, 255, 255, 0.06)',
    menuHover: 'rgba(255, 255, 255, 0.08)',
    menuActiveText: 'var(--ant-color-primary, #409EFF)'
  },
  palette: {
    primary: '#1d5ccc',
    success: '#67C23A',
    warning: '#E6A23C',
    danger: '#F56C6C',
    info: '#909399'
  },
  fonts: {
    body: [
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
    ].join(', '),
    mono: [
      '"SF Mono"',
      'Monaco',
      '"Cascadia Code"',
      '"Roboto Mono"',
      'Consolas',
      '"Courier New"',
      'monospace'
    ].join(', ')
  },
  typography: {
    fontSizeBase: '14px',
    fontSizeSmall: '12px',
    fontSizeLarge: '16px',
    lineHeightBase: 1.5
  }
}

export default themeTokens
