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
          <view class="form-item">
            <view class="input-group" :class="{ 'input-group--error': errors.phone }">
              <input
                class="input-field"
                type="text"
                v-model="formData.phone"
                placeholder="请输入手机号码"
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
                placeholder="请输入验证码"
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
                placeholder="请输入邮箱地址"
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
                placeholder="请输入验证码"
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
              class="input-field"
              :type="showPassword ? 'text' : 'password'"
              v-model="formData.password"
              placeholder="请输入密码"
              maxlength="20"
              @blur="onFieldBlur('password')"
              @input="onFieldInput('password')"
            />
            <view class="password-toggle" @click="togglePassword">
              <uni-icons :type="showPassword ? 'eye-slash' : 'eye'" size="20" color="#999" />
            </view>
          </view>
          <text v-if="errors.password" class="field-error">{{ errors.password }}</text>
        </view>

        <!-- 确认密码输入 -->
        <view class="form-item">
          <view class="input-group input-group--password" :class="{ 'input-group--error': errors.confirmPassword }">
            <input
              class="input-field"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="formData.confirmPassword"
              placeholder="请再次输入密码"
              maxlength="20"
              @blur="onFieldBlur('confirmPassword')"
              @input="onFieldInput('confirmPassword')"
            />
            <view class="password-toggle" @click="toggleConfirmPassword">
              <uni-icons
                :type="showConfirmPassword ? 'eye-slash' : 'eye'"
                size="20"
                color="#999"
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
          <text class="register-btn-text">{{ registering ? '注册中...' : '注册' }}</text>
        </view>

        <!-- 已有账户登录 -->
        <view class="login-hint">
          <text class="hint-text">已有账户？</text>
          <text class="login-link" @click="onGoToLogin">{{ t('立即登录') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import { authRegister, getCaptcha } from '@/api';
import globalTool from '@/utils/globalTool';
import { useI18n } from '@/utils/i18n';

type FieldKey = 'phone' | 'email' | 'verifyCode' | 'password' | 'confirmPassword';

const registerType = ref<'phone' | 'email'>('phone');
const { t } = useI18n();

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
  background: linear-gradient(180deg, #ffe5d9 0%, #fff0eb 30%, #f8f9fa 100%);
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: #ff6b9d;
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

.form-item {
  margin-bottom: 30rpx;
}

.input-group {
  position: relative;
  margin-bottom: 0;
  background: #fff;
  border-radius: 16rpx;
  border: 2rpx solid #e5e5e5;
  overflow: hidden;
}

.input-group--error {
  border-color: #ff3e6c;
}

.field-error {
  display: block;
  margin-top: 10rpx;
  padding-left: 8rpx;
  font-size: 24rpx;
  color: #ff3e6c;
  line-height: 1.4;
}

.field-error--agreement {
  margin-top: 12rpx;
  padding-left: 48rpx;
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
  box-sizing: border-box;
}

.input-group--password .input-field {
  padding-right: 80rpx;
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
  margin-bottom: 30rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff3e6c 100%);
  box-shadow: 0 12rpx 32rpx rgba(255, 62, 108, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;

  &:active:not(.register-btn--disabled) {
    opacity: 0.92;
    transform: scale(0.98);
    box-shadow: 0 6rpx 20rpx rgba(255, 62, 108, 0.22);
  }
}

.register-btn--disabled {
  background: #e8e8e8;
  box-shadow: none;
}

.register-btn--disabled:active {
  opacity: 1;
  transform: none;
}

.register-btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  line-height: 1;
}

.register-btn--disabled .register-btn-text {
  color: #bbb;
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
