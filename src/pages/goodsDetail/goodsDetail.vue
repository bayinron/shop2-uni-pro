<template>
  <view class="goods-detail">
    <!-- 商品图片轮播 -->
    <view class="goods-images">
      <swiper class="swiper" :indicator-dots="true" :autoplay="false" :interval="3000" :duration="500">
        <swiper-item v-for="(img, idx) in goodsData.images" :key="idx">
          <image class="swiper-img" :src="img" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 价格和操作栏 -->
    <view class="price-bar">
      <view class="price-left">
        <text class="price-symbol">￥</text>
        <text class="price-value">{{ goodsData.price }}</text>
        <text class="price-original" v-if="goodsData.originalPrice">￥{{ goodsData.originalPrice }}</text>
      </view>
      <view class="price-center">
        <view class="points-btn" @click="onPointsClick">
          <text class="points-text">赠送 {{ goodsData.points || 0 }} 积分</text>
        </view>
      </view>
      <view class="price-right">
        <view class="favorite-icon-wrap" @click="toggleFavorite">
          <uni-icons :type="isFavorite ? 'star-filled' : 'star'" size="24" color="#fff" />
        </view>
      </view>
    </view>

    <!-- 商品标题 -->
    <view class="goods-title-section">
      <text class="goods-title">{{ goodsData.title }}</text>
    </view>

    <!-- 销售和浏览统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-label">销量：</text>
        <text class="stat-value">{{ goodsData.sales }}</text>
      </view>
      <view class="stat-item">
        <text class="stat-label">浏览量：</text>
        <text class="stat-value">{{ goodsData.views }}</text>
      </view>
    </view>

    <!-- 优惠券 -->
    <view class="coupon-section" @click="onCouponClick">
      <text class="coupon-label">优惠券</text>
      <view class="coupon-right">
        <text class="coupon-text">暂无优惠券</text>
        <uni-icons type="right" size="16" color="#999" />
      </view>
    </view>

    <!-- 购买类型选择 -->
    <view class="purchase-type-section" @click="onPurchaseTypeClick">
      <text class="purchase-type-label">购买类型</text>
      <view class="purchase-type-right">
        <text class="purchase-type-text">{{ selectedPurchaseType }}</text>
        <uni-icons type="right" size="16" color="#999" />
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <text class="detail-title">商品详情</text>
      <view class="detail-content">
        <image
          v-for="(img, idx) in goodsData.detailImages"
          :key="idx"
          class="detail-img"
          :src="img"
          mode="widthFix"
        />
        <text class="detail-text">{{ goodsData.detailText }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bottom-left">
        <view class="bottom-icon-item" @click="onCustomerService">
          <uni-icons type="chatbubble" size="24" color="#666" />
          <text class="bottom-icon-text">客服</text>
        </view>
        <view class="bottom-icon-item" @click="onCartClick">
          <uni-icons type="cart" size="24" color="#666" />
          <text class="bottom-icon-text">购物车</text>
          <text class="bottom-badge" v-if="cartCount > 0">{{ cartCount }}</text>
        </view>
      </view>
      <view class="bottom-right">
        <button class="add-cart-btn" @click="onAddToCart">加入购物车</button>
        <button class="buy-now-btn" @click="onBuyNow">立即购买</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

type GoodsData = {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  points?: number;
  sales: number;
  views: number;
  images: string[];
  detailImages: string[];
  detailText: string;
};

const goodsData = ref<GoodsData>({
  id: '395',
  title: 'BONOTIE 女士流线型短裤配袜子 2双装 2合1 女士跑步短裤 女士跑步短裤 网球短裤，白色，小号',
  price: '2066.55',
  originalPrice: '2999.00',
  points: 0,
  sales: 0,
  views: 1709,
  images: [
    '/static/img/clock.png',
    '/static/img/profit.png',
    '/static/img/money-bag.png',
  ],
  detailImages: [
    '/static/img/invitebg.png',
    '/static/img/clock.png',
  ],
  detailText: '商品详情：\n这是一款专为女性设计的运动短裤，采用高品质面料制作，舒适透气。包含2双配套袜子，适合跑步、网球等运动。\n\n特点：\n- 流线型设计，贴合身形\n- 透气快干面料\n- 配套袜子，方便搭配\n- 多色可选',
});

const isFavorite = ref(false);
const cartCount = ref(3);
const selectedPurchaseType = ref('普通购买');

onLoad((options: any) => {
  // 可以从 options 中获取商品ID等参数
  if (options.id) {
    // 这里可以根据ID加载商品数据（测试数据）
    console.log('商品ID:', options.id);
  }
});

function toggleFavorite() {
  isFavorite.value = !isFavorite.value;
  uni.showToast({
    title: isFavorite.value ? '已收藏' : '已取消收藏',
    icon: 'none',
  });
}

function onCartClick() {
  uni.showToast({ title: '跳转到购物车（测试功能）', icon: 'none' });
}

function onPointsClick() {
  uni.showToast({ title: '查看积分详情（测试功能）', icon: 'none' });
}

function onCouponClick() {
  uni.showToast({ title: '查看优惠券（测试功能）', icon: 'none' });
}

function onPurchaseTypeClick() {
  uni.showActionSheet({
    itemList: ['普通购买', '团购', '秒杀'],
    success: (res) => {
      const types = ['普通购买', '团购', '秒杀'];
      selectedPurchaseType.value = types[res.tapIndex];
    },
  });
}

function onCustomerService() {
  uni.showToast({ title: '联系客服（测试功能）', icon: 'none' });
}

function onAddToCart() {
  cartCount.value++;
  uni.showToast({ title: '已加入购物车', icon: 'success' });
}

function onBuyNow() {
  uni.showToast({ title: '跳转到立即购买（测试功能）', icon: 'none' });
}
</script>

<style lang="scss" scoped>
.goods-detail {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.goods-images {
  width: 100%;
  height: 750rpx;
  background: #fff;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-img {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

.price-bar {
  background: linear-gradient(135deg, #ff6b35, #ff8c42);
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-left {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  flex: 1;
}

.price-symbol {
  font-size: 32rpx;
  color: #fff;
  font-weight: 600;
}

.price-value {
  font-size: 48rpx;
  color: #fff;
  font-weight: 700;
}

.price-original {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: line-through;
  margin-left: 12rpx;
}

.price-center {
  flex: 0 0 auto;
  margin: 0 20rpx;
}

.points-btn {
  background: #ff3e6c;
  padding: 12rpx 24rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.points-text {
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

.price-right {
  flex: 0 0 auto;
}

.favorite-icon-wrap {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goods-title-section {
  background: #fff;
  padding: 30rpx;
  margin-top: 2rpx;
}

.goods-title {
  font-size: 32rpx;
  color: #333;
  line-height: 1.6;
  font-weight: 500;
}

.stats-section {
  background: #fff;
  padding: 24rpx 30rpx;
  margin-top: 2rpx;
  display: flex;
  gap: 40rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #666;
}

.stat-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.coupon-section {
  background: #fff;
  padding: 30rpx;
  margin-top: 2rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.coupon-label {
  font-size: 28rpx;
  color: #333;
}

.coupon-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.coupon-text {
  font-size: 26rpx;
  color: #999;
}

.purchase-type-section {
  background: #fff;
  padding: 30rpx;
  margin-top: 2rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.purchase-type-label {
  font-size: 28rpx;
  color: #333;
}

.purchase-type-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.purchase-type-text {
  font-size: 26rpx;
  color: #333;
}

.detail-section {
  background: #fff;
  margin-top: 20rpx;
  padding: 30rpx;
}

.detail-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 30rpx;
  display: block;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.detail-img {
  width: 100%;
  display: block;
}

.detail-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  white-space: pre-line;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.bottom-left {
  display: flex;
  gap: 40rpx;
}

.bottom-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  position: relative;
}

.bottom-icon-text {
  font-size: 22rpx;
  color: #666;
}

.bottom-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
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

.bottom-right {
  display: flex;
  gap: 20rpx;
}

.add-cart-btn {
  padding: 20rpx 40rpx;
  background: #fff5f5;
  color: #ff3e6c;
  font-size: 28rpx;
  border-radius: 50rpx;
  border: 2rpx solid #ff3e6c;
}

.buy-now-btn {
  padding: 20rpx 40rpx;
  background: #ff3e6c;
  color: #fff;
  font-size: 28rpx;
  border-radius: 50rpx;
  border: none;
}
</style>
