import { useEffect, useMemo, useState } from 'react'
import { Modal, Upload, Row, Col, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'
import { uploadAvatar } from '@/api/system/user'
import { useUserStore } from '@/store/userStore'
import modal from '@/plugins/modal'
import defaultAvatar from '@/assets/images/profile.jpg'
import './index.scss'

const UserAvatar = () => {
  const userStore = useUserStore()
  const [open, setOpen] = useState(false)
  const [fileList, setFileList] = useState([])
  const [imageUrl, setImageUrl] = useState(userStore.avatar || '')
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const displayAvatar = useMemo(() => {
    return imageUrl || userStore.avatar || defaultAvatar
  }, [imageUrl, userStore.avatar])

  // 释放本地预览 URL，避免内存泄漏
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleEditCropper = () => {
    setOpen(true)
  }

  const handleCancel = () => {
    if (uploading) return
    setOpen(false)
    setFileList([])
    setSelectedFile(null)
    setPreviewUrl('')
    setImageUrl(userStore.avatar || '')
  }

  const handleBeforeUpload = (file) => {
    const isImage = file.type.indexOf('image/') !== -1
    if (!isImage) {
      modal.msgError('文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。')
      return false
    }
    const maxSizeMB = 5
    const isLtMax = file.size / 1024 / 1024 < maxSizeMB
    if (!isLtMax) {
      modal.msgError(`上传头像图片大小不能超过 ${maxSizeMB}MB!`)
      return false
    }

    // 仅选择并预览，不自动上传
    const nextPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(nextPreviewUrl)
    setSelectedFile(file)
    setFileList([
      {
        uid: file.uid || `${Date.now()}`,
        name: file.name,
        status: 'done',
        originFileObj: file
      }
    ])
    return false
  }

  const handleChange = ({ fileList: newFileList }) => {
    // 保持单文件，避免裁剪/选择过程中累积
    setFileList(newFileList.slice(-1))
  }

  const handleConfirmUpload = async () => {
    if (!selectedFile || uploading) return
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('avatarfile', selectedFile)
      
      const response = await uploadAvatar(formData)
      const imgUrl = response?.imgUrl || ''
      const fullUrl = imgUrl && imgUrl.startsWith('http') ? imgUrl : `${import.meta.env.VITE_APP_BASE_API || '/dev-api'}${imgUrl}`
      
      setImageUrl(fullUrl)
      userStore.setAvatar(fullUrl)
      
      setOpen(false)
      setFileList([])
      setSelectedFile(null)
      setPreviewUrl('')
      modal.msgSuccess('修改成功')
    } catch (error) {
      modal.msgError('上传失败')
    } finally {
      setUploading(false)
    }
  }

  const previewSrc = previewUrl || displayAvatar

  return (
    <>
      <div className="user-info-head" onClick={handleEditCropper}>
        <img 
          src={displayAvatar} 
          alt="avatar" 
          title="点击上传头像" 
          className="img-circle img-lg" 
        />
      </div>
      <Modal
        title="修改头像"
        open={open}
        onCancel={handleCancel}
        footer={
          <div className="avatar-modal-footer">
            <Button onClick={handleCancel} disabled={uploading}>取消</Button>
            <Button
              type="primary"
              onClick={handleConfirmUpload}
              loading={uploading}
              disabled={!selectedFile}
            >
              确定更新
            </Button>
          </div>
        }
        width={760}
        destroyOnHidden
        centered
        className="avatar-modal"
      >
        <div className="avatar-modal-content">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div className="avatar-panel avatar-uploader-panel">
            <ImgCrop
              rotationSlider
              zoomSlider
              aspect={1}
              quality={1}
              modalTitle="裁剪头像"
            >
              <Upload
                name="avatarfile"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={handleBeforeUpload}
                fileList={fileList}
                onChange={handleChange}
                disabled={uploading}
                className="avatar-uploader"
              >
                <div className="avatar-uploader-trigger">
                  <PlusOutlined />
                  <div className="avatar-uploader-text">
                    {uploading ? '上传中...' : selectedFile ? '重新选择' : '选择图片'}
                  </div>
                  <div className="avatar-uploader-tip">支持 JPG/PNG，大小不超过 5MB</div>
                </div>
              </Upload>
            </ImgCrop>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="avatar-panel avatar-preview-panel">
                <div className="avatar-upload-preview">
                  {previewSrc && (
                    <img 
                      src={previewSrc} 
                      alt="preview" 
                      className="avatar-preview-image"
                    />
                  )}
                </div>
                <div className="avatar-preview-tip">
                  预览效果（圆形头像）{selectedFile ? ' · 未保存' : ''}
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Modal>
    </>
  )
}

export default UserAvatar
