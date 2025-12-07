import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import config from '../../config'
import storage from '../../utils/storage'
import constant from '../../utils/constant'
import { getInfo, login, logout } from '../../api/login'
import { getToken, removeToken, setToken } from '../../utils/auth'

// 默认头像（如果不存在，使用占位符）
const defAva = null

// 登录
export const loginAction = createAsyncThunk(
  'user/login',
  async (userInfo, { rejectWithValue }) => {
    try {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      const res = await login(username, password, code, uuid)
      await setToken(res.token)
      return res
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// 获取用户信息
export const getInfoAction = createAsyncThunk(
  'user/getInfo',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getInfo()
      const user = res.user
      let avatar = user.avatar || ""
      if (avatar && !avatar.startsWith('http') && !avatar.startsWith('data:')) {
        avatar = avatar ? config.baseUrl + avatar : (defAva || '')
      }
      const userid = user && user.userId ? user.userId : ""
      const username = user && user.userName ? user.userName : ""
      
      return {
        ...res,
        userid,
        username,
        avatar
      }
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

// 退出登录
export const logOutAction = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logout()
      await removeToken()
      await storage.clean()
      return true
    } catch (error) {
      return rejectWithValue(error)
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: null,
    id: '',
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  },
  reducers: {
    SET_TOKEN: (state, action) => {
      state.token = action.payload
    },
    SET_ID: (state, action) => {
      state.id = action.payload
      // 异步存储，不阻塞 reducer
      storage.set(constant.id, action.payload).catch(err => console.error('存储 ID 失败:', err))
    },
    SET_NAME: (state, action) => {
      state.name = action.payload
      storage.set(constant.name, action.payload).catch(err => console.error('存储 NAME 失败:', err))
    },
    SET_AVATAR: (state, action) => {
      state.avatar = action.payload
      storage.set(constant.avatar, action.payload).catch(err => console.error('存储 AVATAR 失败:', err))
    },
    SET_ROLES: (state, action) => {
      state.roles = action.payload
      storage.set(constant.roles, action.payload).catch(err => console.error('存储 ROLES 失败:', err))
    },
    SET_PERMISSIONS: (state, action) => {
      state.permissions = action.payload
      storage.set(constant.permissions, action.payload).catch(err => console.error('存储 PERMISSIONS 失败:', err))
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAction.fulfilled, (state, action) => {
        state.token = action.payload.token
      })
      .addCase(getInfoAction.fulfilled, (state, action) => {
        state.id = action.payload.userid
        state.name = action.payload.username
        state.avatar = action.payload.avatar
        if (action.payload.roles && action.payload.roles.length > 0) {
          state.roles = action.payload.roles
          state.permissions = action.payload.permissions
        } else {
          state.roles = ['ROLE_DEFAULT']
        }
      })
      .addCase(logOutAction.fulfilled, (state) => {
        state.token = null
        state.id = ''
        state.name = ''
        state.avatar = ''
        state.roles = []
        state.permissions = []
      })
  }
})

export const { SET_TOKEN, SET_ID, SET_NAME, SET_AVATAR, SET_ROLES, SET_PERMISSIONS } = userSlice.actions
export default userSlice.reducer

