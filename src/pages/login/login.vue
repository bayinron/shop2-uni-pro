<template>
  <view class="login">
    <view class="login-bg" />

    <view class="login-container">
      <text class="login-title">登录帐户</text>

      <view class="register-hint">
        <text class="hint-text">还没有账号？</text>
        <text class="register-link" @click="onRegister">立即注册</text>
      </view>

      <view class="login-form">
        <view class="input-group">
          <input
            class="input-field"
            type="text"
            v-model="formData.login"
            placeholder="请输入您的手机号码。"
            maxlength="64"
          />
        </view>

        <view class="input-group">
          <input
            class="input-field input-field--password"
            :type="showPassword ? 'text' : 'password'"
            v-model="formData.password"
            placeholder="请输入密码。"
            maxlength="20"
          />
          <view class="password-toggle" @click="togglePassword">
            <uni-icons :type="!showPassword ? 'eye-slash' : 'eye'" size="22" color="#b8b8b8" />
          </view>
        </view>

        <view class="agreement-group">
          <view class="checkbox-wrap" @click="toggleAgreement">
            <view class="checkbox" :class="{ 'checkbox--checked': agreed }">
              <text class="checkbox-icon" v-if="agreed">✓</text>
            </view>
            <text class="agreement-text">阅读协议。</text>
          </view>
        </view>

        <view
          class="login-btn"
          :class="{ 'login-btn--disabled': !canLogin || loggingIn }"
          @click="onLogin"
        >
          <text class="login-btn-text">{{ loggingIn ? '登录中...' : '登录' }}</text>
        </view>

        <view class="forgot-password">
          <text class="forgot-link" @click="onForgotPassword">忘记密码</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { authLogin } from '@/api';
import { useUserStore } from '@/stores/modules/userStore';

const userStore = useUserStore();
const formData = ref({
  login: '',
  password: '',
});

const showPassword = ref(false);
const agreed = ref(true);
const loggingIn = ref(false);

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
  return isValidLogin(login) && formData.value.password.length >= 6 && agreed.value;
});

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function toggleAgreement() {
  agreed.value = !agreed.value;
}

function onRegister() {
  uni.navigateTo({
    url: '/pages/register/register',
  });
}

onLoad(() => {
  const loginInfo = uni.getStorageSync('loginInfo');
  if (loginInfo?.login) {
    formData.value.login = loginInfo.login;
  }
});

async function onLogin() {
  if (loggingIn.value || !canLogin.value) return;

  const login = formData.value.login.trim();
  const password = formData.value.password;

  if (!isValidLogin(login)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
    return;
  }
  if (password.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' });
    return;
  }
  if (!agreed.value) {
    uni.showToast({ title: '请先阅读并同意协议', icon: 'none' });
    return;
  }

  loggingIn.value = true;
  try {
    const res: any = await authLogin({ login, password });
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
    uni.setStorageSync('loginInfo', { login });

    if (payload.user) {
      userStore.setUserInfo(payload.user as any);
    }
    await userStore.reqUserInfo();
    uni.switchTab({ url: '/pages/home/index' });
  } catch {
    // 错误提示由 request 拦截器统一处理
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
  background: #f7f7f7;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: -120rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 120%;
  height: 360rpx;
  background:
    radial-gradient(circle at 20% 40%, rgba(255, 182, 193, 0.55) 0%, transparent 55%),
    radial-gradient(circle at 55% 20%, rgba(173, 216, 230, 0.45) 0%, transparent 50%),
    radial-gradient(circle at 85% 35%, rgba(221, 160, 221, 0.4) 0%, transparent 55%);
  filter: blur(40rpx);
  pointer-events: none;
}

.login-container {
  position: relative;
  z-index: 1;
  padding: 120rpx 48rpx 60rpx;
}

.login-title {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}

.register-hint {
  display: flex;
  align-items: center;
  gap: 4rpx;
  margin-bottom: 72rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #666;
}

.register-link {
  font-size: 28rpx;
  color: #f06292;
  font-weight: 500;
}

.login-form {
  width: 100%;
}

.input-group {
  position: relative;
  margin-bottom: 8rpx;
  border-bottom: 2rpx solid #e8e8e8;
}

.input-field {
  width: 100%;
  height: 96rpx;
  padding: 0 0 8rpx;
  font-size: 30rpx;
  color: #333;
  background: transparent;
}

.input-field--password {
  padding-right: 72rpx;
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

.agreement-group {
  margin: 36rpx 0 48rpx;
}

.checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.checkbox--checked {
  background: #e53e41;
  border-color: #e53e41;
}

.checkbox-icon {
  font-size: 22rpx;
  color: #fff;
  font-weight: 600;
  line-height: 1;
}

.agreement-text {
  font-size: 28rpx;
  color: #333;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 48rpx;
  background: #e53e41;
  box-shadow: 0 8rpx 24rpx rgba(229, 62, 65, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.2s;

  &:active:not(.login-btn--disabled) {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.login-btn--disabled {
  background: #e0e0e0;
  box-shadow: none;
  pointer-events: none;
}

.login-btn-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
  line-height: 1;
}

.login-btn--disabled .login-btn-text {
  color: #aaa;
}

.forgot-password {
  display: flex;
  justify-content: flex-end;
  margin-top: 28rpx;
}

.forgot-link {
  font-size: 26rpx;
  color: #999;
}
</style>
