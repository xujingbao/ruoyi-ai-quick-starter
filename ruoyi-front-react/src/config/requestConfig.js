const env = import.meta.env
const envHint = 'VITE_APP_BASE_API'

const requestConfig = {
  envHint,
  baseURL: env.VITE_APP_BASE_API || '/dev-api',
  timeout: Number(env.VITE_APP_REQUEST_TIMEOUT) || 10000,
  duplicateSubmit: {
    intervalMs: Number(env.VITE_APP_DUPLICATE_INTERVAL) || 1000,
    maxBytes: Number(env.VITE_APP_DUPLICATE_LIMIT_BYTES) || 5 * 1024 * 1024
  },
  modal: {
    title: '系统提示',
    content: '登录状态已过期，您可以继续留在该页面，或者重新登录',
    okText: '重新登录',
    cancelText: '取消'
  },
  download: {
    loadingText: '正在下载数据，请稍候'
  },
  messages: {
    apiPathError: `请求失败：API 路径配置错误，请检查 ${envHint} 环境变量`,
    network: '后端接口连接异常',
    timeout: '系统接口请求超时',
    statusPrefix: '系统接口',
    downloadError: '下载文件出现错误，请联系管理员！'
  }
}

export default requestConfig
