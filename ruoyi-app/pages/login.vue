<template>
  <view class="driver-login-container">
    <!-- 顶部背景 -->
    <view class="header-bg">
      <view class="bg-pattern"></view>
    </view>

    <!-- Logo和欢迎语 -->
    <view class="logo-content">
      <view class="logo-wrapper">
        <view class="logo-circle">
          <uni-icons type="car" size="60" color="#409EFF"></uni-icons>
        </view>
      </view>
      <text class="welcome-text">欢迎使用</text>
      <text class="app-title">RuoYi AI Quick Starter</text>
      <text class="app-subtitle">移动端</text>
      <text class="app-desc">功能特点 · 系统优势</text>
    </view>

    <!-- 登录表单 -->
    <view class="login-form-content">
      <view class="input-item">
        <view class="input-wrapper">
          <uni-icons type="person" size="20" color="#909399"></uni-icons>
          <input 
            v-model="loginForm.username" 
            class="input" 
            type="text" 
            placeholder="请输入企业账号/手机号" 
            maxlength="30" 
          />
        </view>
      </view>

      <view class="input-item">
        <view class="input-wrapper">
          <uni-icons type="locked" size="20" color="#909399"></uni-icons>
          <input 
            v-model="loginForm.password" 
            type="password" 
            class="input" 
            placeholder="请输入密码" 
            maxlength="20" 
          />
          <view class="eye-icon" @click="togglePasswordVisible">
            <uni-icons :type="passwordVisible ? 'eye-slash' : 'eye'" size="18" color="#909399"></uni-icons>
          </view>
        </view>
      </view>

      <view class="input-item" v-if="captchaEnabled">
        <view class="input-wrapper captcha-wrapper">
          <uni-icons type="compose" size="20" color="#909399"></uni-icons>
          <input 
            v-model="loginForm.code" 
            type="number" 
            class="input captcha-input" 
            placeholder="请输入验证码" 
            maxlength="4" 
          />
          <view class="login-code" @click="getCode">
            <image :src="codeUrl" class="login-code-img" mode="aspectFit"></image>
          </view>
        </view>
      </view>

      <view class="form-options">
        <view class="remember-me">
          <checkbox-group @change="handleRememberChange">
            <label class="checkbox-label">
              <checkbox value="remember" :checked="rememberMe" color="#409EFF" />
              <text>记住密码</text>
            </label>
          </checkbox-group>
        </view>
        <text class="forgot-pwd" @click="handleForgotPassword">忘记密码？</text>
      </view>

      <view class="action-btn">
        <button @click="handleLogin" class="login-btn">登录</button>
      </view>

      <!-- 微信登录（小程序环境） -->
      <!-- #ifdef MP-WEIXIN -->
      <view class="wechat-login">
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">或</text>
          <view class="divider-line"></view>
        </view>
        <button class="wechat-btn" open-type="getPhone" @getphonenumber="handleWechatLogin">
          <uni-icons type="weixin" size="24" color="#fff"></uni-icons>
          <text>微信一键登录</text>
        </button>
      </view>
      <!-- #endif -->

      <view class="register-link" v-if="register">
        <text class="register-text">还没有账号？</text>
        <text class="register-btn" @click="handleUserRegister">立即注册</text>
      </view>

      <view class="agreement">
        <text class="agreement-text">登录即表示同意</text>
        <text class="agreement-link" @click="handleUserAgrement">《用户协议》</text>
        <text class="agreement-text">和</text>
        <text class="agreement-link" @click="handlePrivacy">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue"
import { onLoad } from "@dcloudio/uni-app"
import { getToken } from '@/utils/auth'
import { getCodeImg } from '@/api/login'
import { useConfigStore, useUserStore } from '@/store'

const { proxy } = getCurrentInstance()
const globalConfig = useConfigStore().config
const codeUrl = ref("")
const captchaEnabled = ref(true)
const register = ref(true)
const rememberMe = ref(false)
const passwordVisible = ref(false)
const loginForm = ref({
  username: "",
  password: "",
  code: "",
  uuid: ""
})

// 切换密码显示
function togglePasswordVisible() {
  passwordVisible.value = !passwordVisible.value
}

// 记住密码
function handleRememberChange(e) {
  rememberMe.value = e.detail.value.includes('remember')
}

// 忘记密码
function handleForgotPassword() {
  uni.showToast({
    title: '忘记密码功能待实现',
    icon: 'none'
  })
}

// 微信登录
function handleWechatLogin(e) {
  if (e.detail.errMsg === 'getPhoneNumber:ok') {
    // TODO: 调用微信登录API
    uni.showToast({
      title: '微信登录功能待实现',
      icon: 'none'
    })
  }
}

// 用户注册
function handleUserRegister() {
  proxy.$tab.redirectTo(`/pages/register`)
}

// 隐私协议
function handlePrivacy() {
  let site = globalConfig.appInfo.agreements[0]
  proxy.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
}

// 用户协议
function handleUserAgrement() {
  let site = globalConfig.appInfo.agreements[1]
  proxy.$tab.navigateTo(`/pages/common/webview/index?title=${site.title}&url=${site.url}`)
}

