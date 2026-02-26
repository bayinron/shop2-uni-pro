<template>
  <view class="mine">
    <!-- 顶部橙色头部 -->
    <!-- 未登录样式 -->
    <view v-if="!isLoggedIn" class="header">
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

    <!-- 已登录样式 -->
    <view v-else class="header header--logged">
      <view class="header-logged-left">
        <view class="logo-box">
          <text class="logo-text">S</text>
        </view>
        <view class="header-user-info">
          <view class="header-user-row">
            <text class="header-user-account">{{ displayAccount }}</text>
            <uni-icons type="compose" size="18" color="#000" @click="onEditUserInfo"/>
          </view>
          <text class="header-user-balance">余额：{{ userBalance }}</text>
        </view>
      </view>
      <view class="header-logged-right">
        <button class="header-recharge-btn" @click="onRecharge">充值</button>
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
          <!-- <view class="order-icon-wrap">
            <text class="icon iconfont icon-qianbao"></text>
          </view> -->
          <image class="order-icon-img" src="/static/img/my_4.png" mode="aspectFill" />
          <text class="order-icon-text">待付款</text>
          <!-- <text class="order-badge" v-if="orderCounts.pending > 0">{{ orderCounts.pending }}</text> -->
        </view>
        <view class="order-icon-item" @click="onOrderStatusClick('processing')">
          <image class="order-icon-img" src="/static/img/my_5.png" mode="aspectFill" />

          <text class="order-icon-text">待发货</text>
          <!-- <text class="order-badge" v-if="orderCounts.shipping > 0">{{ orderCounts.shipping }}</text> -->
        </view>
        <view class="order-icon-item" @click="onOrderStatusClick('shipped')">
          <image class="order-icon-img" src="/static/img/my_6.png" mode="aspectFill" />

          <text class="order-icon-text">待收货</text>
          <!-- <text class="order-badge" v-if="orderCounts.receiving > 0">{{ orderCounts.receiving }}</text> -->
        </view>
        <view class="order-icon-item" @click="onOrderStatusClick('completed')">
          <image class="order-icon-img" src="/static/img/my_8.png" mode="aspectFill" />

          <text class="order-icon-text">已完成</text>
          <!-- <text class="order-badge" v-if="orderCounts.refund > 0">{{ orderCounts.refund }}</text> -->
        </view>
      </view>
    </view>

    <!-- 服务按钮 -->
    <view class="service-buttons">
      <view class="service-btn" @click="onServiceClick('customer')">
        <image class="service-icon-img" src="/static/img/kefu.png" mode="aspectFill" />

        <text class="service-text">客服</text>
      </view>
      <view class="service-btn" @click="addressClick">
        <image class="service-icon-img" src="/static/img/dizhi.png" mode="aspectFill" />
        <text class="service-text">地址</text>
      </view>
      <view v-if="userInfo.user_role == 'merchant'" class="service-btn" @click="goMyShop">
        <image class="service-icon-img" src="/static/img/car.png" mode="aspectFill" />
        <text class="service-text">我的店铺</text>
      </view>
      <view v-else class="service-btn" @click="goApply">
        <image class="service-icon-img" src="/static/img/car.png" mode="aspectFill" />
        <text class="service-text">申请成为商家</text>
      </view>
    </view>
    <view class="exit-btn" @click="onExit">
      <text class="exit-btn-text">退出登录</text>
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
        <view class="product-item" v-for="p in recommendProducts" :key="p.id" @click="onProductClick(p)">
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
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStoreHook } from '@/stores/modules/userStore';
import { type UserInfo } from '@/api/index';

type Product = {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  img: string;
};

const isLoggedIn = ref(false);
const userStore = useUserStoreHook();
const userInfo = computed(() => userStore.getUserInfo());
const displayAccount = computed(() => userInfo.value.phone || userInfo.value.username || '未登录');
const userBalance = computed(() => userInfo.value.balance ?? '0');

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

function onExit() {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
  uni.redirectTo({
    url: '/pages/login/login'
  });
}

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

function onRecharge() {
  uni.navigateTo({
    url: '/pages/wallet/recharge'
  });
}

function onEditUserInfo() {
  uni.navigateTo({
    url: '/pages/editUserInfo/editUserInfo'
  });
}

onShow(() => {
  isLoggedIn.value = !!uni.getStorageSync('token');
});

function onViewAllOrders() {
  uni.navigateTo({
    url: '/pages/order/order'
  });
}

function onOrderStatusClick(status: string) {
  uni.navigateTo({
    url: '/pages/order/order?status=' + status
  });

}
function addressClick() {
  uni.navigateTo({
    url: '/pages/address/list'
  });
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

function goMyShop() {
  uni.navigateTo({
    url: '/pages/shop/myShop',
  });
}

function goApply() {
  uni.navigateTo({
    url: '/pages/shop/apply',
  });
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

.header--logged {
  padding: 40rpx 30rpx 30rpx;
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

.header-logged-left {
  display: flex;
  align-items: center;
}

.header-user-info {
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-user-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.header-user-account {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.header-user-balance {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #fff;
}

.header-logged-right {
  display: flex;
  align-items: center;
}

.header-recharge-btn {
  padding: 18rpx 40rpx;
  border-radius: 40rpx;
  background: #ff3e6c;
  color: #fff;
  font-size: 28rpx;
  border: none;
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

  .order-icon-img {
    width: 78rpx;
    height: 78rpx;
  }
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
.exit-btn {
  margin: 20rpx;
  background: #b4b4b490;
  border-radius: 16rpx;
  padding: 20rpx 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  font-size: 28rpx;
  color: #333;
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

.service-icon-img {
  width: 78rpx;
  height: 78rpx;
  margin-bottom: 16rpx;
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
