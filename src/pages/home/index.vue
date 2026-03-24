<template>
  <view class="home">
    <!-- 顶部搜索 -->
    <view class="topbar">
      <view class="search">
        <uni-icons type="search" size="18" color="#c7c7c7" />
        <input class="search-input" :placeholder="placeholderText" confirm-type="search" @confirm="onSearchConfirm" />
      </view>
    </view>

    <!-- Banner -->
    <view class="banner-wrap">
      <swiper class="banner" :indicator-dots="true" :autoplay="true" :interval="3500" :duration="300">
        <swiper-item v-for="(b, idx) in banners" :key="idx">
          <image class="banner-img" :src="b.image_url" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 宫格入口 -->
    <view class="quick-wrap">
      <view class="quick-grid">
        <view class="quick-item" @click="onQuickClick('shop')">
          <view class="quick-icon">
            <text class="icon iconfont icon-zijinmingxi" />
          </view>
          <text class="quick-text">{{ userInfo.user_role == 'merchant' ? '管理店铺' : '申请成为商家' }}</text>
        </view>
        <view class="quick-item" @click="onQuickClick('cs')">
          <view class="quick-icon">
            <text class="icon iconfont icon-vzaixiankefu" />
          </view>
          <text class="quick-text">在线客服</text>
        </view>
        <view class="quick-item" @click="onQuickClick('help')">
          <view class="quick-icon">
            <text class="icon iconfont icon-xitongtongzhi" />
          </view>
          <text class="quick-text">帮助</text>
        </view>
        <view class="quick-item" @click="onQuickClick('about')">
          <view class="quick-icon">
            <text class="icon iconfont icon-guanyuwomen" />
          </view>
          <text class="quick-text">关于我们</text>
        </view>
      </view>
    </view>

    <!-- 公告/跑马灯 -->
    <view class="notice-wrap">
      <view class="notice-left">
        <text class="icon iconfont icon-xitongtongzhi" />
      </view>
      <view class="notice-marquee">
        <view class="notice-marquee-inner" :style="marqueeStyle">
          <rich-text class="notice-text" :nodes="noticeText"></rich-text>
          <rich-text class="notice-text notice-text--gap" :nodes="noticeText"></rich-text>
        </view>
      </view>
      <view class="notice-right">
        <image class="notice-badge" :src="badgeImg" mode="aspectFit" />
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="list-wrap">
      <view class="card" v-for="p in products" :key="p.id" @click="onProductClick(p)">
        <image class="card-img" :src="p.product.cover_image" mode="aspectFill" />
        <view class="card-body">
          <text class="card-title breakcss">{{ p.product.name }}</text>
          <view class="card-row">
            <text class="price">￥ {{ p.product.sale_price }}</text>
            <view class="buy-btn">购买</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { getPublicAdList, getArticleList, getMallProductList } from '@/api';
import type { LerpBannerItem, LerpGoodsItem, LerpNewsItem } from '@/api/types';
import { useUserStore } from '@/stores/modules/userStore';
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
const placeholderText = '请输入产品名称';

// banner（接口拉取失败时用项目内资源兜底）
const banners = ref<any>();

const badgeImg = '/static/img/money-bag.png';

const fallbackNoticeText = '公告：欢迎使用本平台，如有疑问请联系客服。';
const noticeText = ref(fallbackNoticeText);


const products = ref<any[]>([]);


async function loadHomeFromApi() {
  getPublicAdList({ position: 'home_carousel' }).then((res: any) => {
    banners.value = res.data;
  });
  getArticleList().then((res: any) => {
    noticeText.value = res.data.data[0].content;
  });
  getMallProductList().then((res: any) => {
    products.value = res.data.data;
  });

}

const marqueeX = ref(0);
let marqueeTimer: number | null = null;

const marqueeStyle = computed(() => ({
  transform: `translateX(${marqueeX.value}px)`,
}));

function startMarquee() {
  // 简单循环滚动：每帧左移 1px，到 -宽度后回到 0
  // 这里不精准测宽度，按经验值滚动，保证 H5/小程序都能跑
  const minX = -420;
  marqueeTimer = setInterval(() => {
    marqueeX.value = marqueeX.value - 1;
    if (marqueeX.value <= minX) marqueeX.value = 0;
  }, 16) as unknown as number;
}

