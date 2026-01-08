import { Link as RouterLink } from 'react-router-dom'
import { isExternal } from '@/utils/validate'

const AppLink = ({ to, children }) => {
  const isExt = isExternal(to)

  if (isExt) {
    return (
      <a href={to} target="_blank" rel="noopener">
        {children}
      </a>
    )
  }

  return <RouterLink to={to}>{children}</RouterLink>
}

export default AppLink
