<template>
    <view class="product-manage-page">
      <!-- 顶部商品类型 Tab（参考 shop.vue，一模一样的交互） -->
      <scroll-view class="nav-wrap" scroll-x>
        <view class="nav-inner">
          <view
            v-for="c in categories"
            :key="c.id"
            :class="['nav-item', activeCateId === c.id ? 'nav-item--active' : '']"
            @click="onCateClick(c)"
          >
            <text class="nav-text">{{ c.slug || c.name }}</text>
          </view>
        </view>
      </scroll-view>
  
      <!-- 顶部红色头部 -->
      <view class="header">
        <view class="header-back" @click="onBack">
          <uni-icons type="left" size="20" color="#ffffff" />
        </view>
        <view class="header-search">
          <uni-icons type="search" size="18" color="#c7c7c7" />
          <input
            class="search-input"
            placeholder="请输入商品名"
            v-model="keyword"
            @confirm="onSearch"
          />
        </view>
        <button class="header-search-btn" @click="onSearch">搜索</button>
      </view>
  
      <!-- 商品列表 -->
      <view class="product-list">
        <view
          v-for="product in products"
          :key="product.id"
          class="product-card"
        >
          <image class="product-img" :src="product.image" mode="aspectFill" />
          <view class="product-info">
            <text class="product-name breakcss">{{ product.name }}</text>
            <text class="product-stock">库存: {{ product.stock }}</text>
            <text class="product-price">批发价: ฿ {{ product.wholesale_price }}</text>
            <view class="product-actions">
              <button class="btn-listed" :class="{ 'btn-listed--active': product.is_selling }">
                {{ product.is_selling ? '已上架' : '未上架' }}
              </button>
              <button class="btn-add" @click="onAddClick(product)">add</button>
            </view>
          </view>
        </view>
  
        <!-- 加载更多提示 -->
        <view v-if="loading" class="loading-more">
          <text class="loading-text">加载中...</text>
        </view>
  
        <!-- 没有更多数据提示 -->
        <view v-if="!hasMore && products.length > 0" class="no-more">
          <text class="no-more-text">没有更多了</text>
        </view>
  
        <!-- 空状态 -->
        <view v-if="!products.length && !loading" class="empty">
          <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
          <text class="empty-text">暂无商品</text>
        </view>
      </view>
    </view>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { onReachBottom } from '@dcloudio/uni-app';
  import {  getShopCategories } from '@/api';
  import { getMyShopProductPool } from '@/api/myshop';
  import type { MyShopProductsParams } from '@/api';
  
  type Product = {
    id: number | string;
    name: string;
    image: string;
    stock: number;
    wholesale_price: number | string;
    is_selling: boolean;
  };
  
  const products = ref<Product[]>([]);
  const keyword = ref<string>('');
  
  type Category = {
    id: number;
    name?: string;
    slug?: string;
  };
  
  const categories = ref<Category[]>([]);
  const activeCateId = ref<number>(0);
  
  // 分页相关
  const page = ref<number>(1);
  const limit = ref<number>(15);
  const hasMore = ref<boolean>(true);
  const loading = ref<boolean>(false);
  
  // 加载商品列表
  async function loadProducts(reset: boolean = false) {
    if (loading.value) return;
    if (!hasMore.value && !reset) return;
  
    if (reset) {
      page.value = 1;
      hasMore.value = true;
      products.value = [];
    }
  
    loading.value = true;
    try {
      const params: MyShopProductsParams & { category_id?: number } = {
        page: page.value,
        limit: limit.value,
      };
  
      // 商品类型筛选（与 shop.vue 的 activeCateId 逻辑一致）
      if (activeCateId.value) {
        params.category_id = activeCateId.value;
      }
  
      // 如果有搜索关键词，添加到参数中
      if (keyword.value.trim()) {
        params.keyword = keyword.value.trim();
      }
  
      const res: any = await getMyShopProductPool(params);
      const data = res?.data || res || [];
      const productList = Array.isArray(data) ? data : (data.list || data.items || []);
  
      // 映射服务器返回的数据到前端需要的格式
      const newProducts = productList.map((item: any) => ({
        id: item.id || 0,
        name: item.name || item.title || '商品',
        image: item.images?.[0]?.url || item.image_url || item.image || '/static/img/empty.svg',
        stock: item.stock || item.stock_count || item.quantity || 0,
        wholesale_price: item.wholesale_price || item.price || 0,
        is_selling: item.is_selling !== undefined ? item.is_selling : item.status === 'selling',
      }));
  
      if (reset) {
        products.value = newProducts;
      } else {
        products.value = [...products.value, ...newProducts];
      }
  
      // 判断是否还有更多数据
      hasMore.value = newProducts.length >= limit.value;
      if (hasMore.value) {
        page.value += 1;
      }
    } catch (e) {
      console.error('加载商品列表失败', e);
      uni.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      loading.value = false;
    }
  }
  
  // 返回
  function onBack() {
    uni.navigateBack();
  }
  
  // 搜索
  function onSearch() {
    loadProducts(true);
  }
  
  // 商品类型切换（参考 shop.vue）
  function onCateClick(c: Category) {
    activeCateId.value = c.id;
    keyword.value = '';
    loadProducts(true);
  }
  
  // 添加按钮点击
  function onAddClick(product: Product) {
    uni.showToast({
      title: `操作商品：${product.name}`,
      icon: 'none',
    });
    // TODO: 实现添加/编辑商品功能
  }
  
  // 上拉加载更多
  onReachBottom(() => {
    if (!loading.value && hasMore.value) {
      loadProducts(false);
    }
  });
  
  // 页面加载
  onLoad(() => {
    // 先加载商品类型（参考 shop.vue 的处理方式）
    getShopCategories()
      .then((res: any) => {
        categories.value = res?.data || res || [];
        if (categories.value.length > 0) {
          activeCateId.value = categories.value[0].id;
        }
      })
      .catch((e) => {
        console.error('加载商品类型失败', e);
      })
      .finally(() => {
        loadProducts(true);
      });
  });
  </script>
  
  <style scoped lang="scss">
  .product-manage-page {
    min-height: 100vh;
    background: #f5f5f5;
  }
  
  .nav-wrap {
    position: fixed;
    top: 100rpx;
    left: 0;
    right: 0;
    background: #ffffff;
    height: 80rpx;
    box-shadow: 0 1rpx 0 rgba(0, 0, 0, 0.04);
    z-index: 110;
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
    color: #ff3e6c;
    font-weight: 600;
    border-bottom: 4rpx solid #ff3e6c;
    padding-bottom: 4rpx;
  }
  
  .header {
    position: fixed;
    top: 80rpx;
    left: 0;
    right: 0;
    height: 88rpx;
    background: #ff3e6c;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    z-index: 100;
  }
  
  .header-back {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .header-search {
    flex: 1;
    height: 64rpx;
    background: #ffffff;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    margin: 0 16rpx;
  }
  
  .search-input {
    margin-left: 12rpx;
    flex: 1;
    height: 64rpx;
    font-size: 26rpx;
    color: #333;
  }
  
  .header-search-btn {
    padding: 0 24rpx;
    height: 64rpx;
    line-height: 64rpx;
    background: #ffffff;
    color: #ff3e6c;
    font-size: 26rpx;
    border-radius: 32rpx;
    border: none;
  }
  
  .product-list {
    margin-top: 168rpx;
    padding: 16rpx;
  }
  
  .product-card {
    background: #ffffff;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;
    display: flex;
    align-items: center;
  }
  
  .product-img {
    width: 160rpx;
    height: 160rpx;
    border-radius: 12rpx;
    background: #f5f5f5;
    margin-right: 20rpx;
  }
  
  .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .product-name {
    font-size: 28rpx;
    color: #333;
    margin-bottom: 12rpx;
    line-height: 1.4;
  }
  
  .product-stock {
    font-size: 24rpx;
    color: #666;
    margin-bottom: 8rpx;
  }
  
  .product-price {
    font-size: 28rpx;
    font-weight: 700;
    color: #ff3e6c;
    margin-bottom: 16rpx;
  }
  
  .product-actions {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  
  .btn-listed {
    padding: 8rpx 24rpx;
    height: 56rpx;
    line-height: 40rpx;
    border-radius: 28rpx;
    background: #e0e0e0;
    color: #666;
    font-size: 24rpx;
    border: none;
  }
  
  .btn-listed--active {
    background: #4caf50;
    color: #ffffff;
  }
  
  .btn-add {
    padding: 8rpx 32rpx;
    height: 56rpx;
    line-height: 40rpx;
    border-radius: 28rpx;
    background: #ff9800;
    color: #ffffff;
    font-size: 24rpx;
    border: none;
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
  
  .empty {
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
  