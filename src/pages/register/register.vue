<template>
  <view class="register">
    <view class="register-container">
      <text class="register-title">注册账号</text>

      <view class="register-tabs">
        <view
          class="tab-item"
          :class="{ 'tab-item--active': registerType === 'phone' }"
          @click="registerType = 'phone'"
        >
          <text class="tab-text">电话号码</text>
        </view>
        <view
          class="tab-item"
          :class="{ 'tab-item--active': registerType === 'email' }"
          @click="registerType = 'email'"
        >
          <text class="tab-text">电子邮件</text>
        </view>
      </view>

      <!-- 注册表单 -->
      <view class="register-form">
        <!-- 手机号注册 -->
        <template v-if="registerType === 'phone'">
          <!-- 手机号输入 -->
          <view class="form-item">
            <view class="input-group" :class="{ 'input-group--error': errors.phone }">
              <input
                class="input-field"
                type="text"
                v-model="formData.phone"
                placeholder="请输入您的手机号码。"
                maxlength="32"
                @blur="onFieldBlur('phone')"
                @input="onFieldInput('phone')"
              />
            </view>
            <text v-if="errors.phone" class="field-error">{{ errors.phone }}</text>
          </view>

          <!-- 验证码输入 -->
          <view class="form-item">
            <view class="input-group input-group--code" :class="{ 'input-group--error': errors.verifyCode }">
              <input
                class="input-field"
                type="text"
                v-model="formData.verifyCode"
                placeholder="请输入验证码。"
                maxlength="6"
                @blur="onFieldBlur('verifyCode')"
                @input="onFieldInput('verifyCode')"
              />
              <view class="verify-code-wrap" @click="refreshVerifyCode">
                <image class="verify-code-img" :src="verifyCodeImg" mode="aspectFit" />
              </view>
            </view>
            <text v-if="errors.verifyCode" class="field-error">{{ errors.verifyCode }}</text>
          </view>
        </template>

        <!-- 邮箱注册 -->
        <template v-if="registerType === 'email'">
          <!-- 邮箱输入 -->
          <view class="form-item">
            <view class="input-group" :class="{ 'input-group--error': errors.email }">
              <input
                class="input-field"
                type="text"
                v-model="formData.email"
                placeholder="请输入邮箱地址。"
                maxlength="64"
                @blur="onFieldBlur('email')"
                @input="onFieldInput('email')"
              />
            </view>
            <text v-if="errors.email" class="field-error">{{ errors.email }}</text>
          </view>

          <!-- 验证码输入 -->
          <view class="form-item">
            <view class="input-group input-group--code" :class="{ 'input-group--error': errors.verifyCode }">
              <input
                class="input-field"
                type="text"
                v-model="formData.verifyCode"
                placeholder="请输入验证码。"
                maxlength="6"
                @blur="onFieldBlur('verifyCode')"
                @input="onFieldInput('verifyCode')"
              />
              <view class="verify-code-wrap" @click="refreshVerifyCode">
                <image class="verify-code-img" :src="verifyCodeImg" mode="aspectFit" />
              </view>
            </view>
            <text v-if="errors.verifyCode" class="field-error">{{ errors.verifyCode }}</text>
          </view>
        </template>

        <!-- 密码输入 -->
        <view class="form-item">
          <view class="input-group input-group--password" :class="{ 'input-group--error': errors.password }">
            <input
              class="input-field input-field--password"
              :type="showPassword ? 'text' : 'password'"
              v-model="formData.password"
              placeholder="请输入密码。"
              maxlength="20"
              @blur="onFieldBlur('password')"
              @input="onFieldInput('password')"
            />
            <view class="password-toggle" @click="togglePassword">
              <uni-icons :type="!showPassword ? 'eye-slash' : 'eye'" size="22" color="#b8b8b8" />
            </view>
          </view>
          <text v-if="errors.password" class="field-error">{{ errors.password }}</text>
        </view>

        <!-- 确认密码输入 -->
        <view class="form-item">
          <view class="input-group input-group--password" :class="{ 'input-group--error': errors.confirmPassword }">
            <input
              class="input-field input-field--password"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="formData.confirmPassword"
              placeholder="请再次输入密码。"
              maxlength="20"
              @blur="onFieldBlur('confirmPassword')"
              @input="onFieldInput('confirmPassword')"
            />
            <view class="password-toggle" @click="toggleConfirmPassword">
              <uni-icons
                :type="!showConfirmPassword ? 'eye-slash' : 'eye'"
                size="22"
                color="#b8b8b8"
              />
            </view>
          </view>
          <text v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</text>
        </view>

        <!-- 协议复选框 -->
        <view class="agreement-group">
          <view class="checkbox-wrap" @click="toggleAgreement">
            <view class="checkbox" :class="{ 'checkbox--checked': agreed }">
              <text class="checkbox-icon" v-if="agreed">✓</text>
            </view>
            <text class="agreement-text">我已阅读并同意用户协议和隐私政策</text>
          </view>
          <text v-if="agreementError" class="field-error field-error--agreement">{{ agreementError }}</text>
        </view>

        <!-- 注册按钮 -->
        <view
          class="register-btn"
          :class="{ 'register-btn--disabled': !canRegister || registering }"
          @click="onRegister"
        >
          <text class="register-btn-text">{{ registering ? '登记中...' : '登记' }}</text>
        </view>

        <view class="login-hint">
          <text class="hint-text">已有账号?</text>
          <text class="login-link" @click="onGoToLogin">登录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { authRegister, getCaptcha } from '@/api';
