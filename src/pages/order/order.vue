<template>
  <view class="order-page">


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
            <text class="order-no">{{ t('订单号：') }}{{ order.no }}</text>
            <text class="order-status" :class="`order-status--${order.status}`">
              {{ order.statusText }}
            </text>
          </view>

          <!-- 商品列表 -->
          <view class="order-products">
            <view v-for="(item, idx) in order.items" :key="idx" class="product-item">
              <image class="product-img" :src="orderItemImg(item.img)" mode="aspectFill" />
              <view class="product-info">
                <text class="product-name">{{ item.name }}</text>
                <view class="product-spec" v-if="item.spec">
                  <text class="spec-text">{{ item.spec }}</text>
                </view>
                <view class="product-price-row">
                  <text class="product-price">฿{{ item.price }}</text>
                  <text class="product-quantity">x{{ item.quantity }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 收货信息 -->
          <view class="order-address" v-if="order.receiverName || order.receiverPhone || order.fullAddress">
            <view class="address-header">
              <text class="address-name" v-if="order.receiverName">{{ order.receiverName }}</text>
              <text class="address-phone" v-if="order.receiverPhone">{{ order.receiverPhone }}</text>
            </view>
            <text class="address-detail" v-if="order.fullAddress">{{ order.fullAddress }}</text>
          </view>

          <!-- 订单底部 -->
          <view class="order-card-footer">
            <text class="order-time">{{ order.time }}</text>
            <view class="order-total">
              <text class="total-label">{{ t('合计：') }}</text>
              <text class="total-price">฿{{ order.total }}</text>
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
        <text class="empty-text">{{ t('暂无订单') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import {
  getMallOrderList,
  payMallOrder,
  cancelMallOrder,
  type MallOrderStatus,
  type MallOrder,
  type MallOrderListResponse,
} from '@/api/mall';
import { useUserStore } from '@/stores/modules/userStore';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const userStore = useUserStore();
const prefixUrl = computed(() => userStore.prefixUrl);
// 本页面展示用的订单状态子集
type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed';

type OrderItem = {
  name: string;
  img: string;
  price: string;
  quantity: number;
  spec?: string;
};

type OrderAction = {
  key: 'cancel' | 'pay' | 'contact' | 'track' | 'confirm';
  text: string;
  type: 'primary' | 'default';
};

type ViewOrder = {
  id: number;
  no: string;
  status: MallOrderStatus;
  statusText: string;
  time: string;
  total: string;
  receiverName: string;
  receiverPhone: string;
  fullAddress: string;
  items: OrderItem[];
  actions: OrderAction[];
  raw: MallOrder;
};

type StatusState = {
  list: ViewOrder[];
  page: number;
  hasMore: boolean;
  loading: boolean;
  loaded: boolean;
};

type StatusStateMap = Record<OrderStatus, StatusState>;

const orderTabs = computed(() => [
  { key: 'pending' as OrderStatus, text: t('待付款') },
  { key: 'paid' as OrderStatus, text: t('待发货') },
  { key: 'processing' as OrderStatus, text: t('待收货') },
  { key: 'completed' as OrderStatus, text: t('已完成') },
]);

const activeTab = ref<OrderStatus>('pending');
const PAGE_SIZE = 10;

const statusState = ref<StatusStateMap>({
  pending: { list: [], page: 0, hasMore: true, loading: false, loaded: false },
  paid: { list: [], page: 0, hasMore: true, loading: false, loaded: false },
  processing: { list: [], page: 0, hasMore: true, loading: false, loaded: false },
  completed: { list: [], page: 0, hasMore: true, loading: false, loaded: false },
});

const currentOrders = computed(() => {
  return statusState.value[activeTab.value].list;
});

function getStatusText(status: string) {
  const map: Record<string, string> = {
    pending: t('待付款'),
    paid: t('待发货'),
    processing: t('备货中'),
    shipped: t('已发货'),
    delivered: t('待确认'),
    completed: t('已完成'),
    cancelled: t('已取消'),
  };
  return map[status] || status || '';
}

function removeOrderFromState(status: OrderStatus, orderId: number) {
  const state = statusState.value[status];
  const idx = state.list.findIndex((o) => o.id === orderId);
  if (idx >= 0) state.list.splice(idx, 1);
}

function buildActions(order: MallOrder): OrderAction[] {
  const actions: OrderAction[] = [];
  if (order.status === 'pending') {
    actions.push(
      { key: 'cancel', text: t('取消订单'), type: 'default' },
      { key: 'pay', text: t('立即付款'), type: 'primary' },
    );
  } else if (order.status === 'paid' || order.status === 'processing') {
    actions.push({ key: 'contact', text: t('联系客服'), type: 'default' });
  } else if (order.status === 'shipped' || order.status === 'delivered') {
    actions.push(
      { key: 'track', text: t('查看物流'), type: 'default' },
      { key: 'confirm', text: t('确认收货'), type: 'primary' },
    );
  } else if (order.status === 'completed') {
    actions.push({ key: 'track', text: t('查看物流'), type: 'default' });
  }
  return actions;
}

function parseOrderList(res: any): MallOrder[] {
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.list)) return res.list;
  return [];
}

function orderItemImg(img?: string | null) {
  if (!img) return '/static/img/empty.svg';
  return String(img).startsWith('http') ? img : prefixUrl.value + img;
}

function normalizeOrder(order: MallOrder): ViewOrder {
  const items: OrderItem[] = (order.items || []).map((it) => ({
    name: it.product_name || t('商品'),
    img: it.product_image_url || it.product_image || '',
    price: it.total_price || it.unit_price || '0',
    quantity: it.quantity ?? 1,
    spec: it.sku || undefined,
  }));

  const statusText = getStatusText(order.status as string);
  const shippingAddress = order.shipping_address || {};
  const receiverName = order.receiver_name || shippingAddress?.receiver_name || '';
  const receiverPhone = order.receiver_phone || shippingAddress?.receiver_phone || '';
  const fullAddress = typeof shippingAddress === 'string'
    ? shippingAddress
    : (
      shippingAddress?.full_address
      || shippingAddress?.address
      || [shippingAddress?.province, shippingAddress?.city, shippingAddress?.district, shippingAddress?.detail]
        .filter(Boolean)
        .join('')
    );

  return {
    id: order.id,
    no: order.order_no,
    status: order.status,
    statusText,
    time: order.created_at,
    total: order.total_amount,
    receiverName,
    receiverPhone,
    fullAddress: fullAddress || '',
    items,
    actions: buildActions(order),
    raw: order,
  };
}

function onTabClick(key: OrderStatus) {
  activeTab.value = key;
  const state = statusState.value[key];
  if (!state.loaded) {
    loadOrders(key, false);
  }
}

function loadOrders(status: OrderStatus, loadMore: boolean) {
  const state = statusState.value[status];
  if (state.loading) return;

  const nextPage = loadMore ? state.page + 1 : 1;
  statusState.value = {
    ...statusState.value,
    [status]: { ...state, loading: true },
  };

  const params = {
    status,
    page: nextPage,
    limit: PAGE_SIZE,
  };

  getMallOrderList(params)
    .then((res: any) => {
      const list = parseOrderList(res);
      const viewList = list.map(normalizeOrder);
      const payload = res?.data ?? res;
      const pageLimit = (Array.isArray(payload) ? undefined : payload?.limit ?? payload?.per_page)
        ?? res?.limit
        ?? PAGE_SIZE;

      statusState.value = {
        ...statusState.value,
        [status]: {
          ...statusState.value[status],
          list: loadMore ? statusState.value[status].list.concat(viewList) : viewList,
          page: nextPage,
          hasMore: list.length >= pageLimit,
          loaded: true,
        },
      };
    })
    .catch((err) => {
      console.error(t('加载订单失败'), err);
    })
    .finally(() => {
      statusState.value = {
        ...statusState.value,
        [status]: {
          ...statusState.value[status],
          loading: false,
        },
      };
    });
}

onLoad((options: any) => {
  const status = (options.status as OrderStatus) || 'pending';
  if (orderTabs.value.some((t) => t.key === status)) {
    activeTab.value = status;
  } else {
    activeTab.value = 'pending';
  }
  loadOrders(activeTab.value, false);
});

onReachBottom(() => {
  const currentStatus = activeTab.value;
  const state = statusState.value[currentStatus];
  if (!state.hasMore || state.loading) return;
  loadOrders(currentStatus, true);
});

function onOrderClick(order: ViewOrder) {
  // uni.showToast({ title: `查看订单：${order.no}`, icon: 'none' });
}

function onActionClick(order: ViewOrder, action: OrderAction) {
  const actionMap: Record<OrderAction['key'], string> = {
    cancel: t('取消订单'),
    pay: t('立即付款'),
    contact: t('联系客服'),
    track: t('查看物流'),
    confirm: t('确认收货'),
  };

  if (action.key === 'cancel') {
    uni.showModal({
      title: t('提示'),
      content: t('确定要取消该订单吗？'),
      confirmText: t('确定'),
      cancelText: t('再想想'),
      success: async (r) => {
        if (!r.confirm) return;
        try {
          uni.showLoading({ title: t('取消中...') });
          await cancelMallOrder(order.id);
          uni.hideLoading();
          uni.showToast({ title: t('已取消'), icon: 'none' });
          // 本地直接移除，避免整页刷新
          removeOrderFromState(activeTab.value, order.id);
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: t('取消失败'), icon: 'none' });
        }
      },
    });
    return;
  }

  if (action.key === 'pay') {
    uni.showModal({
      title: t('确认付款'),
      content: `${t('确认使用钱包支付订单？')}\n${t('金额：')}฿${order.total}`,
      confirmText: t('付款'),
      cancelText: t('取消'),
      success: async (r) => {
        if (!r.confirm) return;
        try {
          uni.showLoading({ title: t('支付中...') });
          await payMallOrder(order.id, { payment_method: 'wallet' });
          uni.hideLoading();
          uni.showToast({ title: t('支付成功'), icon: 'none' });
          // 先从待付款列表移除，避免切回看到旧数据
          removeOrderFromState('pending', order.id);
          // 自动跳到「待发货/已付款」并刷新
          activeTab.value = 'paid';
          loadOrders('paid', false);
        } catch (e) {
          uni.hideLoading();
          uni.showToast({ title: t('支付失败'), icon: 'none' });
        }
      },
    });
    return;
  }

  uni.showToast({ title: `${actionMap[action.key]}${t('（测试功能）')}`, icon: 'none' });
}
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
  width: 100%;
}

.tab-item {
  padding: 24rpx 32rpx;
  box-sizing: border-box;
  width:25%;
  position: relative;
  display: inline-block;
  text-align: center;
}

.tab-text {
  font-size: 28rpx;
  color: #666;
  transition: color 0.3s;
  text-align: center;
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

.order-address {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 18rpx 20rpx;
  margin-bottom: 24rpx;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.address-name {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.address-phone {
  font-size: 24rpx;
  color: #666;
}

.address-detail {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
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
  padding: 0rpx 32rpx;
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
