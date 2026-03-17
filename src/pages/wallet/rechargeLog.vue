<template>
  <view class="recharge-log-page">
    <!-- 顶部标题栏占位（导航由 pages.json 控制） -->
    <view class="header-placeholder" />

    <!-- 充值记录列表 -->
    <view class="list">
      <view
        v-for="item in logs"
        :key="item.id"
        class="log-card"
      >
        <view class="log-card-body">
          <view class="log-card-body-top">
            <text class="log-amount"> {{ item.currency }} {{ item.amount }}</text>
            <text class="log-status">{{ item.status_text }}</text>

          </view>
          <text class="log-time">{{ item.created_at }}</text>
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
import { onLoad } from '@dcloudio/uni-app';
import { getWalletDeposits, type WalletDepositListItem } from '@/api/pay';

const logs = ref<WalletDepositListItem[]>([]);

async function loadLogs() {
  try {
    // 充值相关流水：type = deposit
    const res: any = await getWalletDeposits({
      page: 1,
      limit: 50,
    });
    const list = res.data?.list || res?.data || res || [];
    logs.value = list as WalletDepositListItem[];
  } catch (e) {
    console.error('加载充值日志失败', e);
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
  .log-card-body-top{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .log-card-body-bottom{
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}


.log-amount {
  font-size: 32rpx;
  color: #e74c3c;
}
.log-status{
  font-size: 24rpx;
  color: #b3b3b3;
  display: block;
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

