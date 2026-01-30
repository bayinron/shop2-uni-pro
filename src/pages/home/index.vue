<template>
  <view class="home">
    <!-- 顶部搜索 -->
    <view class="topbar">
      <view class="search">
        <uni-icons type="search" size="18" color="#c7c7c7" />
        <input
          class="search-input"
          :placeholder="placeholderText"
          confirm-type="search"
          @confirm="onSearchConfirm"
        />
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
        <view
          v-for="item in quickEntries"
          :key="item.key"
          class="quick-item"
          @click="onQuickClick(item)"
        >
          <view class="quick-icon" :class="item.bgClass">
            <text class="icon iconfont" :class="item.icon" />
          </view>
          <text class="quick-text">{{ item.text }}</text>
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
        <text class="notice-text">{{ noticeText }}</text>
        <text class="notice-text notice-text--gap">{{ noticeText }}</text>
        </view>
      </view>
      <view class="notice-right">
        <image class="notice-badge" :src="badgeImg" mode="aspectFit" />
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="list-wrap">
      <view class="card" v-for="p in products" :key="p.id" @click="onProductClick(p)">
        <image class="card-img" :src="p.img" mode="aspectFill" />
        <view class="card-body">
          <text class="card-title breakcss">{{ p.title }}</text>
          <view class="card-row">
            <text class="price">฿ {{ p.price }}</text>
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

type QuickEntry = {
  key: string;
  text: string;
  icon: string; // iconfont class
  bgClass: string;
};

type Product = {
  id: string;
  title: string;
  price: string;
  img: string;
};

const placeholderText = '请输入产品名称';

// banner（接口拉取失败时用项目内资源兜底）
const banners = ref<any>();

const badgeImg = '/static/img/money-bag.png';

const quickEntries: QuickEntry[] = [
  { key: 'shop', text: '管理店铺', icon: 'icon-zijinmingxi', bgClass: 'bg-red' },
  { key: 'cs', text: '在线客服', icon: 'icon-vzaixiankefu', bgClass: 'bg-pink' },
  { key: 'help', text: '帮助', icon: 'icon-xitongtongzhi', bgClass: 'bg-cream' },
  { key: 'about', text: '关于我们', icon: 'icon-guanyuwomen', bgClass: 'bg-orange' },
];

const fallbackNoticeText = '公告：欢迎使用本平台，如有疑问请联系客服。';
const noticeText = ref(fallbackNoticeText);

const fallbackProducts: Product[] = [
  { id: 'p1', title: '推荐商品 1', price: '199', img: '/static/img/clock.png' },
  { id: 'p2', title: '推荐商品 2', price: '299', img: '/static/img/profit.png' },
  { id: 'p3', title: '推荐商品 3', price: '159', img: '/static/img/money-bag.png' },
  { id: 'p4', title: '推荐商品 4', price: '499', img: '/static/img/invitebg.png' },
];
const products = ref<Product[]>([...fallbackProducts]);

function pickData<T>(res: any): T | undefined {
  return (res?.data ?? res?.result ?? res?.rows) as T | undefined;
}

function asArray<T>(v: any): T[] {
  if (Array.isArray(v)) return v as T[];
  if (Array.isArray(v?.list)) return v.list as T[];
  if (Array.isArray(v?.rows)) return v.rows as T[];
  return [];
}

function bannerToUrl(b: LerpBannerItem): string | undefined {
  return (b.image || b.img || b.pic) as string | undefined;
}

function goodsToCard(g: LerpGoodsItem): Product | null {
  const id = String(g.id ?? '');
  if (!id) return null;
  const title = String(g.title ?? g.name ?? '').trim() || '商品';
  const price = String(g.price ?? g.originalPrice ?? '').trim() || '--';
  const img = String(g.cover ?? g.img ?? (Array.isArray(g.images) ? g.images[0] : '') ?? '').trim();
  return { id, title, price, img: img || '/static/img/empty.svg' };
}

async function loadHomeFromApi() {
  try {
    const [bannerRes, newsRes, goodsRes] = await Promise.all([
    getPublicAdList({ position: 'home_carousel' }),
      getArticleList(),
      getMallProductList(),
    ]);

    // banners

    banners.value =  bannerRes;

    // notice/news
    const newsList = asArray<LerpNewsItem>(pickData<any>(newsRes));
    const firstTitle = String(newsList?.[0]?.title ?? '').trim();
    noticeText.value = firstTitle ? `公告: ${firstTitle}` : fallbackNoticeText;

    // goods
    const goodsList = asArray<LerpGoodsItem>(pickData<any>(goodsRes));
    const mapped = goodsList.map(goodsToCard).filter(Boolean) as Product[];
    products.value = mapped.length ? mapped : fallbackProducts;
  } catch (e) {
   
  }
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
  uni.showToast({ title: `搜索：${value}`, icon: 'none' });
}

function onQuickClick(item: QuickEntry) {
  uni.showToast({ title: item.text, icon: 'none' });
}

function onProductClick(p: Product) {
  uni.showToast({ title: p.title, icon: 'none' });
}

onMounted(() => {
  startMarquee();
  loadHomeFromApi();
});
onUnmounted(() => stopMarquee());
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background: #d9dbff; /* 接近目标站点淡紫底 */
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

.bg-red .icon {
  color: #ff5a5f;
}
.bg-pink .icon {
  color: #ff4aa3;
}
.bg-cream .icon {
  color: #ffb02e;
}
.bg-orange .icon {
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
