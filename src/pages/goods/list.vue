<template>
  <view class="goods-list-page">
    <!-- 顶部搜索 -->
    <view class="topbar">
      <view class="search">
        <uni-icons type="search" size="18" color="#c7c7c7" />
        <input
          class="search-input"
          v-model="keyword"
          placeholder="请输入产品名称"
          confirm-type="search"
          @confirm="onSearchConfirm"
        />
      </view>
    </view>

    <!-- 商品列表（样式复用首页） -->
    <view class="list-wrap">
      <view class="card" v-for="p in products" :key="p.id" @click="onProductClick(p)">
        <image class="card-img" :src="productCover(p)" mode="aspectFill" />
        <view class="card-body">
          <text class="card-title breakcss">{{ productName(p) }}</text>
          <view class="card-row">
            <text class="price">￥ {{ productPrice(p) }}</text>
            <view class="buy-btn">购买</view>
          </view>
        </view>
      </view>
    </view>

    <view class="footer">
      <text v-if="loading">加载中...</text>
      <text v-else-if="!hasMore">没有更多了</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';
import { getMallProductList } from '@/api';

type ProductListItem = any; // 兼容后端返回字段差异

const keyword = ref('');
const products = ref<ProductListItem[]>([]);
const page = ref(0);
const limit = 20;
const hasMore = ref(true);
const loading = ref(false);

function parseList(res: any): { list: ProductListItem[]; limit?: number } {
  // 兼容：request.ts 可能返回 res.data / res.data.data / res
  const data = res?.data?.data ?? res?.data ?? res ?? {};
  // mall.ts 新结构：{ list, total, page, limit }
  if (Array.isArray(data?.list)) return { list: data.list, limit: data.limit };
  // 老结构：直接数组
  if (Array.isArray(data)) return { list: data, limit };
  // 兜底：data.data 里是数组
  if (Array.isArray(data?.data)) return { list: data.data, limit: data.limit };
  return { list: [], limit: data?.limit ?? limit };
}

function resetAndLoad() {
  page.value = 0;
  hasMore.value = true;
  products.value = [];
  loadMore();
}

function onSearchConfirm() {
  const v = keyword.value.trim();
  if (!v) return;
  resetAndLoad();
}

function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  const nextPage = page.value + 1;
  getMallProductList({ keyword: keyword.value.trim(), page: nextPage, limit })
    .then((res: any) => {
      const { list, limit: resLimit } = parseList(res);
      products.value = products.value.concat(list || []);
      page.value = nextPage;
      const pageSize = resLimit ?? limit;
      hasMore.value = (list || []).length >= pageSize;
    })
    .finally(() => {
      loading.value = false;
    });
}

function productName(p: any) {
  return p?.product?.name ?? p?.name ?? '商品';
}

function productCover(p: any) {
  return (
    p?.product?.cover_image ??
    p?.product?.images?.[0]?.url ??
    p?.cover_image ??
    '/static/img/empty.svg'
  );
}

function productPrice(p: any) {
  return p?.product?.sale_price ?? p?.actual_price ?? p?.sale_price ?? 0;
}

function onProductClick(p: any) {
  const pid = p?.product?.id ?? p?.product_id ?? p?.id;
  uni.navigateTo({
    url: '/pages/goodsDetail/goodsDetail?id=' + pid,
  });
}

onLoad((options: any) => {
  keyword.value = decodeURIComponent(options?.keyword || options?.q || '') || '';
  if (keyword.value.trim()) {
    resetAndLoad();
  }
});

onReachBottom(() => loadMore());
</script>

<style scoped lang="scss">
.goods-list-page {
  min-height: 100vh;
  background: #d9dbff;
}

.topbar {
  padding: 18rpx 20rpx 16rpx;
  background: linear-gradient(90deg, #ff3e6c, #ff5a7d);
}

.search {
  height: 72rpx;
  border-radius: 36rpx;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 22rpx;
}

.search-input {
  margin-left: 14rpx;
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
  color: #333;
}

.list-wrap {
  padding: 18rpx 20rpx 28rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.card {
  background: #fff;
  border-radius: 18rpx;
  overflow: hidden;
}

.card-img {
  width: 100%;
  height: 340rpx;
  background: #f6f6f6;
}

.card-body {
  padding: 14rpx 14rpx 16rpx;
}

.card-title {
  font-size: 26rpx;
  color: #2c2c2c;
}

.card-row {
  margin-top: 10rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff3e6c;
}

.buy-btn {
  background: #ff3e6c;
  color: #fff;
  font-size: 24rpx;
  padding: 10rpx 18rpx;
  border-radius: 18rpx;
}

.footer {
  padding: 16rpx 0 28rpx;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}
</style>

