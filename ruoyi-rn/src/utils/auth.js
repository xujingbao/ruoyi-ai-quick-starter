import * as SecureStore from 'expo-secure-store'

const TokenKey = 'App-Token'

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TokenKey)
  } catch (error) {
    console.error('获取 token 失败:', error)
    return null
  }
}

export async function setToken(token) {
  try {
    await SecureStore.setItemAsync(TokenKey, token)
  } catch (error) {
    console.error('保存 token 失败:', error)
  }
}

export async function removeToken() {
  try {
    await SecureStore.deleteItemAsync(TokenKey)
  } catch (error) {
    console.error('删除 token 失败:', error)
  }
}

