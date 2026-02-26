<template>
  <view class="bank-page">
    <!-- 顶部标题栏占位（导航由 pages.json 控制） -->
    <view class="header-placeholder" />

    <!-- 表单区域 -->
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">开户人姓名</text>
        <input
          class="form-input"
          type="text"
          v-model="form.accountName"
          placeholder="请输入开户人姓名"
          placeholder-class="form-input-placeholder"
        />
      </view>

      <view class="form-item">
        <text class="form-label">开户行</text>
        <input
          class="form-input"
          type="text"
          v-model="form.bankName"
          placeholder="请输入开户行"
          placeholder-class="form-input-placeholder"
        />
      </view>

      <view class="form-item no-border">
        <text class="form-label">银行卡号</text>
        <input
          class="form-input"
          type="number"
          v-model="form.bankCard"
          placeholder="请输入银行卡号"
          placeholder-class="form-input-placeholder"
        />
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="onSave">保存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const form = ref({
  accountName: '',
  bankName: '',
  bankCard: '',
});

function onSave() {
  if (!form.value.accountName.trim()) {
    uni.showToast({ title: '请输入开户人姓名', icon: 'none' });
    return;
  }
  if (!form.value.bankName.trim()) {
    uni.showToast({ title: '请输入开户行', icon: 'none' });
    return;
  }
  if (!form.value.bankCard.trim()) {
    uni.showToast({ title: '请输入银行卡号', icon: 'none' });
    return;
  }

  // TODO: 接入绑定/保存银行卡接口
  uni.showToast({
    title: '已保存银行卡信息（示例）',
    icon: 'none',
  });
}
</script>

<style scoped lang="scss">
.bank-page {
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

