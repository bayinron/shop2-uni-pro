<template>
  <view class="wallet-page">
    <!-- 顶部余额区域 -->
    <view class="wallet-header">
      <text class="wallet-label">余额（฿）</text>
      <text class="wallet-amount">{{ balance }}</text>
    </view>

    <!-- 功能列表 -->
    <view class="wallet-list">
      <view class="wallet-item" @click="goRecharge">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">￥</text>
          <text class="wallet-text">充值</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>

      <view class="wallet-item" @click="withdrawClick">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">⤓</text>
          <text class="wallet-text">提现</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>

      <view class="wallet-item" @click="bankClick">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">🏦</text>
          <text class="wallet-text">银行账户</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>
<!-- 
      <view class="wallet-item" @click="todo('bill')">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">📄</text>
          <text class="wallet-text">账单明细</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view> -->

      <view class="wallet-item" @click="todo('withdrawLog')">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">📝</text>
          <text class="wallet-text">提现日志</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>

      <view class="wallet-item" @click="todo('rechargeLog')">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">🧾</text>
          <text class="wallet-text">充值日志</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>

      <view class="wallet-item" @click="todo('bindUsdt')">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">₮</text>
          <text class="wallet-text">绑定USDT</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStoreHook } from '@/stores/modules/userStore';

const userStore = useUserStoreHook();
const userInfo = computed(() => userStore.userInfo);
const balance = computed(() => userInfo.value.balance ?? '0');

function goRecharge() {
  uni.navigateTo({
    url: '/pages/wallet/recharge',
  });
}

function withdrawClick() {
  uni.navigateTo({
    url: '/pages/wallet/withdraw',
  });
}

function bankClick() {
  uni.navigateTo({
    url: '/pages/wallet/bank',
  });
}

function todo(type: string) {
  let url = '';
  switch(type) {
    case 'bill':
      url = '/pages/wallet/bill';
      break;
    case 'withdrawLog':
      url = '/pages/wallet/withdrawLog';
      break;
    case 'rechargeLog':
      url = '/pages/wallet/rechargeLog';
      break;
    case 'bindUsdt':
      url = '/pages/wallet/usdt';
      break;
    default:
      url = '';
  }
  if (url) {
    uni.navigateTo({ url });
  }
}
</script>

<style scoped lang="scss">
.wallet-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.wallet-header {
  background: #ff3e6c;
  padding: 40rpx 30rpx 50rpx;
}

.wallet-label {
  font-size: 28rpx;
  color: #ffe4e8;
}

.wallet-amount {
  margin-top: 20rpx;
  font-size: 56rpx;
  font-weight: 700;
  color: #ffffff;
}

.wallet-list {
  margin-top: 10rpx;
  background: #ffffff;
}

.wallet-item {
  padding: 26rpx 30rpx;
  border-bottom: 1rpx solid #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wallet-item-left {
  display: flex;
  align-items: center;
}

.wallet-icon {
  width: 40rpx;
  margin-right: 16rpx;
  font-size: 32rpx;
  color: #ff3e6c;
}

.wallet-text {
  font-size: 28rpx;
  color: #333333;
}
</style>

