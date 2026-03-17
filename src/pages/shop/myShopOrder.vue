<template>
  <view class="seller-orders-page">
    <!-- 顶部筛选 -->
    <view class="filter-bar">
      <scroll-view class="tabs-scroll" scroll-x>
        <view class="tabs-wrap">
          <view
            v-for="t in tabs"
            :key="t.key"
            class="tab-item"
            :class="{ 'tab-item--active': activeStatus === t.key }"
            @click="onTabClick(t.key)"
          >
            <text class="tab-text">{{ t.text }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="search-row">
        <input
          class="search-input"
          v-model="orderNo"
          placeholder="搜索订单号"
          confirm-type="search"
          @confirm="onSearch"
        />
        <button class="search-btn" @click="onSearch">搜索</button>
      </view>
    </view>

    <!-- 列表 -->
    <view class="order-content">
      <view v-if="list.length > 0" class="order-list">
        <view v-for="o in list" :key="o.id" class="order-card">
          <view class="order-card-header">
            <text class="order-no">订单号：{{ o.order_no }}</text>
            <text class="order-status" :class="`order-status--${o.status}`">
              {{ statusText(o.status) }}
            </text>
          </view>

          <view class="buyer-row">
            <text class="buyer-label">买家：</text>
            <text class="buyer-name">{{ o.buyer?.nickname || o.buyer?.username || '-' }}</text>
          </view>

          <view class="order-products">
            <view v-for="it in o.items" :key="it.id" class="product-item">
              <image class="product-img" :src="it.product_image_url" mode="aspectFill" />
              <view class="product-info">
                <text class="product-name">{{ it.product_name }}</text>
                <text class="product-spec" v-if="it.sku">{{ it.sku }}</text>
                <view class="product-price-row">
                  <text class="product-price">￥{{ it.unit_price }}</text>
                  <text class="product-quantity">x{{ it.quantity }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="order-card-footer">
            <text class="order-time">{{ o.created_at }}</text>
            <view class="order-total">
              <text class="total-label">合计：</text>
              <text class="total-price">￥{{ o.total_amount }}</text>
            </view>
          </view>
        </view>

        <view class="list-footer">
          <text v-if="loading">加载中...</text>
          <text v-else-if="!hasMore">没有更多了</text>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-text">{{ loading ? '加载中...' : '暂无订单' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { getMyShopOrders, type MyShopOrder, type MyShopOrderListResponse } from '@/api/myshop';

type StatusTabKey = '' | 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

const tabs = ref<Array<{ key: StatusTabKey; text: string }>>([
  { key: '', text: '全部' },
  { key: 'pending', text: '待付款' },
  { key: 'paid', text: '待发货' },
  { key: 'processing', text: '备货中' },
  { key: 'shipped', text: '已发货' },
  { key: 'completed', text: '已完成' },
  { key: 'cancelled', text: '已取消' },
]);

const activeStatus = ref<StatusTabKey>('');
const orderNo = ref('');

const PAGE_SIZE = 10;
const page = ref(0);
const hasMore = ref(true);
const loading = ref(false);
const list = ref<MyShopOrder[]>([]);

const statusTextMap: Record<string, string> = {
  pending: '待付款',
  paid: '待发货',
  processing: '备货中',
  shipped: '已发货',
  delivered: '待确认',
  completed: '已完成',
  cancelled: '已取消',
};

function statusText(status: string) {
  return statusTextMap[status] || status || '-';
}

function parseResponse(res: any): MyShopOrderListResponse {
  // 兼容不同包裹：res.data.data / res.data / res
  return (res?.data?.data ?? res?.data ?? res) as MyShopOrderListResponse;
}

function resetAndLoad() {
  page.value = 0;
  hasMore.value = true;
  list.value = [];
  loadMore();
}

function onTabClick(key: StatusTabKey) {
  activeStatus.value = key;
  resetAndLoad();
}

function onSearch() {
  resetAndLoad();
}

function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;

  const nextPage = page.value + 1;
  getMyShopOrders({
    status: activeStatus.value || undefined,
    order_no: orderNo.value.trim() || undefined,
    page: nextPage,
    limit: PAGE_SIZE,
  })
    .then((res: any) => {
      const data = parseResponse(res);
      const items = data?.list || [];
      list.value = list.value.concat(items);
      page.value = nextPage;
      const limit = data?.limit ?? PAGE_SIZE;
      hasMore.value = items.length >= limit;
    })
    .finally(() => {
      loading.value = false;
    });
}

onLoad((options: any) => {
  if (options?.status) {
    activeStatus.value = options.status as StatusTabKey;
  }
  resetAndLoad();
});

onReachBottom(() => {
  loadMore();
});
</script>

<style scoped lang="scss">
.seller-orders-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  background: #fff;
  padding: 16rpx 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs-wrap {
  display: inline-flex;
  gap: 18rpx;
  padding-bottom: 12rpx;
}

.tab-item {
  padding: 12rpx 20rpx;
  border-radius: 999rpx;
  background: #f6f6f6;
}

.tab-item--active {
  background: #ff3e6c;
}

.tab-text {
  font-size: 26rpx;
  color: #666;
}

.tab-item--active .tab-text {
  color: #fff;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 12rpx;
}

.search-input {
  flex: 1;
  height: 70rpx;
  background: #f7f7f7;
  border-radius: 12rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
}

.search-btn {
  height: 70rpx;
  line-height: 70rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  background: #ff3e6c;
  color: #fff;
  font-size: 26rpx;
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
  border-radius: 18rpx;
  padding: 24rpx;
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.order-no {
  font-size: 26rpx;
  color: #666;
}

.order-status {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff3e6c;
}

.buyer-row {
  margin-top: 16rpx;
  display: flex;
  align-items: center;
}

.buyer-label {
  font-size: 26rpx;
  color: #999;
}

.buyer-name {
  font-size: 26rpx;
  color: #333;
}

.order-products {
  margin-top: 18rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.product-item {
  display: flex;
  gap: 16rpx;
}

.product-img {
  width: 140rpx;
  height: 140rpx;
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
  line-height: 1.4;
}

.product-spec {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

.product-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}

.product-price {
  font-size: 28rpx;
  color: #ff3e6c;
  font-weight: 700;
}

.product-quantity {
  font-size: 26rpx;
  color: #666;
}

.order-card-footer {
  margin-top: 18rpx;
  padding-top: 16rpx;
  border-top: 2rpx solid #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-total {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.total-label {
  font-size: 26rpx;
  color: #666;
}

.total-price {
  font-size: 32rpx;
  color: #ff3e6c;
  font-weight: 700;
}

.list-footer {
  padding: 20rpx 0;
  text-align: center;
  color: #999;
  font-size: 24rpx;
}

.empty-state {
  padding: 160rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}
</style>

