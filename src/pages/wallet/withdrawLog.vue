<template>
    <view class="recharge-log-page">
      <!-- 顶部标题栏占位（导航由 pages.json 控制） -->
      <view class="header-placeholder" />
  
  <!-- 提现记录列表 -->
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
import { ref, onMounted } from 'vue';
import { getMyBalanceLogs, type BalanceLogItem } from '@/api/log';
import { onLoad } from '@dcloudio/uni-app';
  
  const logs = ref<BalanceLogItem[]>([]);

  async function loadLogs() {
    try {
      // 只拉取提现相关流水：type = withdraw 或 related_type = withdrawal
      const res: any = await getMyBalanceLogs({
        type: 'withdraw',
        page: 1,
        limit: 50,
      });
      const list = res?.list || res?.data?.list || res?.data || res || [];
      logs.value = list as BalanceLogItem[];
    } catch (e) {
      console.error('加载提现日志失败', e);
      uni.showToast({ title: '加载失败', icon: 'none' });
    }
  }

  onLoad(() => {
    loadLogs();
  });
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
  
  