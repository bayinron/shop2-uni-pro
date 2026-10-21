<template>
  <view class="mine">
    <view class="topbar" >
      <view class="topbar-inner">
        <text class="topbar-title">{{ t('我的账户') }}</text>
        
      </view>
    </view>

    <!-- 橙色头部 -->
    <view class="header">
      <view class="header-body">
        <view class="user-block" @click="onAvatarClick">
          <view class="avatar-wrap">
            <image class="avatar" :src="avatarSrc" mode="widthFix" />
          </view>
          <view class="name-row">
            <text class="user-name">{{ displayAccount }}</text>
            <image
              v-if="isLoggedIn"
              class="edit-icon"
              src="/static/images/about_me/icon_edit.png"
              mode="aspectFit"
              @click.stop="onEditUserInfo"
            />
          </view>
          <view class="id-pill">
            <text class="id-pill-text">ID：{{ userInfo.id || '-' }}</text>
            <text
              v-if="userInfo.id"
              class="iconfont icon-fuzhi id-copy-icon"
              @click.stop="onCopyId"
            />
          </view>
        </view>

        <view class="header-actions">
          <view class="action-btn" @click="goCart">
            <image class="action-icon" src="/static/images/about_me/icon_settings.png" mode="aspectFit" />
          </view>
          <view class="action-btn" @click="onServiceClick">
            <image class="action-icon" src="/static/images/mine/OnlineSupport.png" mode="aspectFit" />
          </view>
          <view class="action-btn" @click="onSettings">
            <image class="action-icon" src="/static/images/about_me/icon_support_header.png" mode="aspectFit" />
          </view>
        </view>
      </view>
    </view>

    <!-- 我的订单 -->
    <view class="order-card">
      <text class="order-title">{{ t('我的订单') }}</text>
      <view class="order-grid">
        <view
          v-for="(item, idx) in orderMenus"
          :key="item.status"
          class="order-item"
          :class="{
            'order-item--right': idx % 2 === 1,
            'order-item--bottom': idx >= 2,
          }"
          @click="onOrderStatusClick(item.status)"
        >
          <image class="order-icon" :src="item.icon" mode="aspectFit" />
          <text class="order-label">{{ item.label }}</text>
        </view>
      </view>
      <view class="order-link" @click="onViewAllOrders">
        <text class="order-link-text">{{ t('查看购买历史') }}</text>
      </view>
    </view>

    <!-- 其他 -->
    <view class="others-card">
      <text class="others-title">{{ t('其他') }}</text>
      <view class="others-grid">
        <view class="others-item" @click="addressClick">
          <image class="others-icon" src="/static/images/mine/HomeAddress.png" mode="aspectFit" />
          <text class="others-text">{{ t('收货地址') }}</text>
        </view>
        <view class="others-item" @click="onServiceClick">
          <image class="others-icon" src="/static/images/mine/OnlineSupport.png" mode="aspectFit" />
          <text class="others-text">{{ t('联系我们') }}</text>
        </view>
        <view class="others-item" @click="onShopClick">
          <image class="others-icon" src="/static/images/mine/shop.png" mode="aspectFit" />
          <text class="others-text">{{ userInfo.user_role == 'merchant' ? t('我的店铺') : t('开店铺') }}</text>
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
  return '/static/images/logo2.png';
});

const orderMenus = computed(() => [
  {
    status: 'pending_payment',
    label: t('待付款'),
    icon: '/static/images/mine/CardPayment.png',
    badge: orderCounts.value.pending || 0,
  },
  {
    status: 'pending_shipment',
    label: t('待发货'),
    icon: '/static/images/mine/DeliveryTime.png',
    badge: 0,
  },
  {
    status: 'pending_receipt',
    label: t('待收货'),
    icon: '/static/images/mine/TimeMachine.png',
    badge: 0,
  },
  {
    status: 'completed',
    label: t('已完成'),
    icon: '/static/images/mine/Checkmark.png',
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

function onCopyId() {
  const id = userInfo.value.id;
  if (!id) return;
  uni.setClipboardData({
    data: String(id),
    showToast: false,
    success: () => {
      uni.showToast({ title: t('已复制到剪贴板'), icon: 'none' });
    },
  });
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
  uni.navigateTo({ url: '/pages/goodsDetail/goodsDetail?id=' + id + '&shop_id=' + p?.shop_id });
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
  background: #f0f0f0;
  padding-bottom: 40rpx;
}

/* ===== Topbar（与店铺页一致） ===== */
.topbar {
  background: #ee4d2d;
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

/* ===== Header ===== */
.header {
  background: url('/static/images/mine/top-bg.png') no-repeat center top;
  background-size: 100% 100%;
  padding: 12rpx 32rpx 48rpx;
  border-radius: 0 0 48rpx 48rpx;
  position: relative;
  overflow: hidden;
}

.header-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.avatar-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #fff;
  padding: 6rpx;
  box-sizing: border-box;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  width: 60%;
  height: auto;
  background: #fff;
}

.name-row {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  max-width: 480rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-icon {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.id-pill {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  background: #f5c542;
  border-radius: 28rpx;
  padding: 8rpx 24rpx;
}

.id-pill-text {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 600;
}

.id-copy-icon {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1;
}

.header-actions {
  margin-top: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 56rpx;
}

.action-btn {
  position: relative;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon {
  width: 48rpx;
  height: 48rpx;
}

/* ===== Orders ===== */
.order-card {
  margin: 24rpx 24rpx 0;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 20rpx 24rpx;
  overflow: hidden;
}

.order-title {
  display: block;
  text-align: center;
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
  margin-bottom: 8rpx;
}

.order-grid {
  display: flex;
  flex-wrap: wrap;
}

.order-item {
  width: 50%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28rpx 12rpx;
  border-bottom: 1rpx solid #f0f0f0;
  border-right: 1rpx solid #f0f0f0;
}

.order-item--right {
  border-right: none;
}

.order-item--bottom {
  border-bottom: none;
}

.order-icon {
  width: 56rpx;
  height: 56rpx;
  margin-bottom: 12rpx;
}

.order-label {
  font-size: 26rpx;
  color: #555;
  text-align: center;
}

.order-link {
  margin-top: 8rpx;
  display: flex;
  justify-content: center;
  padding: 8rpx 0 4rpx;
}

.order-link-text {
  font-size: 24rpx;
  color: #999;
  text-decoration: underline;
}

/* ===== Others ===== */
.others-card {
  margin: 24rpx 24rpx 0;
  background: #fff;
  border-radius: 24rpx;
  padding: 28rpx 20rpx 28rpx;
}

.others-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #222;
  display: block;
  text-align: center;
  margin-bottom: 24rpx;
}

.others-grid {
  display: flex;
  gap: 16rpx;
}

.others-item {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: 1rpx solid #eee;
  border-radius: 16rpx;
  padding: 24rpx 8rpx;
  background: #fff;
}

.others-icon {
  width: 56rpx;
  height: 56rpx;
  flex-shrink: 0;
}

.others-text {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
  text-align: center;
  line-height: 1.3;
}

.exit-btn {
  margin: 24rpx 24rpx 0;
  background: #fff;
  border-radius: 24rpx;
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
  padding: 0 28rpx 16rpx;
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
  padding: 0 20rpx;
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
