import { useEffect, useRef } from 'react'
import { useUserStore } from '@/store/userStore'

/**
 * 权限检查 Hook
 * @param {Array} permissions - 权限数组
 * @returns {boolean} - 是否有权限
 */
export function usePermission(permissions) {
  const userStore = useUserStore()
  const all_permission = "*:*:*"
  const userPermissions = userStore.permissions

  if (permissions && permissions instanceof Array && permissions.length > 0) {
    return userPermissions.some(permission => {
      return all_permission === permission || permissions.includes(permission)
    })
  }
  return false
}

/**
 * 角色检查 Hook
 * @param {Array} roles - 角色数组
 * @returns {boolean} - 是否有角色
 */
export function useRole(roles) {
  const userStore = useUserStore()
  const super_admin = "admin"
  const userRoles = userStore.roles

  if (roles && roles instanceof Array && roles.length > 0) {
    return userRoles.some(role => {
      return super_admin === role || roles.includes(role)
    })
  }
  return false
}

/**
 * 权限控制组件 - 根据权限显示/隐藏子元素
 */
export function HasPermission({ permissions, children, fallback = null }) {
  const hasPermission = usePermission(permissions)
  return hasPermission ? children : fallback
}

/**
 * 角色控制组件 - 根据角色显示/隐藏子元素
 */
export function HasRole({ roles, children, fallback = null }) {
  const hasRole = useRole(roles)
  return hasRole ? children : fallback
}
