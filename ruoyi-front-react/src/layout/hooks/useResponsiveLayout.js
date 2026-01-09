import { useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import layoutConfig from '@/config/layoutConfig'

export function useResponsiveLayout() {
  const toggleDevice = useAppStore((state) => state.toggleDevice)
  const closeSideBar = useAppStore((state) => state.closeSideBar)

  useEffect(() => {
    let mounted = true

    const handleResize = () => {
      if (!mounted) return

      const { mobileBreakpoint } = layoutConfig
      const currentWidth = window.innerWidth
      const isMobile = currentWidth - 1 < mobileBreakpoint
      const currentDevice = useAppStore.getState().device
      const currentSidebar = useAppStore.getState().sidebar

      if (isMobile && currentDevice !== 'mobile') {
        toggleDevice('mobile')
        if (currentSidebar.opened) {
          closeSideBar({ withoutAnimation: true })
        }
      } else if (!isMobile && currentDevice !== 'desktop') {
        toggleDevice('desktop')
      }
    }

    const timer = setTimeout(() => {
      if (mounted) {
        handleResize()
        window.addEventListener('resize', handleResize)
      }
    }, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
      window.removeEventListener('resize', handleResize)
    }
  }, [toggleDevice, closeSideBar])
}