function stopMarquee() {
  if (marqueeTimer) clearInterval(marqueeTimer);
  marqueeTimer = null;
}

function onSearchConfirm(e: any) {
  const value = (e?.detail?.value ?? '').trim();
  if (!value) return;
  uni.navigateTo({
    url: `/pages/goods/list?keyword=${encodeURIComponent(value)}`,
  });
}

function onQuickClick(key: 'shop' | 'cs' | 'help' | 'about' | 'order') {
  if (key === 'shop') {
    if(userInfo.value.user_role == 'merchant') {
      uni.navigateTo({
        url: '/pages/shop/myShop',
      });
    } else {
      uni.navigateTo({
        url: '/pages/shop/apply',
      });
    }
  }else if (key === 'cs') {
    uni.navigateTo({
      url: '/pages/cs/cs',
    });
  }else if (key === 'help') {
    uni.navigateTo({
      url: '/pages/help/help',
    });
  }else if (key === 'about') {
    uni.navigateTo({
      url: '/pages/about/about',
    });
  }else if (key === 'order') {
    uni.navigateTo({
      url: '/pages/shop/myShopOrder',
    });
  }
}

function onProductClick(p: any) {
  uni.navigateTo({
    url: '/pages/goodsDetail/goodsDetail?id=' + p.product.id
  });
}

onLoad((options: any) => {
  startMarquee();
  loadHomeFromApi();
});
onUnmounted(() => stopMarquee());
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background: #d9dbff;
  /* 接近目标站点淡紫底 */
}

.topbar {
  padding: 18rpx 20rpx 16rpx;
  background: linear-gradient(90deg, #ff3e6c, #ff5a7d);
}

.search {
  height: 72rpx;
  border-radius: 36rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 22rpx;
}

.icon {
  font-size: 32rpx;
  color: #c7c7c7;
}

.search-input {
  margin-left: 14rpx;
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
  color: #333;
}

.banner-wrap {
  padding: 18rpx 20rpx 0;
}

.banner {
  height: 320rpx;
  border-radius: 18rpx;
  overflow: hidden;
  background: #fff;
}

.banner-img {
  width: 100%;
  height: 100%;
}

.quick-wrap {
  margin: 16rpx 20rpx 0;
  background: #eef0ff;
  border-radius: 18rpx;
  padding: 18rpx 12rpx;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quick-icon {
  width: 76rpx;
  height: 76rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 0 6rpx 14rpx rgba(0, 0, 0, 0.06);
}

.quick-icon .icon {
  font-size: 40rpx;
  color: #ff3e6c;
}

.quick-text {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #2c2c2c;
  text-align: center;
}

.quick-item:nth-child(1) .quick-icon .icon {
  color: #ff5a5f;
}

.quick-item:nth-child(2) .quick-icon .icon {
  color: #ff4aa3;
}

.quick-item:nth-child(3) .quick-icon .icon {
  color: #ffb02e;
}

.quick-item:nth-child(4) .quick-icon .icon {
  color: #ff7a2f;
}

.notice-wrap {
  margin: 14rpx 20rpx 0;
  background: #fff;
  border-radius: 12rpx;
  height: 84rpx;
  display: flex;
  align-items: center;
  padding: 0 14rpx;
}

.notice-left {
  width: 56rpx;
  display: flex;
  justify-content: center;
}

.notice-left .icon {
  color: #2c7bff;
  font-size: 34rpx;
}

.notice-marquee {
  flex: 1;
  overflow: hidden;
  height: 84rpx;
  display: flex;
  align-items: center;
}

.notice-marquee-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  will-change: transform;
}

.notice-text {
  font-size: 26rpx;
  color: #3a3a3a;
  white-space: nowrap;
}

.notice-text--gap {
  padding-left: 60rpx;
}

.notice-right {
  width: 64rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.notice-badge {
  width: 46rpx;
  height: 46rpx;
}

.list-wrap {
  padding: 18rpx 20rpx 28rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.card {
  background: #fff;
  border-radius: 18rpx;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 340rpx;
  background: #f6f6f6;
}

.card-body {
  padding: 14rpx 14rpx 16rpx;
}

.card-title {
  font-size: 26rpx;
  color: #2c2c2c;
}

.card-row {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff3e6c;
}

.buy-btn {
  background: #ff3e6c;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 18rpx;
  border-radius: 18rpx;
}
</style>
