<template>
  <view class="my-shop-page">
    <!-- 顶部橙色头部 + 店铺账户信息（按截图） -->
    <view class="my-shop-header">
      <view class="my-shop-header-bg"></view>
      <view class="my-shop-header-main">
        <view class="my-shop-logo-box">
          <text class="my-shop-logo-text">S</text>
        </view>
        <view class="my-shop-user-info">
          <view class="my-shop-id-row">
            <text class="my-shop-id-label">ID：</text>
            <text class="my-shop-id-value">{{ shopUser.id }}</text>
          </view>
          <view class="my-shop-name-row">
            <text class="my-shop-name">{{ shopUser.name }}</text>
            <image class="my-shop-badge" src="/static/img/invitebg.png" mode="aspectFill" />
          </view>
          <view class="my-shop-phone-wrap">
            <text class="my-shop-phone">{{ shopUser.phone }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 主体内容：我的订单 + 我的钱包 + 广告 Banner -->
    <scroll-view class="my-shop-content" scroll-y>
      <!-- 我的订单 -->
      <view class="my-shop-card my-shop-card--order">
        <view class="card-header">
          <text class="card-title">我的订单</text>
          <view class="card-link" @click="goAllOrders">
            <text class="card-link-text">全部订单</text>
            <uni-icons type="right" size="18" color="#999" />
          </view>
        </view>
        <view class="order-icons">
          <view class="order-icon-item" @click="goOrderByStatus('pending')">
            <image class="order-icon-img" src="/static/img/my_4.png" mode="aspectFill" />
            <text class="order-icon-text">待付款</text>
          </view>
          <view class="order-icon-item" @click="goOrderByStatus('shipping')">
            <image class="order-icon-img" src="/static/img/my_5.png" mode="aspectFill" />
            <text class="order-icon-text">待发货</text>
          </view>
          <view class="order-icon-item" @click="goOrderByStatus('receiving')">
            <image class="order-icon-img" src="/static/img/my_6.png" mode="aspectFill" />
            <text class="order-icon-text">待收货</text>
          </view>
          <view class="order-icon-item" @click="goOrderByStatus('completed')">
            <image class="order-icon-img" src="/static/img/my_8.png" mode="aspectFill" />
            <text class="order-icon-text">已完成</text>
          </view>
        </view>
      </view>

      <!-- 我的钱包 -->
      <view class="my-shop-card my-shop-card--wallet">
        <view class="card-header">
          <text class="card-title">我的钱包</text>
          <view class="card-link" @click="goWallet">
            <text class="card-link-text">进入钱包</text>
            <uni-icons type="right" size="18" color="#999" />
          </view>
        </view>
        <view class="wallet-body">
          <view class="wallet-labels">
            <text class="wallet-label">余额</text>
          </view>
          <view class="wallet-amount">
            <text class="wallet-currency">฿</text>
            <text class="wallet-value">{{ wallet.balance }}</text>
          </view>
        </view>
      </view>

      <!-- 店铺活动 Banner（测试图片） -->
      <view class="banner-wrap">
        <image class="banner-img" src="/static/img/invitebg.png" mode="aspectFill" />
      </view>

      <!-- 必备工具 -->
      <view class="tools-card">
        <text class="tools-title">必备工具</text>
        <view class="tools-grid">
          <view class="tool-item" @click="onToolClick('invite')">
            <view class="tool-icon">
              <uni-icons type="email" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">邀请好友</text>
          </view>
          <view class="tool-item" @click="onToolClick('address')">
            <view class="tool-icon">
              <uni-icons type="location" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">收货地址</text>
          </view>
          <view class="tool-item" @click="onToolClick('order')">
            <view class="tool-icon">
              <uni-icons type="list" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">订单管理</text>
          </view>
          <view class="tool-item" @click="onToolClick('service')">
            <view class="tool-icon">
              <uni-icons type="chatbubble" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">联系客服</text>
          </view>
          <view class="tool-item" @click="onToolClick('wholesale')">
            <view class="tool-icon">
              <uni-icons type="shop" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">批发中心</text>
          </view>
          <view class="tool-item" @click="onToolClick('product')">
            <view class="tool-icon">
              <uni-icons type="bag" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">商品管理</text>
          </view>
          <view class="tool-item" @click="onToolClick('password')">
            <view class="tool-icon">
              <uni-icons type="locked" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">修改支付密码</text>
          </view>
          <view class="tool-item" @click="onToolClick('logout')">
            <view class="tool-icon">
              <uni-icons type="loop" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">退出登录</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const shopUser = ref({
  id: '10905',
  name: 'AABBC',
  phone: '13100000001',
});

