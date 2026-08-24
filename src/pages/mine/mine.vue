<template>
  <view class="mine">
    <!-- 橙色头部 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-title">{{ t('我的账户') }}</view>

      <view class="header-body">
        <view class="user-row" @click="onAvatarClick">
          <image class="avatar" :src="avatarSrc" mode="aspectFill" />
          <view class="user-meta">
            <view class="name-row">
              <text class="user-name">{{ displayAccount }}</text>
              <image v-if="isLoggedIn" class="edit-icon" src="/static/images/about_me/icon_edit.png" mode="aspectFit"
                @click.stop="onEditUserInfo" />
            </view>
            <view class="level-row">
              <text class="level-label">{{ t('购物达人等级：') }}</text>
              <view class="level-pill">
                <text class="level-text">Classic</text>
                <!-- <text class="level-arrow">›</text> -->
              </view>
            </view>
          </view>
        </view>

        <view class="header-actions">
          <view class="action-btn" @click="onSettings">
            <image class="action-icon" src="/static/images/about_me/icon_support_header.png" mode="aspectFit" />
          </view>
          <view class="action-btn" @click="goCart">
            <image class="action-icon" src="/static/images/about_me/icon_settings.png" mode="aspectFit" />
            <!-- <view v-if="cartCount > 0" class="action-badge">{{ cartCount > 99 ? '99+' : cartCount }}</view> -->
          </view>
          <view class="action-btn" @click="onServiceClick">
            <image class="action-icon" src="/static/images/about_me/icon_cart_header.png" mode="aspectFit" />
          </view>
        </view>
      </view>

      <!-- VIP 横条 -->
      <view class="vip-bar">
        <view class="vip-badge">
          <image class="vip-crown" src="/static/images/about_me/icon_vip_or_deco.png" mode="aspectFit" />
          <text class="vip-badge-text">VIP</text>
        </view>
        <text class="vip-text">{{ t('开通 VIP 享专属权益') }}</text>
        <!-- <text class="vip-arrow">›</text> -->
      </view>
    </view>

    <!-- 新用户礼包 -->
    <!-- <view class="gift-card">
      <view class="gift-head">
        <text class="gift-title">新用户专属礼包</text>
        <view class="countdown">
          <text class="cd-box">{{ countdown.h }}</text>
          <text class="cd-sep">:</text>
          <text class="cd-box">{{ countdown.m }}</text>
          <text class="cd-sep">:</text>
          <text class="cd-box">{{ countdown.s }}</text>
        </view>
      </view>
      <view class="gift-coupons">
        <view class="coupon coupon--discount">
          <image class="coupon-icon" src="/static/images/about_me/icon_coupon_discount.png" mode="aspectFit" />
          <view class="coupon-dash" />
          <view class="coupon-info">
            <text class="coupon-main coupon-main--red">立减 50%</text>
            <text class="coupon-sub">满 ฿0 可用</text>
          </view>
        </view>
        <view class="coupon coupon--ship">
          <image class="coupon-icon" src="/static/images/about_me/icon_coupon_shipping.png" mode="aspectFit" />
          <view class="coupon-dash" />
          <view class="coupon-info">
            <text class="coupon-main coupon-main--teal">免运费券</text>
            <text class="coupon-sub">满 ฿0 可用</text>
          </view>
        </view>
      </view>
      <image class="gift-deco" src="/static/images/about_me/deco_gift_box.png" mode="aspectFit" />
    </view> -->

    <!-- 我的订单 -->
    <view class="order-card">
      <view class="order-header">
        <text class="order-title">{{ t('我的订单') }}</text>
        <view class="order-link" @click="onViewAllOrders">
          <text class="order-link-text">{{ t('查看购买历史') }}</text>
          <text class="order-link-arrow">›</text>
        </view>
      </view>
      <view v-for="(item, idx) in orderMenus" :key="item.status" class="order-row"
        :class="{ 'order-row--last': idx === orderMenus.length - 1 }" @click="onOrderStatusClick(item.status)">
        <image class="order-icon" :src="item.icon" mode="aspectFit" />
        <text class="order-label">{{ item.label }}</text>
        <!-- <view v-if="item.badge" class="order-badge">{{ item.badge }}</view> -->
        <text class="order-row-arrow">›</text>
      </view>
    </view>

    <!-- 其他 -->
    <view class="others-card">
      <text class="others-title">{{ t('其他') }}</text>
      <view class="others-grid">
        <view class="others-item" @click="onShopClick">
          <image class="others-icon" src="/static/images/about_me/icon_service_shop.png" mode="aspectFit" />
          <text class="others-text">{{ userInfo.user_role == 'merchant' ? t('我的店铺') : t('开店铺') }}</text>
        </view>
        <view class="others-item" @click="addressClick">
          <image class="others-icon" src="/static/images/about_me/icon_service_address.png" mode="aspectFit" />
          <text class="others-text">{{ t('收货地址') }}</text>
        </view>
        <view class="others-item" @click="onServiceClick">
          <image class="others-icon" src="/static/images/about_me/icon_service_contact.png" mode="aspectFit" />
          <text class="others-text">{{ t('联系我们') }}</text>
        </view>
      </view>
    </view>

    <view v-if="isLoggedIn" class="exit-btn" @click="onExit">
      <text class="exit-btn-text">{{ t('退出登录') }}</text>
    </view>

    <!-- 推荐商品 -->
    <view class="recommend-section">
      <view class="recommend-header">
        <image class="recommend-flame" src="/static/images/about_me/icon_section_flame.png" mode="aspectFit" />
        <text class="recommend-title">{{ t('推荐商品') }}</text>
      </view>
      <view class="recommend-grid">
        <view class="product-card" v-for="(p, idx) in recommendProducts" :key="p.id || idx" @click="onProductClick(p)">
          <view class="product-img-wrap">
            <image class="product-img" :src="productImage(p)" mode="aspectFill" />
            <image class="top-badge" src="/static/images/about_me/badge_top.png" mode="aspectFit" />
          </view>
          <text class="product-name">{{ productName(p) }}</text>
        </view>
      </view>
      <view v-if="!recommendProducts.length" class="empty">
        <text class="empty-text">{{ t('暂无推荐商品') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getMallCart, getMallProductList } from '@/api';
import { useUserStoreHook } from '@/stores/modules/userStore';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const isLoggedIn = ref(false);
const userStore = useUserStoreHook();
const userInfo = computed(() => userStore.userInfo);
const prefixUrl = computed(() => userStore.prefixUrl);
const statusBarHeight = ref(20);
const cartCount = ref(0);

const displayAccount = computed(() => {
  if (!isLoggedIn.value) return t('点击登录');
  return userInfo.value.nickname || userInfo.value.username || t('用户');
});

const avatarSrc = computed(() => {
  const av = userInfo.value.avatar;
  if (av) {
    return String(av).startsWith('http') || String(av).startsWith('/static')
      ? av
      : prefixUrl.value + av;
  }
  return '/static/images/about_me/avatar.png';
});

const orderMenus = computed(() => [
  {
    status: 'pending_payment',
    label: t('待付款'),
    icon: '/static/images/about_me/icon_order_pay.png',
    badge: orderCounts.value.pending || 0,
  },
  {
    status: 'pending_shipment',
    label: t('待发货'),
    icon: '/static/images/about_me/icon_order_toship.png',
    badge: 0,
  },
  {
    status: 'pending_receipt',
    label: t('待收货'),
    icon: '/static/images/about_me/icon_order_ship.png',
    badge: 0,
  },
  {
    status: 'completed',
    label: t('已完成'),
    icon: '/static/images/about_me/icon_order_completed.png',
    badge: 0,
  },
]);

const orderCounts = ref({
  pending: 2,
  shipping: 0,
  receiving: 0,
  refund: 0,
});

const recommendProducts = ref<any[]>([]);

const countdown = ref({ h: '06', m: '11', s: '47' });
let countdownLeft = 6 * 3600 + 11 * 60 + 47;
let countdownTimer: ReturnType<typeof setInterval> | null = null;

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function tickCountdown() {
  if (countdownLeft <= 0) countdownLeft = 6 * 3600 + 11 * 60 + 47;
  const h = Math.floor(countdownLeft / 3600);
  const m = Math.floor((countdownLeft % 3600) / 60);
  const s = countdownLeft % 60;
  countdown.value = { h: pad2(h), m: pad2(m), s: pad2(s) };
  countdownLeft -= 1;
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  tickCountdown();
  countdownTimer = setInterval(tickCountdown, 1000);
}

function productImage(p: any) {
  const url = p?.product?.images?.[0]?.url ?? p?.product?.cover_image ?? p?.cover_image ?? p?.img ?? '';
  if (!url) return '/static/images/about_me/product_a.png';
  return String(url).startsWith('http') || String(url).startsWith('/static')
    ? url
    : prefixUrl.value + url;
}

function productName(p: any) {
  return p?.product?.name ?? p?.name ?? p?.title ?? '';
}

function requestCartCount() {
  if (!isLoggedIn.value) {
    cartCount.value = 0;
    return;
  }
  getMallCart({ noLoading: true })
    .then((res: any) => {
      const data = res?.data || res;
      cartCount.value = data?.item_count ?? (data?.items || []).length ?? 0;
    })
    .catch(() => {
      cartCount.value = 0;
    });
}

function loadRecommend() {
  getMallProductList({ limit: 9 })
    .then((res: any) => {
      recommendProducts.value = res?.data?.list ?? res?.data?.data?.list ?? res?.data?.data ?? [];
      if (!recommendProducts.value.length) {
        recommendProducts.value = [
          { id: 'a', title: t('精选热卖商品 A'), img: '/static/images/about_me/product_a.png' },
          { id: 'b', title: t('精选热卖商品 B'), img: '/static/images/about_me/product_b.png' },
          { id: 'c', title: t('精选热卖商品 C'), img: '/static/images/about_me/product_a.png' },
        ];
      }
    })
    .catch(() => {
      recommendProducts.value = [
        { id: 'a', title: t('精选热卖商品 A'), img: '/static/images/about_me/product_a.png' },
        { id: 'b', title: t('精选热卖商品 B'), img: '/static/images/about_me/product_b.png' },
        { id: 'c', title: t('精选热卖商品 C'), img: '/static/images/about_me/product_a.png' },
      ];
    });
}

function onAvatarClick() {
  if (!isLoggedIn.value) {
    onLogin();
    return;
  }
  onEditUserInfo();
}

function onExit() {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
  isLoggedIn.value = false;
  uni.redirectTo({ url: '/pages/login/login' });
}

function onLogin() {
  uni.navigateTo({ url: '/pages/login/login' });
}

function onSettings() {
  if (!isLoggedIn.value) {
    onLogin();
    return;
  }
  uni.showActionSheet({
    itemList: [t('编辑资料'), t('充值'), t('退出登录')],
    success: (res) => {
      if (res.tapIndex === 0) onEditUserInfo();
      else if (res.tapIndex === 1) {
        // uni.navigateTo({ url: '/pages/wallet/recharge' });
        uni.navigateTo({
          url: '/pages/service/index?url=' + userStore.kefuConfig.external_url,
        });
      } else if (res.tapIndex === 2) onExit();
    },
  });
}

function onEditUserInfo() {
  if (!isLoggedIn.value) {
    onLogin();
    return;
  }
  uni.navigateTo({ url: '/pages/editUserInfo/editUserInfo' });
}

function onVipClick() {
  uni.showToast({ title: t('VIP 权益即将上线'), icon: 'none' });
}

function onViewAllOrders() {
  if (!isLoggedIn.value) {
    onLogin();
    return;
  }
  uni.navigateTo({ url: '/pages/order/order' });
}

function onOrderStatusClick(status: string) {
  if (!isLoggedIn.value) {
    onLogin();
    return;
  }
  uni.navigateTo({ url: '/pages/order/order?status=' + status });
}

function addressClick() {
  if (!isLoggedIn.value) {
    onLogin();
    return;
  }
  uni.navigateTo({ url: '/pages/address/list' });
}

function onServiceClick() {
  uni.navigateTo({
      url: '/pages/service/index?url=' + userStore.kefuConfig.external_url,
    });
}

function onShopClick() {
  if (!isLoggedIn.value) {
    onLogin();
    return;
  }
  if (userInfo.value.user_role == 'merchant') {
    uni.navigateTo({ url: '/pages/shop/myShop' });
  } else {
    uni.navigateTo({ url: '/pages/shop/apply' });
  }
}

function onProductClick(p: any) {
  const id = p?.product?.id ?? p?.product_id ?? p?.id;
  if (!id || String(id).length <= 1) {
    uni.showToast({ title: t('商品详情暂不可用'), icon: 'none' });
    return;
  }
  uni.navigateTo({ url: '/pages/goodsDetail/goodsDetail?id=' + id+'&shop_id='+p?.shop_id });
}

function goCart() {
  uni.switchTab({ url: '/pages/cart/cart' });
}

try {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight || 20;
} catch (_) {
  statusBarHeight.value = 20;
}

startCountdown();
loadRecommend();

onShow(() => {
  isLoggedIn.value = !!uni.getStorageSync('token');
  if (isLoggedIn.value) {
    userStore.reqUserInfo();
  }
  requestCartCount();
});

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>

<style lang="scss" scoped>
.mine {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 40rpx;
}

/* ===== Header ===== */
.header {
  background: linear-gradient(105deg, #e02d1f 0%, #ee4d2d 55%, #ff6a2a 100%);
  padding: 12rpx 24rpx 20rpx;
  position: relative;
}

.header-title {
  text-align: center;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  padding: 8rpx 0 20rpx;
}

.header-body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 24rpx;
}

.user-row {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.avatar {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  background: #fff;
  flex-shrink: 0;
}

.user-meta {
  margin-left: 20rpx;
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.user-name {
  font-size: 34rpx;
  font-weight: 700;
  color: #fff;
  max-width: 320rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.level-row {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.level-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.95);
}

.level-pill {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20rpx;
  padding: 2rpx 14rpx 2rpx 16rpx;
}

.level-text {
  font-size: 22rpx;
  color: #ee4d2d;
  font-weight: 600;
}

.level-arrow {
  font-size: 24rpx;
  color: #ee4d2d;
  margin-left: 2rpx;
  line-height: 1;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 4rpx;
  flex-shrink: 0;
}

.action-btn {
  position: relative;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  width: 44rpx;
  height: 44rpx;
}

.action-badge {
  position: absolute;
  top: -4rpx;
  right: -6rpx;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  background: #fff;
  color: #ee4d2d;
  font-size: 18rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* VIP */
.vip-bar {
  display: flex;
  align-items: center;
  background: #f7ecd8;
  border-radius: 12rpx;
  padding: 14rpx 16rpx;
  gap: 12rpx;
}

.vip-badge {
  position: relative;
  width: 64rpx;
  height: 40rpx;
  background: linear-gradient(135deg, #f0a020, #e07810);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vip-crown {
  position: absolute;
  top: -10rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 22rpx;
  height: 22rpx;
}

.vip-badge-text {
  font-size: 22rpx;
  font-weight: 800;
  color: #ffe9a8;
  letter-spacing: 1rpx;
}

.vip-text {
  flex: 1;
  font-size: 22rpx;
  color: #8a5a2b;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vip-arrow {
  color: #8a5a2b;
  font-size: 28rpx;
  flex-shrink: 0;
}

/* ===== Gift ===== */
.gift-card {
  margin: 20rpx 20rpx 0;
  background: #ffe8d6;
  border-radius: 16rpx;
  padding: 20rpx 20rpx 24rpx;
  position: relative;
  overflow: hidden;
  border: 1rpx solid #f5d5b8;
}

.gift-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding-right: 80rpx;
}

.gift-title {
  font-size: 26rpx;
  color: #a05a3c;
  font-weight: 600;
}

.countdown {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.cd-box {
  background: #1a1a1a;
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
  min-width: 40rpx;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  border-radius: 6rpx;
  padding: 0 6rpx;
}

.cd-sep {
  font-size: 22rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.gift-coupons {
  display: flex;
  gap: 12rpx;
}

.coupon {
  flex: 1;
  display: flex;
  align-items: center;
  border-radius: 12rpx;
  padding: 16rpx 12rpx;
  min-height: 110rpx;
  position: relative;
}

.coupon--discount {
  background: #fff8f5;
}

.coupon--ship {
  background: #f2fbf9;
}

.coupon-icon {
  width: 64rpx;
  height: 64rpx;
  flex-shrink: 0;
}

.coupon-dash {
  width: 0;
  height: 72rpx;
  border-left: 2rpx dashed #e0cfc0;
  margin: 0 12rpx;
  flex-shrink: 0;
}

.coupon--ship .coupon-dash {
  border-left-color: #c5ddd8;
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  min-width: 0;
}

.coupon-main {
  font-size: 26rpx;
  font-weight: 700;
  line-height: 1.2;
}

.coupon-main--red {
  color: #ee4d2d;
}

.coupon-main--teal {
  color: #26aa99;
}

.coupon-sub {
  font-size: 20rpx;
  color: #999;
}

.gift-deco {
  position: absolute;
  right: -4rpx;
  bottom: -8rpx;
  width: 100rpx;
  height: 100rpx;
  pointer-events: none;
}

/* ===== Orders ===== */
.order-card {
  margin: 20rpx 20rpx 0;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 28rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
}

.order-link {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.order-link-text {
  font-size: 24rpx;
  color: #999;
}

.order-link-arrow {
  font-size: 28rpx;
  color: #bbb;
  line-height: 1;
}

.order-row {
  display: flex;
  align-items: center;
  padding: 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-row--last {
  border-bottom: none;
}

.order-icon {
  width: 48rpx;
  height: 48rpx;
  flex-shrink: 0;
  margin-right: 20rpx;
}

.order-label {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.order-badge {
  min-width: 36rpx;
  height: 36rpx;
  padding: 0 10rpx;
  background: #ee4d2d;
  color: #fff;
  font-size: 22rpx;
  font-weight: 600;
  border-radius: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12rpx;
}

.order-row-arrow {
  font-size: 32rpx;
  color: #ccc;
  line-height: 1;
}

/* ===== Others ===== */
.others-card {
  margin: 20rpx 20rpx 0;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 20rpx 24rpx;
}

.others-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
  display: block;
  margin-bottom: 20rpx;
  padding-left: 8rpx;
}

.others-grid {
  display: flex;
  gap: 12rpx;
}

.others-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  border: 1rpx solid #eee;
  border-radius: 12rpx;
  padding: 22rpx 8rpx;
  background: #fff;
}

.others-icon {
  width: 66rpx;
  height: 66rpx;
  flex-shrink: 0;
}

.others-text {
  font-size: 24rpx;
  color: #e8664a;
  font-weight: 500;
  white-space: nowrap;
}

.exit-btn {
  margin: 20rpx 20rpx 0;
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.exit-btn-text {
  font-size: 28rpx;
  color: #666;
}

/* ===== Recommend ===== */
.recommend-section {
  margin-top: 28rpx;
  padding-bottom: 24rpx;
}

.recommend-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 0 24rpx 16rpx;
}

.recommend-flame {
  width: 40rpx;
  height: 40rpx;
}

.recommend-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #757575;
}

.recommend-grid {
  padding: 0 16rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.product-card {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
}

.product-img-wrap {
  position: relative;
  width: 100%;
  padding-top: 100%;
  background: #f5f5f5;
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

.product-name {
  display: block;
  padding: 12rpx 12rpx 16rpx;
  font-size: 22rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  padding: 40rpx;
  display: flex;
  justify-content: center;
}

.empty-text {
  font-size: 26rpx;
  color: #999;
}
</style>
