<template>
  <view class="register">
    <!-- 左上角返回 -->
    <view class="register-back" @click="onBack">
      <uni-icons type="left" size="24" color="#999" />
    </view>
    <!-- 右上角客服 -->
    <view class="register-cs" @click="onCustomerService">
      <image class="register-cs-img" src="/static/images/icon_support.png" mode="aspectFit" />
    </view>

    <view class="register-container">
      <!-- Logo -->
      <view class="brand">
        <image class="brand-img" src="/static/images/shopee_logo_400.png" mode="aspectFit" />
      </view>

      <text class="register-title">{{ t('注册') }}</text>

      <!-- Tabs -->
      <view class="register-tabs">
        <view
          class="tab-item"
          :class="{ 'tab-item--active': registerType === 'phone' }"
          @click="registerType = 'phone'"
        >
          <text class="tab-text">{{ t('电话号码') }}</text>
        </view>
        <view
          class="tab-item"
          :class="{ 'tab-item--active': registerType === 'email' }"
          @click="registerType = 'email'"
        >
          <text class="tab-text">{{ t('电子邮件') }}</text>
        </view>
      </view>

      <view class="register-form">
        <!-- 手机号 / 邮箱 -->
        <view class="form-item" v-if="registerType === 'phone'">
          <view class="input-group" :class="{ 'input-group--error': errors.phone }">
            <view class="input-icon">
              <image class="input-icon-img" src="/static/images/icon_user.png" mode="aspectFit" />
            </view>
            <input
              class="input-field"
              type="text"
              v-model="formData.phone"
              :placeholder="t('请输入手机号码')"
              placeholder-class="input-placeholder"
              maxlength="32"
              @blur="onFieldBlur('phone')"
              @input="onFieldInput('phone')"
            />
          </view>
          <text v-if="errors.phone" class="field-error">{{ errors.phone }}</text>
        </view>

        <view class="form-item" v-else>
          <view class="input-group" :class="{ 'input-group--error': errors.email }">
            <view class="input-icon">
              <image class="input-icon-img" src="/static/images/icon_user.png" mode="aspectFit" />
            </view>
            <input
              class="input-field"
              type="text"
              v-model="formData.email"
              :placeholder="t('请输入邮箱地址')"
              placeholder-class="input-placeholder"
              maxlength="64"
              @blur="onFieldBlur('email')"
              @input="onFieldInput('email')"
            />
          </view>
          <text v-if="errors.email" class="field-error">{{ errors.email }}</text>
        </view>

        <!-- 密码 -->
        <view class="form-item">
          <view class="input-group" :class="{ 'input-group--error': errors.password }">
            <view class="input-icon">
              <image class="input-icon-img" src="/static/images/icon_password.png" mode="aspectFit" />
            </view>
            <input
              class="input-field input-field--password"
              :type="showPassword ? 'text' : 'password'"
              v-model="formData.password"
              :placeholder="t('密码至少6位')"
              placeholder-class="input-placeholder"
              maxlength="64"
              @blur="onFieldBlur('password')"
              @input="onFieldInput('password')"
            />
            <view class="password-toggle" @click="togglePassword">
              <uni-icons :type="showPassword ? 'eye' : 'eye-slash'" size="20" color="#b0b0b0" />
            </view>
          </view>
          <text v-if="errors.password" class="field-error">{{ errors.password }}</text>
        </view>

        <!-- 确认密码 -->
        <view class="form-item">
          <view class="input-group" :class="{ 'input-group--error': errors.confirmPassword }">
            <view class="input-icon">
              <image class="input-icon-img" src="/static/images/icon_password.png" mode="aspectFit" />
            </view>
            <input
              class="input-field input-field--password"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="formData.confirmPassword"
              :placeholder="t('请再次输入密码')"
              placeholder-class="input-placeholder"
              maxlength="64"
              @blur="onFieldBlur('confirmPassword')"
              @input="onFieldInput('confirmPassword')"
            />
            <view class="password-toggle" @click="toggleConfirmPassword">
              <uni-icons
                :type="showConfirmPassword ? 'eye' : 'eye-slash'"
                size="20"
                color="#b0b0b0"
              />
            </view>
          </view>
          <text v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</text>
        </view>

        <!-- 邀请码 -->
        <view class="form-item">
          <view class="input-group" :class="{ 'input-group--error': errors.inviteCode }">
            <view class="input-icon">
              <image class="input-icon-img" src="/static/images/icon_captcha.png" mode="aspectFit" />
            </view>
            <input
              class="input-field"
              type="text"
              v-model="formData.inviteCode"
              :placeholder="t('请输入邀请码')"
              placeholder-class="input-placeholder"
              maxlength="32"
              @blur="onFieldBlur('inviteCode')"
              @input="onFieldInput('inviteCode')"
            />
          </view>
          <text v-if="errors.inviteCode" class="field-error">{{ errors.inviteCode }}</text>
        </view>

        <!-- 注册按钮 -->
        <view
          class="submit-btn"
          :class="{ 'submit-btn--disabled': !canRegister || registering }"
          @click="onRegister"
        >
          <text class="submit-btn-text">{{ registering ? t('注册中...') : t('注册') }}</text>
        </view>

        <!-- 分隔线 -->
        <view class="divider">
          <view class="divider-line" />
          <text class="divider-text">{{ t('或') }}</text>
          <view class="divider-line" />
        </view>

        <!-- 登录按钮 -->
        <view class="login-btn" @click="onGoToLogin">
          <text class="login-btn-text">{{ t('登录') }}</text>
        </view>
      </view>

      <!-- 底部协议 -->
      <view class="footer">
        <text class="footer-text">
          {{ t('注册即表示我已阅读并同意') }}
          <text class="footer-link" @click="onTerms">{{ t('服务条款') }}</text>
          {{ t('和') }}
          <text class="footer-link" @click="onPrivacy">{{ t('隐私政策') }}</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { authRegister, type AuthRegisterPayload } from '@/api';
