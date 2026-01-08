import { create } from 'zustand'
import router from '@/router'
import { Modal } from 'antd'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { isHttp, isEmpty } from "@/utils/validate"
import defAva from '@/assets/images/profile.jpg'

export const useUserStore = create((set, get) => ({
  token: getToken(),
  id: '',
  name: '',
  nickName: '',
  avatar: '',
  deptName: '',
  roles: [],
  permissions: [],
  
  // 登录
  login: async (userInfo) => {
    const username = userInfo.username.trim()
    const password = userInfo.password
    const code = userInfo.code
    const uuid = userInfo.uuid
    try {
      const res = await login(username, password, code, uuid)
      setToken(res.token)
      set({ token: res.token })
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 获取用户信息
  getInfo: async () => {
    try {
      const res = await getInfo()
      const user = res.user
      let avatar = user.avatar || ""
      if (!isHttp(avatar)) {
        avatar = (isEmpty(avatar)) ? defAva : import.meta.env.VITE_APP_BASE_API + avatar
      }
      let roles = []
      if (res.roles && res.roles.length > 0) {
        roles = res.roles
      } else {
        roles = ['ROLE_DEFAULT']
      }
      
      set({
        id: user.userId,
        name: user.userName,
        nickName: user.nickName,
        avatar: avatar,
        deptName: user.dept?.deptName || '',
        roles: roles,
        permissions: res.permissions || []
      })
      
      /* 初始密码提示 */
      if(res.isDefaultModifyPwd) {
        Modal.confirm({
          title: '安全提示',
          content: '您的密码还是初始密码，请修改密码！',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            router.navigate({ pathname: '/user/profile', search: '?activeTab=resetPwd' })
          }
        })
      }
      /* 过期密码提示 */
      if(!res.isDefaultModifyPwd && res.isPasswordExpired) {
        Modal.confirm({
          title: '安全提示',
          content: '您的密码已过期，请尽快修改密码！',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            router.navigate({ pathname: '/user/profile', search: '?activeTab=resetPwd' })
          }
        })
      }
      
      return Promise.resolve(res)
    } catch (error) {
      return Promise.reject(error)
    }
  },
  
  // 退出系统
  logOut: async () => {
    try {
      await logout(get().token)
      set({
        token: '',
        id: '',
        name: '',
        nickName: '',
        avatar: '',
        deptName: '',
        roles: [],
        permissions: []
      })
      removeToken()
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }
}))
