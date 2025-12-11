import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { useDispatch, useSelector } from 'react-redux'
import { loginAction, getInfoAction } from '../store/modules/user'
import { getCodeImg } from '../api/login'
import config from '../config'

export default function LoginScreen() {
  const router = useRouter()
  const dispatch = useDispatch()
  const token = useSelector(state => state.user.token)
  const insets = useSafeAreaInsets()

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    code: '',
    uuid: ''
  })
  const [captchaEnabled, setCaptchaEnabled] = useState(true)
  const [codeUrl, setCodeUrl] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)

  // 获取验证码
  const getCode = async () => {
    try {
      const res = await getCodeImg()
      setCaptchaEnabled(res.captchaEnabled === undefined ? true : res.captchaEnabled)
      if (res.captchaEnabled !== false) {
        setCodeUrl('data:image/gif;base64,' + res.img)
        setLoginForm(prev => ({ ...prev, uuid: res.uuid }))
      }
    } catch (error) {
      console.error('获取验证码失败:', error)
    }
  }

  // 登录
  const handleLogin = async () => {
    if (!loginForm.username.trim()) {
      Alert.alert('提示', '请输入企业账号/手机号')
      return
    }
    if (!loginForm.password) {
      Alert.alert('提示', '请输入密码')
      return
    }
    if (!loginForm.code && captchaEnabled) {
      Alert.alert('提示', '请输入验证码')
      return
    }

    setLoading(true)
    try {
      await dispatch(loginAction(loginForm)).unwrap()
      // 登录成功后获取用户信息
      await dispatch(getInfoAction()).unwrap()
      // 跳转到主页
      router.replace('/home')
    } catch (error) {
      console.error('登录失败:', error)
      // 登录失败后刷新验证码
      if (captchaEnabled) {
        getCode()
      }
    } finally {
      setLoading(false)
    }
  }

  // 忘记密码
  const handleForgotPassword = () => {
    Alert.alert('提示', '忘记密码功能待实现')
  }

  // 用户注册
  const handleUserRegister = () => {
    Alert.alert('提示', '注册功能待实现')
  }

  // 隐私协议
  const handlePrivacy = () => {
    const site = config.appInfo.agreements[0]
    Alert.alert('隐私政策', `URL: ${site.url}`)
  }

  // 用户协议
  const handleUserAgreement = () => {
    const site = config.appInfo.agreements[1]
    Alert.alert('用户服务协议', `URL: ${site.url}`)
  }

  useEffect(() => {
    getCode()
  }, [])

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        {/* 顶部背景 */}
        <LinearGradient
          colors={['#67C23A', '#85ce61']}
          style={[styles.headerBg, { paddingTop: insets.top }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bgPattern} />
        </LinearGradient>

        {/* Logo和欢迎语 */}
        <View style={[styles.logoContent, { paddingTop: Math.max(80 + insets.top, 100) }]}>
          <View style={styles.logoWrapper}>
            <Image source={require('../assets/logo.png')} style={styles.logoImage} />
          </View>
          <Text style={styles.welcomeText}>欢迎使用</Text>
          <Text style={styles.appTitle}>RuoYi AI Quick Starter</Text>
          <Text style={styles.appSubtitle}>React Native 跨端应用</Text>
          <Text style={styles.appDesc}>一套代码，iOS、Android 全平台运行</Text>
        </View>

        {/* 登录表单 */}
        <View style={styles.loginFormContent}>
          {/* 用户名输入 */}
          <View style={styles.inputItem}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="请输入企业账号/手机号"
                placeholderTextColor="#C0C4CC"
                value={loginForm.username}
                onChangeText={(text) => setLoginForm(prev => ({ ...prev, username: text }))}
                maxLength={30}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* 密码输入 */}
          <View style={styles.inputItem}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="请输入密码"
                placeholderTextColor="#C0C4CC"
                value={loginForm.password}
                onChangeText={(text) => setLoginForm(prev => ({ ...prev, password: text }))}
                secureTextEntry={!passwordVisible}
                maxLength={20}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                <Text style={styles.eyeIconText}>{passwordVisible ? '显示' : '隐藏'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 验证码输入 */}
          {captchaEnabled && (
            <View style={styles.inputItem}>
              <View style={[styles.inputWrapper, styles.captchaWrapper]}>
                <TextInput
                  style={[styles.input, styles.captchaInput]}
                  placeholder="请输入验证码"
                  placeholderTextColor="#C0C4CC"
                  value={loginForm.code}
                  onChangeText={(text) => setLoginForm(prev => ({ ...prev, code: text }))}
                  maxLength={4}
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.loginCode} onPress={getCode}>
                  {codeUrl ? (
                    <Image source={{ uri: codeUrl }} style={styles.loginCodeImg} />
                  ) : (
                    <View style={styles.codePlaceholder}>
                      <Text style={styles.codePlaceholderText}>获取</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 表单选项 */}
          <View style={styles.formOptions}>
            <TouchableOpacity
              style={styles.rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkboxIcon}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>记住密码</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
              <Text style={styles.forgotPwd}>忘记密码？</Text>
            </TouchableOpacity>
          </View>

          {/* 登录按钮 */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            <LinearGradient
              colors={['#67C23A', '#85ce61']}
              style={styles.loginBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>登录</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* 注册链接 */}
          <View style={styles.registerLink}>
            <Text style={styles.registerText}>还没有账号？</Text>
            <TouchableOpacity onPress={handleUserRegister}>
              <Text style={styles.registerBtn}>立即注册</Text>
            </TouchableOpacity>
          </View>

          {/* 协议 */}
          <View style={styles.agreement}>
            <Text style={styles.agreementText}>登录即表示同意</Text>
            <TouchableOpacity onPress={handleUserAgreement}>
              <Text style={styles.agreementLink}>《用户协议》</Text>
            </TouchableOpacity>
            <Text style={styles.agreementText}>和</Text>
            <TouchableOpacity onPress={handlePrivacy}>
              <Text style={styles.agreementLink}>《隐私政策》</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  content: {
    flex: 1
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    minHeight: 380,
    overflow: 'hidden'
  },
  bgPattern: {
    width: '100%',
    height: '100%',
    opacity: 0.1
  },
  logoContent: {
    alignItems: 'center',
    paddingBottom: 50,
    zIndex: 1
  },
  logoWrapper: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  logoImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain'
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
    fontWeight: '400',
    letterSpacing: 0.5
  },
  appTitle: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.5,
    textAlign: 'center',
    paddingHorizontal: 20
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    fontWeight: '400',
    letterSpacing: 0.3
  },
  appDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 0,
    marginTop: 4,
    fontWeight: '400',
    letterSpacing: 0.2,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20
  },
  loginFormContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    marginTop: -20,
    paddingTop: 40,
    zIndex: 1,
    flex: 1
  },
  inputItem: {
    marginBottom: 12
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#303133',
    height: '100%',
    fontWeight: '400',
    letterSpacing: 0.2
  },
  eyeIcon: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  eyeIconText: {
    fontSize: 14,
    color: '#67C23A',
    fontWeight: '500'
  },
  captchaWrapper: {
    gap: 8
  },
  captchaInput: {
    flex: 1
  },
  loginCode: {
    width: 90,
    height: 32,
    borderRadius: 6,
    overflow: 'hidden',
    flexShrink: 0
  },
  loginCodeImg: {
    width: '100%',
    height: '100%'
  },
  codePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e4e7ed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  codePlaceholderText: {
    fontSize: 13,
    color: '#909399',
    fontWeight: '400'
  },
  formOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#dcdfe6',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0
  },
  checkboxChecked: {
    backgroundColor: '#67C23A',
    borderColor: '#67C23A'
  },
  checkboxIcon: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 16
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#606266',
    fontWeight: '400',
    letterSpacing: 0.2
  },
  forgotPwd: {
    fontSize: 15,
    color: '#67C23A',
    fontWeight: '500'
  },
  actionBtn: {
    marginBottom: 12
  },
  loginBtn: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#67C23A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  registerText: {
    fontSize: 14,
    color: '#909399',
    marginRight: 5,
    fontWeight: '400'
  },
  registerBtn: {
    fontSize: 14,
    color: '#67C23A',
    fontWeight: '600'
  },
  agreement: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  agreementText: {
    fontSize: 12,
    color: '#909399',
    fontWeight: '400',
    lineHeight: 18
  },
  agreementLink: {
    fontSize: 12,
    color: '#67C23A',
    fontWeight: '500',
    lineHeight: 18
  }
})

