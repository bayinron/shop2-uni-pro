<template>
  <view class="address-page">
    <scroll-view class="scroll" scroll-y>
      <!-- 空状态 -->
      <view v-if="!loading && addresses.length === 0" class="empty">
        <text class="empty-text">暂无收货地址，请点击下方按钮添加</text>
      </view>

      <!-- 地址列表 -->
      <view v-else>
        <view
          v-for="item in addresses"
          :key="item.id"
          class="address-card"
          @click="onSelect(item)"
        >
          <view class="address-header">
            <view class="address-name-phone">
              <text class="name">{{ item.receiver_name }}</text>
              <text class="phone">{{ item.receiver_phone }}</text>
            </view>
            <view v-if="item.is_default" class="default-tag">默认</view>
          </view>
          <view class="address-body">
            <text class="address-text">
              {{ item.province }}{{ item.city }}{{ item.district }}{{ item.address }}
            </text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部添加按钮 -->
    <view class="bottom-bar">
      <button class="add-btn" @click="onAddAddress">添加新地址</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getUserAddresses, type UserAddress } from '@/api';

const addresses = ref<UserAddress[]>([]);
const loading = ref(false);

function loadAddresses() {
  loading.value = true;
  getUserAddresses()
    .then((res: any) => {
      const list =
        res?.data?.data ??
        res?.data ??
        res?.result ??
        res?.rows ??
        [];
      addresses.value = Array.isArray(list) ? (list as UserAddress[]) : [];
    })
    .finally(() => {
      loading.value = false;
    });
}

function onAddAddress() {
  // 这里先跳转到预留的编辑页面，后续可实现真正的新增/编辑逻辑
  uni.navigateTo({
    url: '/pages/address/edit',
  });
}

function onSelect(item: UserAddress) {
  uni.showToast({
    title: `选择地址：${item.receiver_name}`,
    icon: 'none',
  });
}

onShow(() => {
  loadAddresses();
});
</script>

<style scoped lang="scss">
.address-page {
  min-height: 95vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.scroll {
  flex: 1;
  padding: 20rpx 24rpx 140rpx;
}

.address-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.address-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.address-name-phone {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.phone {
  font-size: 28rpx;
  color: #666;
}

.default-tag {
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  background: #ffedf2;
  color: #ff3e6c;
  font-size: 22rpx;
}

.address-body {
  margin-top: 4rpx;
}

.address-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

.empty {
  margin-top: 120rpx;
  display: flex;
  justify-content: center;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}

.bottom-bar {
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.add-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  background: #ff3e6c;
  color: #fff;
  font-size: 32rpx;
  border: none;
}
</style>

