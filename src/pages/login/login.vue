<template>
  <view class="login">
    <!-- 右上角客服 -->
    <view class="login-cs" @click="onCustomerService">
      <image class="login-cs-img" src="/static/images/icon_support.png" mode="aspectFit" />
    </view>

    <view class="login-container">
      <!-- Logo -->
      <view class="brand">
        <image class="brand-img" src="/static/images/shopee_logo_400.png" mode="aspectFit" />
      </view>

      <text class="login-title">登录</text>

      <view class="login-form">
        <!-- 账号 -->
        <view class="input-group">
          <view class="input-icon">
            <image class="input-icon-img" src="/static/images/icon_user.png" mode="aspectFit" />
          </view>
          <input
            class="input-field"
            type="text"
            v-model="formData.login"
            placeholder="手机号码/邮箱/用户名"
            placeholder-class="input-placeholder"
            maxlength="64"
          />
        </view>

        <!-- 密码 -->
        <view class="input-group">
          <view class="input-icon">
            <image class="input-icon-img" src="/static/images/icon_password.png" mode="aspectFit" />
          </view>
          <input
            class="input-field input-field--password"
            :type="showPassword ? 'text' : 'password'"
            v-model="formData.password"
            placeholder="密码"
            placeholder-class="input-placeholder"
            maxlength="20"
          />
          <view class="password-toggle" @click="togglePassword">
            <uni-icons :type="showPassword ? 'eye' : 'eye-slash'" size="20" color="#b0b0b0" />
          </view>
        </view>

        <!-- 验证码 -->
        <view class="input-group">
          <view class="input-icon">
            <image class="input-icon-img" src="/static/images/icon_captcha.png" mode="aspectFit" />
          </view>
          <input
            class="input-field input-field--captcha"
            type="text"
            v-model="formData.verifyCode"
            placeholder="请输入验证码"
            placeholder-class="input-placeholder"
            maxlength="6"
          />
          <view class="verify-code-wrap" @click="refreshVerifyCode">
            <image class="verify-code-img" :src="verifyCodeImg" mode="aspectFit" />
          </view>
        </view>

        <!-- 登录按钮 -->
        <view
          class="login-btn"
          :class="{ 'login-btn--disabled': !canLogin || loggingIn }"
          @click="onLogin"
        >
          <text class="login-btn-text">{{ loggingIn ? '登录中...' : '登录' }}</text>
        </view>

        <!-- 记住登录 / 忘记密码 -->
        <view class="extra-row">
          <view class="remember-wrap" @click="toggleRemember">
            <view class="checkbox" :class="{ 'checkbox--checked': rememberMe }">
              <text class="checkbox-icon" v-if="rememberMe">✓</text>
            </view>
            <text class="remember-text">记住登录</text>
          </view>
          <text class="forgot-link" @click="onForgotPassword">忘记密码?</text>
        </view>

        <!-- 分隔线 -->
        <view class="divider">
          <view class="divider-line" />
          <text class="divider-text">或</text>
          <view class="divider-line" />
        </view>

        <!-- 注册按钮 -->
        <view class="register-btn" @click="onRegister">
          <text class="register-btn-text">注册账号</text>
        </view>
      </view>

      <!-- 底部协议 -->
      <view class="footer">
        <text class="footer-text">
          登录即表示我已阅读并同意
          <text class="footer-link" @click="onTerms">服务条款</text>
          和
          <text class="footer-link" @click="onPrivacy">隐私政策</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { authLogin, getCaptcha } from '@/api';
import { useUserStore } from '@/stores/modules/userStore';

const userStore = useUserStore();
const formData = ref({
  login: '',
  password: '',
  verifyCode: '',
});

const showPassword = ref(false);
const rememberMe = ref(true);
const loggingIn = ref(false);
const captcha_id = ref('');
const verifyCodeImg = ref('');

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidLogin(value: string) {
  if (!value) return false;
  if (value.includes('@')) return isEmail(value);
  return value.length >= 6;
}

const canLogin = computed(() => {
  const login = formData.value.login.trim();
  return (
    isValidLogin(login) &&
    formData.value.password.length >= 6 &&
    formData.value.verifyCode.trim().length >= 4
  );
});

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function toggleRemember() {
  rememberMe.value = !rememberMe.value;
}

function loadCaptcha() {
  return getCaptcha().then((res: any) => {
    verifyCodeImg.value = res.data.image;
    captcha_id.value = res.data.captcha_id;
  });
}

function refreshVerifyCode() {
  loadCaptcha();
}

function onRegister() {
  uni.navigateTo({
    url: '/pages/register/register',
  });
}

function onCustomerService() {
  uni.showToast({ title: '请联系客服', icon: 'none' });
}

function onTerms() {
  uni.showToast({ title: '服务条款', icon: 'none' });
}

function onPrivacy() {
  uni.showToast({ title: '隐私政策', icon: 'none' });
}

