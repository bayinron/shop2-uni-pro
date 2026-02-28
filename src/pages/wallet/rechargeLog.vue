<template>
  <view class="recharge-log-page">
    <!-- 顶部标题栏占位（导航由 pages.json 控制） -->
    <view class="header-placeholder" />

    <!-- 充值记录列表（测试数据） -->
    <view class="list">
      <view
        v-for="item in logs"
        :key="item.id"
        class="log-card"
      >
        <view class="log-card-top" />
        <view class="log-card-body">
          <text class="log-amount">฿ {{ item.amount }}</text>
          <text class="log-time">{{ item.time }}</text>
        </view>
      </view>

      <!-- 已加载完毕 -->
      <view class="list-footer">
        <view class="line" />
        <text class="footer-text">已加载完毕</text>
        <view class="line" />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type RechargeLogItem = {
  id: number;
  amount: number | string;
  time: string;
};

// 测试数据
const logs = ref<RechargeLogItem[]>([
  { id: 1, amount: 32, time: '2026-02-26 14:30:39' },
  { id: 2, amount: 128.5, time: '2026-02-25 10:12:08' },
  { id: 3, amount: 50, time: '2026-02-24 18:05:21' },
]);
</script>

<style scoped lang="scss">
.recharge-log-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header-placeholder {
  height: 0;
}

.list {
  padding: 16rpx 24rpx 40rpx;
}

.log-card {
  background: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
}

.log-card-top {
  height: 4rpx;
  background: #e74c3c;
}

.log-card-body {
  padding: 20rpx 24rpx 24rpx;
}

.log-amount {
  font-size: 32rpx;
  color: #e74c3c;
}

.log-time {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #b3b3b3;
  display: block;
}

.list-footer {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c0c0;
}

.line {
  flex: 1;
  height: 1rpx;
  background: #e5e5e5;
}

.footer-text {
  margin: 0 16rpx;
  font-size: 24rpx;
  color: #c0c0c0;
}
</style>

