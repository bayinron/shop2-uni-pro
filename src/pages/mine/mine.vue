<template>
  <view class="mine">
    <!-- 顶部橙色头部 -->
    <view class="header">
      <view class="header-left">
        <view class="logo-box">
          <text class="logo-text">S</text>
        </view>
        <text class="brand-text">商城</text>
      </view>
      <view class="header-right">
        <text class="header-btn" @click="onRegisterAgent">注册代理</text>
        <text class="header-btn" @click="onLogin">登录</text>
      </view>
    </view>

    <!-- 我的订单卡片 -->
    <view class="order-card">
      <view class="order-header">
        <text class="order-title">我的订单</text>
        <view class="order-link" @click="onViewAllOrders">
          <text class="order-link-text">全部订单</text>
          <text class="icon iconfont icon-arrow-right">></text>
        </view>
      </view>
      <view class="order-icons">
        <view class="order-icon-item" @click="onOrderStatusClick('pending')">
          <view class="order-icon-wrap">
            <text class="icon iconfont icon-qianbao"></text>
          </view>
          <text class="order-icon-text">待付款</text>
          <text class="order-badge" v-if="orderCounts.pending > 0">{{ orderCounts.pending }}</text>
        </view>
        <view class="order-icon-item" @click="onOrderStatusClick('shipping')">
          <view class="order-icon-wrap">
            <text class="icon iconfont icon-wuliu"></text>
          </view>
          <text class="order-icon-text">待发货</text>
          <text class="order-badge" v-if="orderCounts.shipping > 0">{{ orderCounts.shipping }}</text>
        </view>
        <view class="order-icon-item" @click="onOrderStatusClick('receiving')">
          <view class="order-icon-wrap">
            <text class="icon iconfont icon-daishouhuo"></text>
          </view>
          <text class="order-icon-text">待收货</text>
          <text class="order-badge" v-if="orderCounts.receiving > 0">{{ orderCounts.receiving }}</text>
        </view>
        <view class="order-icon-item" @click="onOrderStatusClick('refund')">
          <view class="order-icon-wrap">
            <text class="icon iconfont icon-tuikuan"></text>
          </view>
          <text class="order-icon-text">已完成</text>
          <text class="order-badge" v-if="orderCounts.refund > 0">{{ orderCounts.refund }}</text>
        </view>
      </view>
    </view>

    <!-- 服务按钮 -->
    <view class="service-buttons">
      <view class="service-btn" @click="onServiceClick('customer')">
        <view class="service-icon-wrap">
          <text class="icon iconfont icon-vzaixiankefu"></text>
        </view>
        <text class="service-text">客服</text>
      </view>
      <view class="service-btn" @click="onServiceClick('address')">
        <view class="service-icon-wrap">
          <text class="icon iconfont icon-dizhi"></text>
        </view>
        <text class="service-text">地址</text>
      </view>
      <view class="service-btn" @click="onServiceClick('becomeMerchant')">
        <view class="service-icon-wrap">
          <text class="icon iconfont icon-shangjia"></text>
        </view>
        <text class="service-text">申请成为商家</text>
      </view>
    </view>

    <!-- 推荐商品 -->
    <view class="recommend-section">
      <view class="recommend-header">
        <view class="recommend-divider"></view>
        <view class="recommend-title-wrap">
          <text class="recommend-icon">◆</text>
          <text class="recommend-title">推荐商品</text>
        </view>
        <view class="recommend-divider"></view>
      </view>
      <view class="recommend-products">
        <view
          class="product-item"
          v-for="p in recommendProducts"
          :key="p.id"
          @click="onProductClick(p)"
        >
          <image class="product-img" :src="p.img" mode="aspectFill" />
          <text class="product-title">{{ p.title }}</text>
          <view class="product-price-wrap">
            <text class="product-price">￥{{ p.price }}</text>
            <text class="product-original" v-if="p.originalPrice">￥{{ p.originalPrice }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

type Product = {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  img: string;
};

// 订单数量统计（测试数据）
const orderCounts = ref({
  pending: 2,
  shipping: 5,
  receiving: 1,
  refund: 0,
});

// 购物车数量（测试数据）
const cartCount = ref(3);

// 推荐商品（测试数据）
const recommendProducts = ref<Product[]>([
  {
    id: 'p1',
    title: '时尚连帽卫衣',
    price: '199.00',
    originalPrice: '299.00',
    img: '/static/img/clock.png',
  },
  {
    id: 'p2',
    title: '休闲夹克外套',
    price: '299.00',
    originalPrice: '399.00',
    img: '/static/img/profit.png',
  },
  {
    id: 'p3',
    title: '经典T恤',
    price: '89.00',
    img: '/static/img/money-bag.png',
  },
  {
    id: 'p4',
    title: '运动鞋',
    price: '459.00',
    originalPrice: '599.00',
    img: '/static/img/invitebg.png',
  },
]);

function onRegisterAgent() {
  uni.navigateTo({
    url: '/pages/register/register'
  });
}

function onLogin() {
  uni.navigateTo({
    url: '/pages/login/login'
  });
}

function onViewAllOrders() {
  uni.navigateTo({
    url: '/pages/order/order'
  });
}

function onOrderStatusClick(status: string) {
  if (status === 'pending') {
    uni.navigateTo({
      url: '/pages/order/order?status=pending'
    });
  } else if (status === 'shipping') {
    uni.navigateTo({
      url: '/pages/order/order?status=shipping'
    });
  } else if (status === 'receiving') {
    uni.navigateTo({
      url: '/pages/order/order?status=receiving'
    });
  }
  else if (status === 'completed') {
    uni.navigateTo({
      url: '/pages/order/order?status=completed'
    });
  }
}

function onServiceClick(type: string) {
  const typeMap: Record<string, string> = {
    customer: '客服',
    address: '地址管理',
    cart: '购物袋',
  };
  uni.showToast({ title: `${typeMap[type]}（测试功能）`, icon: 'none' });
}

function onProductClick(p: Product) {
  uni.showToast({ title: `查看商品：${p.title}`, icon: 'none' });
}
</script>

<style lang="scss" scoped>
.mine {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  padding: 40rpx 30rpx 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo-box {
  width: 80rpx;
  height: 80rpx;
  background: #fff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.logo-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #ff6b35;
}

.brand-text {
  font-size: 32rpx;
  color: #fff;
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 24rpx;
}

.header-btn {
  font-size: 26rpx;
  color: #fff;
  padding: 10rpx 20rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20rpx;
}

.order-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.order-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.order-link {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.order-link-text {
  font-size: 26rpx;
  color: #999;
}

.order-link .icon {
  font-size: 24rpx;
  color: #999;
}

.order-icons {
  display: flex;
  justify-content: space-around;
}

.order-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.order-icon-wrap {
  width: 88rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b9d, #ff8c9d);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.order-icon-wrap .icon {
  font-size: 44rpx;
  color: #fff;
}

.order-icon-text {
  font-size: 24rpx;
  color: #666;
}

.order-badge {
  position: absolute;
  top: -4rpx;
  right: 8rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #ff3e6c;
  color: #fff;
  font-size: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.service-buttons {
  display: flex;
  margin: 20rpx;
  gap: 20rpx;
}

.service-btn {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.service-icon-wrap {
  width: 80rpx;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  position: relative;
}

.service-icon-wrap .icon {
  font-size: 40rpx;
  color: #666;
}

.service-badge {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: #ff3e6c;
  color: #fff;
  font-size: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6rpx;
}

.service-text {
  font-size: 26rpx;
  color: #333;
}

.recommend-section {
  margin-top: 40rpx;
  padding-bottom: 40rpx;
}

.recommend-header {
  display: flex;
  align-items: center;
  margin: 0 30rpx 30rpx;
}

.recommend-divider {
  flex: 1;
  height: 2rpx;
  background: #e5e5e5;
}

.recommend-title-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 24rpx;
}

.recommend-icon {
  font-size: 24rpx;
  color: #ff3e6c;
}

.recommend-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.recommend-products {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 0 20rpx;
}

.product-item {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.product-img {
  width: 100%;
  height: 320rpx;
  background: #f5f5f5;
}

.product-title {
  display: block;
  padding: 16rpx 16rpx 8rpx;
  font-size: 26rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 0 16rpx 16rpx;
}

.product-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff3e6c;
}

.product-original {
  font-size: 22rpx;
  color: #999;
  text-decoration: line-through;
}
</style>
