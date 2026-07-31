<template>
  <view class="home">
    <!-- 顶部导航：Logo + 搜索 + 购物车 + 我的 -->
    <view class="topbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="topbar-inner">
        <view class="logo" @click="scrollTop">
          <image class="logo-img" src="/static/images/logo_bag.png" mode="aspectFit" />
        </view>
        <view class="search">
          <uni-icons type="search" size="16" color="#bdbdbd" />
          <input
            class="search-input"
            :placeholder="placeholderText"
            confirm-type="search"
            @confirm="onSearchConfirm"
          />
        </view>
        <view class="topbar-actions">
          <view class="action-btn" @click="goCart">
            <uni-icons type="cart-filled" size="22" color="#ffffff" />
            <view v-if="cartCount > 0" class="cart-badge">{{ cartCount > 99 ? '99+' : cartCount }}</view>
          </view>
          <view class="action-btn action-btn--mine" @click="goMine">
            <view class="mine-avatar">
              <uni-icons type="person" size="18" color="#ee4d2d" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Banner 轮播 -->
    <view class="banner-wrap">
      <swiper
        class="banner"
        :indicator-dots="false"
        :autoplay="true"
        :interval="3500"
        :duration="300"
        circular
        @change="onBannerChange"
      >
        <swiper-item v-for="(b, idx) in displayBanners" :key="idx">
          <image class="banner-img" :src="bannerSrc(b)" mode="aspectFill" />
        </swiper-item>
      </swiper>
      <view class="banner-dots">
        <view
          v-for="(_, idx) in displayBanners"
          :key="idx"
          class="banner-dot"
          :class="{ 'banner-dot--active': bannerCurrent === idx }"
        />
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-wrap">
      <view class="quick-grid">
        <view class="quick-item" @click="onQuickClick('shop')">
          <view class="quick-icon">
            <image src="/static/images/menu1.png" mode="aspectFill" class="quick-icon-img" />
          </view>
          <view class="quick-underline quick-underline--red" />
          <text class="quick-text">{{ userInfo.user_role == 'merchant' ? t('管理店铺') : t('申请商家') }}</text>
        </view>
        <view class="quick-item" @click="onQuickClick('cs')">
          <view class="quick-icon">
            <image src="/static/images/menu2.png" mode="aspectFill" class="quick-icon-img" />
          </view>
          <view class="quick-underline quick-underline--teal" />
          <text class="quick-text">{{ t('在线客服') }}</text>
        </view>
        <view class="quick-item" @click="onQuickClick('help')">
          <view class="quick-icon">
            <image src="/static/images/menu3.png" mode="aspectFill" class="quick-icon-img" />
          </view>
          <view class="quick-underline quick-underline--pink" />
          <text class="quick-text">{{ t('帮助信息') }}</text>
        </view>
        <view class="quick-item" @click="onQuickClick('about')">
          <view class="quick-icon">
            <image src="/static/images/menu4.png" mode="aspectFill" class="quick-icon-img" />
          </view>
          <view class="quick-underline quick-underline--blue" />
          <text class="quick-text">{{ t('关于我们') }}</text>
        </view>
      </view>
    </view>

    <!-- 促销横幅 -->
    <view class="promo-wrap" @click="onQuickClick('help')">
      <image class="promo-img" src="/static/images/bar.jpg" mode="widthFix" />
    </view>

    <!-- 本周热卖 -->
    <view class="section-head">
      <image class="section-icon" src="/static/images/fire.png" mode="aspectFit" />
      <text class="section-title">{{ t('本周热卖') }}</text>
    </view>

    <view class="list-wrap">
      <view class="card" v-for="(p, idx) in products" :key="p.id" @click="onProductClick(p)">
        <view class="card-img-wrap">
          <image class="card-img" :src="productImage(p)" mode="aspectFill" />
          <view class="top-badge">
            <text class="top-badge-text">TOP</text>
          </view>
        </view>
        <view class="card-body">
          <view class="card-title">{{ productName(p) }}</view>
          <text class="price">฿{{ formatPrice(productPrice(p)) }}</text>
          <view class="card-meta">
            <view class="rating">
              <text class="star">★</text>
              <text class="rating-num">{{ productRating(p) }}</text>
            </view>
            <text class="sold">{{ t('已售') }} {{ formatSold(productSold(p, idx)) }}</text>
          </view>
        </view>
      </view>
    </view>

    <view v-if="!products.length" class="empty">
      <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
      <text class="empty-text">{{ t('暂无商品') }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { getPublicAdList, getMallProductList, getMallCart } from '@/api';
import { useUserStore } from '@/stores/modules/userStore';
import { getLatestMerchantApplication, type MerchantApplicationInfo } from '@/api/myshop';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const userStore = useUserStore();
const userInfo = computed(() => userStore.userInfo);
const placeholderText = computed(() => t('搜索商品'));
const prefixUrl = computed(() => userStore.prefixUrl);
const statusBarHeight = ref(20);
const cartCount = ref(0);
const bannerCurrent = ref(0);

const fallbackBanners = [
  { image_url: '/static/images/index9.png', _local: true },
  { image_url: '/static/images/index10.png', _local: true },
  { image_url: '/static/img/invitebg.png', _local: true },
];

const banners = ref<any[]>([]);
const displayBanners = computed(() =>
  banners.value?.length ? banners.value : fallbackBanners
);

watch(
  () => userInfo.value.user_role,
  (newVal: string) => {
    if (newVal !== 'user') return;
    getLatestMerchantApplication()
      .then((res: any) => {
        const data = res.data as MerchantApplicationInfo;
        if (!data?.status) return;
        const cacheKey = 'merchant_apply_toast_status';
        const lastShown = uni.getStorageSync(cacheKey);
        if (lastShown === data.status) return;
        uni.setStorageSync(cacheKey, data.status);

        if (data.status === 'pending') {
          uni.showToast({ title: t('您的申请正在审核中，请耐心等待'), icon: 'none' });
        } else if (data.status === 'approved') {
          uni.showToast({ title: t('您的申请已通过，请重新登录后进入店铺管理'), icon: 'none' });
        } else if (data.status === 'rejected') {
          uni.showToast({ title: t('您的申请已拒绝，请重新申请'), icon: 'none' });
        } else if (data.status === 'processing') {
          uni.showToast({ title: t('您的申请正在处理中，请耐心等待'), icon: 'none' });
        }
      })
      .catch(() => {});
  },
  { immediate: true }
);

const products = ref<any[]>([]);

function bannerSrc(b: any) {
  if (!b?.image_url) return '/static/images/index9.png';
  if (b._local || String(b.image_url).startsWith('/static') || String(b.image_url).startsWith('http')) {
    return b.image_url;
  }
  return prefixUrl.value + b.image_url;
}

function onBannerChange(e: { detail: { current: number } }) {
  bannerCurrent.value = e.detail.current;
}

function productImage(p: any) {
  const url = p?.product?.images?.[0]?.url ?? p?.product?.cover_image ?? p?.cover_image ?? '';
  if (!url) return '/static/img/empty.svg';
  return String(url).startsWith('http') ? url : prefixUrl.value + url;
}

function productName(p: any) {
  return p?.product?.name ?? p?.name ?? '';
}

function productPrice(p: any) {
  return p?.product?.sale_price ?? p?.actual_price ?? p?.sale_price ?? 0;
}

function productSold(p: any, idx: number) {
  const sold = p?.display_sold_count ?? p?.product?.sold_count ?? p?.sold_count;
  if (sold != null && sold !== '') return Number(sold);
  // 无销量数据时用稳定占位，贴近截图效果
  return [2500, 1800, 980, 3200, 1500, 720][idx % 6];
}

function productRating(p: any) {
  const r = p?.rating ?? p?.product?.rating ?? p?.shop?.rating;
  if (r != null && r !== '') return Number(r).toFixed(1);
  return '5.0';
}

function formatPrice(price: any) {
  const n = Number(price);
  if (Number.isNaN(n)) return String(price ?? '0');
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

function formatSold(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + t('万');
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

function requestCartCount() {
  getMallCart({ noLoading: true })
    .then((res: any) => {
      const data = res?.data || res;
      cartCount.value = data?.item_count ?? (data?.items || []).length ?? 0;
    })
    .catch(() => {
      cartCount.value = 0;
    });
}

async function loadHomeFromApi() {
  getPublicAdList({ position: 'home_carousel' }).then((res: any) => {
    const list = res?.data ?? [];
    banners.value = Array.isArray(list) && list.length ? list : [];
  });
  getMallProductList().then((res: any) => {
    products.value = res?.data?.list ?? res?.data?.data?.list ?? res?.data?.data ?? [];
  });
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
    if (userInfo.value.user_role == 'merchant') {
      uni.navigateTo({ url: '/pages/shop/myShop' });
    } else {
      uni.navigateTo({ url: '/pages/shop/apply' });
    }
  } else if (key === 'cs') {
    uni.navigateTo({
      url: '/pages/service/index?url=' + userStore.kefuConfig.external_url,
    });
  } else if (key === 'help') {
    uni.navigateTo({ url: '/pages/content/page?slug=help' });
  } else if (key === 'about') {
    uni.navigateTo({ url: '/pages/content/page?slug=about' });
  } else if (key === 'order') {
    uni.navigateTo({ url: '/pages/shop/myShopOrder' });
  }
}

function onProductClick(p: any) {
  const id = p?.product?.id ?? p?.product_id ?? p?.id;
  uni.navigateTo({
    url: '/pages/goodsDetail/goodsDetail?id=' + id,
  });
}

function goCart() {
  uni.switchTab({ url: '/pages/cart/cart' });
}

function goMine() {
  uni.switchTab({ url: '/pages/mine/mine' });
}

function scrollTop() {
  uni.pageScrollTo({ scrollTop: 0, duration: 200 });
}

onLoad(() => {
  try {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 10;
  } catch (_) {
    statusBarHeight.value = 10;
  }
  loadHomeFromApi();
});

onShow(() => {
  requestCartCount();
});
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 24rpx;
}

/* ===== 顶部栏 ===== */
.topbar {
  background: #ee4d2d;
  padding-bottom: 16rpx;
  padding-left: 20rpx;
  padding-right: 16rpx;
}

.topbar-inner {
  display: flex;
  align-items: center;
  height: 72rpx;
  gap: 12rpx;
}

.logo {
  flex-shrink: 0;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img {
  width: 48rpx;
  height: 52rpx;
}

.search {
  flex: 1;
  height: 64rpx;
  border-radius: 32rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 22rpx;
  min-width: 0;
}

.search-input {
  margin-left: 10rpx;
  flex: 1;
  height: 64rpx;
  font-size: 26rpx;
  color: #333;
}

.topbar-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4rpx;
}

.action-btn {
  position: relative;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mine-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-badge {
  position: absolute;
  top: 2rpx;
  right: 0;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  background: #ffc107;
  color: #333;
  font-size: 18rpx;
  font-weight: 700;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  box-sizing: border-box;
}

/* ===== Banner ===== */
.banner-wrap {
  // background: #ee4d2d;
  padding: 0 0 12rpx;
}

.banner {
  height: 340rpx;
  background: #ee4d2d;
}

.banner-img {
  width: 100%;
  height: 100%;
}

.banner-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  margin-top: 10px;
}

.banner-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background:#b2b2b2;
}

