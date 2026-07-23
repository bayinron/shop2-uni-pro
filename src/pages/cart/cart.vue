<template>
  <view class="cart-page">
    <!-- 顶部栏 -->
    <view class="header">
      <view class="header-inner">
        <view class="header-side" />
        <text class="header-title">{{ t('购物车') }} ({{ totalItemCount }})</text>
        <view class="header-side header-side--right" @click="onDeleteSelected">
          <uni-icons type="trash" size="22" color="#ffffff" />
        </view>
      </view>
    </view>

    <!-- 状态切换 -->
    <view class="tabs-wrap">
      <view class="tabs">
        <view
          :class="['tab', activeTab === 'cart' ? 'tab--active' : '']"
          @click="activeTab = 'cart'"
        >
          <text class="tab-text">{{ t('待付款') }}</text>
        </view>
        <view
          :class="['tab', activeTab === 'ship' ? 'tab--active' : '']"
          @click="onShipTab"
        >
          <text class="tab-text">{{ t('待发货') }}</text>
        </view>
      </view>
    </view>

    <scroll-view class="cart-scroll" scroll-y>
      <!-- 空状态 -->
      <view v-if="!allItems.length" class="empty-cart">
        <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
        <text class="empty-text">{{ t('购物车是空的') }}</text>
        <view class="empty-btn" @click="goHome">{{ t('去逛逛') }}</view>
      </view>

      <template v-else>
        <view class="section-head">
          <view class="section-bar" />
          <text class="section-title">{{ t('购物车商品') }}</text>
        </view>

        <view
          v-for="shop in shops"
          :key="shop.id"
          class="shop-block"
        >
          <view
            v-for="item in shop.items"
            :key="item.id"
            class="cart-card"
          >
            <view class="check-box" @click="toggleItem(shop, item)">
              <view :class="['check', item.checked ? 'check--on' : '']">
                <text v-if="item.checked" class="check-mark">✓</text>
              </view>
            </view>

            <image class="item-img" :src="itemImage(item)" mode="aspectFill" />

            <view class="item-info">
              <text class="item-title">{{ item.title }}</text>
              <view class="item-bottom">
                <text class="item-price">฿{{ formatPrice(item.price) }}</text>
                <view class="qty-pill">
                  <text class="qty-btn" @click="decreaseQty(shop, item)">−</text>
                  <text class="qty-num">{{ item.qty }}</text>
                  <text class="qty-btn" @click="increaseQty(shop, item)">+</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </template>
    </scroll-view>

    <!-- 底部结算栏 -->
    <view v-if="allItems.length" class="cart-footer" :style="{ paddingBottom: safeBottom + 'px' }">
      <view class="footer-row">
        <view class="select-all" @click="toggleSelectAll">
          <view :class="['check', allChecked ? 'check--on' : '']">
            <text v-if="allChecked" class="check-mark">✓</text>
          </view>
          <text class="select-text">{{ t('全选') }} {{ checkedCount }}/{{ totalItemCount }}</text>
        </view>
        <text class="discount-link" @click="onDiscountTip">{{ t('领取更多优惠') }}</text>
      </view>

      <view class="footer-total">
        <text class="total-label">{{ t('合计金额') }}</text>
        <text class="total-amount">฿{{ formatPrice(totalPrice) }}</text>
      </view>

      <view class="checkout-btn" @click="onCheckout">
        <uni-icons type="cart-filled" size="18" color="#ffffff" />
        <text class="checkout-text">{{ t('去结算') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import {
  createMallOrder,
  deleteMallCartItem,
  deleteMallCartItems,
  getMallCart,
  getUserAddresses,
  payMallOrder,
  type MallOrder,
  type UserAddress,
  updateMallCartItem,
} from '@/api';
import { useUserStore } from '@/stores/modules/userStore';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const userStore = useUserStore();
const prefixUrl = computed(() => userStore.prefixUrl);
const statusBarHeight = ref(20);
const safeBottom = ref(0);
const activeTab = ref<'cart' | 'ship'>('cart');

type CartItem = {
  id: number;
  title: string;
  price: number;
  qty: number;
  img: string;
  checked: boolean;
};

type CartShop = {
  id: number;
  name: string;
  checked: boolean;
  items: CartItem[];
};

const shops = ref<CartShop[]>([]);

try {
  const sys = uni.getSystemInfoSync();
  statusBarHeight.value = sys.statusBarHeight || 20;
  safeBottom.value = (sys as any).safeAreaInsets?.bottom || 0;
} catch (_) {
  statusBarHeight.value = 20;
}

const allItems = computed(() => shops.value.flatMap((s) => s.items));
const totalItemCount = computed(() => allItems.value.length);
const checkedCount = computed(() => allItems.value.filter((i) => i.checked).length);
const allChecked = computed(
  () => totalItemCount.value > 0 && checkedCount.value === totalItemCount.value
);

const totalPrice = computed(() => {
  let sum = 0;
  shops.value.forEach((shop) => {
    shop.items.forEach((item) => {
      if (item.checked) sum += item.price * item.qty;
    });
  });
  return sum;
});

function itemImage(item: CartItem) {
  const url = item.img || '';
  if (!url) return '/static/img/empty.svg';
  if (String(url).startsWith('http') || String(url).startsWith('/static')) return url;
  return prefixUrl.value + url;
}

function formatPrice(price: any) {
  const n = Number(price);
  if (Number.isNaN(n)) return String(price ?? '0');
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 });
}

