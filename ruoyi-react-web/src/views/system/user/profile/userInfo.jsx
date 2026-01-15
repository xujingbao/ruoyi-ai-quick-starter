import { useState, useEffect } from 'react'
import { Form, Input, Radio, Button, Row, Col } from 'antd'
import { updateUserProfile } from '@/api/system/user'
import modal from '@/plugins/modal'
import { useTagsViewStore } from '@/store/tagsViewStore'
import './index.scss'

const UserInfo = ({ user }) => {
  const [form] = Form.useForm()
  const tagsViewStore = useTagsViewStore()

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        nickName: user.nickName,
        phonenumber: user.phonenumber,
        email: user.email,
        sex: user.sex
      })
    }
  }, [user, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await updateUserProfile(values)
      modal.msgSuccess('修改成功')
      // 更新父组件的 user 对象
      if (user) {
        user.phonenumber = values.phonenumber
        user.email = values.email
      }
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
      className="user-info-form"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
    >
      <Row gutter={20}>
        <Col span={12} xs={24}>
          <Form.Item
            label="用户昵称"
            name="nickName"
            rules={[
              { required: true, message: '用户昵称不能为空' }
            ]}
          >
            <Input
              maxLength={30}
              showCount
              placeholder="请输入用户昵称"
            />
          </Form.Item>
        </Col>
        <Col span={12} xs={24}>
          <Form.Item
            label="手机号码"
            name="phonenumber"
            rules={[
              { required: true, message: '手机号码不能为空' },
              { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码' }
            ]}
          >
            <Input
              maxLength={11}
              placeholder="请输入手机号码"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={12} xs={24}>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '邮箱地址不能为空' },
              { type: 'email', message: '请输入正确的邮箱地址' }
            ]}
          >
            <Input
              maxLength={50}
              showCount
              placeholder="请输入邮箱地址"
            />
          </Form.Item>
        </Col>
        <Col span={12} xs={24}>
          <Form.Item label="性别" name="sex">
            <Radio.Group>
              <Radio value="0">男</Radio>
              <Radio value="1">女</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <div className="form-actions">
          <Button onClick={handleClose}>取 消</Button>
          <Button type="primary" onClick={handleSubmit}>保 存</Button>
        </div>
      </Form.Item>
    </Form>
  )
}

export default UserInfo
