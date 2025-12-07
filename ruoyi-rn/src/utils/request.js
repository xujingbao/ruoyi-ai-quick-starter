import axios from 'axios'
import { Alert } from 'react-native'
import config from '../config'
import { getToken } from './auth'
import errorCode from './errorCode'

const timeout = 10000
const baseUrl = config.baseUrl

// 创建 axios 实例
const service = axios.create({
  baseURL: baseUrl,
  timeout: timeout,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  async config => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false
    if (!isToken) {
      const token = await getToken()
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token
      }
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    const code = res.code || 200
    const msg = errorCode[code] || res.msg || errorCode['default']
    
    if (code === 401) {
      Alert.alert(
        '提示',
        '登录状态已过期，您可以继续留在该页面，或者重新登录?',
        [
          {
            text: '取消',
            style: 'cancel'
          },
          {
            text: '重新登录',
            onPress: () => {
              // 跳转到登录页面，需要根据实际路由配置
              // navigation.navigate('Login')
            }
          }
        ]
      )
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
    } else if (code === 500) {
      Alert.alert('错误', msg)
      return Promise.reject('500')
    } else if (code !== 200) {
      Alert.alert('错误', msg)
      return Promise.reject(code)
    }
    return res
  },
  error => {
    let { message } = error
    if (message === 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常'
    }
    Alert.alert('错误', message)
    return Promise.reject(error)
  }
)

export default service

