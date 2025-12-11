import AsyncStorage from '@react-native-async-storage/async-storage'
import constant from './constant'

// 存储变量名
const storageKey = 'storage_data'

// 存储节点变量名
const storageNodeKeys = [constant.avatar, constant.id, constant.name, constant.roles, constant.permissions]

const storage = {
  set: async function(key, value) {
    if (storageNodeKeys.indexOf(key) !== -1) {
      try {
        const tmp = await AsyncStorage.getItem(storageKey)
        const data = tmp ? JSON.parse(tmp) : {}
        data[key] = value
        await AsyncStorage.setItem(storageKey, JSON.stringify(data))
      } catch (error) {
        console.error('存储数据失败:', error)
      }
    }
  },
  get: async function(key) {
    try {
      const storageData = await AsyncStorage.getItem(storageKey)
      const data = storageData ? JSON.parse(storageData) : {}
      return data[key] || ""
    } catch (error) {
      console.error('获取数据失败:', error)
      return ""
    }
  },
  remove: async function(key) {
    try {
      const storageData = await AsyncStorage.getItem(storageKey)
      const data = storageData ? JSON.parse(storageData) : {}
      delete data[key]
      await AsyncStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('删除数据失败:', error)
    }
  },
  clean: async function() {
    try {
      await AsyncStorage.removeItem(storageKey)
    } catch (error) {
      console.error('清空数据失败:', error)
    }
  }
}

export default storage