function loadCart() {
  getMallCart({ noLoading: true })
    .then((res: any) => {
      const data = res?.data || res || {};
      const items: any[] = data.items || [];
      const shopsList: any[] = data.shops || [];
      const groupByShop: Record<string, number[]> = data.group_by_shop || {};

      const itemMap: Record<number, any> = {};
      items.forEach((item: any) => {
        itemMap[item.id] = item;
      });

      const shopInfoMap: Record<number, any> = {};
      shopsList.forEach((shop: any) => {
        shopInfoMap[shop.id] = shop;
      });

      const shopMap: Record<number, CartShop> = {};
      Object.keys(groupByShop).forEach((shopIdStr: string) => {
        const shopId = Number(shopIdStr);
        const cartItemIds: number[] = groupByShop[shopIdStr] || [];
        const shopInfo = shopInfoMap[shopId];
        if (!shopInfo) return;

        const cartItems: CartItem[] = [];
        cartItemIds.forEach((cartItemId: number) => {
          const item = itemMap[cartItemId];
          if (!item) return;
          cartItems.push({
            id: item.id,
            title: item.product?.name ?? t('商品'),
            price: Number(item.product?.sale_price ?? 0),
            qty: Number(item.quantity ?? 1),
            img: item.product?.images?.[0]?.url ?? '/static/img/empty.svg',
            checked: false,
          });
        });

        if (cartItems.length > 0) {
          shopMap[shopId] = {
            id: shopId,
            name: shopInfo.name ?? t('店铺'),
            checked: false,
            items: cartItems,
          };
        }
      });

      // 若无 group_by_shop，兜底平铺
      if (!Object.keys(shopMap).length && items.length) {
        shopMap[0] = {
          id: 0,
          name: t('购物车'),
          checked: false,
          items: items.map((item: any) => ({
            id: item.id,
            title: item.product?.name ?? t('商品'),
            price: Number(item.product?.sale_price ?? 0),
            qty: Number(item.quantity ?? 1),
            img: item.product?.images?.[0]?.url ?? '/static/img/empty.svg',
            checked: false,
          })),
        };
      }

      shops.value = Object.values(shopMap);
    })
    .catch((e) => {
      console.error(t('加载购物车失败'), e);
      shops.value = [];
    });
}

onShow(() => {
  activeTab.value = 'cart';
  loadCart();
});

function onShipTab() {
  activeTab.value = 'ship';
  uni.navigateTo({ url: '/pages/order/order?status=paid' });
}

function toggleItem(shop: CartShop, item: CartItem) {
  item.checked = !item.checked;
  shop.checked = shop.items.every((it) => it.checked);
}

function toggleSelectAll() {
  const next = !allChecked.value;
  shops.value.forEach((shop) => {
    shop.checked = next;
    shop.items.forEach((item) => {
      item.checked = next;
    });
  });
}

