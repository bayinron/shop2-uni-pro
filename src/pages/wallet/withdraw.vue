<template>
  <view class="withdraw-page">
    <!-- 顶部标题栏（由导航栏控制，这里只预留背景） -->
    <view class="header-placeholder" />

   
      <!-- 提现金额 -->
      <view class="section">
        <text class="section-label">提现金额</text>
        <view class="amount-input-wrap">
          <text class="currency-symbol">฿</text>
          <input
            class="amount-input"
            type="number"
            v-model="form.amount"
            placeholder="请输入提现金额"
          />
        </view>
      </view>

      <!-- 提现类型 -->
      <view class="section">
        <view class="section-row" @click="onWithdrawTypeClick">
          <text class="section-label">提现类型</text>
          <view class="section-right">
            <text class="section-value">{{ currentWithdrawType.name }}</text>
            <uni-icons type="bottom" size="18" color="#999" />
          </view>
        </view>
      </view>

      <!-- 支付密码 -->
      <view class="section">
        <text class="section-label">支付密码</text>
        <input
          class="password-input"
          type="text"
          password
          v-model="form.payPassword"
          placeholder="请输入支付密码"
        />

        <view class="balance-row">
          <text class="balance-text">
            可用余额：<text class="balance-amount">฿ {{ availableBalance }}</text>
          </text>
        </view>
      </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="onSubmit">提现</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUserStoreHook } from '@/stores/modules/userStore';

type WithdrawType = {
  key: string;
  name: string;
};

const form = ref({
  amount: '',
  withdrawType: 'usdt',
  payPassword: '',
});

const withdrawTypes: WithdrawType[] = [
  { key: 'usdt', name: 'USDT' },
  // 需要更多类型的话在这里加
];

const currentWithdrawType = ref<WithdrawType>(withdrawTypes[0]);

const userStore = useUserStoreHook();
const userInfo = computed(() => userStore.userInfo);
const availableBalance = computed(() => userInfo.value?.balance ?? '0');

function onWithdrawTypeClick() {
  const itemList = withdrawTypes.map((p) => p.name);
  uni.showActionSheet({
    itemList,
    success: (res) => {
      const idx = res.tapIndex;
      if (idx >= 0 && idx < withdrawTypes.length) {
        currentWithdrawType.value = withdrawTypes[idx];
        form.value.withdrawType = withdrawTypes[idx].key;
      }
    },
  });
}

function onSubmit() {
  const amountNum = Number(form.value.amount);
  if (!amountNum || amountNum <= 0) {
    uni.showToast({ title: '请输入正确的提现金额', icon: 'none' });
    return;
  }
  if (!form.value.payPassword.trim()) {
    uni.showToast({ title: '请输入支付密码', icon: 'none' });
    return;
  }

  // TODO: 接入真实提现接口
  uni.showToast({
    title: `提交提现：฿${amountNum.toFixed(2)}（${currentWithdrawType.value.name}）`,
    icon: 'none',
  });
}
</script>

<style scoped lang="scss">
.withdraw-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-placeholder {
  height: 0;
}

.scroll {
  flex: 1;
}

.section {
  background: #fff;
  padding: 24rpx 30rpx;
  margin-top: 16rpx;
}

.section-label {
  font-size: 28rpx;
  color: #333;
}

.amount-input-wrap {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #f0f0f0;
  padding-bottom: 10rpx;
}

.currency-symbol {
  font-size: 40rpx;
  color: #ff3e6c;
  margin-right: 10rpx;
}

.amount-input {
  flex: 1;
  font-size: 40rpx;
  color: #333;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.section-value {
  font-size: 26rpx;
  color: #333;
}

.password-input {
  margin-top: 20rpx;
  font-size: 40rpx;
  color: #333;
  // padding: 38rpx 0;
  height: 80rpx;
  flex: 1;

  border-bottom: 2rpx solid #f0f0f0;
}

.balance-row {
  margin-top: 18rpx;
  display: flex;
  justify-content: flex-end;
}

.balance-text {
  font-size: 26rpx;
  color: #666;
}

.balance-amount {
  color: #ff3e6c;
  font-weight: 600;
}

.bottom-bar {
  padding: 20rpx 30rpx;
  // padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: #ff3e6c;
  color: #fff;
  font-size: 30rpx;
  border: none;
}
</style>
