import { useState, useEffect } from 'react'
import { Pagination as AntPagination } from 'antd'
import { scrollTo } from '@/utils/scroll-to'
import './index.scss'

const Pagination = ({
  total,
  page = 1,
  limit = 20,
  pageSizes = [10, 20, 30, 50],
  pagerCount = typeof window !== 'undefined' && window.innerWidth < 992 ? 5 : 7,
  background = true,
  autoScroll = true,
  hidden = false,
  onChange
}) => {
  const [currentPage, setCurrentPage] = useState(page)
  const [pageSize, setPageSize] = useState(limit)

  useEffect(() => {
    setCurrentPage(page)
  }, [page])

  useEffect(() => {
    setPageSize(limit)
  }, [limit])

  const handleSizeChange = (current, size) => {
    if (current * size > total) {
      setCurrentPage(1)
      if (onChange) {
        onChange({ page: 1, limit: size })
      }
    } else {
      setCurrentPage(current)
      if (onChange) {
        onChange({ page: current, limit: size })
      }
    }
    if (autoScroll) {
      scrollTo(0, 800)
    }
  }

  const handlePageChange = (page, size) => {
    setCurrentPage(page)
    setPageSize(size)
    if (onChange) {
      onChange({ page, limit: size })
    }
    if (autoScroll) {
      scrollTo(0, 800)
    }
  }

  if (hidden) {
    return null
  }

  return (
    <div className="pagination-container">
      <AntPagination
        current={currentPage}
        pageSize={pageSize}
        total={total}
        pageSizeOptions={pageSizes}
        showSizeChanger
        showQuickJumper
        showTotal={(total, range) => `共 ${total} 条`}
        onChange={handlePageChange}
        onShowSizeChange={handleSizeChange}
      />
    </div>
  )
}

export default Pagination
