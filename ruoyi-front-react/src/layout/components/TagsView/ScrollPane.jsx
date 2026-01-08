import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import './ScrollPane.scss'

const ScrollPane = forwardRef(({ children, onScroll, className = '' }, ref) => {
  const scrollContainerRef = useRef(null)
  const scrollWrapperRef = useRef(null)
  const tagAndTagSpacing = 4

  useEffect(() => {
    if (scrollContainerRef.current) {
      const wrapper = scrollContainerRef.current.querySelector('.scrollbar-wrapper')
      scrollWrapperRef.current = wrapper
      if (wrapper) {
        wrapper.addEventListener('scroll', onScroll, true)
      }
    }

    return () => {
      if (scrollWrapperRef.current) {
        scrollWrapperRef.current.removeEventListener('scroll', onScroll)
      }
    }
  }, [onScroll])

  const handleScroll = (e) => {
    const eventDelta = e.wheelDelta || -e.deltaY * 40
    if (scrollWrapperRef.current) {
      scrollWrapperRef.current.scrollLeft = scrollWrapperRef.current.scrollLeft + eventDelta / 4
    }
  }

  const moveToTarget = (currentTag, visitedViews) => {
    if (!scrollContainerRef.current || !scrollWrapperRef.current) return

    const $container = scrollContainerRef.current
    const $containerWidth = $container.offsetWidth
    const $scrollWrapper = scrollWrapperRef.current

    let firstTag = null
    let lastTag = null

    if (visitedViews.length > 0) {
      firstTag = visitedViews[0]
      lastTag = visitedViews[visitedViews.length - 1]
    }

    if (firstTag === currentTag) {
      $scrollWrapper.scrollLeft = 0
    } else if (lastTag === currentTag) {
      $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
    } else {
      const tagListDom = document.getElementsByClassName('tags-view-item')
      const currentIndex = visitedViews.findIndex(item => item === currentTag)
      let prevTag = null
      let nextTag = null
      for (const k in tagListDom) {
        if (k !== 'length' && Object.hasOwnProperty.call(tagListDom, k)) {
          if (tagListDom[k].dataset.path === visitedViews[currentIndex - 1]?.path) {
            prevTag = tagListDom[k]
          }
          if (tagListDom[k].dataset.path === visitedViews[currentIndex + 1]?.path) {
            nextTag = tagListDom[k]
          }
        }
      }

      if (nextTag && prevTag) {
        const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + tagAndTagSpacing
        const beforePrevTagOffsetLeft = prevTag.offsetLeft - tagAndTagSpacing
        if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
          $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
        } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
          $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
        }
      }
    }
  }

  useImperativeHandle(ref, () => ({
    moveToTarget: (currentTag, visitedViews) => {
      moveToTarget(currentTag, visitedViews)
    }
  }))

  return (
    <div
      ref={scrollContainerRef}
      className={`scroll-container ${className}`.trim()}
      onWheel={handleScroll}
    >
      <div className="scrollbar-wrapper">
        {children}
      </div>
    </div>
  )
})

ScrollPane.displayName = 'ScrollPane'

export default ScrollPane
