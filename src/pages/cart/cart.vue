<template>
  <view class="cart-page">
    <scroll-view class="cart-scroll" scroll-y>
      <view
        v-for="shop in shops"
        :key="shop.id"
        class="shop-card"
      >
        <!-- 店铺标题 + 店铺勾选 -->
        <view class="shop-header">
          <view class="shop-check" @click="toggleShop(shop)">
            <view :class="['check-circle', shop.checked ? 'check-circle--active' : '']">
              <view v-if="shop.checked" class="check-dot" />
            </view>
          </view>
          <text class="shop-name">{{ shop.name }}</text>
        </view>

        <!-- 商品列表 -->
        <view
          v-for="item in shop.items"
          :key="item.id"
          class="cart-item"
        >
          <view class="item-left">
            <view class="shop-check" @click="toggleItem(shop, item)">
              <view :class="['check-circle', item.checked ? 'check-circle--active' : '']">
                <view v-if="item.checked" class="check-dot" />
              </view>
            </view>
            <image class="item-img" :src="item.img" mode="aspectFill" />
          </view>

          <view class="item-right">
            <text class="item-title breakcss">
              {{ item.title }}
            </text>
            <view class="item-bottom">
              <text class="item-price">฿{{ item.price }}</text>
              <view class="quantity-wrap">
                <text class="qty-btn" @click="decreaseQty(shop, item)">－</text>
                <text class="qty-value">{{ item.qty }}</text>
                <text class="qty-btn" @click="increaseQty(shop, item)">＋</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部合计栏 -->
    <view class="cart-footer">
      <view class="cart-total">
        <text class="total-label">合计：</text>
        <text class="total-amount">฿{{ totalPrice }}</text>
      </view>
      <button class="checkout-btn" @click="onCheckout">去结算</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getMallCart } from '@/api';

const cart = ref<any[]>([]);

onShow(() => {
  getMallCart().then((res: any) => {
    cart.value = res.data;
  });
});
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

const shops = ref<CartShop[]>([
  {
    id: 1,
    name: 'BALE',
    checked: true,
    items: [
      {
        id: 101,
        title: 'Harley–Davidson Military – Men\'s Graphic Short Sleeve Crew T–Shirt – Overseas To...',
        price: 2070,
        qty: 1,
        img: '/static/img/invitebg.png',
        checked: true,
      },
    ],
  },
  {
    id: 2,
    name: 'BANK',
    checked: false,
    items: [
      {
        id: 201,
        title: 'Anne Klein Women\'s Bracelet Watch and Bracelet Set AK/1470',
        price: 2790,
        qty: 1,
        img: '/static/img/clock.png',
        checked: false,
      },
    ],
  },
  {
    id: 3,
    name: 'first',
    checked: false,
    items: [
      {
        id: 301,
        title: 'GUERLAIN Abeille Royale Eye Repair Serum, 0.6 fl oz, 20ml',
        price: 3595,
        qty: 1,
        img: '/static/img/profit.png',
        checked: false,
      },
    ],
  },
]);

const totalPrice = computed(() => {
  let sum = 0;
  shops.value.forEach((shop) => {
    shop.items.forEach((item) => {
      if (item.checked) {
        sum += item.price * item.qty;
      }
    });
  });
  return sum;
});

function toggleShop(shop: CartShop) {
  const next = !shop.checked;
  shop.checked = next;
  shop.items.forEach((item) => {
    item.checked = next;
  });
}

function toggleItem(shop: CartShop, item: CartItem) {
  item.checked = !item.checked;
  // 更新店铺是否全选
  shop.checked = shop.items.every((it) => it.checked);
}

function decreaseQty(shop: CartShop, item: CartItem) {
  if (item.qty <= 1) return;
  item.qty -= 1;
}

function increaseQty(shop: CartShop, item: CartItem) {
  item.qty += 1;
}

function onCheckout() {
  if (!totalPrice.value) {
    uni.showToast({ title: '请先选择要结算的商品', icon: 'none' });
    return;
  }
  uni.showToast({ title: `测试结算，总金额 ฿${totalPrice.value}`, icon: 'none' });
}
</script>

<style scoped lang="scss">
.cart-page {
  min-height: 91vh;
  background: #e1ddff;
  display: flex;
  flex-direction: column;
}

.cart-scroll {
  flex: 1;
  padding: 16rpx 16rpx 120rpx;
}

.shop-card {
  background: #f5f2ff;
  border-radius: 20rpx;
  padding: 20rpx 0 10rpx;
  margin-bottom: 16rpx;
}

.shop-header {
  flex-direction: row;
  display: flex;
  align-items: center;
  padding: 0 26rpx 12rpx;
}

.shop-check {
  margin-right: 18rpx;
}

.check-circle {
  width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  border: 2rpx solid #c7c7c7;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.check-circle--active {
  border-color: #ff3e6c;
}

.check-dot {
  width: 18rpx;
  height: 18rpx;
  border-radius: 50%;
  background: #ff3e6c;
}

.shop-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.cart-item {
  flex-direction: row;
  display: flex;
  align-items: flex-start;
  padding: 12rpx 26rpx 14rpx;
}

.item-left {
  flex-direction: row;
  display: flex;
  align-items: center;
}

.item-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 10rpx;
  background: #ffffff;
}

.item-right {
  margin-left: 18rpx;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title {
  font-size: 26rpx;
  color: #333;
}

.item-bottom {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-price {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff3e6c;
}

.quantity-wrap {
  flex-direction: row;
  display: flex;
  align-items: center;
}

.qty-btn {
  width: 52rpx;
  height: 52rpx;
  line-height: 52rpx;
  text-align: center;
  font-size: 30rpx;
  color: #666;
}

.qty-value {
  min-width: 50rpx;
  text-align: center;
  font-size: 26rpx;
  color: #333;
}

.cart-footer {
  height: 110rpx;
  padding: 0 24rpx;
  background: #ffffff;
  flex-direction: row;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-total {
  flex-direction: row;
  display: flex;
  align-items: baseline;
}

.total-label {
  font-size: 28rpx;
  color: #ff3e6c;
}

.total-amount {
  margin-left: 6rpx;
  font-size: 30rpx;
  font-weight: 700;
  color: #ff3e6c;
}

.checkout-btn {
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

