import { useState } from 'react'
import { Form, Input, Button } from 'antd'
import { updateUserPwd } from '@/api/system/user'
import modal from '@/plugins/modal'
import { useTagsViewStore } from '@/store/tagsViewStore'
import './index.scss'

const ResetPwd = () => {
  const [form] = Form.useForm()
  const tagsViewStore = useTagsViewStore()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await updateUserPwd(values.oldPassword, values.newPassword)
      modal.msgSuccess('修改成功')
      form.resetFields()
    } catch (error) {
      console.error('Validation failed:', error)
    }
  }

  const handleClose = () => {
    tagsViewStore.delView(tagsViewStore.visitedViews.find(v => v.path === '/user/profile'))
  }

  return (
    <Form
      form={form}
      layout="vertical"
      className="reset-pwd-form"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
    >
      <Form.Item
        label="旧密码"
        name="oldPassword"
        rules={[
          { required: true, message: '旧密码不能为空' }
        ]}
      >
        <Input.Password
          placeholder="请输入旧密码"
        />
      </Form.Item>
      <Form.Item
        label="新密码"
        name="newPassword"
        rules={[
          { required: true, message: '新密码不能为空' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符' },
          { pattern: /^[^<>"'|\\]+$/, message: '不能包含非法字符：< > " \' \\ |' }
        ]}
      >
        <Input.Password
          placeholder="请输入新密码（6-20个字符）"
        />
      </Form.Item>
      <div className="form-tip">密码长度必须在 6 到 20 个字符之间</div>
      <Form.Item
        label="确认密码"
        name="confirmPassword"
        dependencies={['newPassword']}
        rules={[
          { required: true, message: '确认密码不能为空' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('newPassword') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('两次输入的密码不一致'))
            }
          })
        ]}
      >
        <Input.Password
          placeholder="请再次输入新密码"
        />
      </Form.Item>
      <Form.Item>
        <div className="form-actions">
          <Button onClick={handleClose}>取 消</Button>
          <Button type="primary" onClick={handleSubmit}>保 存</Button>
        </div>
      </Form.Item>
    </Form>
  )
}

export default ResetPwd
