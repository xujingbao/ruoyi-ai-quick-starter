import { useEffect } from 'react'
import { App as AntdApp } from 'antd'
import { setAntdAppApi } from './antdApp'

/**
 * Bridge Ant Design App context (message/modal/notification)
 * to non-React modules (e.g. plugins/modal.js).
 */
export default function AntdAppBridge({ children }) {
  const api = AntdApp.useApp()

  useEffect(() => {
    setAntdAppApi(api)
    return () => setAntdAppApi(null)
  }, [api])

  return children
}

