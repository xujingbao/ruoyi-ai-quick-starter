import { Form, Input, Button } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { register } from '@/api/login'
import { message } from 'antd'

const Register = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const handleRegister = async (values) => {
    try {
      await register(values)
      message.success('注册成功，请登录')
      navigate('/login')
    } catch (error) {
      console.error('注册失败', error)
    }
  }

  return (
    <div className="register">
      <Form
        form={form}
        className="register-form"
        onFinish={handleRegister}
      >
        <h3>用户注册</h3>
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            size="large"
            placeholder="用户名"
            prefix={<UserOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            size="large"
            placeholder="密码"
            prefix={<LockOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="email"
          rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
        >
          <Input
            size="large"
            placeholder="邮箱"
            prefix={<MailOutlined />}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" size="large" htmlType="submit" block>
            注册
          </Button>
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <a href="/login">已有账号？立即登录</a>
          </div>
        </Form.Item>
      </Form>
    </div>
  )
}

export default Register
