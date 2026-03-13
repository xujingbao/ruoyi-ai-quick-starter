import { Modal, Upload, Button, Checkbox } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

const UserImportModal = ({
  open,
  onCancel,
  onOk,
  uploading,
  selectedFile,
  onFileChange,
  onFileRemove,
  updateSupport,
  onUpdateSupportChange,
  onImportTemplate
}) => {
  return (
    <Modal
      title="用户导入"
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      confirmLoading={uploading}
      width={400}
    >
      <Upload
        beforeUpload={onFileChange}
        fileList={selectedFile ? [selectedFile] : []}
        onRemove={onFileRemove}
        accept=".xlsx,.xls"
        maxCount={1}
      >
        <Button icon={<UploadOutlined />}>选择文件</Button>
      </Upload>
      <div style={{ marginTop: 16 }}>
        <Checkbox checked={updateSupport === 1} onChange={onUpdateSupportChange}>
          是否更新已经存在的用户数据
        </Checkbox>
        <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
          仅允许导入xls、xlsx格式文件。
          <Button type="link" size="small" onClick={onImportTemplate} style={{ padding: 0, height: 'auto' }}>
            下载模板
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default UserImportModal
