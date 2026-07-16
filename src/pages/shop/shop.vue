<template>
  <view class="shop-page">
    <!-- 顶部标题栏 -->
    <view class="topbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="topbar-inner">
        <text class="topbar-title">全部店铺</text>
        <view class="topbar-action" @click="onSupport">
          <image class="topbar-icon" src="/static/images/store/icon_support_header.png" mode="aspectFit" />
        </view>
      </view>
    </view>

      <!-- 本月精选：整图 + 头像 + 昵称 -->
      <view class="featured" @click="onFeaturedClick">
        <image class="featured-bg" src="/static/images/store/hero_square_clean.png" mode="aspectFill" />
        <view class="featured-mask">
          <view class="featured-brand">
            <image class="featured-logo" src="/static/images/store/logo_shopee_header.png" mode="aspectFit" />
            <view class="featured-titles">
              <text class="featured-title">本月精选店铺</text>
              <text class="featured-sub">达成销售目标 · 准时发货</text>
            </view>
          </view>

          <view class="featured-avatar-wrap">
            <view class="featured-avatar-box">
              <!-- 庆祝插画：紧贴头像圆顶，约为头像宽度的一半 -->
              <image
                class="featured-celeb"
                src="/static/images/store/deco_celebration.png"
                mode="aspectFit"
              />
              <image class="featured-avatar" :src="featured.avatar" mode="aspectFill" />
            </view>
            <view class="featured-name-pill">
              <text class="featured-name">{{ featured.name }}</text>
            </view>
            <view class="featured-stats">
              <view class="stats-left">
                <view class="stats-num-row">
                  <text class="stats-num">{{ featured.orders }}</text>
                  <text class="stats-unit">订单</text>
                </view>
                <text class="stats-desc">成功发货的销售总额</text>
              </view>
              <view class="stats-right">
                <image class="stats-flame" src="/static/images/store/icon_bag_flame.png" mode="aspectFit" />
                <view class="stats-rating">
                  <text class="stats-star">★</text>
                  <text class="stats-score">{{ featured.rating }}</text>
                </view>
              </view>
            </view>
          </view>

        </view>
      </view>

      <!-- 精选店铺排行 -->
      <view class="rank-section">
        <view class="section-head">
          <view class="section-bar" />
          <text class="section-title">精选店铺排行</text>
        </view>

        <view
          v-for="(item, idx) in rankList"
          :key="item.id || idx"
          :class="['rank-card', `rank-card--${idx + 1}`]"
          @click="onShopClick(item)"
        >
          <view :class="['rank-side', `rank-side--${idx + 1}`]">
            <text class="rank-num">{{ idx + 1 }}</text>
          </view>
          <view class="rank-body">
            <image
              class="rank-avatar"
              :src="item.logo || fallbackAvatars[idx] || '/static/img/empty.svg'"
              mode="aspectFill"
            />
            <view class="rank-main">
              <text class="rank-name">{{ item.name }}</text>
              <text class="rank-sub">{{ item.description || item.tagline || '成功发货的销售总额' }}</text>
            </view>
            <view class="rank-meta">
              <view class="rank-orders-block">
                <text class="rank-orders-num">{{ formatOrders(item) || '0' }}</text>
                <text class="rank-orders-unit">订单</text>
              </view>
              <view class="rank-rating">
                <image class="rank-flame" src="/static/images/store/icon_bag_flame.png" mode="aspectFit" />
                <view class="rank-score-pill">
                  <text class="rank-star">★</text>
                  <text class="rank-score">{{ item.rating || '5.0' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 全部店铺 -->
      <view class="all-section">
        <view class="section-head">
          <view class="section-bar" />
          <text class="section-title">全部店铺</text>
        </view>

        <view class="search-wrap">
          <view class="search-box">
            <image class="search-icon" src="/static/images/store/icon_search.png" mode="aspectFit" />
            <input
              class="search-input"
              :placeholder="placeholderText"
              confirm-type="search"
              v-model="keyword"
              @confirm="onSearchConfirm"
            />
          </view>
        </view>

        <!-- 分类条（保留原有能力） -->
        <scroll-view v-if="categories.length" class="nav-wrap" scroll-x>
          <view class="nav-inner">
            <view
              v-for="c in categories"
              :key="c.id"
              :class="['nav-item', activeCateId === c.id ? 'nav-item--active' : '']"
              @click="onCateClick(c)"
            >
              <text class="nav-text">{{ c.name || c.slug }}</text>
            </view>
          </view>
        </scroll-view>

        <view class="shop-grid">
          <view
            v-for="(s, idx) in shops"
            :key="s.id"
            class="shop-tile"
            @click="onShopClick(s)"
          >
            <view class="tile-img-wrap">
              <image class="tile-img" :src="s.logo || brandFallbacks[idx % brandFallbacks.length]" mode="aspectFill" />
              <image v-if="idx < 3" class="tile-badge" src="/static/images/store/badge_top.png" mode="widthFix" />
            </view>
            <text class="tile-name">{{ s.name }}</text>
          </view>
        </view>

        <view v-if="loading" class="loading-more">
          <text class="loading-text">加载中...</text>
        </view>
        <view v-if="!hasMore && shops.length > 0" class="no-more">
          <text class="no-more-text">没有更多了</text>
        </view>
        <view v-if="!shops.length && !loading" class="empty">
          <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
          <text class="empty-text">暂无符合条件的店铺</text>
        </view>
      </view>

      <view class="bottom-space" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { getShopCategories, getShopCategoryShops } from '@/api';

type Category = {
  id: number;
  name?: string;
  slug?: string;
};

type ShopItem = {
  id: number;
  name: string;
  logo?: string | null;
  tagline?: string;
  description?: string | null;
  categoryId?: number;
  rating?: string | number;
  order_count?: number;
  orders?: number;
};

const placeholderText = '搜索店铺';
const statusBarHeight = ref(20);
const scrollHeight = ref('100vh');

const categories = ref<Category[]>([]);
const shops = ref<ShopItem[]>([]);
const activeCateId = ref<number>(1);
const keyword = ref('');

const page = ref(1);
const limit = ref(15);
const hasMore = ref(true);
const loading = ref(false);

const fallbackAvatars = [
  '/static/images/store/avatar_win.png',
  '/static/images/store/avatar_pimrypie.png',
  '/static/images/store/avatar_jenny.png',
];

const brandFallbacks = [
  '/static/images/store/brand_xiaomi.png',
  '/static/images/store/brand_hitachi.png',
  '/static/images/store/brand_toshiba.png',
];

const featured = computed(() => {
  const s = shops.value[0];
  return {
    id: s?.id,
    name: s?.name || 'Win William',
    avatar: s?.logo || '/static/images/store/avatar_win.png',
    orders: formatOrders(s) || '4,969',
    rating: s?.rating || '5.0',
  };
});

const rankList = computed(() => {
  const list = shops.value.slice(0, 3);
  if (list.length >= 3) return list;
  // 不足时用占位补齐展示结构
  const placeholders: ShopItem[] = [
    { id: -1, name: 'Win William', logo: fallbackAvatars[0], description: '本月精选店主', rating: '5.0', order_count: 4969 },
    { id: -2, name: 'Pimrypie', logo: fallbackAvatars[1], description: '人气店铺', rating: '5.0', order_count: 3200 },
    { id: -3, name: 'Jenny Ratchanok', logo: fallbackAvatars[2], description: '优质商家', rating: '5.0', order_count: 2100 },
  ];
  return [...list, ...placeholders.slice(list.length)].slice(0, 3);
});

function formatOrders(s?: ShopItem | null) {
  if (!s) return '';
  const n = s.order_count ?? s.orders;
  if (n == null) return '';
  return Number(n).toLocaleString();
}

async function loadShops(reset = false) {
  if (loading.value) return;
  if (!hasMore.value && !reset) return;

  if (reset) {
    page.value = 1;
    hasMore.value = true;
    shops.value = [];
  }

  loading.value = true;
  try {
    const res: any = await getShopCategoryShops({
      category_id: activeCateId.value,
      keyword: keyword.value.trim(),
      page: page.value,
      limit: limit.value,
    });

    const data = res?.data?.data ?? res?.data ?? [];
    const newShops = Array.isArray(data) ? data : (data.list || data.items || []);

    shops.value = reset ? newShops : [...shops.value, ...newShops];
    hasMore.value = newShops.length >= limit.value;
    if (hasMore.value) page.value += 1;
  } catch (e) {
    console.error('加载店铺列表失败', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function onCateClick(c: Category) {
  activeCateId.value = c.id;
  keyword.value = '';
  loadShops(true);
}

function onSearchConfirm(e: any) {
  keyword.value = (e?.detail?.value ?? keyword.value ?? '').trim();
  loadShops(true);
}

function onReachBottomLoad() {
  if (!loading.value && hasMore.value) loadShops(false);
}

function onShopClick(s: ShopItem) {
  if (!s?.id || s.id < 0) return;
  uni.navigateTo({ url: `/pages/shop/home?id=${s.id}` });
}

function onFeaturedClick() {
  if (featured.value.id) onShopClick({ id: featured.value.id, name: featured.value.name });
}

function onSupport() {
  uni.showToast({ title: '客服功能开发中', icon: 'none' });
}

onReachBottom(() => onReachBottomLoad());

onLoad(async () => {
  try {
    const sys = uni.getSystemInfoSync();
    statusBarHeight.value = sys.statusBarHeight || 20;
    const winH = sys.windowHeight || 667;
    scrollHeight.value = `${winH - statusBarHeight.value - 44}px`;
  } catch (_) {
    statusBarHeight.value = 20;
  }

  try {
    const res: any = await getShopCategories();
    categories.value = res?.data || res || [];
    if (categories.value.length > 0) {
      activeCateId.value = categories.value[0].id;
    }
    await loadShops(true);
  } catch (e) {
    console.error('加载分类失败', e);
  }
});
</script>

<style scoped lang="scss">
$orange: #ee4d2d;
$orange-deep: #d73211;

.shop-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.topbar {
  background: $orange;
  flex-shrink: 0;
}

.topbar-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 24rpx;
}

.topbar-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #fff;
}

.topbar-action {
  position: absolute;
  right: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar-icon {
  width: 44rpx;
  height: 44rpx;
}

.page-scroll {
  flex: 1;
  background: #f5f5f5;
}

/* ===== 本月精选 ===== */
.featured {
  position: relative;
  width: 100%;
  // aspect-ratio: 1 / 1;
  height: 650rpx;
  overflow: hidden;
  background: $orange;
}

.featured-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.featured-mask {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24rpx 28rpx 36rpx;
  box-sizing: border-box;
}

.featured-brand {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.featured-logo {
  width: 200rpx;
  height: 64rpx;
  flex-shrink: 0;
}

.featured-titles {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 4rpx;
}

.featured-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}

.featured-sub {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.3;
}

.featured-avatar-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
}

.featured-avatar-box {
  position: relative;
  width: 220rpx;
  height: 220rpx;
}

/* PDF 中庆祝图约头像宽度的 47%，紧贴圆顶 */
.featured-celeb {
  position: absolute;
  left: 50%;
  top: -82rpx;
  width: 104rpx;
  height: 84rpx;
  transform: translateX(-50%);
  z-index: 2;
  pointer-events: none;
}

.featured-avatar {
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  border: 8rpx solid #fff;
  background: #fff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.18);
  position: relative;
  z-index: 1;
}

.featured-name-pill {
  margin-top: -40rpx;
  padding: 10rpx 36rpx;
  border-radius: 999rpx;
  background: #26aa99;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
  z-index:2;
}

.featured-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #fff;
}

.featured-stats {
  margin-top: 0rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 0rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  justify-content: space-between;
}

.stats-left {
  display: flex;
  flex-direction: column;
}

.stats-num-row {
  display: flex;
  align-items: baseline;
  gap: 10rpx;
}

.stats-num {
  font-size: 48rpx;
  font-weight: 800;
  color: $orange;
  line-height: 1;
}

.stats-unit {
  font-size: 24rpx;
  color: #666;
}

.stats-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
}

.stats-right {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stats-flame {
  width: 72rpx;
  height: 72rpx;
}

.stats-rating {
  margin-top: 0rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.stats-star {
  font-size: 22rpx;
  color: #f5a623;
}

.stats-score {
  font-size: 24rpx;
  font-weight: 700;
  color: #333;
}

/* ===== 排行 ===== */
.rank-section {
  margin-top: 20rpx;
  background: #f5f5f5;
  padding: 24rpx 24rpx 8rpx;
}

.all-section {
  margin-top: 8rpx;
  background: #fff;
  padding: 24rpx 24rpx 8rpx;
}

.section-head {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-bar {
  width: 8rpx;
  height: 32rpx;
  border-radius: 4rpx;
  background: $orange;
  margin-right: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
}

.rank-card {
  display: flex;
  align-items: stretch;
  margin-bottom: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

  &:last-child {
    margin-bottom: 12rpx;
  }
}

.rank-side {
  width: 88rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rank-side--1 {
  background: linear-gradient(180deg, #f6d365 0%, #e8a017 100%);
}

.rank-side--2 {
  background: linear-gradient(180deg, #ffe566 0%, #f0b429 100%);
}

.rank-side--3 {
  background: linear-gradient(180deg, #8a8a8a 0%, #5c5c5c 100%);
}

.rank-num {
  font-size: 48rpx;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.rank-body {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  padding: 20rpx 18rpx 20rpx 16rpx;
  background: #fff;
  border-style: solid;
  border-width: 2rpx 2rpx 2rpx 0;
  border-radius: 0 16rpx 16rpx 0;
}

.rank-card--1 .rank-body {
  border-color: #e8a017;
}

.rank-card--2 .rank-body {
  border-color: #f0b429;
}

.rank-card--3 .rank-body {
  border-color: #6a6a6a;
}

.rank-avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: #f5f5f5;
  margin-right: 14rpx;
  flex-shrink: 0;
}

.rank-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.rank-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-sub {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #999;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.rank-meta {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  margin-left: 8rpx;
  gap: 10rpx;
}

.rank-orders-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.rank-orders-num {
  font-size: 42rpx;
  font-weight: bold;
  color: $orange;
  line-height: 1.1;
}

.rank-orders-unit {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #333;
}

.rank-rating {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rank-flame {
  width: 52rpx;
  height: 52rpx;
}

.rank-score-pill {
  margin-top: 2rpx;
  display: flex;
  align-items: center;
  gap: 2rpx;
  padding: 2rpx 8rpx;
  border-radius: 999rpx;
  background: #fff3c4;
}

.rank-star {
  font-size: 16rpx;
  color: #f5a623;
}

.rank-score {
  font-size: 18rpx;
  font-weight: 700;
  color: #333;
}

/* ===== 搜索 + 网格 ===== */
.search-wrap {
  margin-bottom: 16rpx;
}

.search-box {
  height: 72rpx;
  border-radius: 36rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}

.search-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.search-input {
  margin-left: 12rpx;
  flex: 1;
  height: 72rpx;
  font-size: 26rpx;
  color: #333;
}

.nav-wrap {
  margin-bottom: 12rpx;
  white-space: nowrap;
}

.nav-inner {
  display: inline-flex;
  align-items: center;
  padding-bottom: 4rpx;
}

.nav-item {
  margin-right: 28rpx;
  padding-bottom: 8rpx;
}

.nav-text {
  font-size: 26rpx;
  color: #666;
}

.nav-item--active .nav-text {
  color: $orange;
  font-weight: 700;
  border-bottom: 4rpx solid $orange;
  padding-bottom: 4rpx;
}

.shop-grid {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -8rpx;
}

.shop-tile {
  width: 33.333%;
  padding: 8rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tile-img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f7f7f7;
  border: 1rpx solid #eee;
}

.tile-img {
  width: 100%;
  height: 100%;
}

.tile-badge {
  position: absolute;
  left: 0;
  top: 0;
  width: 56rpx;
  z-index: 1;
}

.tile-name {
  margin-top: 10rpx;
  margin-bottom: 8rpx;
  font-size: 24rpx;
  color: #333;
  text-align: center;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4rpx;
  box-sizing: border-box;
}

.empty {
  margin-top: 60rpx;
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

.loading-more,
.no-more {
  padding: 28rpx 0;
  text-align: center;
}

.loading-text,
.no-more-text {
  font-size: 24rpx;
  color: #ccc;
}

.bottom-space {
  height: 40rpx;
}
</style>
