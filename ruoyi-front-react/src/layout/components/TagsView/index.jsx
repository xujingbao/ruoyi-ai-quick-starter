import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CloseOutlined, ReloadOutlined, CloseCircleOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { useTagsViewStore } from '@/store/tagsViewStore'
import { useSettingsStore } from '@/store/settingsStore'
import { usePermissionStore } from '@/store/permissionStore'
import { getNormalPath } from '@/utils/ruoyi'
import { getIconComponent } from '@/utils/icon'
import { useTab } from '@/plugins/tab'
import ScrollPane from './ScrollPane'
import './index.scss'

const TagsView = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const visitedViews = useTagsViewStore((state) => state.visitedViews)
  const routes = usePermissionStore((state) => state.routes)
  const theme = useSettingsStore((state) => state.theme)
  const tagsIcon = useSettingsStore((state) => state.tagsIcon)
  const { refreshPage, closePage, closeOthersPage, closeLeftPage, closeRightPage, closeAllPage } = useTab()
  
  const [visible, setVisible] = useState(false)
  const [top, setTop] = useState(0)
  const [left, setLeft] = useState(0)
  const [selectedTag, setSelectedTag] = useState({})
  const [affixTags, setAffixTags] = useState([])
  const scrollPaneRef = useRef(null)
  const containerRef = useRef(null)
  const initedRef = useRef(false)

  const isActive = (r) => {
    return r.path === location.pathname
  }

  const activeStyle = (tag) => {
    if (!isActive(tag)) return {}
    return {
      backgroundColor: theme,
      borderColor: theme
    }
  }

  const isAffix = (tag) => {
    return tag.meta && tag.meta.affix
  }

  const filterAffixTags = (routes, basePath = '') => {
    let tags = []
    routes.forEach(route => {
      const routeMeta = route.handle?.meta || route.meta
      const routePath = route.index ? '' : (route.path || '')
      if (routeMeta && routeMeta.affix) {
        const tagPath = getNormalPath(`${basePath}/${routePath}`) || '/'
        tags.push({
          fullPath: tagPath,
          path: tagPath,
          name: route.name || route.routeName || tagPath,
          meta: { ...routeMeta }
        })
      }
      if (route.children) {
        const nextBasePath = getNormalPath(`${basePath}/${routePath}`) || '/'
        const tempTags = filterAffixTags(route.children, nextBasePath)
        if (tempTags.length >= 1) {
          tags = [...tags, ...tempTags]
        }
      }
    })
    return tags
  }

  const initTags = () => {
    const res = filterAffixTags(routes)
    setAffixTags(res)
    res.forEach(tag => {
      if (tag.name) {
        useTagsViewStore.getState().addVisitedView(tag)
      }
    })
  }

  const findRouteByPath = useCallback((routeList, pathname, basePath = '') => {
    for (const route of routeList || []) {
      const routePath = route.index ? '' : (route.path || '')
      const fullPath = getNormalPath(`${basePath}/${routePath}`) || '/'
      if (fullPath === pathname) return route
      if (route.children?.length) {
        const found = findRouteByPath(route.children, pathname, fullPath)
        if (found) return found
      }
    }
    return null
  }, [])

  const addTags = useCallback(() => {
    // 不在 tags-view 中展示这些页面
    const ignore = ['/login', '/register', '/401']
    if (ignore.includes(location.pathname) || location.pathname.startsWith('/redirect')) return

    const route = findRouteByPath(routes, location.pathname)
    const meta = route?.handle?.meta || route?.meta || {}
    if (meta.hidden) return

    const fullPath = `${location.pathname}${location.search || ''}`
    const view = {
      path: location.pathname,
      fullPath,
      name: route?.name || route?.routeName || location.pathname,
      meta,
      title: meta.title
    }

    const store = useTagsViewStore.getState()
    // 已存在则更新（例如 query 变化）
    if (store.visitedViews.some(v => v.path === view.path)) {
      store.updateVisitedView(view)
      return
    }
    store.addView(view)
  }, [findRouteByPath, location.pathname, location.search, routes])

  const moveToCurrentTag = useCallback(() => {
    if (!scrollPaneRef.current) return
    const store = useTagsViewStore.getState()
    const current = store.visitedViews.find(v => v.path === location.pathname)
    if (!current) return

    // DOM 更新后滚动到当前标签
    setTimeout(() => {
      scrollPaneRef.current?.moveToTarget(current, store.visitedViews)
    }, 0)
  }, [location.pathname])

  useEffect(() => {
    if (!initedRef.current && routes?.length) {
      initTags()
      initedRef.current = true
    }
  }, [routes?.length])

  useEffect(() => {
    addTags()
    moveToCurrentTag()
  }, [location.pathname, location.search, addTags, moveToCurrentTag])

  useEffect(() => {
    if (visible) {
      document.body.addEventListener('click', closeMenu)
    } else {
      document.body.removeEventListener('click', closeMenu)
    }
    return () => {
      document.body.removeEventListener('click', closeMenu)
    }
  }, [visible])

  const openMenu = (tag, e) => {
    if (!containerRef.current) return
    
    const menuMinWidth = 105
    const offsetLeft = containerRef.current.getBoundingClientRect().left
    const offsetWidth = containerRef.current.offsetWidth
    const maxLeft = offsetWidth - menuMinWidth
    const l = e.clientX - offsetLeft + 15

    setLeft(l > maxLeft ? maxLeft : l)
    setTop(e.clientY)
    setVisible(true)
    setSelectedTag(tag)
  }

  const closeMenu = () => {
    setVisible(false)
  }

  const handleScroll = () => {
    closeMenu()
  }

  const refreshSelectedTag = (view) => {
    refreshPage(view)
  }

  const closeSelectedTag = (view) => {
    closePage(view).then(({ visitedViews }) => {
      if (isActive(view)) {
        toLastView(visitedViews, view)
      }
    })
  }

  const closeRightTags = () => {
    closeRightPage(selectedTag).then(visitedViews => {
      if (!visitedViews.find(i => i.path === location.pathname)) {
        toLastView(visitedViews)
      }
    })
  }

  const closeLeftTags = () => {
    closeLeftPage(selectedTag).then(visitedViews => {
      if (!visitedViews.find(i => i.path === location.pathname)) {
        toLastView(visitedViews)
      }
    })
  }

  const closeOthersTags = () => {
    navigate(selectedTag.path)
    closeOthersPage(selectedTag).then(() => {
      moveToCurrentTag()
    })
  }

  const closeAllTags = (view) => {
    closeAllPage().then(({ visitedViews }) => {
      if (affixTags.some(tag => tag.path === location.pathname)) {
        return
      }
      toLastView(visitedViews, view)
    })
  }

  const toLastView = (visitedViews, view) => {
    const latestView = visitedViews.slice(-1)[0]
    if (latestView) {
      navigate(latestView.path)
    } else {
      if (view?.name === 'Dashboard') {
        navigate(`/redirect${view.fullPath}`, { replace: true })
      } else {
        navigate('/')
      }
    }
  }

  const hasNonAffixLeft = () => {
    const idx = visitedViews.findIndex(v => v.path === selectedTag.path)
    if (idx <= 0) return false
    return visitedViews.slice(0, idx).some(v => !v.meta?.affix)
  }

  const hasNonAffixRight = () => {
    const idx = visitedViews.findIndex(v => v.path === selectedTag.path)
    if (idx === -1 || idx >= visitedViews.length - 1) return false
    return visitedViews.slice(idx + 1).some(v => !v.meta?.affix)
  }

  return (
    <div id="tags-view-container" className="tags-view-container" ref={containerRef}>
      <ScrollPane ref={scrollPaneRef} onScroll={handleScroll} className="tags-view-wrapper">
        {visitedViews.map(tag => {
          const IconComponent = tagsIcon && tag.meta?.icon && tag.meta.icon !== '#' 
            ? getIconComponent(tag.meta.icon) 
            : null
          
          return (
            <Link
              key={tag.path}
              data-path={tag.path}
              to={tag.path}
              className={`tags-view-item ${isActive(tag) ? 'active' : ''} ${tagsIcon ? 'has-icon' : ''}`}
              style={activeStyle(tag)}
              onContextMenu={(e) => {
                e.preventDefault()
                openMenu(tag, e)
              }}
              onMouseDown={(e) => {
                if (e.button === 1 && !isAffix(tag)) {
                  e.preventDefault()
                  closeSelectedTag(tag)
                }
              }}
            >
              <span className="tag-content">
                {IconComponent && <IconComponent />}
                <span className="tag-title">{tag.title || tag.meta?.title}</span>
              </span>
              {!isAffix(tag) && (
                <span
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    closeSelectedTag(tag)
                  }}
                >
                  <CloseOutlined className="el-icon-close" />
                </span>
              )}
            </Link>
          )
        })}
      </ScrollPane>
      {visible && (
        <ul className="contextmenu" style={{ left: `${left}px`, top: `${top}px` }}>
          <li onClick={() => refreshSelectedTag(selectedTag)}>
            <ReloadOutlined /> 刷新页面
          </li>
          {!isAffix(selectedTag) && (
            <li onClick={() => closeSelectedTag(selectedTag)}>
              <CloseOutlined /> 关闭当前
            </li>
          )}
          <li onClick={closeOthersTags}>
            <CloseCircleOutlined /> 关闭其他
          </li>
          {hasNonAffixLeft() && (
            <li onClick={closeLeftTags}>
              <LeftOutlined /> 关闭左侧
            </li>
          )}
          {hasNonAffixRight() && (
            <li onClick={closeRightTags}>
              <RightOutlined /> 关闭右侧
            </li>
          )}
          <li onClick={() => closeAllTags(selectedTag)}>
            <CloseCircleOutlined /> 全部关闭
          </li>
        </ul>
      )}
    </div>
  )
}

export default TagsView
