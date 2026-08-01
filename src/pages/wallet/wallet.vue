<template>
  <view class="wallet-page">
    <!-- 顶部余额区域：店铺结算钱包 -->
    <view class="wallet-header">
      <text class="wallet-label">{{ t('余额') }}</text>
      <text class="wallet-amount">{{ balance }}</text>
      <view class="wallet-stats">
        <view class="stat-item">
          <text class="stat-label">{{ t('待结算') }}</text>
          <text class="stat-value">{{ formatAmount(financial?.pending_amount) }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">{{ t('已结算') }}</text>
          <text class="stat-value">{{ formatAmount(financial?.settled_amount) }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">{{ t('累计收益') }}</text>
          <text class="stat-value">{{ formatAmount(financial?.total_earned) }}</text>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="wallet-list">
      <view class="wallet-item" @click="goRecharge">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">฿</text>
          <text class="wallet-text">{{ t('充值') }}</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>

      <view class="wallet-item" @click="withdrawClick">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">⤓</text>
          <text class="wallet-text">{{ t('提现') }}</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>

      <view class="wallet-item" @click="bankClick">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">🏦</text>
          <text class="wallet-text">{{ t('银行账户') }}</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>

      <view class="wallet-item" @click="todo('withdrawLog')">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">📝</text>
          <text class="wallet-text">{{ t('提现日志') }}</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>

      <view class="wallet-item" @click="todo('rechargeLog')">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">🧾</text>
          <text class="wallet-text">{{ t('充值日志') }}</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>

      <view class="wallet-item" @click="todo('bindUsdt')">
        <view class="wallet-item-left">
          <text class="iconfont wallet-icon">₮</text>
          <text class="wallet-text">{{ t('绑定USDT') }}</text>
        </view>
        <uni-icons type="right" size="18" color="#c7c7c7" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStoreHook } from '@/stores/modules/userStore';
import {
  getMyShopFinancialSummary,
  type MyShopFinancialSummary,
} from '@/api/myshop';
import { getWalletBalanceOverview } from '@/api/pay';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const userStore = useUserStoreHook();

const financial = ref<MyShopFinancialSummary | null>(null);
const balance = ref('0');

function formatAmount(v: number | string | null | undefined) {
  if (v === undefined || v === null || v === '') return '0.00';
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(2) : String(v);
}

function unwrapData<T>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

async function loadBalance() {
  try {
    const res: any = await getWalletBalanceOverview();
    const data = unwrapData<any>(res);
    balance.value =
      data?.balance_wallet?.balance_formatted ||
      data?.total_formatted ||
      '0';
  } catch {
    balance.value = '0';
  }
}

async function loadFinancial() {
  try {
    const res: any = await getMyShopFinancialSummary();
    financial.value = unwrapData<MyShopFinancialSummary>(res);
  } catch {
    financial.value = null;
  }
}

onShow(() => {
  loadBalance();
  loadFinancial();
});

function goRecharge() {
  uni.navigateTo({
    url: '/pages/service/index?url=' + userStore.kefuConfig.external_url,
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
  switch (type) {
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
  padding: 40rpx 30rpx 40rpx;
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

.wallet-stats {
  margin-top: 28rpx;
  display: flex;
  justify-content: space-between;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.75);
}

.stat-value {
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 600;
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
