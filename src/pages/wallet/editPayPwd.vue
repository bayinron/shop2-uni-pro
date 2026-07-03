<template>
  <view class="edit-pay-pwd-page">
    <!-- 顶部标题栏占位（导航由 pages.json 控制） -->
    <view class="header-placeholder" />

    <!-- 表单区域 -->
    <view class="form-card">
      <view class="form-item" v-if="!first">
        <text class="form-label">原密码</text>
        <input
          class="form-input"
          type="password"
          v-model="form.oldPwd"
          placeholder="请输入原密码"
          placeholder-class="form-input-placeholder"
        />
      </view>

      <view class="form-item">
        <text class="form-label">新密码</text>
        <input
          class="form-input"
          type="password"
          v-model="form.newPwd"
          placeholder="请输入新密码"
          placeholder-class="form-input-placeholder"
        />
      </view>

      <view class="form-item no-border">
        <text class="form-label">确认密码</text>
        <input
          class="form-input"
          type="password"
          v-model="form.confirmPwd"
          placeholder="请确认新密码"
          placeholder-class="form-input-placeholder"
        />
      </view>
    </view>

    <!-- 底部确认按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="onSubmit">确认</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { updateWithdrawPassword, type UpdateWithdrawPasswordPayload } from '@/api/auth';
import globalTool from '@/utils/globalTool';
const first = ref(false);
const form = ref({
  oldPwd: '',
  newPwd: '',
  confirmPwd: '',
});
onLoad((options :any) => {
  if (options.first) {
    first.value = options.first === 'true';
  }
});
async function onSubmit() {
  if (!first.value && !form.value.oldPwd.trim()) {
    uni.showToast({ title: '请输入原密码', icon: 'none' });
    return;
  }
  if (!form.value.newPwd.trim()) {
    uni.showToast({ title: '请输入新密码', icon: 'none' });
    return;
  }
  if (form.value.newPwd.length < 6) {
    uni.showToast({ title: '新密码至少6位', icon: 'none' });
    return;
  }
  if (form.value.newPwd !== form.value.confirmPwd) {
    uni.showToast({ title: '两次输入的新密码不一致', icon: 'none' });
    return;
  }

  const payload: UpdateWithdrawPasswordPayload = first.value
    ? {
        new_password: form.value.newPwd,
        confirm_password: form.value.confirmPwd,
      }
    : {
        old_password: form.value.oldPwd,
        new_password: form.value.newPwd,
        confirm_password: form.value.confirmPwd,
      };

  try {
    await updateWithdrawPassword(payload);
    globalTool.showToast('修改成功', true, 'success');
  } catch (e) {
    // 具体错误提示已在全局 http 拦截器中处理，这里只做兜底
    console.error('修改提现密码失败', e);
  }
}
</script>

<style scoped lang="scss">
.edit-pay-pwd-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-placeholder {
  height: 0;
}

.form-card {
  margin-top: 16rpx;
  background: #ffffff;
}

.form-item {
  padding: 0 30rpx;
  height: 96rpx;
  border-bottom: 1rpx solid #f2f2f2;
  display: flex;
  align-items: center;
}

.form-item.no-border {
  border-bottom: none;
}

.form-label {
  width: 180rpx;
  font-size: 28rpx;
  color: #333333;
}

.form-input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #333333;
}

.form-input-placeholder {
  font-size: 28rpx;
  color: #c7c7c7;
}

.bottom-bar {
  margin-top: 60rpx;
  padding: 0 30rpx 40rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: #ff3e6c;
  color: #ffffff;
  font-size: 30rpx;
  border: none;
}
</style>

