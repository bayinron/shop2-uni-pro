<template>
  <view class="recharge-page">
    <!-- 顶部标题栏（由导航栏控制，这里只预留背景） -->
    <view class="header-placeholder" />

    <scroll-view class="scroll" scroll-y>
      <!-- 充值金额 -->
      <view class="section">
        <text class="section-label">充值金额</text>
        <view class="amount-input-wrap">
          <text class="currency-symbol">￥</text>
          <input
            class="amount-input"
            type="number"
            v-model="form.amount"
            placeholder="请输入充值金额"
          />
        </view>
      </view>

      <!-- 充值方式 -->
      <view class="section">
        <view class="section-row" @click="onPayTypeClick">
          <text class="section-label">充值方式</text>
          <view class="section-right">
            <text class="section-value">{{ currentPayType.name }}</text>
            <uni-icons type="right" size="18" color="#999" />
          </view>
        </view>
        <view class="pay-desc">
          <text class="pay-desc-text">{{ currentPayType.desc }}</text>
        </view>
      </view>

      <!-- 上传支付凭证（示意） -->
      <view class="section upload-section">
        <view class="upload-card" @click="onUploadClick">
          <view class="upload-icon-wrap">
            <text class="icon iconfont icon-camera" />
          </view>
          <view class="upload-text-wrap">
            <text class="upload-title">点击上传付款凭证</text>
            <text class="upload-sub">请上传转账截图，方便客服为您核对到账</text>
          </view>
        </view>
      </view>

      <!-- 温馨提示 -->
      <view class="tips-section">
        <text class="tips-title">温馨提示：</text>
        <view class="tips-item" v-for="(t, idx) in tips" :key="idx">
          <text class="tips-index">{{ idx + 1 }}.</text>
          <text class="tips-text">{{ t }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="onSubmit">立即充值</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type PayType = {
  key: string;
  name: string;
  desc: string;
};

const form = ref({
  amount: '',
  payType: 'usdt',
});

const payTypes: PayType[] = [
  {
    key: 'usdt',
    name: 'USDT 充值',
    desc: '使用 USDT 进行充值，请按照平台提示完成链上转账。',
  },
  {
    key: 'unionpay',
    name: '银联转账',
    desc: '通过银联线下转账，请联系在线客服获取收款账户信息。',
  },
];

const currentPayType = ref<PayType>(payTypes[0]);

const tips = [
  '为确保充值及时到账，请严格按照充值金额进行支付。',
  '完成转账后，请上传清晰的转账截图，方便客服为您核对。',
  '每日审核时间为 9:00-22:00，其他时间提交的订单将顺延处理。',
  '如有任何疑问，请及时联系在线客服为您处理。',
];

function onPayTypeClick() {
  const itemList = payTypes.map((p) => p.name);
  uni.showActionSheet({
    itemList,
    success: (res) => {
      const idx = res.tapIndex;
      if (idx >= 0 && idx < payTypes.length) {
        currentPayType.value = payTypes[idx];
        form.value.payType = payTypes[idx].key;
      }
    },
  });
}

function onUploadClick() {
  uni.showToast({ title: '选择或拍摄转账截图（测试功能）', icon: 'none' });
}

function onSubmit() {
  const amountNum = Number(form.value.amount);
  if (!amountNum || amountNum <= 0) {
    uni.showToast({ title: '请输入正确的充值金额', icon: 'none' });
    return;
  }
  uni.showToast({
    title: `提交充值：￥${amountNum.toFixed(2)}（${currentPayType.value.name}）`,
    icon: 'none',
  });
}
</script>

<style scoped lang="scss">
.recharge-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-placeholder {
  height: 0; // 头部由导航栏自身控制，这里不再占位高度
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

.pay-desc {
  margin-top: 16rpx;
}

.pay-desc-text {
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.upload-section {
  background: #fff;
}

.upload-card {
  margin-top: 10rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff5f7;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.upload-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #ff6b9d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon-wrap .icon {
  font-size: 48rpx;
  color: #fff;
}

.upload-text-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.upload-title {
  font-size: 28rpx;
  color: #333;
}

.upload-sub {
  font-size: 24rpx;
  color: #999;
}

.tips-section {
  margin-top: 24rpx;
  padding: 24rpx 30rpx 40rpx;
}

.tips-title {
  font-size: 26rpx;
  color: #ff3e6c;
  font-weight: 600;
}

.tips-item {
  margin-top: 8rpx;
  display: flex;
  align-items: flex-start;
}

.tips-index {
  font-size: 24rpx;
  color: #ff3e6c;
  margin-right: 8rpx;
}

.tips-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

.bottom-bar {
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
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

