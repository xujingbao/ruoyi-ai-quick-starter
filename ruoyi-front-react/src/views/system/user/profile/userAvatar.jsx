import { useMemo, useState } from 'react'
import { Modal, Upload, Row, Col } from 'antd'
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
  const [uploading, setUploading] = useState(false)

  const displayAvatar = useMemo(() => {
    return imageUrl || userStore.avatar || defaultAvatar
  }, [imageUrl, userStore.avatar])

  const handleEditCropper = () => {
    setOpen(true)
  }

  const handleCancel = () => {
    if (uploading) return
    setOpen(false)
    setFileList([])
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
    return true
  }

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList)
  }

  const handleUpload = async (options) => {
    const { onSuccess, onError, file } = options
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('avatarfile', file)
      
      const response = await uploadAvatar(formData)
      const imgUrl = response?.imgUrl || ''
      const fullUrl = imgUrl && imgUrl.startsWith('http') ? imgUrl : `${import.meta.env.VITE_APP_BASE_API || '/dev-api'}${imgUrl}`
      
      setImageUrl(fullUrl)
      userStore.setAvatar(fullUrl)
      
      onSuccess(response, file)
      setOpen(false)
      setFileList([])
      modal.msgSuccess('修改成功')
    } catch (error) {
      onError(error)
      modal.msgError('上传失败')
    } finally {
      setUploading(false)
    }
  }

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
        footer={null}
        width={800}
        destroyOnHidden
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12} style={{ height: '350px' }}>
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
                customRequest={handleUpload}
                fileList={fileList}
                onChange={handleChange}
                disabled={uploading}
              >
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>{uploading ? '上传中...' : '选择'}</div>
                  </div>
                )}
              </Upload>
            </ImgCrop>
          </Col>
          <Col xs={24} md={12} style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="avatar-upload-preview">
              {displayAvatar && (
                <img 
                  src={displayAvatar} 
                  alt="preview" 
                  style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '50%' }}
                />
              )}
            </div>
          </Col>
        </Row>
      </Modal>
    </>
  )
}

export default UserAvatar
