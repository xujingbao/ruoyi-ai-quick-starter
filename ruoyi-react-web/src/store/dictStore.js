import { create } from 'zustand'

export const useDictStore = create((set, get) => ({
  dict: [],
  
  // 获取字典
  getDict: (_key) => {
    if (_key == null || _key === "") {
      return null
    }
    try {
      const dict = get().dict
      for (let i = 0; i < dict.length; i++) {
        if (dict[i].key == _key) {
          return dict[i].value
        }
      }
    } catch (e) {
      return null
    }
    return null
  },
  
  // 设置字典
  setDict: (_key, value) => {
    if (_key !== null && _key !== "") {
      set((state) => ({
        dict: [...state.dict, { key: _key, value: value }]
      }))
    }
  },
  
  // 删除字典
  removeDict: (_key) => {
    try {
      set((state) => ({
        dict: state.dict.filter(item => item.key !== _key)
      }))
      return true
    } catch (e) {
      return false
    }
  },
  
  // 清空字典
  cleanDict: () => {
    set({ dict: [] })
  },
  
  // 初始字典
  initDict: () => {
    // 初始化逻辑
  }
}))