function decreaseQty(shop: CartShop, item: CartItem) {
  if (item.qty <= 1) {
    uni.showModal({
      title: t('提示'),
      content: t('是否删除该商品？'),
      confirmText: t('删除'),
      cancelText: t('取消'),
      success: (res) => {
        if (!res.confirm) return;
        deleteMallCartItem(item.id)
          .then(() => {
            const idx = shop.items.findIndex((it) => it.id === item.id);
            if (idx >= 0) shop.items.splice(idx, 1);
            if (shop.items.length === 0) {
              const shopIdx = shops.value.findIndex((s) => s.id === shop.id);
              if (shopIdx >= 0) shops.value.splice(shopIdx, 1);
            } else {
              shop.checked = shop.items.every((it) => it.checked);
            }
          })
          .catch(() => {
            uni.showToast({ title: t('删除失败'), icon: 'none' });
          });
      },
    });
    return;
  }
  const next = item.qty - 1;
  updateMallCartItem(item.id, { quantity: next })
    .then(() => {
      item.qty = next;
    })
    .catch(() => {
      uni.showToast({ title: t('更新数量失败'), icon: 'none' });
    });
}

function increaseQty(_shop: CartShop, item: CartItem) {
  const next = item.qty + 1;
  updateMallCartItem(item.id, { quantity: next })
    .then(() => {
      item.qty = next;
    })
    .catch(() => {
      uni.showToast({ title: t('更新数量失败'), icon: 'none' });
    });
}

function onDeleteSelected() {
  const ids = allItems.value.filter((i) => i.checked).map((i) => i.id);
  if (!ids.length) {
    uni.showToast({ title: t('请先选择要删除的商品'), icon: 'none' });
    return;
  }
  uni.showModal({
    title: t('提示'),
    content: `${t('确定删除已选')} ${ids.length} ${t('件商品？')}`,
    confirmText: t('删除'),
    cancelText: t('取消'),
    success: (res) => {
      if (!res.confirm) return;
      deleteMallCartItems(ids)
        .then(() => {
          uni.showToast({ title: t('已删除'), icon: 'none' });
          loadCart();
        })
        .catch(() => {
          uni.showToast({ title: t('删除失败'), icon: 'none' });
        });
    },
  });
}

function onDiscountTip() {
  uni.showToast({ title: t('优惠活动即将上线'), icon: 'none' });
}

function goHome() {
  uni.switchTab({ url: '/pages/home/index' });
}

function pickCreatedOrder(res: any): MallOrder | null {
  const data = res?.data ?? res;
  if (!data) return null;
  if (Array.isArray(data)) return (data[0] as MallOrder) || null;
  if (Array.isArray(data?.data)) return (data.data[0] as MallOrder) || null;
  if (data?.data && typeof data.data === 'object') return data.data as MallOrder;
  if (typeof data === 'object') return data as MallOrder;
  return null;
}

async function onCheckout() {
  if (!totalPrice.value) {
    uni.showToast({ title: t('请先选择要结算的商品'), icon: 'none' });
    return;
  }

  const selectedItems: CartItem[] = [];
  const cartIds: number[] = [];
  let currentShopId: number | null = null;

  for (const shop of shops.value) {
    for (const item of shop.items) {
      if (item.checked) {
        if (currentShopId === null) currentShopId = shop.id;
        if (currentShopId !== shop.id) {
          uni.showToast({ title: t('请选择同一店铺的商品'), icon: 'none' });
          return;
        }
        selectedItems.push(item);
        cartIds.push(item.id);
      }
    }
  }

  if (!selectedItems.length || currentShopId === null) {
    uni.showToast({ title: t('请先选择要结算的商品'), icon: 'none' });
    return;
  }

  try {
    uni.showLoading({ title: t('下单中...') });

    const addrRes: any = await getUserAddresses();
    const addresses: UserAddress[] = addrRes?.data || addrRes || [];
    const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
    if (!defaultAddr?.id) {
      uni.hideLoading();
      uni.showToast({ title: t('请先添加收货地址'), icon: 'none' });
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/address/add' });
      }, 800);
      return;
    }

    const createRes: any = await createMallOrder({
      cart_ids: cartIds,
      address_id: defaultAddr.id,
    });

    uni.hideLoading();
    const createdOrder = pickCreatedOrder(createRes);
    const orderId = createdOrder?.id;
    const orderAmount = createdOrder?.total_amount || String(totalPrice.value);

    if (!orderId) {
      uni.showToast({ title: t('下单成功，请到订单页付款'), icon: 'none' });
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/order/order?status=pending' });
      }, 500);
      return;
    }

    uni.showModal({
      title: t('确认付款'),
      content: `${t('确认使用钱包支付订单？')}\n${t('金额：')}฿${orderAmount}`,
      confirmText: t('付款'),
      cancelText: t('取消'),
      success: async (r) => {
        if (!r.confirm) {
          uni.showToast({ title: t('已创建订单'), icon: 'none' });
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/order/order?status=pending' });
          }, 300);
          return;
        }
        try {
          uni.showLoading({ title: t('支付中...') });
          await payMallOrder(orderId, { payment_method: 'wallet' });
          uni.hideLoading();
          uni.showToast({ title: t('支付成功'), icon: 'none' });
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/order/order?status=paid' });
          }, 300);
        } catch (e) {
          uni.hideLoading();
        }
      },
    });
  } catch (e) {
    uni.hideLoading();
    console.error(t('结算下单失败'), e);
  }
}
</script>