import globalTool from '@/utils/globalTool';

type FieldKey = 'phone' | 'email' | 'verifyCode' | 'password' | 'confirmPassword';

const registerType = ref<'phone' | 'email'>('phone');

const formData = reactive({
  phone: '',
  email: '',
  verifyCode: '',
  password: '',
  confirmPassword: '',
});
const captcha_id = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const agreed = ref(false);
const verifyCodeImg = ref('');
const registering = ref(false);
const showAllErrors = ref(false);
const touched = reactive<Record<FieldKey, boolean>>({
  phone: false,
  email: false,
  verifyCode: false,
  password: false,
  confirmPassword: false,
});

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string) {
  return value.trim().length >= 6;
}

function getFieldError(field: FieldKey): string {
  switch (field) {
    case 'phone':
      if (registerType.value !== 'phone') return '';
      if (!formData.phone.trim()) return '请输入手机号码';
      if (!isValidPhone(formData.phone)) return '手机号码至少6位';
      return '';
    case 'email':
      if (registerType.value !== 'email') return '';
      if (!formData.email.trim()) return '请输入邮箱地址';
      if (!isEmail(formData.email.trim())) return '请输入正确的邮箱地址';
      return '';
    case 'verifyCode':
      if (!formData.verifyCode.trim()) return '请输入验证码';
      if (formData.verifyCode.trim().length < 4) return '验证码至少4位';
      return '';
    case 'password':
      if (!formData.password) return '请输入密码';
      if (formData.password.length < 6) return '密码至少6位';
      return '';
    case 'confirmPassword':
      if (!formData.confirmPassword) return '请再次输入密码';
      if (formData.confirmPassword !== formData.password) return '两次密码输入不一致';
      return '';
  }
}

function shouldShowError(field: FieldKey) {
  return showAllErrors.value || touched[field];
}

const errors = computed(() => ({
  phone: shouldShowError('phone') ? getFieldError('phone') : '',
  email: shouldShowError('email') ? getFieldError('email') : '',
  verifyCode: shouldShowError('verifyCode') ? getFieldError('verifyCode') : '',
  password: shouldShowError('password') ? getFieldError('password') : '',
  confirmPassword: shouldShowError('confirmPassword') ? getFieldError('confirmPassword') : '',
}));

const agreementError = computed(() => {
  if (!showAllErrors.value) return '';
  if (!agreed.value) return '请先阅读并同意协议';
  return '';
});

function onFieldBlur(field: FieldKey) {
  touched[field] = true;
}

function onFieldInput(field: FieldKey) {
  if (showAllErrors.value || touched[field]) {
    touched[field] = true;
  }
  if (field === 'password' && (showAllErrors.value || touched.confirmPassword)) {
    touched.confirmPassword = true;
  }
}

function markAllFieldsTouched() {
  (Object.keys(touched) as FieldKey[]).forEach((field) => {
    touched[field] = true;
  });
}

watch(registerType, () => {
  showAllErrors.value = false;
  touched.phone = false;
  touched.email = false;
  touched.verifyCode = false;
});

function loadCaptcha() {
  return getCaptcha().then((res: any) => {
    verifyCodeImg.value = res.data.image;
    captcha_id.value = res.data.captcha_id;
  });
}

