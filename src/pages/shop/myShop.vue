<template>
  <view class="my-shop-page">
    <!-- 顶部：店铺资料 -->
    <view class="my-shop-header">
      <view class="my-shop-header-bg"></view>
      <view class="my-shop-header-main">
        <view class="my-shop-logo-box">
          <image
            v-if="shopLogo"
            class="my-shop-logo-img"
            :src="shopLogo"
            mode="aspectFill"
          />
          <text v-else class="my-shop-logo-text">{{ shopInitial }}</text>
        </view>
        <view class="my-shop-user-info">
          <view class="my-shop-id-row">
            <text class="my-shop-id-label">{{ t('ID：') }}</text>
            <text class="my-shop-id-value">{{ shopProfile?.id || '-' }}</text>
          </view>
          <view class="my-shop-name-row">
            <text class="my-shop-name">{{ shopName }}</text>
          </view>
          <view v-if="shopProfile?.rating" class="my-shop-rating-row">
            <text class="my-shop-rating">{{ t('评分') }} {{ shopProfile.rating }}</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view class="my-shop-content" scroll-y>
      <!-- 我的订单（卖家） -->
      <view class="my-shop-card my-shop-card--order">
        <view class="card-header">
          <text class="card-title">{{ t('我的订单') }}</text>
          <view class="card-link" @click="goAllOrders">
            <text class="card-link-text">{{ t('全部订单') }}</text>
            <uni-icons type="right" size="18" color="#999" />
          </view>
        </view>
        <view class="order-icons">
          <view class="order-icon-item" @click="goOrderByStatus('pending')">
            <image class="order-icon-img" src="/static/img/my_4.png" mode="aspectFill" />
            <text class="order-icon-text">{{ t('待付款') }}</text>
          </view>
          <view class="order-icon-item" @click="goOrderByStatus('paid')">
            <image class="order-icon-img" src="/static/img/my_5.png" mode="aspectFill" />
            <text class="order-icon-text">{{ t('待发货') }}</text>
          </view>
          <view class="order-icon-item" @click="goOrderByStatus('shipped')">
            <image class="order-icon-img" src="/static/img/my_6.png" mode="aspectFill" />
            <text class="order-icon-text">{{ t('待收货') }}</text>
          </view>
          <view class="order-icon-item" @click="goOrderByStatus('completed')">
            <image class="order-icon-img" src="/static/img/my_8.png" mode="aspectFill" />
            <text class="order-icon-text">{{ t('已完成') }}</text>
          </view>
        </view>
      </view>

      <!-- 结算钱包 -->
      <view class="my-shop-card my-shop-card--wallet">
        <view class="card-header">
          <text class="card-title">{{ t('我的钱包') }}</text>
          <view class="card-link" @click="goWallet">
            <text class="card-link-text">{{ t('进入钱包') }}</text>
            <uni-icons type="right" size="18" color="#999" />
          </view>
        </view>
        <view class="wallet-body">
          <view class="wallet-labels">
            <text class="wallet-label">{{ t('余额') }}</text>
          </view>
          <view class="wallet-amount">
            <text class="wallet-currency">{{ currencySymbol }}</text>
            <text class="wallet-value">{{ shopBalance }}</text>
          </view>
        </view>
      </view>

      <!-- 店铺封面 -->
      <view v-if="shopCover" class="banner-wrap">
        <image class="banner-img" :src="shopCover" mode="aspectFill" />
      </view>
      <view v-else class="banner-wrap">
        <image class="banner-img" src="/static/img/invitebg.png" mode="aspectFill" />
      </view>

      <!-- 必备工具 -->
      <view class="tools-card">
        <text class="tools-title">{{ t('必备工具') }}</text>
        <view class="tools-grid">
          <view class="tool-item" @click="onToolClick('invite')">
            <view class="tool-icon">
              <uni-icons type="email" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">{{ t('邀请好友') }}</text>
          </view>
          <view class="tool-item" @click="onToolClick('address')">
            <view class="tool-icon">
              <uni-icons type="location" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">{{ t('收货地址') }}</text>
          </view>
          <view class="tool-item" @click="onToolClick('order')">
            <view class="tool-icon">
              <uni-icons type="list" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">{{ t('订单管理') }}</text>
          </view>
          <view class="tool-item" @click="onToolClick('service')">
            <view class="tool-icon">
              <uni-icons type="chatbubble" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">{{ t('联系客服') }}</text>
          </view>
          <view class="tool-item" @click="onToolClick('wholesale')">
            <view class="tool-icon">
              <uni-icons type="shop" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">{{ t('批发中心') }}</text>
          </view>
          <view class="tool-item" @click="onToolClick('product')">
            <view class="tool-icon">
              <uni-icons type="gift" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">{{ t('商品管理') }}</text>
          </view>
          <view class="tool-item" @click="onToolClick('password')">
            <view class="tool-icon">
              <uni-icons type="locked" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">{{ userInfo.has_withdraw_password ? t('修改支付密码') : t('设置支付密码') }}</text>
          </view>
          <view class="tool-item" @click="onToolClick('logout')">
            <view class="tool-icon">
              <uni-icons type="loop" size="40" color="#ff6b9d" />
            </view>
            <text class="tool-text">{{ t('退出登录') }}</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { useUserStoreHook } from '@/stores/modules/userStore';
