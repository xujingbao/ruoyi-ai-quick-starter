import { useState, useEffect, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Upload } from 'antd'
import axios from 'axios'
import { getToken } from '@/utils/auth'
import modal from '@/plugins/modal'
import './index.scss'

const Editor = ({ 
  value, 
  onChange, 
  height = null, 
  minHeight = null, 
  readOnly = false,
  fileSize = 5,
  type = 'url'
}) => {
  const quillRef = useRef(null)
  const uploadRef = useRef(null)
  const [content, setContent] = useState(value || '')

  const uploadUrl = `${import.meta.env.VITE_APP_BASE_API || '/dev-api'}/common/upload`
  const headers = {
    Authorization: 'Bearer ' + getToken()
  }

  useEffect(() => {
    if (value !== content) {
      setContent(value == undefined ? '<p></p>' : value)
    }
  }, [value])

  useEffect(() => {
    if (onChange) {
      onChange(content)
    }
  }, [content])

  useEffect(() => {
    if (type === 'url' && quillRef.current) {
      const quill = quillRef.current.getEditor()
      const toolbar = quill.getModule('toolbar')
      
      toolbar.addHandler('image', () => {
        if (uploadRef.current) {
          uploadRef.current.click()
        }
      })

      const handlePaste = (e) => {
        const clipboard = e.clipboardData || window.clipboardData
        if (clipboard && clipboard.items) {
          for (let i = 0; i < clipboard.items.length; i++) {
            const item = clipboard.items[i]
            if (item.type.indexOf('image') !== -1) {
              e.preventDefault()
              const file = item.getAsFile()
              insertImage(file)
            }
          }
        }
      }

      quill.root.addEventListener('paste', handlePaste, true)
      
      return () => {
        quill.root.removeEventListener('paste', handlePaste, true)
      }
    }
  }, [type])

  const beforeUpload = (file) => {
    const isImage = file.type.includes('image')
    if (!isImage) {
      modal.msgError('图片格式错误!')
      return false
    }
    if (fileSize) {
      const isLt = file.size / 1024 / 1024 < fileSize
      if (!isLt) {
        modal.msgError(`上传文件大小不能超过 ${fileSize} MB!`)
        return false
      }
    }
    return true
  }

  const handleUploadSuccess = (res) => {
    if (res.code == 200) {
      const quill = quillRef.current.getEditor()
      const length = quill.getSelection(true).index
      const imageUrl = res.fileName.startsWith('http') 
        ? res.fileName 
        : `${import.meta.env.VITE_APP_BASE_API || '/dev-api'}${res.fileName}`
      quill.insertEmbed(length, 'image', imageUrl)
      quill.setSelection(length + 1)
    } else {
      modal.msgError('图片插入失败')
    }
  }

  const handleUploadError = () => {
    modal.msgError('图片插入失败')
  }

  const insertImage = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    axios.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: headers.Authorization
      }
    }).then(res => {
      handleUploadSuccess(res.data)
    }).catch(() => {
      modal.msgError('图片插入失败')
    })
  }

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  }

  const style = {}
  if (minHeight) {
    style.minHeight = `${minHeight}px`
  }
  if (height) {
    style.height = `${height}px`
  }

  return (
    <div>
      {type === 'url' && (
        <Upload
          action={uploadUrl}
          beforeUpload={beforeUpload}
          onSuccess={handleUploadSuccess}
          onError={handleUploadError}
          name="file"
          showUploadList={false}
          headers={headers}
          className="editor-img-uploader"
        >
          <div ref={uploadRef} style={{ display: 'none' }} />
        </Upload>
      )}
      <div className="editor" style={style}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={setContent}
          readOnly={readOnly}
          modules={modules}
          placeholder="请输入内容"
        />
      </div>
    </div>
  )
}

export default Editor
