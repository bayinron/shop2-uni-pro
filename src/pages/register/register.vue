<template>
  <view class="register">
    <view class="register-container">
      <!-- 标题 -->
      <text class="register-title">注册账户</text>

      <!-- 注册方式标签页 -->
      <view class="register-tabs">
        <view
          class="tab-item"
          :class="{ 'tab-item--active': registerType === 'phone' }"
          @click="registerType = 'phone'"
        >
          <text class="tab-text">手机号</text>
        </view>
        <view
          class="tab-item"
          :class="{ 'tab-item--active': registerType === 'email' }"
          @click="registerType = 'email'"
        >
          <text class="tab-text">邮箱</text>
        </view>
      </view>

      <!-- 注册表单 -->
      <view class="register-form">
        <!-- 手机号注册 -->
        <template v-if="registerType === 'phone'">
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

          <!-- 验证码输入 -->
          <view class="input-group input-group--code">
            <input
              class="input-field"
              type="text"
              v-model="formData.verifyCode"
              placeholder="请输入验证码"
              maxlength="6"
            />
            <view class="verify-code-wrap" @click="refreshVerifyCode">
              <image class="verify-code-img" :src="verifyCodeImg" mode="aspectFit" />
            </view>
          </view>
        </template>

        <!-- 邮箱注册 -->
        <template v-if="registerType === 'email'">
          <!-- 邮箱输入 -->
          <view class="input-group">
            <input
              class="input-field"
              type="text"
              v-model="formData.email"
              placeholder="请输入邮箱地址"
            />
          </view>

          <!-- 验证码输入 -->
          <view class="input-group input-group--code">
            <input
              class="input-field"
              type="text"
              v-model="formData.verifyCode"
              placeholder="请输入验证码"
              maxlength="6"
            />
            <view class="verify-code-wrap" @click="refreshVerifyCode">
              <image class="verify-code-img" :src="verifyCodeImg" mode="aspectFit" />
            </view>
          </view>
        </template>

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

        <!-- 确认密码输入 -->
        <view class="input-group">
          <input
            class="input-field"
            :type="showConfirmPassword ? 'text' : 'password'"
            v-model="formData.confirmPassword"
            placeholder="请再次输入密码"
            maxlength="20"
          />
          <view class="password-toggle" @click="toggleConfirmPassword">
            <uni-icons
              :type="showConfirmPassword ? 'eye-slash' : 'eye'"
              size="20"
              color="#999"
            />
          </view>
        </view>

        <!-- 协议复选框 -->
        <view class="agreement-group">
          <view class="checkbox-wrap" @click="toggleAgreement">
            <view class="checkbox" :class="{ 'checkbox--checked': agreed }">
              <text class="checkbox-icon" v-if="agreed">✓</text>
            </view>
            <text class="agreement-text">我已阅读并同意用户协议和隐私政策</text>
          </view>
        </view>

        <!-- 注册按钮 -->
        <button class="register-btn" :disabled="!canRegister" @click="onRegister">
          注册
        </button>

        <!-- 已有账户登录 -->
        <view class="login-hint">
          <text class="hint-text">已有账户？</text>
          <text class="login-link" @click="onGoToLogin">立即登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

const registerType = ref<'phone' | 'email'>('phone');

const formData = ref({
  phone: '',
  email: '',
  verifyCode: '',
  password: '',
  confirmPassword: '',
});

const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreed = ref(false);
const verifyCodeImg = ref('');

// 生成验证码图片（测试数据 - 实际应该是后端接口返回）
function generateVerifyCode() {
  // 这里使用一个简单的占位图，实际应该是验证码图片的 base64 或 URL
  // 为了演示，我们使用一个占位符
  verifyCodeImg.value = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSI1MCIgeT0iMjUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFCM0M8L3RleHQ+PC9zdmc+';
}

function refreshVerifyCode() {
  generateVerifyCode();
}

const canRegister = computed(() => {
  if (registerType.value === 'phone') {
    return (
      formData.value.phone.length >= 11 &&
      formData.value.verifyCode.length >= 4 &&
      formData.value.password.length >= 6 &&
      formData.value.password === formData.value.confirmPassword &&
      agreed.value
    );
  } else {
    return (
      formData.value.email.includes('@') &&
      formData.value.verifyCode.length >= 4 &&
      formData.value.password.length >= 6 &&
      formData.value.password === formData.value.confirmPassword &&
      agreed.value
    );
  }
});

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function toggleConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value;
}

function toggleAgreement() {
  agreed.value = !agreed.value;
}

function onRegister() {
  if (!canRegister.value) {
    if (registerType.value === 'phone' && formData.value.phone.length < 11) {
      uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
      return;
    }
    if (registerType.value === 'email' && !formData.value.email.includes('@')) {
      uni.showToast({ title: '请输入正确的邮箱地址', icon: 'none' });
      return;
    }
    if (formData.value.verifyCode.length < 4) {
      uni.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }
    if (formData.value.password.length < 6) {
      uni.showToast({ title: '密码至少6位', icon: 'none' });
      return;
    }
    if (formData.value.password !== formData.value.confirmPassword) {
      uni.showToast({ title: '两次密码输入不一致', icon: 'none' });
      return;
    }
    if (!agreed.value) {
      uni.showToast({ title: '请先阅读并同意协议', icon: 'none' });
      return;
    }
    return;
  }

  // 模拟注册成功
  uni.showToast({ title: '注册成功（测试数据）', icon: 'success' });

  // 模拟延迟后跳转到登录页
  setTimeout(() => {
    uni.navigateTo({ url: '/pages/login/login' });
  }, 1500);
}

function onGoToLogin() {
  uni.navigateTo({ url: '/pages/login/login' });
}

onMounted(() => {
  generateVerifyCode();
});
</script>

<style lang="scss" scoped>
.register {
  min-height: 100vh;
  background: #fff;
  padding: 60rpx 40rpx;
}

.register-container {
  width: 100%;
  max-width: 600rpx;
  margin: 0 auto;
}

.register-title {
  display: block;
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin-bottom: 50rpx;
}

.register-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 40rpx;
  border-bottom: 2rpx solid #e5e5e5;
}

.tab-item {
  flex: 1;
  padding: 20rpx 0;
  text-align: center;
  background: #f5f5f5;
  border-top-left-radius: 12rpx;
  border-top-right-radius: 12rpx;
  border: 2rpx solid #e5e5e5;
  border-bottom: none;
  margin-bottom: -2rpx;
}

.tab-item--active {
  background: #fff;
  border-color: #e5e5e5;
  border-bottom-color: #fff;
}

.tab-text {
  font-size: 28rpx;
  color: #333;
}

.tab-item--active .tab-text {
  color: #ff3e6c;
  font-weight: 500;
}

.register-form {
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

.input-group--code {
  display: flex;
  align-items: center;
}

.input-field {
  flex: 1;
  height: 100rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  color: #333;
  background: transparent;
}

.verify-code-wrap {
  width: 160rpx;
  height: 60rpx;
  margin-right: 20rpx;
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
  align-items: flex-start;
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
  flex-shrink: 0;
  margin-top: 2rpx;
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
  line-height: 1.6;
}

.register-btn {
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

.register-btn:disabled {
  background: #ccc;
  color: #999;
}

.login-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.hint-text {
  font-size: 28rpx;
  color: #666;
}

.login-link {
  font-size: 28rpx;
  color: #ff3e6c;
  font-weight: 500;
}
</style>
