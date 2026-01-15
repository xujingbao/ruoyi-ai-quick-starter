import { useState, useEffect } from 'react'
import { Layout } from 'antd'
import SplitPane from 'react-split-pane'
import './index.scss'

const { Sider, Content } = Layout

const Splitpanes = ({ 
  children, 
  horizontal = false,
  defaultSize = 200,
  minSize = 100,
  maxSize = 500,
  className = ''
}) => {
  const [paneSize, setPaneSize] = useState(defaultSize)

  if (horizontal) {
    return (
      <div className={`splitpanes-container ${className}`}>
        <SplitPane
          split="horizontal"
          defaultSize={defaultSize}
          minSize={minSize}
          maxSize={maxSize}
          onChange={(size) => setPaneSize(size)}
        >
          {children}
        </SplitPane>
      </div>
    )
  }

  return (
    <div className={`splitpanes-container ${className}`}>
      <SplitPane
        split="vertical"
        defaultSize={defaultSize}
        minSize={minSize}
        maxSize={maxSize}
        onChange={(size) => setPaneSize(size)}
      >
        {children}
      </SplitPane>
    </div>
  )
}

export default Splitpanes
