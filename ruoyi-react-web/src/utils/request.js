import axios from 'axios'
import { message, notification, Modal } from 'antd'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import { tansParams, blobValidate } from '@/utils/ruoyi'
import cache from '@/plugins/cache'
import { saveAs } from 'file-saver'
import { useUserStore } from '@/store/userStore'
import requestConfig from '@/config/requestConfig'

let downloadLoadingInstance = null
// 是否显示重新登录
export let isRelogin = { show: false }

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: requestConfig.baseURL,
  // 超时
  timeout: requestConfig.timeout
})

// request拦截器
service.interceptors.request.use(config => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false
  // 是否需要防止数据重复提交
  const isRepeatSubmit = (config.headers || {}).repeatSubmit === false
  if (getToken() && !isToken) {
    config.headers['Authorization'] = 'Bearer ' + getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
  }
  // get请求映射params参数
  if (config.method === 'get' && config.params) {
    let url = config.url + '?' + tansParams(config.params)
    url = url.slice(0, -1)
    config.params = {}
    config.url = url
  }
  if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
    const requestObj = {
      url: config.url,
      data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
      time: new Date().getTime()
    }
    const requestSize = Object.keys(JSON.stringify(requestObj)).length // 请求数据大小
    const limitSize = requestConfig.duplicateSubmit.maxBytes
    const limitSizeMB = (limitSize / 1024 / 1024).toFixed(1)
    if (requestSize >= limitSize) {
      console.warn(`[${config.url}]: ` + `请求数据大小超出允许的${limitSizeMB}MB限制，无法进行防重复提交验证。`)
      return config
    }
    const sessionObj = cache.session.getJSON('sessionObj')
    if (sessionObj === undefined || sessionObj === null || sessionObj === '') {
      cache.session.setJSON('sessionObj', requestObj)
    } else {
      const s_url = sessionObj.url                // 请求地址
      const s_data = sessionObj.data              // 请求数据
      const s_time = sessionObj.time              // 请求时间
      const interval = requestConfig.duplicateSubmit.intervalMs                       // 间隔时间(ms)，小于此时间视为重复提交
      if (s_data === requestObj.data && requestObj.time - s_time < interval && s_url === requestObj.url) {
        const errorMsg = '数据正在处理，请勿重复提交'
        console.warn(`[${s_url}]: ` + errorMsg)
        return Promise.reject(new Error(errorMsg))
      } else {
        cache.session.setJSON('sessionObj', requestObj)
      }
    }
  }
  return config
}, error => {
    console.log(error)
    return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
    // 检查响应是否为 HTML（通常表示请求被重定向到登录页）
    if (typeof res.data === 'string' && res.data.trim().startsWith('<!DOCTYPE html>')) {
      console.error('API 返回了 HTML 页面，可能是路径配置错误或请求被重定向')
      message.error(requestConfig.messages.apiPathError)
      return Promise.reject(new Error('API 返回了 HTML 页面'))
    }
    
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default']
    // 二进制数据则直接返回
    if (res.request.responseType ===  'blob' || res.request.responseType ===  'arraybuffer') {
      return res.data
    }
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true
        Modal.confirm({
          title: requestConfig.modal.title,
          content: requestConfig.modal.content,
          okText: requestConfig.modal.okText,
          cancelText: requestConfig.modal.cancelText,
          onOk: () => {
            isRelogin.show = false
            useUserStore.getState().logOut().then(() => {
              window.location.href = '/login'
            })
          },
          onCancel: () => {
            isRelogin.show = false
          }
        })
      }
      return Promise.reject(new Error('无效的会话，或者会话已过期，请重新登录。'))
    } else if (code === 500) {
      message.error(msg)
      return Promise.reject(new Error(msg))
    } else if (code === 601) {
      message.warning(msg)
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      notification.error({ message: msg })
      return Promise.reject(new Error('error'))
    } else {
      return  Promise.resolve(res.data)
    }
  },
  error => {
    console.log('err' + error)
    let { message: errorMsg } = error
    if (errorMsg === 'Network Error') {
      errorMsg = requestConfig.messages.network
    } else if (errorMsg.includes('timeout')) {
      errorMsg = requestConfig.messages.timeout
    } else if (errorMsg.includes('Request failed with status code')) {
      const statusCode = errorMsg.substr(errorMsg.length - 3)
      errorMsg = `${requestConfig.messages.statusPrefix}${statusCode}异常`
    }
    message.error({ content: errorMsg, duration: 5 })
    return Promise.reject(error)
  }
)

// 通用下载方法
export function download(url, params, filename, config) {
  downloadLoadingInstance = message.loading({ content: requestConfig.download.loadingText, duration: 0 })
  return service.post(url, params, {
    transformRequest: [(params) => { return tansParams(params) }],
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    responseType: 'blob',
    ...config
  }).then(async (data) => {
    const isBlob = blobValidate(data)
    if (isBlob) {
      const blob = new Blob([data])
      saveAs(blob, filename)
    } else {
      const resText = await data.text()
      const rspObj = JSON.parse(resText)
      const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
      message.error(errMsg)
    }
    if (downloadLoadingInstance) {
      downloadLoadingInstance()
    }
  }).catch((r) => {
    console.error(r)
    message.error(requestConfig.messages.downloadError)
    if (downloadLoadingInstance) {
      downloadLoadingInstance()
    }
  })
}

export default service