onLoad(() => {
  const loginInfo = uni.getStorageSync('loginInfo');
  if (loginInfo?.login) {
    formData.value.login = loginInfo.login;
  }
  if (loginInfo?.rememberMe === false) {
    rememberMe.value = false;
  }
  loadCaptcha();
});

async function onLogin() {
  if (loggingIn.value || !canLogin.value) return;

  const login = formData.value.login.trim();
  const password = formData.value.password;

  if (!isValidLogin(login)) {
    uni.showToast({ title: '请输入正确的手机号码或邮箱', icon: 'none' });
    return;
  }
  if (password.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' });
    return;
  }
  if (formData.value.verifyCode.trim().length < 4) {
    uni.showToast({ title: '请输入验证码', icon: 'none' });
    return;
  }

  loggingIn.value = true;
  try {
    const res: any = await authLogin({
      login,
      password,
      captcha_id: captcha_id.value,
      captcha_code: formData.value.verifyCode.trim(),
    });
    const payload = res.data;

    if (payload?.totp_required) {
      uni.showToast({ title: '需要二次验证，请完成 TOTP 验证', icon: 'none' });
      return;
    }
    if (!payload?.token) {
      uni.showToast({ title: '登录失败，请重试', icon: 'none' });
      return;
    }

    uni.setStorageSync('token', payload.token);
    if (rememberMe.value) {
      uni.setStorageSync('loginInfo', { login, rememberMe: true });
    } else {
      uni.removeStorageSync('loginInfo');
    }

    if (payload.user) {
      userStore.setUserInfo(payload.user as any);
    }
    await userStore.reqUserInfo();
    uni.switchTab({ url: '/pages/home/index' });
  } catch {
    // 错误提示由 request 拦截器统一处理
    setTimeout(() => {
      refreshVerifyCode();
    }, 1000);
  } finally {
    loggingIn.value = false;
  }
}

function onForgotPassword() {
  uni.showToast({ title: '请联系客服重置密码', icon: 'none' });
}
</script>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
  box-sizing: border-box;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.login-cs {
  position: absolute;
  top: calc(24rpx + var(--status-bar-height, 44px));
  right: 32rpx;
  z-index: 2;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-cs-img {
  width: 44rpx;
  height: 44rpx;
}

.login-container {
  position: relative;
  z-index: 1;
  padding: calc(120rpx + var(--status-bar-height, 44px)) 56rpx 40rpx;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 28rpx;
}

.brand-img {
  width: 280rpx;
  height: 90rpx;
}

.login-title {
  display: block;
  text-align: center;
  font-size: 44rpx;
  font-weight: 600;
  color: #ee4d2d;
  margin-bottom: 64rpx;
}

.login-form {
  width: 100%;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  border-bottom: 2rpx solid #e5e5e5;
  min-height: 96rpx;
}

.input-icon {
  width: 48rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.input-icon-img {
  width: 40rpx;
  height: 40rpx;
}

.input-field {
  flex: 1;
  height: 96rpx;
  padding: 0;
  font-size: 30rpx;
  color: #333;
  background: transparent;
}

.input-placeholder {
  color: #c0c0c0;
  font-size: 28rpx;
}

.input-field--password {
  padding-right: 56rpx;
}

.input-field--captcha {
  padding-right: 8rpx;
}

.password-toggle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-code-wrap {
  flex-shrink: 0;
  width: 180rpx;
  height: 64rpx;
  margin-left: 12rpx;
  border-radius: 8rpx;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.verify-code-img {
  width: 100%;
  height: 100%;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  margin-top: 48rpx;
  border-radius: 8rpx;
  background: #ed4d2f;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active:not(.login-btn--disabled) {
    opacity: 0.9;
  }
}

.login-btn--disabled {
  background: #f5a898;
  pointer-events: none;
}

.login-btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  line-height: 1;
}

.extra-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 28rpx;
}

.remember-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.checkbox {
  width: 34rpx;
  height: 34rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-sizing: border-box;
}

.checkbox--checked {
  background: #ee4d2d;
  border-color: #ee4d2d;
}

.checkbox-icon {
  font-size: 20rpx;
  color: #fff;
  font-weight: 700;
  line-height: 1;
}

.remember-text {
  font-size: 26rpx;
  color: #555;
}

.forgot-link {
  font-size: 26rpx;
  color: #5a7a9a;
}

.divider {
  display: flex;
  align-items: center;
  margin: 48rpx 0 36rpx;
  gap: 24rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: #e0e0e0;
}

.divider-text {
  font-size: 26rpx;
  color: #999;
  flex-shrink: 0;
}

.register-btn {
  width: 100%;
  height: 88rpx;
  border-radius: 8rpx;
  background: #efefef;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.85;
  }
}

.register-btn-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #888;
  line-height: 1;
}

.footer {
  margin-top: auto;
  padding-top: 80rpx;
  padding-bottom: 20rpx;
}

.footer-text {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #777;
  line-height: 1.7;
}

.footer-link {
  color: #4a6fa5;
}
</style>
