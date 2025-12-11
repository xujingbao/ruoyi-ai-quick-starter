import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useSelector } from 'react-redux'
import { getToken } from '../utils/auth'

export default function Index() {
  const router = useRouter()
  const token = useSelector(state => state.user.token)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const checkAuth = async () => {
      try {
        const storedToken = await getToken()
        if (storedToken || token) {
          // 已登录，跳转到主页
          router.replace('/home')
        } else {
          // 未登录，跳转到登录页
          router.replace('/login')
        }
      } catch (error) {
        console.error('检查认证状态失败:', error)
        router.replace('/login')
      }
    }
    checkAuth()
  }, [mounted, token])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>加载中...</Text>
    </View>
  )
}

