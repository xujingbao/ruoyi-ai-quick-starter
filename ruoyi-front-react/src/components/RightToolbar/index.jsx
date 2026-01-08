import { useState, useMemo } from 'react'
import { Button, Tooltip, Dropdown, Checkbox, Modal, Transfer } from 'antd'
import { SearchOutlined, ReloadOutlined, MenuOutlined } from '@ant-design/icons'
import './index.scss'

const RightToolbar = ({
  showSearch = true,
  columns = {},
  search = true,
  showColumnsType = 'checkbox',
  gutter = 10,
  onShowSearchChange,
  onQueryTable
}) => {
  const [open, setOpen] = useState(false)
  const [transferValue, setTransferValue] = useState([])

  const style = useMemo(() => {
    const ret = {}
    if (gutter) {
      ret.marginRight = `${gutter / 2}px`
    }
    return ret
  }, [gutter])

  // 是否全选/半选状态
  const isChecked = useMemo(() => {
    if (Array.isArray(columns)) {
      return columns.every(col => col.visible)
    } else {
      return Object.values(columns).every(col => col.visible)
    }
  }, [columns])

  const isIndeterminate = useMemo(() => {
    if (Array.isArray(columns)) {
      return columns.some(col => col.visible) && !isChecked
    } else {
      return Object.values(columns).some(col => col.visible) && !isChecked
    }
  }, [columns, isChecked])

  const transferData = useMemo(() => {
    if (Array.isArray(columns)) {
      return columns.map((item, index) => ({ key: index, title: item.label }))
    } else {
      return Object.keys(columns).map((key, index) => ({ key: index, title: columns[key].label }))
    }
  }, [columns])

  // 初始化 transfer 的 value（隐藏的列）
  useMemo(() => {
    if (showColumnsType === 'transfer') {
      const hiddenKeys = []
      if (Array.isArray(columns)) {
        columns.forEach((item, index) => {
          if (item.visible === false) {
            hiddenKeys.push(index)
          }
        })
      } else {
        Object.keys(columns).forEach((key, index) => {
          if (columns[key].visible === false) {
            hiddenKeys.push(index)
          }
        })
      }
      setTransferValue(hiddenKeys)
    }
  }, [showColumnsType, columns])

  const toggleSearch = () => {
    if (onShowSearchChange) {
      onShowSearchChange(!showSearch)
    }
  }

  const refresh = () => {
    if (onQueryTable) {
      onQueryTable()
    }
  }

  const showColumn = () => {
    setOpen(true)
  }

  const handleTransferChange = (targetKeys) => {
    setTransferValue(targetKeys)
    if (Array.isArray(columns)) {
      columns.forEach((item, index) => {
        item.visible = !targetKeys.includes(index)
      })
    } else {
      Object.keys(columns).forEach((key, index) => {
        columns[key].visible = !targetKeys.includes(index)
      })
    }
  }

  const checkboxChange = (checked, key) => {
    if (Array.isArray(columns)) {
      const item = columns.find(item => item.key === key)
      if (item) {
        item.visible = checked
      }
    } else {
      if (columns[key]) {
        columns[key].visible = checked
      }
    }
  }

  const toggleCheckAll = () => {
    const newValue = !isChecked
    if (Array.isArray(columns)) {
      columns.forEach(col => {
        col.visible = newValue
      })
    } else {
      Object.values(columns).forEach(col => {
        col.visible = newValue
      })
    }
  }

  const hasColumns = Array.isArray(columns) ? columns.length > 0 : Object.keys(columns).length > 0

  const dropdownMenu = {
    items: [
      {
        key: 'checkall',
        label: (
          <Checkbox
            indeterminate={isIndeterminate}
            checked={isChecked}
            onChange={toggleCheckAll}
          >
            列展示
          </Checkbox>
        )
      },
      {
        type: 'divider'
      },
      ...(Array.isArray(columns)
        ? columns.map((item, index) => ({
            key: item.key || index,
            label: (
              <Checkbox
                checked={item.visible}
                onChange={(e) => checkboxChange(e.target.checked, item.key)}
              >
                {item.label}
              </Checkbox>
            )
          }))
        : Object.keys(columns).map((key) => ({
            key,
            label: (
              <Checkbox
                checked={columns[key].visible}
                onChange={(e) => checkboxChange(e.target.checked, key)}
              >
                {columns[key].label}
              </Checkbox>
            )
          })))
    ]
  }

  return (
    <div className="top-right-btn" style={style}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {search && (
          <Tooltip title={showSearch ? '隐藏搜索' : '显示搜索'}>
            <Button
              shape="circle"
              icon={<SearchOutlined />}
              onClick={toggleSearch}
            />
          </Tooltip>
        )}
        <Tooltip title="刷新">
          <Button
            shape="circle"
            icon={<ReloadOutlined />}
            onClick={refresh}
          />
        </Tooltip>
        {hasColumns && showColumnsType === 'transfer' && (
          <Tooltip title="显隐列">
            <Button
              shape="circle"
              icon={<MenuOutlined />}
              onClick={showColumn}
            />
          </Tooltip>
        )}
        {hasColumns && showColumnsType === 'checkbox' && (
          <Dropdown menu={dropdownMenu} trigger={['click']}>
            <Tooltip title="显隐列">
              <Button shape="circle" icon={<MenuOutlined />} />
            </Tooltip>
          </Dropdown>
        )}
      </div>
      {showColumnsType === 'transfer' && (
        <Modal
          title="显示/隐藏"
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          width={600}
        >
          <Transfer
            titles={['显示', '隐藏']}
            dataSource={transferData}
            targetKeys={transferValue}
            onChange={handleTransferChange}
            render={(item) => item.title}
          />
        </Modal>
      )}
    </div>
  )
}

export default RightToolbar
