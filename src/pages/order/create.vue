<template>
  <view class="create-order-page">
    <scroll-view class="order-scroll" scroll-y>
      <!-- 收货地址卡片 -->
      <view class="address-card" @click="onSelectAddress" v-if="selectedAddress">
        <view class="address-info">
          <text class="address-name">{{ selectedAddress.receiver_name }}</text>
          <text class="address-phone">{{ selectedAddress.receiver_phone }}</text>
        </view>
        <text class="address-detail">{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.address
          }}</text>
        <uni-icons type="right" size="18" color="#999" />
      </view>
      <view class="address-card address-card--empty" @click="onSelectAddress" v-else>
        <text class="address-empty-text">请选择收货地址</text>
        <uni-icons type="right" size="18" color="#999" />
      </view>

      <!-- 支付方式卡片 -->
      <view class="payment-card">
        <text class="payment-label">支付方式</text>
        <text class="payment-value">在线支付</text>
      </view>

      <!-- 商品列表 -->
      <view class="product-card">
        <view v-for="item in orderItems" :key="item.id" class="product-item">
          <image class="product-img" :src="item.img" mode="aspectFill" />
          <view class="product-info">
            <text class="product-title breakcss">{{ item.title }}</text>
            <view class="product-price-row">
              <text class="product-price">฿{{ item.price }} x {{ item.qty }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部固定栏 -->
    <view class="order-footer">
      <view class="footer-left">
        <text class="footer-label">实付款:</text>
        <text class="footer-amount">฿{{ totalPrice }}</text>
        <text class="footer-count">共{{ totalCount }}件</text>
      </view>
      <button class="submit-btn" @click="onSubmitOrder">提交订单</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { createMallOrder, getUserAddresses } from '@/api';
import type { MallCreateOrderPayload, UserAddress } from '@/api';
import globalTool from '@/utils/globalTool';

type OrderItem = {
  id: number; // 购物车项 ID
  title: string;
  price: number;
  qty: number;
  img: string;
};

// 订单商品列表（从购物车页面传递）
const orderItems = ref<OrderItem[]>([]);
const shopId = ref<number>(0);
const cartIds = ref<number[]>([]);
const selectedAddress = ref<UserAddress | null>(null);

// 计算总价
const totalPrice = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.qty, 0);
});

// 计算总件数
const totalCount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.qty, 0);
});

// 页面加载时接收参数
onLoad((options: any) => {
  // 从购物车页面传递的数据
  if (options.items) {
    try {
      orderItems.value = JSON.parse(decodeURIComponent(options.items));
    } catch (e) {
      console.error('解析商品数据失败', e);
    }
  }
  if (options.shopId) {
    shopId.value = Number(options.shopId);
  }
  if (options.cartIds) {
    try {
      cartIds.value = JSON.parse(decodeURIComponent(options.cartIds));
    } catch (e) {
      console.error('解析购物车ID失败', e);
    }
  }

  // 加载默认地址
  loadDefaultAddress();
});

// 页面显示时重新加载地址（从地址列表返回时）
onShow(() => {
  loadDefaultAddress();
});

// 加载默认地址
async function loadDefaultAddress() {
  try {
    const res: any = await getUserAddresses();
    const addresses: UserAddress[] = res?.data || res || [];
    const defaultAddr = addresses.find((addr) => addr.is_default) || addresses[0];
    selectedAddress.value = defaultAddr || null;
  } catch (e) {
    console.error('加载地址失败', e);
  }
}

// 选择地址
function onSelectAddress() {
  uni.navigateTo({
    url: '/pages/address/list',
  });
}

// 提交订单
async function onSubmitOrder() {
  if (!selectedAddress.value) {
    uni.showToast({ title: '请先选择收货地址', icon: 'none' });
    onSelectAddress();
    return;
  }

  if (!cartIds.value.length || !shopId.value) {
    uni.showToast({ title: '订单数据不完整', icon: 'none' });
    return;
  }

  const payload: MallCreateOrderPayload = {
    cart_ids: cartIds.value,
    shop_id: shopId.value,
    address: {
      receiver_name: selectedAddress.value.receiver_name,
      receiver_phone: selectedAddress.value.receiver_phone,
      city: selectedAddress.value.city,
      district: selectedAddress.value.district,
      address: selectedAddress.value.address,
    },
  };


  uni.showLoading({ title: '提交中...' });
  createMallOrder(payload).then((res: any) => {
    uni.hideLoading();
    globalTool.showToast(res?.message, true, 'success');
  })


}
</script>

<style scoped lang="scss">
.create-order-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.order-scroll {
  flex: 1;
  padding: 16rpx;
  padding-bottom: 120rpx;
}

.address-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 16rpx;
  display: flex;
  flex-direction: column;
  position: relative;
}

.address-card--empty {
  align-items: center;
  justify-content: center;
  min-height: 120rpx;
}

.address-info {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.address-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-right: 20rpx;
}

.address-phone {
  font-size: 26rpx;
  color: #666;
}

.address-detail {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

.address-empty-text {
  font-size: 28rpx;
  color: #999;
}

.address-card .uni-icons {
  position: absolute;
  right: 28rpx;
  top: 50%;
  transform: translateY(-50%);
}

.payment-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.payment-label {
  font-size: 28rpx;
  color: #333;
}

.payment-value {
  font-size: 28rpx;
  color: #333;
}

.product-card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 20rpx 28rpx;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.product-item:not(:last-child) {
  border-bottom: 1rpx solid #f0f0f0;
}

.product-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  margin-right: 20rpx;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 12rpx;
}

.product-price-row {
  display: flex;
  align-items: center;
}

.product-price {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff3e6c;
}

.order-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  padding: 0 24rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.footer-left {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.footer-label {
  font-size: 26rpx;
  color: #333;
}

.footer-amount {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff3e6c;
}

.footer-count {
  font-size: 24rpx;
  color: #666;
  margin-left: 8rpx;
}

.submit-btn {
  width: 220rpx;
  height: 76rpx;
  line-height: 76rpx;
  text-align: center;
  border-radius: 38rpx;
  background: #ff3e6c;
  color: #ffffff;
  font-size: 30rpx;
  border: none;
}
</style>
