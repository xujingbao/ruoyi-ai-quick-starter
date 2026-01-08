import { useState, useEffect } from 'react'
import { useDictStore } from '@/store/dictStore'
import { getDicts } from '@/api/system/dict/data'

/**
 * 获取字典数据 - React Hook 版本
 */
export function useDict(...args) {
  const [dictData, setDictData] = useState({})
  const dictStore = useDictStore()

  useEffect(() => {
    const res = {}
    args.forEach((dictType) => {
      res[dictType] = []
      const dicts = dictStore.getDict(dictType)
      if (dicts) {
        res[dictType] = dicts
      } else {
        getDicts(dictType).then(resp => {
          const dictList = resp.data.map(p => ({ 
            label: p.dictLabel, 
            value: p.dictValue, 
            elTagType: p.listClass, 
            elTagClass: p.cssClass 
          }))
          dictStore.setDict(dictType, dictList)
          setDictData(prev => ({
            ...prev,
            [dictType]: dictList
          }))
        })
      }
    })
    setDictData(res)
  }, [args.join(',')])

  return dictData
}
