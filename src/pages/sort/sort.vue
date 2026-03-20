<template>
  <view class="sort-page">
    <!-- 顶部搜索栏 -->
    <view class="topbar">
      <view class="search">
        <uni-icons type="search" size="18" color="#c7c7c7" />
        <input
          class="search-input"
          :placeholder="placeholderText"
          confirm-type="search"
          @confirm="onSearchConfirm"
        />
      </view>
    </view>

    <view class="content">
      <!-- 左侧分类列表 -->
      <scroll-view class="cate-left" scroll-y>
        <view
          v-for="c in categories"
          :key="c.id"
          :class="['cate-item', activeCateId === c.id ? 'cate-item--active' : '']"
          @click="onCateClick(c)"
        >
          <text class="cate-text">{{ c.name }}</text>
        </view>
      </scroll-view>

      <!-- 右侧商品列表 -->
      <scroll-view class="cate-right" scroll-y>
        <view class="right-header">
          <text class="right-title">{{ activeCateName }}</text>
          <text class="right-sub">共 {{ currentProducts.length }} 件商品</text>
        </view>

        <view class="product-grid" v-if="currentProducts.length">
          <view
            class="product-card"
            v-for="p in currentProducts"
            :key="p.id"
            @click="onProductClick(p)"
          >
            <image
              class="product-img"
              :src="p.product?.images?.[0]?.url || p.product?.cover_image || '/static/img/empty.svg'"
              mode="aspectFill"
            />
            <view class="product-body">
              <text class="product-title breakcss">{{ p.product?.name || p.name }}</text>
              <view class="product-row">
                <text class="product-price">￥{{ p.product?.sale_price || p.actual_price || 0 }}</text>
                <text class="product-sales">已售 {{ p.sold_count || p.display_sold_count || 0 }} 件</text>
              </view>
            </view>
          </view>
        </view>

        <view class="empty" v-else>
          <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
          <text class="empty-text">该分类下暂无商品</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getCategoryTree, getMallProductList } from '@/api';
import { useUserStore } from '@/stores/modules/userStore';

const userStore = useUserStore();
const url = computed(() => userStore.url);
console.log(url);
onLoad(() => {
  getCategoryTree().then((res: any) => {
    categories.value = res.data;
    if(res.data.length > 0){
      activeCateId.value = res.data[0].id;
      onCateClick(res.data[0]);
    }
  });
});

const placeholderText = '请输入产品名称';

type Category = {
  id: number;
  name: string;
};

type Product = {
  id: string | number;
  cateId: number;
  title: string;
  price: string | number;
  img: string;
  sold: number;
};

// 测试分类数据
const categories = ref<Category[]>([

]);


const activeCateId = ref<number>(categories.value[0]?.id || 1);

const activeCateName = computed(() => {
  return categories.value.find((c) => c.id === activeCateId.value)?.name || '';
});

const currentProducts = ref<any[]>([]);
const searchKeyword = ref('');

function parseProductList(res: any): any[] {
  // 兼容 request.ts / 后端包裹：res.data.data / res.data / res
  const data = res?.data?.data ?? res?.data ?? res ?? {};
  if (Array.isArray(data?.list)) return data.list;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function loadProducts() {
  const params: any = {
    category_id: activeCateId.value,
    page: 1,
    limit: 50,
  };
  if (searchKeyword.value.trim()) params.keyword = searchKeyword.value.trim();

  getMallProductList(params).then((res: any) => {
    currentProducts.value = parseProductList(res);
  });
}

function onCateClick(c: Category) {
  activeCateId.value = c.id;
  searchKeyword.value = '';
  loadProducts();
}

function onSearchConfirm(e: any) {
  const value = (e?.detail?.value ?? '').trim();
  if (!value) return;
  searchKeyword.value = value;
  loadProducts();
}

function onProductClick(p: Product) {
  const pid = (p as any)?.product?.id ?? (p as any)?.product_id ?? (p as any)?.id;
  uni.navigateTo({
    url: '/pages/goodsDetail/goodsDetail?id=' + pid
  });
}
</script>

<style scoped lang="scss">
.sort-page {
  min-height: 100vh;
  background: #f6f7fb;
  display: flex;
  flex-direction: column;
}

.topbar {
  padding: 18rpx 20rpx 12rpx;
  background: #ffffff;
}

.search {
  height: 72rpx;
  border-radius: 36rpx;
  background: #f5f5f5;
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

.content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.cate-left {
  width: 220rpx;
  background: #f5f6fa;
}

.cate-item {
  height: 96rpx;
  padding: 0 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #555;
}

.cate-item--active {
  background: #ffffff;
  position: relative;
  font-weight: 600;
  color: #ff3e6c;
}

.cate-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20rpx;
  bottom: 20rpx;
  width: 6rpx;
  border-radius: 0 4rpx 4rpx 0;
  background: #ff3e6c;
}

.cate-text {
  text-align: center;
}

.cate-right {
  flex: 1;
  background: #ffffff;
  padding: 12rpx 16rpx 16rpx;
}

.right-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 4rpx 12rpx;
}

.right-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.right-sub {
  font-size: 24rpx;
  color: #999;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18rpx;
}

.product-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.04);
}

.product-img {
  width: 100%;
  height: 260rpx;
  background: #f5f5f5;
}

.product-body {
  padding: 12rpx 12rpx 16rpx;
}

.product-title {
  font-size: 26rpx;
  color: #333;
}

.product-row {
  margin-top: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff3e6c;
}

.product-sales {
  font-size: 22rpx;
  color: #999;
}

.empty {
  padding-top: 80rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 26rpx;
}
</style>

