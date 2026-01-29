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
            <image class="product-img" :src="p.img" mode="aspectFill" />
            <view class="product-body">
              <text class="product-title breakcss">{{ p.title }}</text>
              <view class="product-row">
                <text class="product-price">￥{{ p.price }}</text>
                <text class="product-sales">已售 {{ p.sold }} 件</text>
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
  { id: 1, name: '热门推荐' },
  { id: 2, name: '手机数码' },
  { id: 3, name: '家用电器' },
  { id: 4, name: '美妆个护' },
  { id: 5, name: '服饰鞋包' },
  { id: 6, name: '家居家装' },
  { id: 7, name: '电脑办公' },
  { id: 8, name: '运动户外' },
]);

// 测试商品数据（简单模拟几类）
const allProducts = ref<Product[]>([
  {
    id: 'p1',
    cateId: 1,
    title: '爆款蓝牙耳机',
    price: 199,
    img: '/static/img/clock.png',
    sold: 325,
  },
  {
    id: 'p2',
    cateId: 1,
    title: '夏季人气T恤',
    price: 89,
    img: '/static/img/profit.png',
    sold: 612,
  },
  {
    id: 'p3',
    cateId: 2,
    title: '5G 智能手机 128G',
    price: 2699,
    img: '/static/img/invitebg.png',
    sold: 128,
  },
  {
    id: 'p4',
    cateId: 2,
    title: '平板电脑 学习娱乐两用',
    price: 1499,
    img: '/static/img/money-bag.png',
    sold: 85,
  },
  {
    id: 'p5',
    cateId: 3,
    title: '智能扫地机器人',
    price: 899,
    img: '/static/img/clock.png',
    sold: 54,
  },
  {
    id: 'p6',
    cateId: 4,
    title: '补水保湿面膜 10片',
    price: 59,
    img: '/static/img/profit.png',
    sold: 412,
  },
  {
    id: 'p7',
    cateId: 5,
    title: '百搭运动鞋',
    price: 239,
    img: '/static/img/money-bag.png',
    sold: 203,
  },
  {
    id: 'p8',
    cateId: 6,
    title: '北欧风客厅地毯',
    price: 329,
    img: '/static/img/invitebg.png',
    sold: 67,
  },
  {
    id: 'p9',
    cateId: 7,
    title: '机械键盘 青轴',
    price: 299,
    img: '/static/img/clock.png',
    sold: 188,
  },
  {
    id: 'p10',
    cateId: 8,
    title: '户外登山背包 40L',
    price: 199,
    img: '/static/img/profit.png',
    sold: 42,
  },
]);

const activeCateId = ref<number>(categories.value[0]?.id || 1);

const activeCateName = computed(() => {
  return categories.value.find((c) => c.id === activeCateId.value)?.name || '';
});

const currentProducts = computed(() =>
  allProducts.value.filter((p) => p.cateId === activeCateId.value),
);

function onCateClick(c: Category) {
  activeCateId.value = c.id;
}

function onSearchConfirm(e: any) {
  const value = (e?.detail?.value ?? '').trim();
  if (!value) return;
  uni.showToast({ title: `搜索：${value}`, icon: 'none' });
}

function onProductClick(p: Product) {
  uni.showToast({ title: String(p.title), icon: 'none' });
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