.banner-dot--active {
  background: #757575;
}

/* ===== 快捷入口 ===== */
.quick-wrap {
  margin: 8rpx 20rpx 0;
  position: relative;
  z-index: 2;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx 12rpx 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8rpx;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quick-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 20rpx;
  overflow: hidden;
  background: #fff;
  border: 1rpx solid #eeeeee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quick-icon-img {
  width: 100%;
  height: 100%;
}

.quick-underline {
  margin-top: 8rpx;
  width: 40rpx;
  height: 6rpx;
  border-radius: 3rpx;
}

.quick-underline--red {
  background: #ee4d2d;
}

.quick-underline--teal {
  background: #26a69a;
}

.quick-underline--pink {
  background: #e91e63;
}

.quick-underline--blue {
  background: #1e88e5;
}

.quick-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #555555;
  text-align: center;
  line-height: 1.3;
}

/* ===== 促销条 ===== */
.promo-wrap {
  margin: 16rpx 20rpx 0;
  border-radius: 12rpx;
  overflow: hidden;
}

.promo-img {
  width: 100%;
  display: block;
}

/* ===== 分区标题 ===== */
.section-head {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx 12rpx;
  gap: 10rpx;
}

.section-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #757575;
}

/* ===== 商品三列网格 ===== */
.list-wrap {
  padding: 0 16rpx 28rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.card {
  background: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;
  border: 1rpx solid #eeeeee;
}

.card-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f6f6f6;
}

