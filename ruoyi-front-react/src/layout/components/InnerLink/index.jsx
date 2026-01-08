import { useEffect, useRef, useState } from 'react'
import { Spin } from 'antd'

const InnerLink = ({ src = '/', iframeId }) => {
  const [loading, setLoading] = useState(true)
  const [height, setHeight] = useState(`${document.documentElement.clientHeight - 94.5}px`)
  const iframeRef = useRef(null)

  useEffect(() => {
    const updateHeight = () => {
      setHeight(`${document.documentElement.clientHeight - 94.5}px`)
    }
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.onload = () => {
        setLoading(false)
      }
    }
  }, [])

  return (
    <div style={{ height }} className="inner-link-container">
      <Spin spinning={loading} tip="正在加载页面，请稍候！">
        <iframe
          id={iframeId}
          ref={iframeRef}
          style={{ width: '100%', height: '100%' }}
          src={src}
          frameBorder="no"
        />
      </Spin>
    </div>
  )
}

export default InnerLink
