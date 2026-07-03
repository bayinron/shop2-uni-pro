<template>
  <view class="login">
    <view class="login-container">
      <!-- 标题 -->
      <text class="login-title">账户登录</text>

      <!-- 注册提示 -->
      <view class="register-hint">
        <text class="hint-text">还没有账户？</text>
        <text class="register-link" @click="onRegister">立即注册</text>
      </view>

      <!-- 登录表单 -->
      <view class="login-form">
        <!-- 手机号输入 -->
        <view class="input-group">
          <input
            class="input-field"
            type="text"
            v-model="formData.login"
            placeholder="请输入手机号码或邮箱"
            maxlength="64"
          />
        </view>

        <!-- 密码输入 -->
        <view class="input-group">
          <input
            class="input-field"
            :type="showPassword ? 'text' : 'password'"
            v-model="formData.password"
            placeholder="请输入密码"
            maxlength="20"
          />
          <view class="password-toggle" @click="togglePassword">
            <uni-icons :type="showPassword ? 'eye-slash' : 'eye'" size="20" color="#999" />
          </view>
        </view>

        <!-- 协议复选框 -->
        <view class="agreement-group">
          <view class="checkbox-wrap" @click="toggleAgreement">
            <view class="checkbox" :class="{ 'checkbox--checked': agreed }">
              <text class="checkbox-icon" v-if="agreed">✓</text>
            </view>
            <text class="agreement-text">阅读协议</text>
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

        <!-- 忘记密码 -->
        <!-- <view class="forgot-password">
          <text class="forgot-link" @click="onForgotPassword">忘记密码</text>
        </view> -->
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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
    url: '/pages/register/register'
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
    uni.showToast({ title: '请输入正确的手机号或邮箱', icon: 'none' });
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
    // 仅记住账号，不保存密码
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
  uni.showToast({ title: '跳转到忘记密码页面（测试功能）', icon: 'none' });
}
</script>

<style lang="scss" scoped>
.login {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffe5d9 0%, #fff0eb 30%, #f8f9fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
}

.login-container {
  width: 100%;
  max-width: 600rpx;
}

.login-title {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  color: #ff6b9d;
  text-align: center;
  margin-bottom: 20rpx;
}

.register-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  margin-bottom: 60rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #666;
}

.register-link {
  font-size: 28rpx;
  color: #ff3e6c;
  font-weight: 500;
}

.login-form {
  width: 100%;
}

.input-group {
  position: relative;
  margin-bottom: 30rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 2rpx solid #e5e5e5;
  overflow: hidden;
}

.input-field {
  width: 100%;
  height: 100rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  color: #333;
  background: transparent;
}

.password-toggle {
  position: absolute;
  right: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.agreement-group {
  margin-bottom: 40rpx;
}

.checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
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
  transition: all 0.3s;
}

.checkbox--checked {
  background: #ff3e6c;
  border-color: #ff3e6c;
}

.checkbox-icon {
  font-size: 24rpx;
  color: #fff;
  font-weight: 600;
}

.agreement-text {
  font-size: 26rpx;
  color: #666;
}

.login-btn {
  width: 100%;
  height: 96rpx;
  margin-bottom: 30rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff3e6c 100%);
  box-shadow: 0 12rpx 32rpx rgba(255, 62, 108, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;

  &:active:not(.login-btn--disabled) {
    opacity: 0.92;
    transform: scale(0.98);
    box-shadow: 0 6rpx 20rpx rgba(255, 62, 108, 0.22);
  }
}

.login-btn--disabled {
  background: #e8e8e8;
  box-shadow: none;
  pointer-events: none;
}

.login-btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  line-height: 1;
}

.login-btn--disabled .login-btn-text {
  color: #bbb;
}

.forgot-password {
  display: flex;
  justify-content: flex-end;
}

.forgot-link {
  font-size: 26rpx;
  color: #999;
}
</style>