.card-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.top-badge {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background: #ee4d2d;
  padding: 4rpx 10rpx 8rpx;
  min-width: 52rpx;
  display: flex;
  justify-content: center;
  border-radius: 0 0 8rpx 0;
}

.top-badge::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8rpx;
  width: 0;
  height: 0;
  border-left: 26rpx solid #ee4d2d;
  border-right: 26rpx solid #ee4d2d;
  border-bottom: 8rpx solid transparent;
}

.top-badge-text {
  position: relative;
  z-index: 1;
  font-size: 16rpx;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 1rpx;
}

.card-body {
  padding: 10rpx 10rpx 14rpx;
}

.card-title {
  font-size: 22rpx;
  color: #222222;
  line-height: 1.35;
  height: 60rpx; // 固定两行高度
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  white-space: normal;
  word-break: break-all;
  text-overflow: ellipsis;
}

.price {
  display: block;
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #ee4d2d;
}

.card-meta {
  margin-top: 6rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rpx;
}

.rating {
  display: flex;
  align-items: center;
  gap: 2rpx;
  flex-shrink: 0;
}

.star {
  font-size: 18rpx;
  color: #ffc107;
  line-height: 1;
}

.rating-num {
  font-size: 18rpx;
  color: #757575;
}

.sold {
  font-size: 16rpx;
  color: #9e9e9e;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: right;
}

.empty {
  padding: 80rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-img {
  width: 160rpx;
  height: 160rpx;
  opacity: 0.5;
}

.empty-text {
  margin-top: 16rpx;
  font-size: 26rpx;
  color: #9e9e9e;
}
</style>
