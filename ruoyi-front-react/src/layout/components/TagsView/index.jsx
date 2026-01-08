import { useState, useEffect, useRef } from 'react'
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
      if (route.meta && route.meta.affix) {
        const tagPath = getNormalPath(basePath + '/' + route.path)
        tags.push({
          fullPath: tagPath,
          path: tagPath,
          name: route.name,
          meta: { ...route.meta }
        })
      }
      if (route.children) {
        const tempTags = filterAffixTags(route.children, route.path)
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

  const addTags = () => {
    const { name } = location
    if (name) {
      useTagsViewStore.getState().addView({ path: location.pathname, meta: location.state?.meta || {} })
    }
  }

  useEffect(() => {
    initTags()
    addTags()
  }, [])

  useEffect(() => {
    addTags()
  }, [location.pathname])

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
      // moveToCurrentTag()
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

  const isFirstView = () => {
    try {
      return selectedTag.fullPath === '/index' || selectedTag.fullPath === visitedViews[1]?.fullPath
    } catch (err) {
      return false
    }
  }

  const isLastView = () => {
    try {
      return selectedTag.fullPath === visitedViews[visitedViews.length - 1]?.fullPath
    } catch (err) {
      return false
    }
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
              {IconComponent && <IconComponent />}
              {tag.title || tag.meta?.title}
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
          {!isFirstView() && (
            <li onClick={closeLeftTags}>
              <LeftOutlined /> 关闭左侧
            </li>
          )}
          {!isLastView() && (
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