const wallet = ref({
  balance: '0',
});

function goAllOrders() {
  uni.navigateTo({
    url: '/pages/order/order',
  });
}

function goOrderByStatus(status: string) {
  uni.navigateTo({
    url: '/pages/order/order?status=' + status,
  });
}

function goWallet() {
  uni.navigateTo({
    url: '/pages/wallet/wallet',
  });
}

function onToolClick(type: string) {
  if (type === 'invite') {
    uni.navigateTo({
      url: '/pages/invite/invite',
    });
  } else if (type === 'address') {
    uni.navigateTo({
      url: '/pages/address/list',
    });
  }else if (type === 'product') {
    uni.navigateTo({
      url: '/pages/shop/productManage',
    });
  }
}
</script>

<style scoped lang="scss">
.my-shop-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.my-shop-header {
  position: relative;
  padding-bottom: 40rpx;
}

.my-shop-header-bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 260rpx;
  background: linear-gradient(180deg, #ff6b35, #ff8c42);
}

.my-shop-header-main {
  position: relative;
  padding: 80rpx 40rpx 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.my-shop-logo-box {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-shop-logo-text {
  font-size: 52rpx;
  font-weight: 700;
  color: #ff6b35;
}

.my-shop-user-info {
  margin-left: 28rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.my-shop-id-row {
  flex-direction: row;
  display: flex;
  align-items: center;
}

.my-shop-id-label {
  font-size: 26rpx;
  color: #ffe4c4;
}

.my-shop-id-value {
  font-size: 28rpx;
  color: #ffffff;
  margin-left: 6rpx;
}

.my-shop-name-row {
  margin-top: 10rpx;
  flex-direction: row;
  display: flex;
  align-items: center;
}

.my-shop-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  margin-right: 14rpx;
}

.my-shop-badge {
  width: 48rpx;
  height: 32rpx;
  border-radius: 8rpx;
}

.my-shop-phone-wrap {
  margin-top: 16rpx;
  align-self: flex-start;
  padding: 10rpx 26rpx;
  border-radius: 40rpx;
  background: #ffffff;
}

.my-shop-phone {
  font-size: 26rpx;
  color: #ff3e6c;
}

.my-shop-content {
  flex: 1;
  margin-top: -30rpx;
  padding: 0 20rpx 24rpx;
}

.my-shop-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 26rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.my-shop-card--order {
  margin-top: 20rpx;
}

.my-shop-card--wallet {
  margin-top: 16rpx;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.card-link {
  display: flex;
  align-items: center;
}

.card-link-text {
  font-size: 26rpx;
  color: #999999;
  margin-right: 4rpx;
}

.order-icons {
  display: flex;
  justify-content: space-around;
}

.order-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-icon-img {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 12rpx;
}

.order-icon-text {
  font-size: 24rpx;
  color: #555555;
}

.wallet-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wallet-labels {
  display: flex;
  flex-direction: column;
}

.wallet-label {
  font-size: 26rpx;
  color: #666666;
}

.wallet-amount {
  display: flex;
  align-items: baseline;
}

.wallet-currency {
  font-size: 30rpx;
  color: #ff3e6c;
  margin-right: 4rpx;
}

.wallet-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #ff3e6c;
}

.banner-wrap {
  margin-top: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 260rpx;
}

.tools-card {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.tools-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24rpx;
  display: block;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx 0;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tool-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.tool-text {
  font-size: 24rpx;
  color: #333333;
  text-align: center;
}
</style>