<style scoped lang="scss">
.cart-page {
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background: linear-gradient(90deg, #ee4d2d 0%, #ff6a3c 100%);
  flex-shrink: 0;
}

.header-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
}

.header-side {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-side--right {
  margin-left: auto;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
}

.tabs-wrap {
  padding: 20rpx 24rpx 8rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}

.tabs {
  display: flex;
  border-radius: 40rpx;
  overflow: hidden;
  background: #ffe8de;
}

.tab {
  flex: 1;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab--active {
  background: #3a3a3a;
  border-radius: 40rpx;
}

.tab-text {
  font-size: 28rpx;
  color: #c45a3a;
  font-weight: 600;
}

.tab--active .tab-text {
  color: #ffffff;
}

.cart-scroll {
  flex: 1;
  min-height: 0;
  padding: 8rpx 20rpx 24rpx;
  box-sizing: border-box;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 12rpx 4rpx 16rpx;
}

.section-bar {
  width: 8rpx;
  height: 28rpx;
  border-radius: 4rpx;
  background: #ee4d2d;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #555;
}

.shop-block {
  margin-bottom: 4rpx;
}

.cart-card {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 16rpx;
  padding: 20rpx 18rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.04);
}

.check-box {
  padding: 8rpx 12rpx 8rpx 4rpx;
  flex-shrink: 0;
}

.check {
  width: 36rpx;
  height: 36rpx;
  border-radius: 6rpx;
  border: 3rpx solid #ee4d2d;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  box-sizing: border-box;
}

.check--on {
  background: #ee4d2d;
}

.check-mark {
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1;
}

.item-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 10rpx;
  background: #f0f0f0;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  margin-left: 16rpx;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140rpx;
}

.item-title {
  font-size: 26rpx;
  color: #222;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
  gap: 12rpx;
}

.item-price {
  font-size: 30rpx;
  font-weight: 700;
  color: #ee4d2d;
}

.qty-pill {
  display: flex;
  align-items: center;
  background: #f3f3f3;
  border-radius: 24rpx;
  padding: 4rpx 6rpx;
  flex-shrink: 0;
}

.qty-btn {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  font-size: 30rpx;
  color: #666;
}

.qty-num {
  min-width: 40rpx;
  text-align: center;
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

/* 底部栏 */
.cart-footer {
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 20rpx 28rpx 16rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.select-text {
  font-size: 26rpx;
  color: #757575;
}

.discount-link {
  font-size: 24rpx;
  color: #ee4d2d;
}

.footer-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.total-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #222;
}

.total-amount {
  font-size: 36rpx;
  font-weight: 700;
  color: #ee4d2d;
}

.checkout-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: #ee4d2d;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.checkout-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}

.empty-cart {
  padding: 120rpx 0 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 32rpx;
}

.empty-btn {
  padding: 16rpx 48rpx;
  background: #ee4d2d;
  color: #fff;
  font-size: 28rpx;
  border-radius: 32rpx;
}
</style>
