import { create } from 'zustand'

export const useTagsViewStore = create((set, get) => ({
  visitedViews: [],
  cachedViews: [],
  iframeViews: [],
  
  addView: (view) => {
    get().addVisitedView(view)
    get().addCachedView(view)
  },
  
  addIframeView: (view) => {
    const state = get()
    if (state.iframeViews.some(v => v.path === view.path)) return
    set({
      iframeViews: [
        ...state.iframeViews,
        Object.assign({}, view, {
          title: view.meta?.title || 'no-name'
        })
      ]
    })
  },
  
  addVisitedView: (view) => {
    const state = get()
    if (state.visitedViews.some(v => v.path === view.path)) return
    set({
      visitedViews: [
        ...state.visitedViews,
        Object.assign({}, view, {
          title: view.meta?.title || 'no-name'
        })
      ]
    })
  },
  
  addCachedView: (view) => {
    const state = get()
    if (state.cachedViews.includes(view.name)) return
    if (!view.meta?.noCache) {
      set({
        cachedViews: [...state.cachedViews, view.name]
      })
    }
  },
  
  delView: (view) => {
    return new Promise(resolve => {
      get().delVisitedView(view)
      get().delCachedView(view)
      const state = get()
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  
  delVisitedView: (view) => {
    return new Promise(resolve => {
      set((state) => {
        const visitedViews = state.visitedViews.filter(v => v.path !== view.path)
        const iframeViews = state.iframeViews.filter(item => item.path !== view.path)
        return { visitedViews, iframeViews }
      })
      resolve([...get().visitedViews])
    })
  },
  
  delIframeView: (view) => {
    return new Promise(resolve => {
      set((state) => ({
        iframeViews: state.iframeViews.filter(item => item.path !== view.path)
      }))
      resolve([...get().iframeViews])
    })
  },
  
  delCachedView: (view) => {
    return new Promise(resolve => {
      set((state) => {
        const index = state.cachedViews.indexOf(view.name)
        if (index > -1) {
          return {
            cachedViews: state.cachedViews.filter((_, i) => i !== index)
          }
        }
        return state
      })
      resolve([...get().cachedViews])
    })
  },
  
  delOthersViews: (view) => {
    return new Promise(resolve => {
      get().delOthersVisitedViews(view)
      get().delOthersCachedViews(view)
      const state = get()
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  
  delOthersVisitedViews: (view) => {
    return new Promise(resolve => {
      set((state) => {
        const visitedViews = state.visitedViews.filter(v => {
          return v.meta?.affix || v.path === view.path
        })
        const iframeViews = state.iframeViews.filter(item => item.path === view.path)
        return { visitedViews, iframeViews }
      })
      resolve([...get().visitedViews])
    })
  },
  
  delOthersCachedViews: (view) => {
    return new Promise(resolve => {
      set((state) => {
        const index = state.cachedViews.indexOf(view.name)
        if (index > -1) {
          return {
            cachedViews: state.cachedViews.slice(index, index + 1)
          }
        } else {
          return { cachedViews: [] }
        }
      })
      resolve([...get().cachedViews])
    })
  },
  
  delAllViews: (view) => {
    return new Promise(resolve => {
      get().delAllVisitedViews(view)
      get().delAllCachedViews(view)
      const state = get()
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      })
    })
  },
  
  delAllVisitedViews: (view) => {
    return new Promise(resolve => {
      set((state) => {
        const affixTags = state.visitedViews.filter(tag => tag.meta?.affix)
        return {
          visitedViews: affixTags,
          iframeViews: []
        }
      })
      resolve([...get().visitedViews])
    })
  },
  
  delAllCachedViews: (view) => {
    return new Promise(resolve => {
      set({ cachedViews: [] })
      resolve([...get().cachedViews])
    })
  },
  
  updateVisitedView: (view) => {
    set((state) => {
      const visitedViews = state.visitedViews.map(v => {
        if (v.path === view.path) {
          return Object.assign(v, view)
        }
        return v
      })
      return { visitedViews }
    })
  },
  
  delRightTags: (view) => {
    return new Promise(resolve => {
      set((state) => {
        const index = state.visitedViews.findIndex(v => v.path === view.path)
        if (index === -1) {
          return state
        }
        const visitedViews = state.visitedViews.filter((item, idx) => {
          if (idx <= index || (item.meta && item.meta.affix)) {
            return true
          }
          const i = state.cachedViews.indexOf(item.name)
          if (i > -1) {
            state.cachedViews.splice(i, 1)
          }
          if(item.meta?.link) {
            const fi = state.iframeViews.findIndex(v => v.path === item.path)
            if (fi > -1) {
              state.iframeViews.splice(fi, 1)
            }
          }
          return false
        })
        return { visitedViews }
      })
      resolve([...get().visitedViews])
    })
  },
  
  delLeftTags: (view) => {
    return new Promise(resolve => {
      set((state) => {
        const index = state.visitedViews.findIndex(v => v.path === view.path)
        if (index === -1) {
          return state
        }
        const visitedViews = state.visitedViews.filter((item, idx) => {
          if (idx >= index || (item.meta && item.meta.affix)) {
            return true
          }
          const i = state.cachedViews.indexOf(item.name)
          if (i > -1) {
            state.cachedViews.splice(i, 1)
          }
          if(item.meta?.link) {
            const fi = state.iframeViews.findIndex(v => v.path === item.path)
            if (fi > -1) {
              state.iframeViews.splice(fi, 1)
            }
          }
          return false
        })
        return { visitedViews }
      })
      resolve([...get().visitedViews])
    })
  }
}))
