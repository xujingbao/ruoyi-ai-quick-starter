export function getLayoutWrapperClass({ sidebar, device }) {
  const classes = ['app-wrapper']
  if (!sidebar.opened) {
    classes.push('hideSidebar')
  } else if (sidebar.opened) {
    classes.push('openSidebar')
  }
  if (sidebar.withoutAnimation) {
    classes.push('withoutAnimation')
  }
  if (device === 'mobile') {
    classes.push('mobile')
  }
  return classes.join(' ')
}