function refreshVerifyCode() {
  loadCaptcha();
}

const canRegister = computed(() => {
  const verifyOk = formData.verifyCode.trim().length >= 4;
  const passwordOk =
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword;

  if (registerType.value === 'phone') {
    return isValidPhone(formData.phone) && verifyOk && passwordOk && agreed.value;
  }
  return isEmail(formData.email.trim()) && verifyOk && passwordOk && agreed.value;
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

async function onRegister() {
  if (registering.value) return;

  showAllErrors.value = true;
  markAllFieldsTouched();
  if (!canRegister.value) return;

  const params: any = {
    password: formData.password,
    captcha_id: captcha_id.value,
    captcha_code: formData.verifyCode.trim(),
  };
  if (registerType.value === 'phone') {
    params.phone = formData.phone.trim();
  } else {
    params.email = formData.email.trim();
  }

  registering.value = true;
  try {
    await authRegister(params);
    globalTool.showToast('注册成功', () => {
      uni.navigateTo({ url: '/pages/login/login' });
    });
  } catch {
    refreshVerifyCode();
  } finally {
    registering.value = false;
  }
}

function onGoToLogin() {
  uni.navigateTo({ url: '/pages/login/login' });
}

onLoad(() => {
  loadCaptcha();
});
</script>

<style lang="scss" scoped>
.register {
  min-height: 100vh;
  background: #ffffff;
  padding: 80rpx 48rpx 60rpx;
}

.register-container {
  width: 100%;
}

.register-title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #3a3a3a;
  text-align: center;
  margin-bottom: 48rpx;
}

.register-tabs {
  display: flex;
  padding: 8rpx;
  margin-bottom: 48rpx;
  background: #f2f2f2;
  border-radius: 20rpx;
}

.tab-item {
  flex: 1;
  padding: 22rpx 0;
  text-align: center;
  border-radius: 16rpx;
  transition: all 0.2s;
}

.tab-item--active {
  background: #ffffff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.tab-text {
  font-size: 28rpx;
  color: #999999;
}

.tab-item--active .tab-text {
  color: #333333;
  font-weight: 500;
}

.register-form {
  width: 100%;
}

.form-item {
  margin-bottom: 16rpx;
}

.input-group {
  position: relative;
  border-bottom: 2rpx solid #eeeeee;
}

.input-group--error {
  border-bottom-color: #e54d42;
}

.field-error {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #e54d42;
  line-height: 1.4;
}

.field-error--agreement {
  margin-top: 12rpx;
  padding-left: 50rpx;
}

.input-group--code {
  display: flex;
  align-items: center;
}

.input-field {
  flex: 1;
  width: 100%;
  height: 96rpx;
  padding: 0 0 8rpx;
  font-size: 30rpx;
  color: #333333;
  background: transparent;
  box-sizing: border-box;
}

.input-field--password {
  padding-right: 72rpx;
}

.input-group--code .input-field {
  padding-right: 16rpx;
}

.verify-code-wrap {
  width: 180rpx;
  height: 64rpx;
  margin-bottom: 8rpx;
  border-radius: 8rpx;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.verify-code-img {
  width: 100%;
  height: 100%;
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
  margin: 32rpx 0 40rpx;
}

.checkbox-wrap {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #dddddd;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.checkbox--checked {
  background: #e54d42;
  border-color: #e54d42;
}

.checkbox-icon {
  font-size: 22rpx;
  color: #ffffff;
  font-weight: 600;
  line-height: 1;
}

.agreement-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
}

.register-btn {
  width: 100%;
  height: 96rpx;
  margin-top: 16rpx;
  border-radius: 48rpx;
  background: #e54d42;
  box-shadow: 0 8rpx 24rpx rgba(229, 77, 66, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.2s;

  &:active:not(.register-btn--disabled) {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

.register-btn--disabled {
  background: #e0e0e0;
  box-shadow: none;
  pointer-events: none;
}

.register-btn-text {
  font-size: 34rpx;
  font-weight: 600;
  color: #ffffff;
  line-height: 1;
}

.register-btn--disabled .register-btn-text {
  color: #aaaaaa;
}

.login-hint {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4rpx;
  margin-top: 28rpx;
}

.hint-text {
  font-size: 26rpx;
  color: #666666;
}

.login-link {
  font-size: 26rpx;
  color: #e54d42;
  font-weight: 500;
}
</style>
