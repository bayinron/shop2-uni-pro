<template>
  <view class="shop-list-page">
    <!-- 顶部类目导航（仿目标站顶部分类条） -->
    <scroll-view class="nav-wrap" scroll-x>
      <view class="nav-inner">
        <view
          v-for="c in categories"
          :key="c.id"
          :class="['nav-item', activeCateId === c.id ? 'nav-item--active' : '']"
          @click="onCateClick(c)"
        >
          <text class="nav-text">{{ c.slug }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 顶部搜索框 -->
    <view class="search-wrap">
      <view class="search-box">
        <uni-icons type="search" size="18" color="#c7c7c7" />
        <input
          class="search-input"
          :placeholder="placeholderText"
          confirm-type="search"
          v-model="keyword"
          @confirm="onSearchConfirm"
        />
      </view>
      <button class="search-btn" @click="onSearchClick">搜索</button>
    </view>

    <!-- 店铺列表 -->
    <view class="list-scroll">
      <view
        v-for="s in shops"
        :key="s.id"
        class="shop-card"
        @click="onShopClick(s)"
      >
        <view class="shop-card-inner">
          <image class="shop-logo" :src="s.logo || '/static/img/empty.svg'" mode="aspectFill" />
          <view class="shop-main">
            <text class="shop-name">{{ s.name }}</text>
            <text class="shop-sub">{{ s.description || s.tagline || '' }}</text>
          </view>
          <view class="shop-enter">
            <text class="enter-text">进入店铺</text>
            <text class="enter-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="loading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>

      <!-- 没有更多数据提示 -->
      <view v-if="!hasMore && shops.length > 0" class="no-more">
        <text class="no-more-text">没有更多了</text>
      </view>

      <!-- 空状态 -->
      <view v-if="!shops.length && !loading" class="empty">
        <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
        <text class="empty-text">暂无符合条件的店铺</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onReachBottom } from '@dcloudio/uni-app';
import { getShopCategories, getShopCategoryShops } from '@/api';


type Category = {
  id: number;
  name: string;
};

type ShopItem = {
  id: number;
  name: string;
  logo?: string | null;
  tagline?: string;
  description?: string | null;
  categoryId?: number;
};

const placeholderText = '请输入店铺名称';

const categories = ref<any[]>([
]);

const shops = ref<ShopItem[]>([]);

const activeCateId = ref<number>(1);
const keyword = ref<string>('');

// 分页相关
const page = ref<number>(1);
const limit = ref<number>(15);
const hasMore = ref<boolean>(true);
const loading = ref<boolean>(false);

// 加载店铺列表
async function loadShops(reset: boolean = false) {
  if (loading.value) return;
  if (!hasMore.value && !reset) return;

  if (reset) {
    page.value = 1;
    hasMore.value = true;
    shops.value = [];
  }

  loading.value = true;
  try {
    const res: any = await getShopCategoryShops({
      category_id: activeCateId.value,
      keyword: keyword.value.trim(),
      page: page.value,
      limit: limit.value,
    });

    const data = res?.data || res || [];
    const newShops = Array.isArray(data) ? data : (data.list || data.items || []);

    if (reset) {
      shops.value = newShops;
    } else {
      shops.value = [...shops.value, ...newShops];
    }

    // 判断是否还有更多数据
    hasMore.value = newShops.length >= limit.value;
    if (hasMore.value) {
      page.value += 1;
    }
  } catch (e) {
    console.error('加载店铺列表失败', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

// 分类切换
function onCateClick(c: Category) {
  activeCateId.value = c.id;
  keyword.value = ''; // 切换分类时清空搜索关键词
  loadShops(true);
}

// 搜索确认（回车）
function onSearchConfirm(e: any) {
  const value = (e?.detail?.value ?? '').trim();
  keyword.value = value;
  loadShops(true);
}

// 搜索按钮点击
function onSearchClick() {
  const value = keyword.value.trim();
  if (!value) {
    uni.showToast({ title: '请输入搜索关键词', icon: 'none' });
    return;
  }
  loadShops(true);
}

// 上拉加载更多（使用页面生命周期 onReachBottom）
onReachBottom(() => {
  if (!loading.value && hasMore.value) {
    loadShops(false);
}
});

function onShopClick(s: ShopItem) {
  uni.navigateTo({ url: `/pages/shop/home?id=${s.id}` });
}

onLoad(async () => {
  try {
    const res: any = await getShopCategories();
    categories.value = res?.data || res || [];
    if (categories.value.length > 0) {
      activeCateId.value = categories.value[0].id;
    }
    // 加载初始店铺列表
    loadShops(true);
  } catch (e) {
    console.error('加载分类失败', e);
  }
}); 
</script>

<style scoped lang="scss">
.shop-list-page {
  min-height: 100vh;
  background: #d9dbff; // 与首页保持一致的淡紫背景
  display: flex;
  flex-direction: column;
}

.nav-wrap {
  background: #ffffff;
  height: 80rpx;
  box-shadow: 0 1rpx 0 rgba(0, 0, 0, 0.04);
}

.nav-inner {
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.nav-item {
  margin-right: 30rpx;
  padding-bottom: 6rpx;
}

.nav-text {
  font-size: 26rpx;
  color: #555;
}

.nav-item--active .nav-text {
  color: #4e4bff;
  font-weight: 600;
  border-bottom: 4rpx solid #4e4bff;
  padding-bottom: 4rpx;
}

.search-wrap {
  padding: 14rpx 20rpx 10rpx;
  display: flex;
  align-items: center;
  background: #d9dbff;
}

.search-box {
  flex: 1;
  height: 72rpx;
  border-radius: 36rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
}

.search-input {
  margin-left: 10rpx;
  flex: 1;
  height: 72rpx;
  font-size: 26rpx;
  color: #333;
}

.search-btn {
  margin-left: 12rpx;
  padding: 0 28rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
  background: #ff3e6c;
  color: #fff;
  font-size: 26rpx;
  border: none;
}

.list-scroll {
  flex: 1;
  padding: 4rpx 16rpx 20rpx;
}

.shop-card {
  margin-top: 12rpx;
  background: #f0e9ff;
  border-radius: 18rpx;
  padding: 8rpx;
}

.shop-card-inner {
  background: #ffffff;
  border-radius: 14rpx;
  padding: 16rpx 16rpx 18rpx;
  display: flex;
  align-items: center;
}

.shop-logo {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
}

.shop-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 16rpx;
}

.shop-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #4e4bff;
}

.shop-sub {
  margin-top: 6rpx;
  font-size: 24rpx;
  color: #666;
}

.shop-enter {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.enter-text {
  font-size: 26rpx;
  color: #ff3e6c;
}

.enter-arrow {
  margin-left: 4rpx;
  font-size: 34rpx;
  color: #ff3e6c;
}

.empty {
  margin-top: 80rpx;
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

.loading-more {
  padding: 30rpx 0;
  text-align: center;
}

.loading-text {
  font-size: 26rpx;
  color: #999;
}

.no-more {
  padding: 30rpx 0;
  text-align: center;
}

.no-more-text {
  font-size: 24rpx;
  color: #ccc;
}
</style>

