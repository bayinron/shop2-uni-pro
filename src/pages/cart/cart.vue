<template>
  <view class="cart-page">
    <scroll-view class="cart-scroll" scroll-y>
      <!-- 空状态 -->
      <view v-if="!shops.length" class="empty-cart">
        <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
        <text class="empty-text">购物车是空的</text>
      </view>

      <!-- 购物车列表 -->
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
import { onShow } from '@dcloudio/uni-app';
import { deleteMallCartItem, getMallCart, getUserAddresses, updateMallCartItem } from '@/api';
type CartItem = {
  /** 购物车项 ID，用于更新数量 */
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

// 购物车数据（从服务器加载）
const shops = ref<CartShop[]>([]);

// 从接口加载购物车数据并按店铺分组
onShow(async () => {
  try {
    const res: any = await getMallCart();
    const data = res || {};
    
    // 数据结构：{ items: [], shops: [], group_by_shop: {} }
    const items: any[] = data.items || [];
    const shopsList: any[] = data.shops || [];
    const groupByShop: Record<string, number[]> = data.group_by_shop || {};


    // 创建商品映射表（cart_item_id => item）
    const itemMap: Record<number, any> = {};
    items.forEach((item: any) => {
      itemMap[item.id] = item;
    });

    // 创建店铺映射表（shop_id => shop）
    const shopInfoMap: Record<number, any> = {};
    shopsList.forEach((shop: any) => {
      shopInfoMap[shop.id] = shop;
    });

    // 根据 group_by_shop 构建店铺购物车结构
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
          id: item.id, // 购物车项 ID
          title: item.product?.name ?? '商品',
          price: Number(item.product?.sale_price ?? 0),
          qty: Number(item.quantity ?? 1),
          img: item.product?.images?.[0]?.url ?? '/static/img/empty.svg',
          checked: false,
        });
      });

      if (cartItems.length > 0) {
        shopMap[shopId] = {
          id: shopId,
          name: shopInfo.name ?? '店铺',
          checked: false,
          items: cartItems,
        };
      }
    });

    const result = Object.values(shopMap);
    shops.value = result;
  } catch (e) {
    console.error('加载购物车失败', e);
    uni.showToast({ title: '加载购物车失败', icon: 'none' });
    shops.value = [];
  }
});

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
  if (item.qty <= 1) {
    uni.showModal({
      title: '提示',
      content: '数量将变为 0，是否删除该商品？',
      confirmText: '删除',
      cancelText: '取消',
      success: (res) => {
        if (!res.confirm) return;
        deleteMallCartItem(item.id)
          .then(() => {
            const idx = shop.items.findIndex((it) => it.id === item.id);
            if (idx >= 0) shop.items.splice(idx, 1);

            // 如果店铺下已无商品，则移除店铺
            if (shop.items.length === 0) {
              const shopIdx = shops.value.findIndex((s) => s.id === shop.id);
              if (shopIdx >= 0) shops.value.splice(shopIdx, 1);
            } else {
              // 更新店铺是否全选
              shop.checked = shop.items.every((it) => it.checked);
            }
          })
          .catch(() => {
            uni.showToast({ title: '删除失败', icon: 'none' });
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
      uni.showToast({ title: '更新数量失败', icon: 'none' });
    });
}

function increaseQty(shop: CartShop, item: CartItem) {
  const next = item.qty + 1;
  updateMallCartItem(item.id, { quantity: next })
    .then(() => {
      item.qty = next;
    })
    .catch(() => {
      uni.showToast({ title: '更新数量失败', icon: 'none' });
    });
}

async function onCheckout() {
  if (!totalPrice.value) {
    uni.showToast({ title: '请先选择要结算的商品', icon: 'none' });
    return;
  }

  // 收集选中的商品数据
  const selectedItems: CartItem[] = [];
  const cartIds: number[] = [];
  let currentShopId: number | null = null;

  for (const shop of shops.value) {
    for (const item of shop.items) {
      if (item.checked) {
        if (currentShopId === null) {
          currentShopId = shop.id;
        }
        // 如果跨店铺，提示只能选择同一店铺的商品
        if (currentShopId !== shop.id) {
          uni.showToast({ title: '请选择同一店铺的商品', icon: 'none' });
          return;
        }
        selectedItems.push(item);
        cartIds.push(item.id);
      }
    }
  }

  if (!selectedItems.length || !currentShopId) {
    uni.showToast({ title: '请先选择要结算的商品', icon: 'none' });
    return;
  }

  // 检查地址
  try {
    const res: any = await getUserAddresses();
    const addresses: any[] = res?.data || res || [];
    if (!addresses.length) {
      uni.showToast({ title: '请先添加收货地址', icon: 'none' });
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages/address/add',
        });
      }, 1500);
      return;
    }
  } catch (e) {
    console.error('获取地址失败', e);
  }

  // 跳转到订单创建页面
  const itemsStr = encodeURIComponent(JSON.stringify(selectedItems));
  const cartIdsStr = encodeURIComponent(JSON.stringify(cartIds));
  uni.navigateTo({
    url: `/pages/order/create?items=${itemsStr}&shopId=${currentShopId}&cartIds=${cartIdsStr}`,
  });
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
  margin: 0;
}

.empty-cart {
  padding: 120rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>

