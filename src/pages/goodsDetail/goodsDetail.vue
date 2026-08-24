<template>
  <view class="goods-detail">
    <!-- 商品图片轮播 -->
    <view class="goods-images">
      <swiper class="swiper" :indicator-dots="true" :autoplay="false" :interval="3000" :duration="500">
        <swiper-item v-for="(img, idx) in goodsData.images" :key="idx">
          <image class="swiper-img" :src="prefixUrl + img.url" mode="aspectFill" />
        </swiper-item>
      </swiper>
    </view>

    <!-- 价格和操作栏 -->
    <view class="price-bar">
      <view class="price-left">
        <text class="price-symbol">฿</text>
        <text class="price-value">{{ goodsData.sale_price }}</text>
        <text class="price-original" v-if="goodsData.original_price">฿{{ goodsData.original_price }}</text>
      </view>
      <view class="price-center">
        <view class="points-btn">
          <text class="points-text">{{ t('赠送') }} {{ goodsData.coupon_applicable || 0 }} {{ t('积分') }}</text>
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
      <text class="goods-title">{{ goodsData.name }}</text>
    </view>

    <!-- 销售和浏览统计 -->
    <view class="stats-section">
      <view class="stat-item">
        <text class="stat-label">{{ t('销量：') }}</text>
        <text class="stat-value">{{ goodsData.sold_count }}</text>
      </view>
      <view class="stat-item">
        <text class="stat-label">{{ t('浏览量：') }}</text>
        <text class="stat-value">{{ goodsData.view_count }}</text>
      </view>
    </view>

    <!-- 优惠券 -->
    <view class="coupon-section" @click="onCouponClick">
      <text class="coupon-label">{{ t('优惠券') }}</text>
      <view class="coupon-right">
        <text class="coupon-text">{{ t('暂无优惠券') }}</text>
        <uni-icons type="right" size="16" color="#999" />
      </view>
    </view>

    <!-- 购买类型选择 -->
    <view class="purchase-type-section" @click="onPurchaseTypeClick">
      <text class="purchase-type-label">{{ t('购买类型') }}</text>
      <view class="purchase-type-right">
        <text class="purchase-type-text">{{ selectedPurchaseType }}</text>
        <uni-icons type="right" size="16" color="#999" />
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="detail-section">
      <text class="detail-title">{{ t('商品详情') }}</text>
      <view class="detail-content">
        <image v-for="(img, idx) in goodsData.images" :key="idx" class="detail-img" :src="prefixUrl + img.url" mode="widthFix" />
        <text class="detail-text">{{ goodsData.description }}</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="bottom-left">
        <!-- <view class="bottom-icon-item" @click="onCustomerService">
          <uni-icons type="chatbubble" size="24" color="#666" />
          <text class="bottom-icon-text">{{ t('客服') }}</text>
        </view>
        <view class="bottom-icon-item" @click="onCartClick">
          <uni-icons type="cart" size="24" color="#666" />
          <text class="bottom-icon-text">{{ t('购物车') }}</text>
          <text class="bottom-badge" v-if="cartCount > 0">{{ cartCount }}</text>
        </view> -->
      </view>
      <view class="bottom-right">
        <button class="add-cart-btn" @click="onAddToCart">{{ t('加入购物车') }}</button>
        <button class="buy-now-btn" @click="openBuySheet">{{ t('立即购买') }}</button>
      </view>
    </view>

    <!-- 立即购买：填写数量 -->
    <view v-if="buySheetVisible" class="sheet-mask" @click="closeBuySheet" />
    <view v-if="buySheetVisible" class="sheet" @click.stop>
      <view class="sheet-content">
        <image
          class="sheet-img"
          :src="prefixUrl + (goodsData.images?.[0]?.url || goodsData.cover_image || '')"
          mode="aspectFill"
        />
        <view class="sheet-info">
          <text class="sheet-title">{{ goodsData.name }}</text>
          <text class="sheet-price">฿{{ goodsData.sale_price }}</text>
        </view>
        <view class="sheet-stock" v-if="!goodsData.is_unlimited_stock">
          <text class="sheet-stock-text">{{ t('库存：') }}{{ goodsData.stock ?? 0 }}</text>
        </view>
      </view>

      <view class="sheet-row">
        <text class="sheet-row-label">{{ t('数量') }}</text>
        <view class="qty">
          <view class="qty-btn" :class="{ 'qty-btn--disabled': buyQty <= 1 }" @click="decBuyQty">－</view>
          <input
            class="qty-input"
            type="number"
            :value="String(buyQty)"
            @input="onBuyQtyInput"
            @blur="normalizeBuyQty"
          />
          <view
            class="qty-btn"
            :class="{ 'qty-btn--disabled': !goodsData.is_unlimited_stock && buyQty >= maxBuyQty }"
            @click="incBuyQty"
          >＋</view>
        </view>
      </view>

      <view class="sheet-actions">
        <view class="sheet-btn sheet-btn--close" @click="closeBuySheet">{{ t('关闭') }}</view>
        <view class="sheet-btn sheet-btn--ok" @click="confirmBuy">{{ t('确认') }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { addMallCartItem, createMallOrder, getMallCart, getMallProductDetail, getUserAddresses, payMallOrder } from '@/api';
import type { MallOrder, UserAddress } from '@/api';
import { useUserStore } from '@/stores/modules/userStore';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const userStore = useUserStore();
const prefixUrl = computed(() => userStore.prefixUrl);
type GoodsData = {
  id: string;
  shop_id: string;
  category_id: string;
  sku: string | null;
  name: string;
  description: string;
  cover_image: string;
  stock: number;
  reserved_stock: number;
  original_price: string;
  sale_price: string;
  discount_type: string;
  discount_value: string;
  storage_type: string;
  weight: string;
  shipping_fee: string;
  free_shipping_quantity: number | null;
  free_shipping_amount: number | null;
  fees: any | null;
  sold_count: number;
  view_count: number;
  display_sold_type: string;
  display_sold_modifier: string;
  status: string;
  is_featured: number;
  logistics_provider_id: number | null;
  payment_methods: any | null;
  coupon_applicable: number;
  min_purchase_discount: number | null;
  group_buy_config: any | null;
  flash_sale_config: any | null;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_unlimited_stock: number;
  images: Array<{
    id: string;
    product_id: string;
    path: string;
    storage_driver: string;
    sort_order: number;
    is_cover: number;
    created_at: string;
    url: string;
  }>;
  display_sold_count: number;
};

const goodsData = ref<GoodsData>({
  id: '',
  shop_id: '',
  category_id: '',
  sku: null,
  name: '',
  description: '',
  cover_image: '',
  stock: 0,
  reserved_stock: 0,
  original_price: '',
  sale_price: '',
  discount_type: '',
  discount_value: '',
  storage_type: '',
  weight: '',
  shipping_fee: '',
  free_shipping_quantity: null,
  free_shipping_amount: null,
  fees: undefined,
  sold_count: 0,
  view_count: 0,
  display_sold_type: '',
  display_sold_modifier: '',
  status: '',
  is_featured: 0,
  logistics_provider_id: null,
  payment_methods: undefined,
  coupon_applicable: 0,
  min_purchase_discount: null,
  group_buy_config: undefined,
  flash_sale_config: undefined,
  version: 0,
  created_at: '',
  updated_at: '',
  deleted_at: null,
  is_unlimited_stock: 0,
  images: [],
  display_sold_count: 0
});

const isFavorite = ref(false);
const cartCount = ref(0);
const selectedPurchaseType = ref(t('普通购买'));

onLoad((options: any) => {
  // 可以从 options 中获取商品ID等参数
  if (options.id) {
    // 这里可以根据ID加载商品数据（测试数据）
    console.log(t('商品ID'), options.id);
    getMallProductDetail(options.id, options.shop_id).then((res: any) => {
      console.log(res);
      goodsData.value = res?.data || res;
    });
    requestCartCount();
  }
});

function toggleFavorite() {
  isFavorite.value = !isFavorite.value;
  uni.showToast({
    title: isFavorite.value ? t('已收藏') : t('已取消收藏'),
    icon: 'none',
  });
}

function onCartClick() {
  uni.switchTab({
    url: '/pages/cart/cart',
  });
}

function onPointsClick() {
  uni.showToast({ title: t('查看积分详情（测试功能）'), icon: 'none' });
}

function onCouponClick() {
  uni.showToast({ title: t('查看优惠券（测试功能）'), icon: 'none' });
}

function onPurchaseTypeClick() {
  uni.showActionSheet({
    itemList: [t('普通购买'), t('团购'), t('秒杀')],
    success: (res) => {
      const types = [t('普通购买'), t('团购'), t('秒杀')];
      selectedPurchaseType.value = types[res.tapIndex];
    },
  });
}

function onCustomerService() {
  uni.showToast({ title: t('联系客服（测试功能）'), icon: 'none' });
}

function onAddToCart() {
  if (!goodsData.value?.id || !goodsData.value?.shop_id) {
    uni.showToast({ title: t('商品加载中，请稍后'), icon: 'none' });
    return;
  }
  addMallCartItem({
    product_id: parseInt(goodsData.value.id),
    quantity: 1,
    selected_sku: goodsData.value.sku || '1',
    shop_id: parseInt(goodsData.value.shop_id),
  }).then(() => {
    uni.showToast({ title: t('已加入购物车'), icon: 'success' });
    requestCartCount();
  }).catch(() => {
    // 错误提示由 request 拦截器统一处理
  });
}

const requestCartCount = () => {
  // 更新購物車角標時不需要全局 loading，避免覆蓋 Toast
  getMallCart({ noLoading: true }).then((res: any) => {
    const data = res?.data || res;
    cartCount.value = (data?.items || []).length;
  });
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

const buySheetVisible = ref(false);
const buyQty = ref(1);
const buying = ref(false);

const maxBuyQty = computed(() => {
  if (goodsData.value?.is_unlimited_stock) return 9999;
  const stock = Number(goodsData.value?.stock ?? 0);
  return stock > 0 ? stock : 1;
});

function openBuySheet() {
  if (!goodsData.value?.id || !goodsData.value?.shop_id) {
    uni.showToast({ title: t('商品数据异常'), icon: 'none' });
    return;
  }
  if (!goodsData.value.is_unlimited_stock && Number(goodsData.value.stock) <= 0) {
    uni.showToast({ title: t('库存不足'), icon: 'none' });
    return;
  }
  buyQty.value = 1;
  buySheetVisible.value = true;
}

function closeBuySheet() {
  if (buying.value) return;
  buySheetVisible.value = false;
}

function decBuyQty() {
  buyQty.value = Math.max(1, buyQty.value - 1);
}

function incBuyQty() {
  buyQty.value = Math.min(maxBuyQty.value, buyQty.value + 1);
}

function onBuyQtyInput(e: any) {
  const raw = String(e?.detail?.value ?? '').replace(/\D/g, '');
  if (!raw) {
    buyQty.value = 1;
    return;
  }
  buyQty.value = Math.min(maxBuyQty.value, Math.max(1, parseInt(raw, 10) || 1));
}

function normalizeBuyQty() {
  buyQty.value = Math.min(maxBuyQty.value, Math.max(1, Number(buyQty.value) || 1));
}

async function confirmBuy() {
  normalizeBuyQty();
  buySheetVisible.value = false;
  await onBuyNow(buyQty.value);
}

async function onBuyNow(quantity = 1) {
  if (!goodsData.value?.id || !goodsData.value?.shop_id) {
    uni.showToast({ title: t('商品数据异常'), icon: 'none' });
    return;
  }

  const qty = Math.min(maxBuyQty.value, Math.max(1, Number(quantity) || 1));
  buying.value = true;
  uni.showLoading({ title: t('下单中...') });
  try {
    const addrRes: any = await getUserAddresses();
    const addresses: UserAddress[] = addrRes?.data || addrRes || [];
    const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
    if (!defaultAddr?.id) {
      uni.showToast({ title: t('请先添加收货地址'), icon: 'none' });
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/address/add' });
      }, 800);
      return;
    }

    const createRes: any = await createMallOrder({
      items: [
        {
          product_id: Number(goodsData.value.id),
          quantity: qty,
          sku: goodsData.value.sku || undefined,
        },
      ],
      shop_id: Number(goodsData.value.shop_id),
      address_id: defaultAddr.id,
    });

    const createdOrder = pickCreatedOrder(createRes);
    const orderId = createdOrder?.id;
    const orderAmount = createdOrder?.total_amount || goodsData.value.sale_price;

    if (!orderId) {
      uni.showToast({ title: t('下单成功，请到订单页付款'), icon: 'none' });
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/order/order?status=pending_payment' });
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
            uni.navigateTo({ url: '/pages/order/order?status=pending_payment' });
          }, 300);
          return;
        }
        try {
          uni.showLoading({ title: t('支付中...') });
          await payMallOrder(orderId, { payment_method: 'wallet' });
          uni.showToast({ title: t('支付成功'), icon: 'none' });
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/order/order?status=pending_shipment' });
          }, 300);
        } catch {
          // 错误提示由 request 拦截器统一处理
        } finally {
          uni.hideLoading();
        }
      },
    });
  } catch {
    // 错误提示由 request 拦截器统一处理
  } finally {
    buying.value = false;
    uni.hideLoading();
  }
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

