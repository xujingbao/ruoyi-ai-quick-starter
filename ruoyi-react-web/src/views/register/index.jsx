import { useEffect, useState } from 'react'
import { Form, Input, Button, Grid } from 'antd'
import { UserOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { register, getCodeImg } from '@/api/login'
import defaultSettings from '@/settings'
import modal from '@/plugins/modal'
import AuthBrandPanel from '@/views/login/components/AuthBrandPanel'
import '@/views/login/index.scss'

const Register = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [codeUrl, setCodeUrl] = useState('')
  const [captchaEnabled, setCaptchaEnabled] = useState(true)
  const [uuid, setUuid] = useState('')
  const screens = Grid.useBreakpoint()
  const isCompact = !screens.md

  const title = import.meta.env.VITE_APP_TITLE
  const footerContent = defaultSettings.footerContent

  useEffect(() => {
    const prevBodyOverflowX = document.body.style.overflowX
    const prevHtmlOverflowX = document.documentElement.style.overflowX
    document.body.style.overflowX = 'hidden'
    document.documentElement.style.overflowX = 'hidden'
    return () => {
      document.body.style.overflowX = prevBodyOverflowX
      document.documentElement.style.overflowX = prevHtmlOverflowX
    }
  }, [])

  const getCode = async () => {
    try {
      const res = await getCodeImg()
      const data = res.data || res
      if (data && data.img) {
        let imgBase64 = data.img
        if (!imgBase64.startsWith('data:')) {
          if (imgBase64.startsWith('/9j/')) {
            imgBase64 = 'data:image/jpeg;base64,' + imgBase64
          } else if (imgBase64.startsWith('iVBORw0KGgo')) {
            imgBase64 = 'data:image/png;base64,' + imgBase64
          } else if (imgBase64.startsWith('R0lGODlh')) {
            imgBase64 = 'data:image/gif;base64,' + imgBase64
          } else {
            imgBase64 = 'data:image/jpeg;base64,' + imgBase64
          }
        }
        setCodeUrl(imgBase64)
        setUuid(data.uuid || '')
        setCaptchaEnabled(data.captchaEnabled === undefined ? true : data.captchaEnabled)
      } else {
        modal.msgError('获取验证码失败，请刷新页面重试')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || err.message || '未知错误'
      modal.msgError('获取验证码失败: ' + errorMsg)
    }
  }

  const handleRegister = async (values) => {
    setLoading(true)
    try {
      await register({
        username: values.username,
        password: values.password,
        code: values.code,
        uuid: uuid
      })
      modal.msgSuccess('注册成功，请登录')
      navigate('/login')
    } catch (error) {
      console.error('注册失败', error)
      if (captchaEnabled) {
        getCode()
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getCode()
  }, [])

  return (
    <div className={`login${isCompact ? ' login--compact' : ''}`}>
      <AuthBrandPanel isCompact={isCompact} />

      <div className="login-form-side">
        <div className="login-form-body">
          <div className="login-form-wrap">
            <h1 className="login-page-title">用户注册</h1>
            <p className="login-page-subtitle">创建账号后即可登录 {title}</p>

            <Form
              form={form}
              className="login-form"
              layout="vertical"
              requiredMark={false}
              onFinish={handleRegister}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 2, max: 20, message: '用户名长度为 2-20 个字符' }
                ]}
              >
                <Input
                  size="large"
                  placeholder="请输入用户名"
                  prefix={<UserOutlined className="input-icon" />}
                  autoComplete="username"
                  autoFocus
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 5, max: 20, message: '密码长度为 5-20 个字符' }
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="请输入密码"
                  prefix={<LockOutlined className="input-icon" />}
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                name="confirm"
                label="确认密码"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请再次输入密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'))
                    }
                  })
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="请再次输入密码"
                  prefix={<LockOutlined className="input-icon" />}
                  autoComplete="new-password"
                />
              </Form.Item>

              {captchaEnabled && (
                <Form.Item label="验证码" required>
                  <div className="login-captcha-row">
                    <Form.Item
                      name="code"
                      noStyle
                      rules={[{ required: true, message: '请输入验证码' }]}
                    >
                      <Input
                        size="large"
                        placeholder="请输入验证码"
                        prefix={<KeyOutlined className="input-icon" />}
                      />
                    </Form.Item>
                    <button
                      type="button"
                      className="login-code"
                      onClick={getCode}
                      title="点击刷新验证码"
                    >
                      {codeUrl ? (
                        <img src={codeUrl} className="login-code-img" alt="验证码" />
                      ) : (
                        <span className="login-code-placeholder">刷新</span>
                      )}
                    </button>
                  </div>
                </Form.Item>
              )}

              <Form.Item className="login-submit">
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  {loading ? '注册中...' : '注册'}
                </Button>
              </Form.Item>

              <div className="login-foot-links auth-register-foot">
                <span className="login-foot-links__register">
                  已有账号？
                  <Link to="/login" className="login-foot-links__primary">
                    立即登录
                  </Link>
                </span>
              </div>
            </Form>
          </div>
        </div>

        <div className="login-footer">
          <span className="login-footer__item">{footerContent}</span>
        </div>
      </div>
    </div>
  )
}

export default Register
