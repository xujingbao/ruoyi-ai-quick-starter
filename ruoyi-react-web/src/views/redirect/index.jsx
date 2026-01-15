import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Redirect = () => {
  const navigate = useNavigate()
  const { path } = useParams()

  useEffect(() => {
    if (path) {
      navigate(`/${path}`, { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [path, navigate])

  return null
}

export default Redirect
