<template>
  <view class="sort-page">
    <!-- 顶部：Logo + 搜索 + 购物车 + 我的 -->
    <view class="topbar">
      <view class="topbar-inner">
        <view class="logo" @click="goHome">
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

    <view class="content">
      <!-- 左侧分类：深色侧栏 -->
      <scroll-view class="cate-left" scroll-y>
        <view
          v-for="c in visibleCategories"
          :key="c.id"
          :class="['cate-item', activeCateId === c.id ? 'cate-item--active' : '']"
          @click="onCateClick(c)"
        >
          <view v-if="activeCateId === c.id" class="cate-indicator" />
          <text class="cate-text">{{ c.name }}</text>
        </view>
        <view
          v-if="categories.length > sidebarLimit"
          class="cate-item cate-item--more"
          @click="toggleExpand"
        >
          <text class="cate-text">{{ sidebarExpanded ? t('收起') : t('更多...') }}</text>
          <text class="cate-more-arrow">{{ sidebarExpanded ? '˄' : '˅' }}</text>
        </view>
      </scroll-view>

      <!-- 右侧内容 -->
      <scroll-view class="cate-right" scroll-y>
        <view class="right-header">
          <text class="right-title">{{ t('商品类型：') }}{{ activeCateName }}</text>
        </view>

        <!-- 子分类网格 -->
        <!-- <view class="subcate-grid" v-if="subCategories.length">
          <view
            class="subcate-card"
            v-for="s in displaySubCategories"
            :key="s.id"
            @click="onSubCateClick(s)"
          >
            <image class="subcate-img" :src="cateImage(s)" mode="aspectFill" />
            <text class="subcate-name">{{ s.name }}</text>
            <text class="subcate-count">{{ t('商品数量：') }}{{ formatCount(s.product_count ?? s.productCount) }} {{ t('件') }}</text>
          </view>
          <view class="subcate-card subcate-card--more" @click="onViewAll">
            <uni-icons type="bottom" size="28" color="#9e9e9e" />
            <text class="subcate-more-text">{{ t('点击查看全部') }}</text>
          </view>
        </view> -->

       

        <view class="product-grid" v-if="currentProducts.length">
          <view
            class="product-card"
            v-for="(p, idx) in currentProducts"
            :key="p.id || idx"
            @click="onProductClick(p)"
          >
            <view class="product-img-wrap">
              <image class="product-img" :src="productImage(p)" mode="aspectFill" />
              <image class="top-badge" src="/static/images/badge_top.png" mode="aspectFit" />
            </view>
            <view class="product-body">
              <text class="product-title">{{ productName(p) }}</text>
              <text class="product-price">฿{{ formatPrice(productPrice(p)) }}</text>
              <view class="product-meta">
                <view class="rating">
                  <text class="star">★</text>
                  <text class="rating-num">{{ productRating(p) }}</text>
                </view>
                <text class="product-sales">{{ t('已售') }} {{ formatSold(productSold(p, idx)) }} {{ t('件') }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="empty" v-else>
          <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
          <text class="empty-text">{{ t('该分类下暂无商品') }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { getCategoryTree, getMallCart, getMallProductList } from '@/api';
import { useUserStore } from '@/stores/modules/userStore';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const userStore = useUserStore();
const prefixUrl = computed(() => userStore.prefixUrl);
const placeholderText = computed(() => t('搜索商品'));
const statusBarHeight = ref(20);
const cartCount = ref(0);

type Category = {
  id: number;
  name: string;
  children?: Category[];
  image?: string;
  icon?: string;
  cover_image?: string;
  image_url?: string;
  product_count?: number;
  productCount?: number;
  [key: string]: any;
};

const categories = ref<Category[]>([]);
const activeCateId = ref<number>(0);
const currentProducts = ref<any[]>([]);
const searchKeyword = ref('');
const sidebarLimit = 9;
const sidebarExpanded = ref(false);
const subExpanded = ref(false);
const subPreviewCount = 3;

const activeCate = computed(() => categories.value.find((c) => c.id === activeCateId.value));
const activeCateName = computed(() => activeCate.value?.name || '');
const subCategories = computed(() => activeCate.value?.children || []);

const visibleCategories = computed(() => {
  if (sidebarExpanded.value || categories.value.length <= sidebarLimit) {
    return categories.value;
  }
  return categories.value.slice(0, sidebarLimit);
});

const displaySubCategories = computed(() => {
  if (subExpanded.value || subCategories.value.length <= subPreviewCount) {
    return subCategories.value;
  }
  return subCategories.value.slice(0, subPreviewCount);
});

function cateImage(c: Category) {
  const url = c.image_url || c.cover_image || c.image || c.icon || '';
  if (!url) return '/static/images/about_me/product_a.png';
  if (String(url).startsWith('http') || String(url).startsWith('/static')) return url;
  return prefixUrl.value + url;
}

function productImage(p: any) {
  const url = p?.product?.images?.[0]?.url ?? p?.product?.cover_image ?? p?.cover_image ?? '';
  if (!url) return '/static/img/empty.svg';
  return String(url).startsWith('http') || String(url).startsWith('/static')
    ? url
    : prefixUrl.value + url;
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

function formatCount(n: any) {
  const num = Number(n);
  if (!num || Number.isNaN(num)) return '—';
  return formatSold(num);
}

function parseProductList(res: any): any[] {
  const data = res?.data?.data ?? res?.data ?? res ?? {};
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function loadProducts() {
  const params: any = {
    category_id: activeCateId.value,
    page: 1,
    limit: 50,
  };
  if (searchKeyword.value.trim()) params.keyword = searchKeyword.value.trim();

  getMallProductList(params).then((res: any) => {
    currentProducts.value = parseProductList(res);
  });
}

function onCateClick(c: Category) {
  activeCateId.value = c.id;
  searchKeyword.value = '';
  subExpanded.value = false;
  loadProducts();
}

// function onSubCateClick(s: Category) {
//   uni.navigateTo({
//     url: `/pages/goods/list?category_id=${s.id}&title=${encodeURIComponent(s.name || '')}`,
//   });
// }

// function onViewAll() {
//   if (subCategories.value.length > subPreviewCount && !subExpanded.value) {
//     subExpanded.value = true;
//     return;
//   }
//   uni.navigateTo({
//     url: `/pages/goods/list?category_id=${activeCateId.value}&title=${encodeURIComponent(activeCateName.value)}`,
//   });
// }

function toggleExpand() {
  sidebarExpanded.value = !sidebarExpanded.value;
}

function onSearchConfirm(e: any) {
  const value = (e?.detail?.value ?? '').trim();
  if (!value) return;
  searchKeyword.value = value;
  loadProducts();
}

function onProductClick(p: any) {
  const pid = p?.product?.id ?? p?.product_id ?? p?.id;
  uni.navigateTo({
    url: '/pages/goodsDetail/goodsDetail?id=' + pid+'&shop_id='+p?.shop_id,
  });
}

function goCart() {
  uni.switchTab({ url: '/pages/cart/cart' });
}

function goMine() {
  uni.switchTab({ url: '/pages/mine/mine' });
}

function goHome() {
  uni.switchTab({ url: '/pages/home/index' });
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

onLoad(() => {
  try {
    statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
  } catch (_) {
    statusBarHeight.value = 20;
  }
  getCategoryTree().then((res: any) => {
    const list = res?.data ?? [];
    categories.value = Array.isArray(list) ? list : [];
    if (categories.value.length > 0) {
      activeCateId.value = categories.value[0].id;
      onCateClick(categories.value[0]);
    }
  });
});

onShow(() => {
  requestCartCount();
});
</script>

<style scoped lang="scss">
.sort-page {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== 顶部栏 ===== */
.topbar {
  background: #ee4d2d;
  padding-bottom: 16rpx;
  padding-left: 20rpx;
  padding-right: 16rpx;
  padding-top: 20rpx;
  flex-shrink: 0;
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
}

/* ===== 主体双栏 ===== */
.content {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

.cate-left {
  width: 200rpx;
  background: #2b2b2b;
  flex-shrink: 0;
  height: 100%;
}

.cate-item {
  position: relative;
  min-height: 96rpx;
  padding: 24rpx 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cate-item--active {
  background: #f5f5f5;
}

.cate-indicator {
  position: absolute;
  left: 0;
  top: 24rpx;
  bottom: 24rpx;
  width: 6rpx;
  background: #ee4d2d;
  border-radius: 0 4rpx 4rpx 0;
}

.cate-text {
  font-size: 24rpx;
  color: #ffffff;
  text-align: center;
  line-height: 1.35;
}

.cate-item--active .cate-text {
  color: #ee4d2d;
  font-weight: 600;
}

.cate-item--more {
  flex-direction: column;
  gap: 4rpx;
}

.cate-more-arrow {
  font-size: 22rpx;
  color: #ffffff;
  line-height: 1;
}

.cate-right {
  flex: 1;
  background: #f5f5f5;
  height: 100%;
  padding: 16rpx 16rpx 32rpx;
  box-sizing: border-box;
}

.right-header {
  padding: 4rpx 4rpx 16rpx;
}

.right-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #555;
}

/* 子分类 */
.subcate-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.subcate-card {
  background: #ffffff;
  border-radius: 12rpx;
  padding: 16rpx 12rpx 18rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 220rpx;
}

.subcate-img {
  width: 140rpx;
  height: 120rpx;
  border-radius: 8rpx;
  background: #f0f0f0;
  margin-bottom: 12rpx;
}

.subcate-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  text-align: center;
  line-height: 1.3;
}

.subcate-count {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #999;
  text-align: center;
}

.subcate-card--more {
  justify-content: center;
  gap: 12rpx;
}

.subcate-more-text {
  font-size: 24rpx;
  color: #757575;
  text-align: center;
}

/* 推荐商品 */
.recommend-head {
  padding: 8rpx 4rpx 14rpx;
}

.recommend-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #757575;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
}

.product-card {
  background: #ffffff;
  border-radius: 12rpx;
  overflow: hidden;
}

.product-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f0f0f0;
}

.product-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.top-badge {
  position: absolute;
  top: 0;
  left: 8rpx;
  width: 40rpx;
  height: 54rpx;
  z-index: 1;
}

.product-body {
  padding: 12rpx 12rpx 16rpx;
}

.product-title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  font-size: 24rpx;
  color: #333;
  line-height: 1.35;
  min-height: 64rpx;
}

.product-price {
  display: block;
  margin-top: 8rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #ee4d2d;
}

.product-meta {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8rpx;
}

.rating {
  display: flex;
  align-items: center;
  gap: 2rpx;
}

.star {
  font-size: 20rpx;
  color: #ffb300;
}

.rating-num {
  font-size: 20rpx;
  color: #757575;
}

.product-sales {
  font-size: 20rpx;
  color: #999;
  flex-shrink: 0;
}

.empty {
  padding-top: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 26rpx;
}
</style>
