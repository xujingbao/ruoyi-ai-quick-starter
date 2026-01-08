import { useState, useEffect } from 'react'
import { useDictStore } from '@/store/dictStore'
import { getDicts } from '@/api/system/dict/data'

/**
 * 获取字典数据 Hook
 * @param {...string} args - 字典类型列表
 * @returns {Object} 字典数据对象，每个字典类型对应一个数组
 */
export function useDict(...args) {
  const dictStore = useDictStore()
  const [dictData, setDictData] = useState({})

  useEffect(() => {
    const loadDicts = async () => {
      const newDictData = {}
      
      for (const dictType of args) {
        if (!dictType) continue
        
        // 先从 store 中获取
        const cached = dictStore.getDict(dictType)
        if (cached) {
          newDictData[dictType] = cached
        } else {
          // 从 API 获取
          try {
            const resp = await getDicts(dictType)
            const dictList = resp.data.map(p => ({
              label: p.dictLabel,
              value: p.dictValue,
              elTagType: p.listClass,
              elTagClass: p.cssClass
            }))
            dictStore.setDict(dictType, dictList)
            newDictData[dictType] = dictList
          } catch (error) {
            console.error(`Failed to load dict ${dictType}:`, error)
            newDictData[dictType] = []
          }
        }
      }
      
      setDictData(newDictData)
    }

    loadDicts()
  }, [args.join(',')])

  return dictData
}
