import { create } from 'zustand'
import Cookies from 'js-cookie'

export const useAppStore = create((set) => ({
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false,
    hide: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'default',
  
  toggleSideBar: (withoutAnimation) => {
    set((state) => {
      if (state.sidebar.hide) {
        return state
      }
      const opened = !state.sidebar.opened
      if (opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      return {
        sidebar: {
          ...state.sidebar,
          opened,
          withoutAnimation
        }
      }
    })
  },
  
  closeSideBar: ({ withoutAnimation }) => {
    Cookies.set('sidebarStatus', 0)
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        opened: false,
        withoutAnimation
      }
    }))
  },
  
  toggleDevice: (device) => {
    set({ device })
  },
  
  setSize: (size) => {
    Cookies.set('size', size)
    set({ size })
  },
  
  toggleSideBarHide: (status) => {
    set((state) => ({
      sidebar: {
        ...state.sidebar,
        hide: status
      }
    }))
  }
}))