import {
  getMyShopFinancialSummary,
  getMyShopProfile,
  type MyShopFinancialSummary,
  type MyShopProfile,
} from '@/api/myshop';
import globalTool from '@/utils/globalTool';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const userStore = useUserStoreHook();
const userInfo = computed(() => userStore.userInfo);

const shopProfile = ref<MyShopProfile | null>(null);
const financial = ref<MyShopFinancialSummary | null>(null);

const shopName = computed(() => shopProfile.value?.name || t('我的店铺'));
const shopInitial = computed(() => {
  const name = shopProfile.value?.name?.trim();
  return name ? name.charAt(0).toUpperCase() : 'S';
});
const shopLogo = computed(() => globalTool.resolveMediaUrl(shopProfile.value?.logo || ''));
const shopCover = computed(() => globalTool.resolveMediaUrl(shopProfile.value?.cover_image || ''));

const currencySymbol = computed(
  () => userInfo.value.wallet?.balance_symbol || '฿',
);

const shopBalance = computed(() => {
  const balance = financial.value?.settlement_wallet?.balance;
  if (balance === undefined || balance === null) return '0.00';
  const n = Number(balance);
  return Number.isFinite(n) ? n.toFixed(2) : String(balance);
});

function unwrapData<T>(res: any): T {
  return (res?.data?.data ?? res?.data ?? res) as T;
}

async function loadShopProfile() {
  try {
    const res: any = await getMyShopProfile();
    shopProfile.value = unwrapData<MyShopProfile>(res);
  } catch (e: any) {
    shopProfile.value = null;
    const status = e?.statusCode ?? e?.data?.code;
    const message = e?.data?.message || '';
    // 尚未成为商户
    if (status === 403 || String(message).includes('尚未成为商户')) {
      globalTool.showModal(
        message || t('尚未成为商户，请先提交商户申请'),
        () => {
          uni.navigateTo({ url: '/pages/shop/apply' });
        },
        true,
      );
    }
  }
}

async function loadFinancial() {
  try {
    const res: any = await getMyShopFinancialSummary();
    financial.value = unwrapData<MyShopFinancialSummary>(res);
  } catch {
    financial.value = null;
  }
}

function refreshPage() {
  loadShopProfile();
  loadFinancial();
  userStore.reqUserInfo().catch(() => {});
}

onShow(() => {
  refreshPage();
});

function goAllOrders() {
  uni.navigateTo({
    url: '/pages/shop/myShopOrder',
  });
}