import globalTool from '@/utils/globalTool';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();

type FieldKey = 'phone' | 'email' | 'password' | 'confirmPassword' | 'inviteCode';

const registerType = ref<'phone' | 'email'>('phone');

const formData = reactive({
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
});
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const registering = ref(false);
const showAllErrors = ref(false);
const touched = reactive<Record<FieldKey, boolean>>({
  phone: false,
  email: false,
  password: false,
  confirmPassword: false,
  inviteCode: false,
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
      if (!formData.phone.trim()) return t('请输入手机号码');
      if (!isValidPhone(formData.phone)) return t('手机号码至少6位');
      return '';
    case 'email':
      if (registerType.value !== 'email') return '';
      if (!formData.email.trim()) return t('请输入邮箱地址');
      if (!isEmail(formData.email.trim())) return t('请输入正确的邮箱地址');
      return '';
    case 'password':
      if (!formData.password) return t('请输入密码');
      if (formData.password.length < 6) return t('密码至少6位');
      return '';
    case 'confirmPassword':
      if (!formData.confirmPassword) return t('请再次输入密码');
      if (formData.confirmPassword !== formData.password) return t('两次密码输入不一致');
      return '';
    case 'inviteCode':
      if (!formData.inviteCode.trim()) return t('请输入邀请码');
      return '';
  }
}

function shouldShowError(field: FieldKey) {
  return showAllErrors.value || touched[field];
}

const errors = computed(() => ({
  phone: shouldShowError('phone') ? getFieldError('phone') : '',
  email: shouldShowError('email') ? getFieldError('email') : '',
  password: shouldShowError('password') ? getFieldError('password') : '',
  confirmPassword: shouldShowError('confirmPassword') ? getFieldError('confirmPassword') : '',
  inviteCode: shouldShowError('inviteCode') ? getFieldError('inviteCode') : '',
}));

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
});

