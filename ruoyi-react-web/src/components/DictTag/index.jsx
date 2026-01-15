import PropTypes from 'prop-types'
import { Tag } from 'antd'

const DictTag = ({ options = [], value, placeholder = '-' }) => {
  if (value == null || value === '') {
    return <Tag>{placeholder}</Tag>
  }

  const option = options?.find(
    (item) =>
      item.value === value ||
      item.key === value ||
      (typeof item.value === 'string' && item.value === String(value))
  )

  return <Tag>{option?.label ?? option?.name ?? option?.title ?? String(value)}</Tag>
}

DictTag.propTypes = {
  options: PropTypes.array,
  value: PropTypes.any,
  placeholder: PropTypes.string
}

export default DictTag