// 获取图形验证码
function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = 'data:image/gif;base64,' + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

// 登录方法
async function handleLogin() {
  if (loginForm.value.username === "") {
    proxy.$modal.msgError("请输入企业账号/手机号")
  } else if (loginForm.value.password === "") {
    proxy.$modal.msgError("请输入密码")
  } else if (loginForm.value.code === "" && captchaEnabled.value) {
    proxy.$modal.msgError("请输入验证码")
  } else {
    proxy.$modal.loading("登录中，请耐心等待...")
    pwdLogin()
  }
}

// 密码登录
async function pwdLogin() {
  useUserStore().login(loginForm.value).then(() => {
    proxy.$modal.closeLoading()
    loginSuccess()
  }).catch(() => {
    if (captchaEnabled.value) {
      getCode()
    }
  })
}

// 登录成功后，处理函数
function loginSuccess(result) {
  useUserStore().getInfo().then(res => {
    proxy.$tab.reLaunch('/pages/index')
  })
}

onLoad(() => {
  //#ifdef H5
  if (getToken()) {
    proxy.$tab.reLaunch('/pages/index')
  }
  //#endif
})

getCode()
</script>

<style lang="scss" scoped>
page {
  background: linear-gradient(180deg, #67C23A 0%, #85ce61 50%, #f5f5f5 50%);
  height: 100vh;
  overflow: hidden;
}

.driver-login-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 500rpx;
    background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
    overflow: hidden;

    .bg-pattern {
      width: 100%;
      height: 100%;
      background-image: 
        radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    }
  }

  .logo-content {
    text-align: center;
    padding-top: 100rpx;
    padding-bottom: 60rpx;
    position: relative;
    z-index: 1;

    .logo-wrapper {
      margin-bottom: 30rpx;
      
      .logo-circle {
        width: 160rpx;
        height: 160rpx;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        backdrop-filter: blur(10rpx);
      }
    }

    .welcome-text {
      display: block;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 10rpx;
    }

    .app-title {
      display: block;
      font-size: 48rpx;
      color: #fff;
      font-weight: 600;
      margin-bottom: 10rpx;
    }

    .app-subtitle {
      display: block;
      font-size: 28rpx;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 20rpx;
    }

    .app-desc {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .login-form-content {
    background-color: #fff;
    border-radius: 40rpx 40rpx 0 0;
    padding: 60rpx 60rpx 40rpx;
    margin-top: 40rpx;
    position: relative;
    z-index: 1;
    height: calc(100vh - 500rpx);
    overflow-y: auto;

    .input-item {
      margin-bottom: 30rpx;

      .input-wrapper {
        display: flex;
        align-items: center;
        background-color: #f5f5f5;
        border-radius: 20rpx;
        padding: 0 30rpx;
        height: 100rpx;
        gap: 20rpx;

        .input {
          flex: 1;
          font-size: 28rpx;
          color: #333;
          height: 100%;
        }

        .eye-icon {
          padding: 10rpx;
        }

        &.captcha-wrapper {
          .captcha-input {
            flex: 1;
          }

          .login-code {
            width: 200rpx;
            height: 60rpx;
            border-radius: 10rpx;
            overflow: hidden;
            flex-shrink: 0;

            .login-code-img {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40rpx;

      .remember-me {
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10rpx;
          font-size: 24rpx;
          color: #606266;
        }
      }

      .forgot-pwd {
        font-size: 24rpx;
        color: #67C23A;
      }
    }

    .action-btn {
      margin-bottom: 30rpx;

      .login-btn {
        width: 100%;
        height: 100rpx;
        line-height: 100rpx;
        text-align: center;
        background: linear-gradient(135deg, #67C23A 0%, #85ce61 100%);
        color: #fff;
        border-radius: 50rpx;
        font-size: 32rpx;
        font-weight: 600;
        border: none;
        box-shadow: 0 8rpx 20rpx rgba(103, 194, 58, 0.3);
      }
    }

    .wechat-login {
      margin-bottom: 30rpx;

      .divider {
        display: flex;
        align-items: center;
        margin: 40rpx 0;
        gap: 20rpx;

        .divider-line {
          flex: 1;
          height: 1rpx;
          background-color: #e4e7ed;
        }

        .divider-text {
          font-size: 24rpx;
          color: #909399;
        }
      }

      .wechat-btn {
        width: 100%;
        height: 100rpx;
        line-height: 100rpx;
        text-align: center;
        background-color: #07c160;
        color: #fff;
        border-radius: 50rpx;
        font-size: 28rpx;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10rpx;
      }
    }

    .register-link {
      text-align: center;
      margin-bottom: 40rpx;

      .register-text {
        font-size: 24rpx;
        color: #909399;
        margin-right: 10rpx;
      }

      .register-btn {
        font-size: 24rpx;
        color: #67C23A;
        font-weight: 600;
      }
    }

    .agreement {
      text-align: center;
      font-size: 22rpx;
      color: #909399;
      line-height: 1.6;

      .agreement-text {
        color: #909399;
      }

      .agreement-link {
        color: #67C23A;
      }
    }
  }
}
</style>
