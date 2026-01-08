import { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/userStore'
import { getCodeImg } from '@/api/login'
import { encrypt } from '@/utils/jsencrypt'
import defaultSettings from '@/settings'
import './index.scss'

const Login = () => {
  const navigate = useNavigate()
  const userStore = useUserStore()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [codeUrl, setCodeUrl] = useState('')
  const [captchaEnabled, setCaptchaEnabled] = useState(true)
  const [uuid, setUuid] = useState('')

  const title = import.meta.env.VITE_APP_TITLE
  const footerContent = defaultSettings.footerContent

  // 登录页禁止滚动（仅本页生效，离开后恢复）
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
    }
  }, [])

  const getCode = async () => {
    try {
      const res = await getCodeImg()
      // 处理响应数据，可能是 res 或 res.data
      const data = res.data || res
      if (data && data.img) {
        // 判断图片格式：/9j/ 开头是 JPEG，iVBORw0KGgo 开头是 PNG，R0lGODlh 开头是 GIF
        let imgBase64 = data.img
        if (!imgBase64.startsWith('data:')) {
          if (imgBase64.startsWith('/9j/')) {
            imgBase64 = 'data:image/jpeg;base64,' + imgBase64
          } else if (imgBase64.startsWith('iVBORw0KGgo')) {
            imgBase64 = 'data:image/png;base64,' + imgBase64
          } else if (imgBase64.startsWith('R0lGODlh')) {
            imgBase64 = 'data:image/gif;base64,' + imgBase64
          } else {
            // 默认使用 JPEG
            imgBase64 = 'data:image/jpeg;base64,' + imgBase64
          }
        }
        setCodeUrl(imgBase64)
        setUuid(data.uuid || '')
        setCaptchaEnabled(data.captchaEnabled === undefined ? true : data.captchaEnabled)
      } else {
        console.error('验证码响应数据格式错误:', data)
        message.error('获取验证码失败，请刷新页面重试')
      }
    } catch (err) {
      console.error('获取验证码失败', err)
      const errorMsg = err.response?.data?.msg || err.message || '未知错误'
      message.error('获取验证码失败: ' + errorMsg)
    }
  }

  const handleLogin = async (values) => {
    setLoading(true)
    try {
      let password = values.password
      if (import.meta.env.VITE_APP_ENCRYPT === 'true') {
        password = encrypt(password)
      }
      
      await userStore.login({
        username: values.username,
        password: password,
        code: values.code,
        uuid: uuid
      })

      await userStore.getInfo()
      
      const redirect = new URLSearchParams(window.location.search).get('redirect')
      navigate(redirect || '/', { replace: true })
      message.success('登录成功')
    } catch (error) {
      console.error('登录失败', error)
      if (captchaEnabled) {
        getCode()
      }
    } finally {
      setLoading(false)
    }
  }

  // 初始化获取验证码
  useEffect(() => {
    getCode()
  }, [])

  return (
    <div className="login">
      <div className="login-overlay"></div>
      <Form
        form={form}
        className="login-form"
        onFinish={handleLogin}
        initialValues={{
          username: 'admin',
          password: 'admin123',
          rememberMe: false
        }}
      >
        <h3 className="title">{title}</h3>
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入您的账号' }]}
        >
          <Input
            size="large"
            placeholder="账号"
            prefix={<UserOutlined className="input-icon" />}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入您的密码' }]}
        >
          <Input.Password
            size="large"
            placeholder="密码"
            prefix={<LockOutlined className="input-icon" />}
            onPressEnter={() => form.submit()}
          />
        </Form.Item>
        {captchaEnabled && (
          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <Input
                size="large"
                placeholder="验证码"
                prefix={<KeyOutlined className="input-icon" />}
                style={{ flex: 1 }}
                onPressEnter={() => form.submit()}
              />
              <div className="login-code" onClick={getCode}>
                {codeUrl ? (
                  <img 
                    src={codeUrl} 
                    className="login-code-img"
                    alt="验证码"
                    style={{ cursor: 'pointer' }}
                  />
                ) : (
                  <div 
                    className="login-code-img" 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#999'
                    }}
                  >
                    点击获取验证码
                  </div>
                )}
              </div>
            </div>
          </Form.Item>
        )}
        <Form.Item name="rememberMe" valuePropName="checked">
          <Checkbox>记住密码</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
            block
          >
            {loading ? '登 录 中...' : '登 录'}
          </Button>
          <div style={{ float: 'right', marginTop: '10px' }}>
            <a href="/register">立即注册</a>
          </div>
        </Form.Item>
      </Form>
      <div className="el-login-footer">
        <span>{footerContent}</span>
      </div>
    </div>
  )
}

export default Login
