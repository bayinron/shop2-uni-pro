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
          <text class="nav-text">{{ c.name }}</text>
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
    <scroll-view class="list-scroll" scroll-y>
      <view
        v-for="s in filteredShops"
        :key="s.id"
        class="shop-card"
        @click="onShopClick(s)"
      >
        <view class="shop-card-inner">
          <image class="shop-logo" :src="s.logo" mode="aspectFill" />
          <view class="shop-main">
            <text class="shop-name">{{ s.name }}</text>
            <text class="shop-sub">{{ s.tagline }}</text>
          </view>
          <view class="shop-enter">
            <text class="enter-text">进入店铺</text>
            <text class="enter-arrow">›</text>
          </view>
        </view>
      </view>

      <view v-if="!filteredShops.length" class="empty">
        <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
        <text class="empty-text">暂无符合条件的店铺</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type Category = {
  id: number;
  name: string;
};

type ShopItem = {
  id: number;
  name: string;
  logo: string;
  tagline: string;
  categoryId: number;
};

const placeholderText = '请输入店铺名称';

const categories = ref<Category[]>([
  { id: 1, name: '推荐' },
  { id: 2, name: '服饰鞋包' },
  { id: 3, name: '家居日用' },
  { id: 4, name: '美妆个护' },
  { id: 5, name: '数码电器' },
  { id: 6, name: '母婴玩具' },
  { id: 7, name: '食品饮料' },
]);

const shops = ref<ShopItem[]>([
  {
    id: 1,
    name: '小幸旗舰店',
    logo: '/static/img/invitebg.png',
    tagline: '主营：服饰 / 鞋靴 / 箱包配件',
    categoryId: 2,
  },
  {
    id: 2,
    name: '暖心生活馆',
    logo: '/static/img/clock.png',
    tagline: '主营：家居日用 / 清洁收纳',
    categoryId: 3,
  },
  {
    id: 3,
    name: '美丽研究所',
    logo: '/static/img/profit.png',
    tagline: '主营：美妆护肤 / 个护清洁',
    categoryId: 4,
  },
  {
    id: 4,
    name: '数码优选店',
    logo: '/static/img/money-bag.png',
    tagline: '主营：手机配件 / 智能设备',
    categoryId: 5,
  },
  {
    id: 5,
    name: '萌宝母婴馆',
    logo: '/static/img/clock.png',
    tagline: '主营：母婴用品 / 玩具图书',
    categoryId: 6,
  },
  {
    id: 6,
    name: '零食派对屋',
    logo: '/static/img/profit.png',
    tagline: '主营：休闲零食 / 饮料冲调',
    categoryId: 7,
  },
]);

const activeCateId = ref<number>(1);
const keyword = ref<string>('');

const filteredShops = computed(() => {
  return shops.value.filter((s) => {
    const matchCate = activeCateId.value === 1 || s.categoryId === activeCateId.value;
    const kw = keyword.value.trim();
    const matchKeyword = !kw || s.name.includes(kw) || s.tagline.includes(kw);
    return matchCate && matchKeyword;
  });
});

function onCateClick(c: Category) {
  activeCateId.value = c.id;
}

function onSearchConfirm(e: any) {
  const value = (e?.detail?.value ?? '').trim();
  keyword.value = value;
  if (!value) return;
  uni.showToast({ title: `搜索店铺：${value}`, icon: 'none' });
}

function onSearchClick() {
  const value = keyword.value.trim();
  if (!value) return;
  uni.showToast({ title: `搜索店铺：${value}`, icon: 'none' });
}

function onShopClick(s: ShopItem) {
  uni.showToast({ title: `进入店铺：${s.name}（测试数据）`, icon: 'none' });
}
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
</style>

