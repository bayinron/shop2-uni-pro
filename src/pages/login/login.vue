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
            type="number"
            v-model="formData.phone"
            placeholder="请输入手机号码"
            maxlength="11"
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
        <button class="login-btn" :disabled="!canLogin" @click="onLogin">
          登录
        </button>

        <!-- 忘记密码 -->
        <view class="forgot-password">
          <text class="forgot-link" @click="onForgotPassword">忘记密码</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const formData = ref({
  phone: '',
  password: '',
});

const showPassword = ref(false);
const agreed = ref(false);

const canLogin = computed(() => {
  return formData.value.phone.length >= 11 && formData.value.password.length >= 6 && agreed.value;
});

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function toggleAgreement() {
  agreed.value = !agreed.value;
}

function onRegister() {
  uni.showToast({ title: '跳转到注册页面（测试功能）', icon: 'none' });
}

function onLogin() {
  if (!canLogin.value) {
    uni.showToast({ title: '请完善登录信息', icon: 'none' });
    return;
  }

  // 模拟登录成功
  uni.showToast({ title: '登录成功（测试数据）', icon: 'success' });
  
  // 模拟延迟后返回上一页或跳转到首页
  setTimeout(() => {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      uni.navigateBack();
    } else {
      uni.switchTab({ url: '/pages/home/index' });
    }
  }, 1500);
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
  background: #ff3e6c;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-btn:disabled {
  background: #ccc;
  color: #999;
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
