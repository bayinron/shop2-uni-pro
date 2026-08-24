<template>
  <view class="seller-orders-page">
    <!-- 订单状态标签页 -->
    <view class="order-tabs">
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
    </view>

    <!-- 搜索 -->
    <!-- <view class="filter-bar">
      <view class="search-row">
        <input
          class="search-input"
          v-model="orderNo"
          :placeholder="t('搜索订单号')"
          confirm-type="search"
          @confirm="onSearch"
        />
        <button class="search-btn" @click="onSearch">{{ t('搜索') }}</button>
      </view>
    </view> -->

    <!-- 列表 -->
    <view class="order-content">
      <view v-if="list.length > 0" class="order-list">
        <view v-for="o in list" :key="o.id" class="order-card">
          <view class="order-card-header">
            <text class="order-no">{{ t('订单号：') }}{{ o.order_no }}</text>
            <text class="order-status" :class="`order-status--${o.status}`">
              {{ statusText(o.status) }}
            </text>
          </view>

          <!-- <view class="buyer-row">
            <text class="buyer-label">{{ t('买家：') }}</text>
            <text class="buyer-name">{{ o.buyer?.nickname || o.buyer?.username || '-' }}</text>
          </view> -->

          <view class="order-products">
            <view v-for="it in o.items" :key="it.id" class="product-item">
              <image class="product-img" :src="prefixUrl + it.product_image_url" mode="aspectFill" />
              <view class="product-info">
                <text class="product-name">{{ it.product_name }}</text>
                <text class="product-spec" v-if="it.sku">{{ it.sku }}</text>
                <view class="product-price-row">
                  <text class="product-price">฿{{ it.unit_price }}</text>
                  <text class="product-quantity">x{{ it.quantity }}</text>
                </view>
              </view>
            </view>
          </view>

          <view class="order-card-footer">
            <text class="order-time">{{ o.created_at }}</text>
            <view class="order-total">
              <text class="total-label">{{ t('合计：') }}</text>
              <text class="total-price">฿{{ o.total_amount }}</text>
            </view>
          </view>

          <view class="order-actions" v-if="activeStatus === 'paid' || o.status === 'paid'">
            <view class="action-btn action-btn--primary" @click.stop="onConfirmShip(o)">
              <text class="action-btn-text">{{ t('确认发送') }}</text>
            </view>
          </view>
        </view>

        <view class="list-footer">
          <text v-if="loading">{{ t('加载中...') }}</text>
          <text v-else-if="!hasMore">{{ t('没有更多了') }}</text>
        </view>
      </view>

      <view v-else class="empty-state">
        <text class="empty-text">{{ loading ? t('加载中...') : t('暂无订单') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { getMyShopOrders, type MyShopOrder, type MyShopOrderListResponse } from '@/api/myshop';
import { shipMyShopOrder } from '@/api/pay';
import { useUserStore } from '@/stores/modules/userStore';

import { useI18n } from '@/utils/i18n';
const userStore = useUserStore();
const prefixUrl = computed(() => userStore.prefixUrl);
const { t } = useI18n();
type StatusTabKey = '' | 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

const tabs = computed(() => [
  // { key: '' as StatusTabKey, text: t('全部') },
  { key: 'pending' as StatusTabKey, text: t('待付款') },
  { key: 'paid' as StatusTabKey, text: t('待发货') },
  // { key: 'processing' as StatusTabKey, text: t('备货中') },
  { key: 'shipped' as StatusTabKey, text: t('待收货') },
  { key: 'completed' as StatusTabKey, text: t('已完成') },
  // { key: 'cancelled' as StatusTabKey, text: t('已取消') },
]);

const activeStatus = ref<StatusTabKey>('pending');
const orderNo = ref('');

const PAGE_SIZE = 10;
const page = ref(0);
const hasMore = ref(true);
const loading = ref(false);
const shipping = ref(false);
const list = ref<MyShopOrder[]>([]);

function statusText(status: string) {
  const map: Record<string, string> = {
    pending: t('待付款'),
    paid: t('待发货'),
    processing: t('备货中'),
    shipped: t('待收货'),
    delivered: t('待确认'),
    completed: t('已完成'),
    cancelled: t('已取消'),
  };
  return map[status] || status || '-';
}

function parseResponse(res: any): MyShopOrderListResponse {
  // http 返回 { code, message, data }，分页字段在 data 内：data.data 为订单列表
  return (res?.data ?? res) as MyShopOrderListResponse;
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

function onConfirmShip(order: MyShopOrder) {
  if (shipping.value || !order?.id) return;
  shipping.value = true;
  shipMyShopOrder(order.id)
    .then(() => {
      uni.showToast({ title: t('操作成功'), icon: 'none' });
      onTabClick('shipped');
    })
    .catch(() => {
      uni.showToast({ title: t('操作失败'), icon: 'none' });
    })
    .finally(() => {
      shipping.value = false;
    });
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
      const items = Array.isArray(data?.data) ? data.data : [];
      list.value = list.value.concat(items);
      page.value = nextPage;
      hasMore.value =
        typeof data?.has_more === 'boolean'
          ? data.has_more
          : items.length >= (data?.per_page ?? PAGE_SIZE);
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

.order-tabs {
  background: #fff;
  border-bottom: 2rpx solid #f0f0f0;
}

.tabs-scroll {
  white-space: nowrap;
  width: 100%;
}

.tabs-wrap {
  display: flex;
  width: 100%;
}

.tab-item {
  flex: 1;
  padding: 24rpx 0;
  box-sizing: border-box;
  position: relative;
  text-align: center;
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
  left: 50%;
  transform: translateX(-50%);
  width: 48rpx;
  height: 4rpx;
  background: #ff3e6c;
  border-radius: 2rpx;
}

.filter-bar {
  background: #fff;
  padding: 16rpx 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
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

.order-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20rpx;
  padding-top: 20rpx;
  margin-top: 18rpx;
  border-top: 2rpx solid #f5f5f5;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56rpx;
  padding: 0 32rpx;
  border-radius: 40rpx;
  border: 2rpx solid #e5e5e5;
  background: #fff;
  box-sizing: border-box;
}

.action-btn--primary {
  background: #ff3e6c;
  border-color: #ff3e6c;
}

.action-btn-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1;
}

.action-btn--primary .action-btn-text {
  color: #fff;
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

