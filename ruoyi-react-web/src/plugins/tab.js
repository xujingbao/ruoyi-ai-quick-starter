import { useTagsViewStore } from '@/store/tagsViewStore'
import { useNavigate, useLocation } from 'react-router-dom'

// React 版本的 tab 工具函数
// 注意：这些函数需要在组件内部使用，因为它们依赖 React Router hooks
export function useTab() {
  const navigate = useNavigate()
  const location = useLocation()
  const tagsViewStore = useTagsViewStore()

  // 刷新当前tab页签
  const refreshPage = (obj) => {
    if (obj === undefined) {
      const path = location.pathname
      const search = location.search
      obj = { path, search }
    }
    return tagsViewStore.delCachedView({ path: location.pathname }).then(() => {
      const { path, search } = obj
      navigate(`/redirect${path}${search}`, { replace: true })
    })
  }

  // 关闭当前tab页签，打开新页签
  const closeOpenPage = (obj) => {
    tagsViewStore.delView({ path: location.pathname })
    if (obj !== undefined) {
      return navigate(obj.path || obj, { state: obj.state })
    }
  }

  // 关闭指定tab页签
  const closePage = (obj) => {
    if (obj === undefined) {
      return tagsViewStore.delView({ path: location.pathname }).then(({ visitedViews }) => {
        const latestView = visitedViews.slice(-1)[0]
        if (latestView) {
          return navigate(latestView.path)
        }
        return navigate('/')
      })
    }
    return tagsViewStore.delView(obj)
  }

  // 关闭所有tab页签
  const closeAllPage = () => {
    return tagsViewStore.delAllViews()
  }

  // 关闭左侧tab页签
  const closeLeftPage = (obj) => {
    return tagsViewStore.delLeftTags(obj || { path: location.pathname })
  }

  // 关闭右侧tab页签
  const closeRightPage = (obj) => {
    return tagsViewStore.delRightTags(obj || { path: location.pathname })
  }

  // 关闭其他tab页签
  const closeOtherPage = (obj) => {
    return tagsViewStore.delOthersViews(obj || { path: location.pathname })
  }
  // 兼容 Vue 版本命名
  const closeOthersPage = closeOtherPage

  // 打开tab页签
  const openPage = (title, url, params) => {
    const obj = { path: url, meta: { title: title } }
    tagsViewStore.addView(obj)
    const searchParams = new URLSearchParams(params).toString()
    return navigate(`${url}${searchParams ? '?' + searchParams : ''}`)
  }

  // 修改tab页签
  const updatePage = (obj) => {
    return tagsViewStore.updateVisitedView(obj)
  }

  return {
    refreshPage,
    closeOpenPage,
    closePage,
    closeAllPage,
    closeLeftPage,
    closeRightPage,
    closeOtherPage,
    closeOthersPage,
    openPage,
    updatePage
  }
}