const canRegister = computed(() => {
  const passwordOk =
    formData.password.length >= 6 && formData.password === formData.confirmPassword;
  const inviteOk = formData.inviteCode.trim().length > 0;

  if (registerType.value === 'phone') {
    return isValidPhone(formData.phone) && passwordOk && inviteOk;
  }
  return isEmail(formData.email.trim()) && passwordOk && inviteOk;
});

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function toggleConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value;
}

async function onRegister() {
  if (registering.value) return;

  showAllErrors.value = true;
  markAllFieldsTouched();
  if (!canRegister.value) return;

  const account =
    registerType.value === 'phone' ? formData.phone.trim() : formData.email.trim();
  const params: AuthRegisterPayload = {
    password: formData.password,
    invite_code: formData.inviteCode.trim(),
  };
  if (registerType.value === 'phone') {
    params.phone = account;
  } else {
    params.email = account;
  }

  registering.value = true;
  try {
    await authRegister(params);
    // 注册成功不返回 Token，引导去登录；预填账号方便登录
    uni.setStorageSync('loginInfo', { login: account, rememberMe: true });
    globalTool.showToast(t('注册成功'), () => {
      uni.navigateTo({ url: '/pages/login/login' });
    });
  } catch {
    // 错误提示由请求拦截器处理
  } finally {
    registering.value = false;
  }
}

function onBack() {
  uni.navigateBack({
    fail: () => {
      uni.navigateTo({ url: '/pages/login/login' });
    },
  });
}

function onGoToLogin() {
  uni.navigateTo({ url: '/pages/login/login' });
}

function onCustomerService() {
  uni.showToast({ title: t('请联系客服'), icon: 'none' });
}

function onTerms() {
  uni.showToast({ title: t('服务条款'), icon: 'none' });
}

function onPrivacy() {
  uni.showToast({ title: t('隐私政策'), icon: 'none' });
}

onLoad((options: any) => {
  const code =
    options?.invite_code || options?.invitation_code || options?.code || options?.inviteCode || '';
  if (code) {
    formData.inviteCode = String(code).trim();
  }
});
</script>

<style lang="scss" scoped>
.register {
  min-height: 100vh;
  background: #ffffff;
  position: relative;
  box-sizing: border-box;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

.register-back {
  position: absolute;
  top: calc(24rpx + var(--status-bar-height, 44px));
  left: 24rpx;
  z-index: 2;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-cs {
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

.register-cs-img {
  width: 44rpx;
  height: 44rpx;
}

.register-container {
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

.register-title {
  display: block;
  text-align: center;
  font-size: 44rpx;
  font-weight: 600;
  color: #ee4d2d;
  margin-bottom: 48rpx;
}

.register-tabs {
  display: flex;
  margin-bottom: 24rpx;
  border-bottom: 2rpx solid #e8e8e8;
}

.tab-item {
  flex: 1;
  padding: 20rpx 0;
  text-align: center;
  position: relative;
}

.tab-item--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -2rpx;
  height: 4rpx;
  background: #ee4d2d;
}

.tab-text {
  font-size: 28rpx;
  color: #999;
}

.tab-item--active .tab-text {
  color: #ee4d2d;
  font-weight: 500;
}

.register-form {
  width: 100%;
}

.form-item {
  margin-bottom: 0;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
  border-bottom: 2rpx solid #e5e5e5;
  min-height: 96rpx;
}

.input-group--error {
  border-bottom-color: #e54d42;
}

.field-error {
  display: block;
  margin: -4rpx 0 12rpx;
  font-size: 24rpx;
  color: #e54d42;
  line-height: 1.4;
  padding-left: 60rpx;
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

.submit-btn {
  width: 100%;
  height: 88rpx;
  margin-top: 48rpx;
  border-radius: 8rpx;
  background: #ed4d2f;
  display: flex;
  align-items: center;
  justify-content: center;

  &:active:not(.submit-btn--disabled) {
    opacity: 0.9;
  }
}

.submit-btn--disabled {
  background: #f5a898;
  pointer-events: none;
}

.submit-btn-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  line-height: 1;
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

.login-btn {
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

.login-btn-text {
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
