<template>
  <view class="order-page">
    <!-- 顶部头部 -->
    <view class="order-header">
      <view class="header-back" @click="onBack">
        <uni-icons type="left" size="24" color="#fff" />
      </view>
      <text class="header-title">我的订单</text>
      <view class="header-placeholder"></view>
    </view>

    <!-- 订单状态标签页 -->
    <view class="order-tabs">
      <scroll-view class="tabs-scroll" scroll-x>
        <view class="tabs-wrap">
          <view
            v-for="tab in orderTabs"
            :key="tab.key"
            class="tab-item"
            :class="{ 'tab-item--active': activeTab === tab.key }"
            @click="onTabClick(tab.key)"
          >
            <text class="tab-text">{{ tab.text }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 订单列表 -->
    <view class="order-content">
      <!-- 有订单时显示列表 -->
      <view v-if="currentOrders.length > 0" class="order-list">
        <view
          v-for="order in currentOrders"
          :key="order.id"
          class="order-card"
          @click="onOrderClick(order)"
        >
          <!-- 订单头部 -->
          <view class="order-card-header">
            <text class="order-no">订单号：{{ order.no }}</text>
            <text class="order-status" :class="`order-status--${order.status}`">
              {{ order.statusText }}
            </text>
          </view>

          <!-- 商品列表 -->
          <view class="order-products">
            <view v-for="(item, idx) in order.items" :key="idx" class="product-item">
              <image class="product-img" :src="item.img" mode="aspectFill" />
              <view class="product-info">
                <text class="product-name">{{ item.name }}</text>
                <view class="product-spec" v-if="item.spec">
                  <text class="spec-text">{{ item.spec }}</text>
                </view>
                <view class="product-price-row">
                  <text class="product-price">￥{{ item.price }}</text>
                  <text class="product-quantity">x{{ item.quantity }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 订单底部 -->
          <view class="order-card-footer">
            <text class="order-time">{{ order.time }}</text>
            <view class="order-total">
              <text class="total-label">合计：</text>
              <text class="total-price">￥{{ order.total }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="order-actions" v-if="order.actions && order.actions.length > 0">
            <button
              v-for="action in order.actions"
              :key="action.key"
              class="action-btn"
              :class="`action-btn--${action.type}`"
              @click.stop="onActionClick(order, action)"
            >
              {{ action.text }}
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <view class="empty-icon">
          <text class="icon iconfont icon-gouwuche"></text>
        </view>
        <text class="empty-text">暂无订单</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type OrderStatus = 'all' | 'pending' | 'paid' | 'shipping' | 'receiving' | 'completed';

type OrderItem = {
  name: string;
  img: string;
  price: string;
  quantity: number;
  spec?: string;
};

type OrderAction = {
  key: string;
  text: string;
  type: 'primary' | 'default';
};

type Order = {
  id: string;
  no: string;
  status: OrderStatus;
  statusText: string;
  time: string;
  total: string;
  items: OrderItem[];
  actions?: OrderAction[];
};

const orderTabs = ref<Array<{ key: OrderStatus; text: string }>>([
  { key: 'pending', text: '待付款' },
  { key: 'paid', text: '待发货' },
  { key: 'shipping', text: '待收货' },
  { key: 'completed', text: '已完成' },
]);

const activeTab = ref<OrderStatus>('pending');

// 测试订单数据
const allOrders = ref<Order[]>([
  {
    id: 'o1',
    no: '202501300001',
    status: 'pending',
    statusText: '待付款',
    time: '2025-01-30 10:20',
    total: '299.00',
    items: [
      {
        name: '时尚连帽卫衣',
        img: '/static/img/clock.png',
        price: '199.00',
        quantity: 1,
        spec: '颜色：黑色 / 尺码：L',
      },
      {
        name: '休闲运动裤',
        img: '/static/img/profit.png',
        price: '100.00',
        quantity: 1,
        spec: '颜色：灰色 / 尺码：M',
      },
    ],
    actions: [
      { key: 'cancel', text: '取消订单', type: 'default' },
      { key: 'pay', text: '立即付款', type: 'primary' },
    ],
  },
  {
    id: 'o2',
    no: '202501300002',
    status: 'paid',
    statusText: '待发货',
    time: '2025-01-29 15:30',
    total: '459.00',
    items: [
      {
        name: '运动鞋',
        img: '/static/img/money-bag.png',
        price: '459.00',
        quantity: 1,
        spec: '颜色：白色 / 尺码：42',
      },
    ],
    actions: [{ key: 'contact', text: '联系客服', type: 'default' }],
  },
  {
    id: 'o3',
    no: '202501300003',
    status: 'shipping',
    statusText: '待收货',
    time: '2025-01-28 09:15',
    total: '199.00',
    items: [
      {
        name: '经典T恤',
        img: '/static/img/invitebg.png',
        price: '89.00',
        quantity: 2,
        spec: '颜色：白色 / 尺码：L',
      },
    ],
    actions: [
      { key: 'track', text: '查看物流', type: 'default' },
      { key: 'confirm', text: '确认收货', type: 'primary' },
    ],
  },
  {
    id: 'o4',
    no: '202501300004',
    status: 'completed',
    statusText: '已完成',
    time: '2025-01-27 14:20',
    total: '599.00',
    items: [
      {
        name: '休闲夹克外套',
        img: '/static/img/clock.png',
        price: '599.00',
        quantity: 1,
        spec: '颜色：卡其色 / 尺码：XL',
      },
    ],
    actions: [],
  },
]);

const currentOrders = computed(() => {
  return allOrders.value.filter((o) => o.status === activeTab.value);
});

function onBack() {
  uni.navigateBack();
}

function onTabClick(key: OrderStatus) {
  activeTab.value = key;
}

function onOrderClick(order: Order) {
  uni.showToast({ title: `查看订单：${order.no}`, icon: 'none' });
}

function onActionClick(order: Order, action: OrderAction) {
  const actionMap: Record<string, string> = {
    cancel: '取消订单',
    pay: '立即付款',
    contact: '联系客服',
    track: '查看物流',
    confirm: '确认收货',
  };
  uni.showToast({ title: `${actionMap[action.key]}（测试功能）`, icon: 'none' });
}
onLoad((options: any) => {
  const status = options.status;
  if (status) {
    activeTab.value = status as OrderStatus;
  }
});
</script>

<style lang="scss" scoped>
.order-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.order-header {
  background: linear-gradient(135deg, #ff6b9d, #ff8c9d);
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-back {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

.header-placeholder {
  width: 60rpx;
}

.order-tabs {
  background: #fff;
  border-bottom: 2rpx solid #f0f0f0;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-wrap {
  display: inline-flex;
  padding: 0 20rpx;
}

.tab-item {
  padding: 24rpx 32rpx;
  position: relative;
  display: inline-block;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
  transition: color 0.3s;
}

.tab-item--active .tab-text {
  color: #ff3e6c;
  font-weight: 500;
}

.tab-item--active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 32rpx;
  right: 32rpx;
  height: 4rpx;
  background: #ff3e6c;
  border-radius: 2rpx;
}

.order-content {
  flex: 1;
  padding: 20rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.order-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.order-no {
  font-size: 26rpx;
  color: #666;
}

.order-status {
  font-size: 28rpx;
  font-weight: 500;
}

.order-status--pending {
  color: #ff3e6c;
}

.order-status--paid {
  color: #ff9500;
}

.order-status--shipping {
  color: #2c7bff;
}

.order-status--receiving {
  color: #2c7bff;
}

.order-status--completed {
  color: #999;
}

.order-products {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.product-item {
  display: flex;
  gap: 20rpx;
}

.product-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-spec {
  margin-top: 8rpx;
}

.spec-text {
  font-size: 24rpx;
  color: #999;
}

.product-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12rpx;
}

.product-price {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff3e6c;
}

.product-quantity {
  font-size: 26rpx;
  color: #666;
}

.order-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rpx;
  border-top: 2rpx solid #f5f5f5;
  margin-bottom: 20rpx;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-total {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.total-label {
  font-size: 26rpx;
  color: #666;
}

.total-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff3e6c;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 20rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid #f5f5f5;
}

.action-btn {
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  border: 2rpx solid #e5e5e5;
  background: #fff;
  color: #666;
}

.action-btn--primary {
  background: #ff3e6c;
  color: #fff;
  border-color: #ff3e6c;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.empty-icon .icon {
  font-size: 160rpx;
  color: #ddd;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>
