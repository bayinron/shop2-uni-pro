<template>
  <view class="usdt-page">
    <!-- 顶部标题栏占位（导航由 pages.json 控制） -->
    <view class="header-placeholder" />

    <!-- 表单区域 -->
    <view class="form-card">
      <!-- 主网选择 -->
      <view class="form-item" @click="onNetworkClick">
        <text class="form-label">请选择主网</text>
        <view class="form-right">
          <text class="form-value">{{ currentNetwork.name }}</text>
          <uni-icons type="bottom" size="18" color="#c7c7c7" />
        </view>
      </view>

      <!-- USDT 地址 -->
      <view class="form-item no-border">
        <text class="form-label">USDT</text>
        <input
          class="form-input"
          type="text"
          v-model="form.address"
          placeholder="请输入USDT地址"
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

type NetworkItem = {
  key: string;
  name: string;
};

const networks: NetworkItem[] = [
  { key: 'TRC20', name: 'TRC20' },
  // 以后如果有 ERC20、OMNI 等，在这里扩展
];

const form = ref({
  network: networks[0].key,
  address: '',
});

const currentNetwork = ref<NetworkItem>(networks[0]);

function onNetworkClick() {
  const itemList = networks.map((n) => n.name);
  uni.showActionSheet({
    itemList,
    success: (res) => {
      const idx = res.tapIndex;
      if (idx >= 0 && idx < networks.length) {
        currentNetwork.value = networks[idx];
        form.value.network = networks[idx].key;
      }
    },
  });
}

function onSave() {
  if (!form.value.address.trim()) {
    uni.showToast({ title: '请输入USDT地址', icon: 'none' });
    return;
  }

  // TODO: 接入绑定/保存 USDT 地址的真实接口
  uni.showToast({
    title: '已保存USDT地址（示例）',
    icon: 'none',
  });
  setTimeout(() => {
    uni.navigateBack();
  }, 1500);
}
</script>

<style scoped lang="scss">
.usdt-page {
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
  justify-content: space-between;
}

.form-item.no-border {
  border-bottom: none;
}

.form-label {
  font-size: 28rpx;
  color: #333333;
}

.form-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.form-value {
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