function goOrderByStatus(status: string) {
  uni.navigateTo({
    url: `/pages/shop/myShopOrder?status=${status}`,
  });
}

function goWallet() {
  uni.navigateTo({
    url: '/pages/wallet/wallet',
  });
}

function onToolClick(type: string) {
  if (type === 'invite') {
    uni.showToast({ title: t('邀请好友功能开发中'), icon: 'none' });
  } else if (type === 'address') {
    uni.navigateTo({
      url: '/pages/address/list',
    });
  } else if (type === 'product') {
    uni.navigateTo({
      url: '/pages/shop/productManage',
    });
  } else if (type === 'wholesale') {
    uni.navigateTo({
      url: '/pages/shop/wholesale',
    });
  } else if (type === 'password') {
    uni.navigateTo({
      url: `/pages/wallet/editPayPwd?first=${!userInfo.value.has_withdraw_password}`,
    });
  } else if (type === 'logout') {
    uni.removeStorageSync('token');
    uni.removeStorageSync('userInfo');
    uni.redirectTo({
      url: '/pages/login/login',
    });
  } else if (type === 'service') {
    if (!userStore.openKefu()) {
      uni.showToast({ title: t('联系客服'), icon: 'none' });
    }
  } else if (type === 'order') {
    uni.navigateTo({
      url: '/pages/shop/myShopOrder',
    });
  }
}
</script>

<style scoped lang="scss">
.my-shop-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.my-shop-header {
  position: relative;
  padding-bottom: 40rpx;
}

.my-shop-header-bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 260rpx;
  background: linear-gradient(180deg, #ff6b35, #ff8c42);
}

.my-shop-header-main {
  position: relative;
  padding: 80rpx 40rpx 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.my-shop-logo-box {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.my-shop-logo-img {
  width: 100%;
  height: 100%;
}

.my-shop-logo-text {
  font-size: 52rpx;
  font-weight: 700;
  color: #ff6b35;
}

.my-shop-user-info {
  margin-left: 28rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.my-shop-id-row {
  flex-direction: row;
  display: flex;
  align-items: center;
}

.my-shop-id-label {
  font-size: 26rpx;
  color: #ffe4c4;
}

.my-shop-id-value {
  font-size: 28rpx;
  color: #ffffff;
  margin-left: 6rpx;
}

.my-shop-name-row {
  margin-top: 10rpx;
  flex-direction: row;
  display: flex;
  align-items: center;
}

.my-shop-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  margin-right: 14rpx;
}

.my-shop-rating-row {
  margin-top: 8rpx;
}

.my-shop-rating {
  font-size: 24rpx;
  color: #ffe4c4;
}

.my-shop-content {
  flex: 1;
  margin-top: -30rpx;
  padding: 0 20rpx 24rpx;
}

.my-shop-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 26rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.my-shop-card--order {
  margin-top: 20rpx;
}

.my-shop-card--wallet {
  margin-top: 16rpx;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.card-link {
  display: flex;
  align-items: center;
}

.card-link-text {
  font-size: 26rpx;
  color: #999999;
  margin-right: 4rpx;
}

.order-icons {
  display: flex;
  justify-content: space-around;
}

.order-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.order-icon-img {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 12rpx;
}

.order-icon-text {
  font-size: 24rpx;
  color: #555555;
}

.wallet-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wallet-labels {
  display: flex;
  flex-direction: column;
}

.wallet-label {
  font-size: 26rpx;
  color: #666666;
}

.wallet-amount {
  display: flex;
  align-items: baseline;
}

.wallet-currency {
  font-size: 30rpx;
  color: #ff3e6c;
  margin-right: 4rpx;
}

.wallet-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #ff3e6c;
}

.banner-wrap {
  margin-top: 20rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 260rpx;
}

.tools-card {
  margin-top: 20rpx;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.tools-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 24rpx;
  display: block;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx 0;
}

.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tool-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.tool-text {
  font-size: 24rpx;
  color: #333333;
  text-align: center;
}
</style>
