import { useState, useEffect } from 'react'
import { Form, Input, Button, Checkbox, Grid } from 'antd'
import { UserOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { useUserStore } from '@/store/userStore'
import { getCodeImg } from '@/api/login'
import { encrypt } from '@/utils/jsencrypt'
import defaultSettings from '@/settings'
import modal from '@/plugins/modal'
import AuthBrandPanel from './components/AuthBrandPanel'
import './index.scss'

const Login = () => {
  const navigate = useNavigate()
  const userStore = useUserStore()
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
        console.error('验证码响应数据格式错误:', data)
        modal.msgError('获取验证码失败，请刷新页面重试')
      }
    } catch (err) {
      console.error('获取验证码失败', err)
      const errorMsg = err.response?.data?.msg || err.message || '未知错误'
      modal.msgError('获取验证码失败: ' + errorMsg)
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
      const safeRedirect = (redirect && redirect.startsWith('/') && !redirect.includes('//')) ? redirect : '/'
      navigate(safeRedirect, { replace: true })
      modal.msgSuccess('登录成功')
    } catch (error) {
      console.error('登录失败', error)
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
            <h1 className="login-page-title">{title}</h1>
            <p className="login-page-subtitle">欢迎登录，管理业务数据与系统配置</p>

            <Form
              form={form}
              className="login-form"
              layout="vertical"
              requiredMark={false}
              onFinish={handleLogin}
              initialValues={{
                username: 'admin',
                password: 'admin123',
                rememberMe: false
              }}
            >
              <Form.Item
                name="username"
                label="账号"
                rules={[{ required: true, message: '请输入您的账号' }]}
              >
                <Input
                  size="large"
                  placeholder="请输入账号"
                  prefix={<UserOutlined className="input-icon" />}
                  autoComplete="username"
                  autoFocus
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入您的密码' }]}
              >
                <Input.Password
                  size="large"
                  placeholder="请输入密码"
                  prefix={<LockOutlined className="input-icon" />}
                  autoComplete="current-password"
                  onPressEnter={() => form.submit()}
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
                        onPressEnter={() => form.submit()}
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

              <Form.Item name="rememberMe" valuePropName="checked" className="login-remember">
                <Checkbox>记住密码</Checkbox>
              </Form.Item>

              <Form.Item className="login-submit">
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  {loading ? '登 录 中...' : '登 录'}
                </Button>
              </Form.Item>

              <div className="login-foot-links">
                <span />
                <span className="login-foot-links__register">
                  还没有账号？
                  <Link to="/register" className="login-foot-links__primary">
                    立即注册
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

export default Login