.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 998;
}

.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 22rpx 24rpx calc(22rpx + env(safe-area-inset-bottom));
  z-index: 999;
}

.sheet-content {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.sheet-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 14rpx;
  background: #f5f5f5;
}

.sheet-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  padding-top: 4rpx;
  min-width: 0;
}

.sheet-title {
  font-size: 30rpx;
  color: #111;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.sheet-price {
  font-size: 40rpx;
  color: #ff3e6c;
  font-weight: 700;
}

.sheet-stock {
  padding-top: 12rpx;
  white-space: nowrap;
}

.sheet-stock-text {
  font-size: 26rpx;
  color: #999;
}

.sheet-row {
  margin-top: 26rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sheet-row-label {
  font-size: 30rpx;
  color: #666;
}

.qty {
  display: flex;
  align-items: center;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  overflow: hidden;
  height: 64rpx;
}

.qty-btn {
  width: 64rpx;
  height: 64rpx;
  line-height: 64rpx;
  text-align: center;
  background: #fff;
  color: #666;
  font-size: 28rpx;
}

.qty-btn--disabled {
  color: #ccc;
}

.qty-input {
  width: 88rpx;
  height: 64rpx;
  text-align: center;
  font-size: 28rpx;
  color: #111;
  border-left: 1rpx solid #eee;
  border-right: 1rpx solid #eee;
}

.sheet-actions {
  margin-top: 28rpx;
  display: flex;
  gap: 18rpx;
}

.sheet-btn {
  flex: 1;
  height: 84rpx;
  line-height: 84rpx;
  text-align: center;
  border-radius: 42rpx;
  font-size: 30rpx;
}

.sheet-btn--close {
  background: #f2f2f2;
  color: #111;
}

.sheet-btn--ok {
  background: #ff3e6c;
  color: #fff;
}
</style>
