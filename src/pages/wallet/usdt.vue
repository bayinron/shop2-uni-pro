<template>
  <view class="usdt-page">
    <view class="tip-card">
      <text class="tip-title">{{ t('收款账户') }}</text>
      <text class="tip-text">{{ t('每位用户仅能绑定一组收款账户') }}</text>
      <text class="tip-text">{{ t('如需变更请联系客服由管理员处理') }}</text>
    </view>

    <view class="bottom-bar">
      <button class="submit-btn" @click="goBank">{{ t('查看收款账户') }}</button>
      <button class="submit-btn ghost" @click="goCustomerService">{{ t('联系客服') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStoreHook } from '@/stores/modules/userStore';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const userStore = useUserStoreHook();

function goBank() {
  uni.redirectTo({
    url: '/pages/wallet/bank',
  });
}

function goCustomerService() {
  const url = userStore.kefuConfig?.external_url;
  if (!url) {
    uni.showToast({ title: t('请联系客服'), icon: 'none' });
    return;
  }
  uni.navigateTo({
    url: '/pages/service/index?url=' + url,
  });
}
</script>

<style scoped lang="scss">
.usdt-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.tip-card {
  margin: 40rpx 30rpx 0;
  padding: 32rpx;
  background: #ffffff;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.tip-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.tip-text {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.5;
}

.bottom-bar {
  margin-top: 60rpx;
  padding: 0 30rpx 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
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

.submit-btn.ghost {
  background: #ffffff;
  color: #ff3e6c;
  border: 1rpx solid #ff3e6c;
}
</style>
