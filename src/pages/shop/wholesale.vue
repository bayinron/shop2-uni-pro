<template>
    <view class="product-manage-page">
      <!-- 顶部固定区域：Tab + 搜索框放在一起，顶置在顶部 -->
      <view class="top-bar">
        <!-- 商品类型 Tab（参考 shop.vue，一模一样的交互） -->
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

        <!-- 搜索栏 -->
        <view class="header">
          <!-- <view class="header-back" @click="onBack">
            <uni-icons type="left" size="20" color="#ffffff" />
          </view> -->
          <view class="header-search">
            <uni-icons type="search" size="18" color="#c7c7c7" />
            <input
              class="search-input"
              :placeholder="t('请输入商品名')"
              v-model="keyword"
              @confirm="onSearch"
            />
          </view>
          <button class="header-search-btn" @click="onSearch">{{ t('搜索') }}</button>
        </view>
      </view>
  
      <!-- 商品列表（两列卡片） -->
      <view class="product-list">
        <view class="grid">
          <view
            v-for="product in products"
            :key="product.id"
            class="grid-item"
          >
            <view class="card">
              <image class="card-img" :src="prefixUrl + product.cover_image" mode="aspectFill" />
              <view class="card-body">
                <text class="card-title breakcss">{{ product.name }}</text>
                <text class="card-stock">{{ t('库存：') }}{{ product.stock }}</text>
                <view class="card-bottom">
                  <text class="card-price">฿{{ formatPrice(product.displayPrice) }}</text>
                  <button
                    v-if="product.in_my_shop"
                    class="card-btn card-btn--listed"
                    disabled
                  >
                    {{ t('已上架') }}
                  </button>
                  <button
                    v-else
                    class="card-btn card-btn--ship"
                    @click="openShipSheet(product)"
                  >
                    {{ t('一键铺货') }}
                  </button>
                </view>
              </view>
            </view>
          </view>
        </view>
  
        <!-- 加载更多提示 -->
        <view v-if="loading" class="loading-more">
          <text class="loading-text">{{ t('加载中...') }}</text>
        </view>
  
        <!-- 没有更多数据提示 -->
        <view v-if="!hasMore && products.length > 0" class="no-more">
          <text class="no-more-text">{{ t('没有更多了') }}</text>
        </view>
  
        <!-- 空状态 -->
        <view v-if="!products.length && !loading" class="empty">
          <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
          <text class="empty-text">{{ t('暂无商品') }}</text>
        </view>
      </view>

      <!-- 底部弹窗：{{ t('一键铺货') }} -->
      <view v-if="shipSheetVisible" class="sheet-mask" @click="closeShipSheet" />
      <view v-if="shipSheetVisible" class="sheet" @click.stop>
        <view class="sheet-content">
          <image class="sheet-img" :src="prefixUrl + currentProduct?.cover_image || ''" mode="aspectFill" />
          <view class="sheet-info">
            <text class="sheet-title breakcss">{{ currentProduct?.name || '' }}</text>
            <text class="sheet-price">฿{{ formatPrice(currentProduct?.displayPrice) }}</text>
          </view>
          <view class="sheet-stock">
            <text class="sheet-stock-text">{{ t('库存：') }}{{ currentProduct?.stock ?? 0 }}</text>
          </view>
        </view>

        <view class="sheet-row">
          <text class="sheet-row-label">{{ t('数量') }}</text>
          <view class="qty">
            <view
              class="qty-btn"
              :class="{ 'qty-btn--disabled': shipQty <= 1 }"
              @click="decQty"
            >－</view>
            <view class="qty-num">{{ shipQty }}</view>
            <view class="qty-btn" @click="incQty">＋</view>
          </view>
        </view>

        <view class="sheet-actions">
          <view class="sheet-btn sheet-btn--close" @click="closeShipSheet">{{ t('关闭') }}</view>
          <view class="sheet-btn sheet-btn--ok" @click="confirmShip">{{ t('确认') }}</view>
        </view>
      </view>
    </view>
  </template>
  
  <script setup lang="ts">
  import { computed, ref } from 'vue';
  import { onReachBottom } from '@dcloudio/uni-app';
  import {  getCategoryList, getShopCategories } from '@/api';
  import { addProductToMyShop, getMyShopProductPool } from '@/api/myshop';
  import type { MallShopProductsParams } from '@/api';
  import globalTool from '@/utils/globalTool';
  import { useUserStore } from '@/stores/modules/userStore';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
  const userStore = useUserStore();
const prefixUrl = computed(() => userStore.prefixUrl);
  type Product = {
    id: number | string;
    name: string;
    cover_image: string;
    stock: number;
    displayPrice: number | string;
    in_my_shop: boolean;
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
      const params: MallShopProductsParams & { category_id?: number } = {
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
      const data = res?.data.data || res || [];
      const productList = Array.isArray(data) ? data : (data.list || data.items || []);
  
      // 映射服务器返回的数据到前端需要的格式
      const newProducts = productList.map((item: any) => ({
        id: item.id || 0,
        name: item.name || item.title || t('商品'),
        cover_image: item.cover_image || item.images?.[0]?.url || item.image_url || item.image || '/static/img/empty.svg',
        stock: item.stock || item.stock_count || item.quantity || 0,
        // 优先展示平台售价/销售价，其次回退到批发价/price
        displayPrice: item.sale_price ?? item.original_price ?? item.wholesale_price ?? item.price ?? 0,
        // 兼容不同字段：in_my_shop / is_in_my_shop / shop_product_id / already_added
        in_my_shop: Boolean(item.in_my_shop ?? item.is_in_my_shop ?? item.shop_product_id ?? item.already_added),
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
      console.error(t('加载商品列表失败'), e);
      globalTool.showToast(t('加载失败'), false, 'none');
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
  
  // ====== {{ t('一键铺货') }}：底部弹窗 ======
  const shipSheetVisible = ref(false);
  const currentProduct = ref<Product | null>(null);
  const shipQty = ref(1);
  const shipSubmitting = ref(false);

  function openShipSheet(product: Product) {
    currentProduct.value = product;
    shipQty.value = 1;
    shipSheetVisible.value = true;
  }

  function closeShipSheet() {
    if (shipSubmitting.value) return;
    shipSheetVisible.value = false;
    currentProduct.value = null;
  }

  function decQty() {
    shipQty.value = Math.max(1, shipQty.value - 1);
  }
  function incQty() {
    const max = Number(currentProduct.value?.stock ?? 999999);
    shipQty.value = Math.min(max || 999999, shipQty.value + 1);
  }

  async function confirmShip() {
    if (!currentProduct.value) return;
    if (shipSubmitting.value) return;
    shipSubmitting.value = true;
    try {
      // 说明：文档当前只需要 product_id；数量先做 UI 预留，后端支持时再一并传
      await addProductToMyShop({ product_id: Number(currentProduct.value.id) });
      // 本地乐观更新
      currentProduct.value.in_my_shop = true;
      globalTool.showToast(t('铺货成功'), false, 'success');
      closeShipSheet();
    } catch (e: any) {
      console.error(t('铺货失败'), e);
      globalTool.showToast(e?.message || t('铺货失败，请稍后重试'), false, 'none');
    } finally {
      shipSubmitting.value = false;
    }
  }

  function formatPrice(v: any) {
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v ?? '0');
    // 价格一般保留两位，小数为 0 时也显示两位，便于对齐
    return n.toFixed(2);
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
    getCategoryList({})
      .then((res: any) => {
        categories.value = res?.data || [];
        if (categories.value.length > 0) {
          activeCateId.value = categories.value[0].id;
        }
      })
      .catch((e) => {
        console.error(t('加载商品类型失败'), e);
      })
      .finally(() => {
        loadProducts(true);
      });
  });
  </script>
  
  <style scoped lang="scss">
  .product-manage-page {
    min-height: 100vh;
    background: #d9dbff;
    --top-nav-height: 80rpx;
    --top-header-height: 88rpx;
  }

  .top-bar {
    position: fixed;
    top: var(--window-top);
    left: 0;
    right: 0;
    z-index: 110;
    background: #ffffff;
  }
  
  .nav-wrap {
    height: var(--top-nav-height);
    background: #ffffff;
    box-shadow: 0 1rpx 0 rgba(0, 0, 0, 0.04);
    white-space: nowrap;
  }
  
  .nav-inner {
    display: inline-flex;
    align-items: center;
    height: var(--top-nav-height);
    padding: 0 20rpx;
    box-sizing: border-box;
  }
  
  .nav-item {
    flex-shrink: 0;
    margin-right: 36rpx;
    padding: 20rpx 0 16rpx;
  }
  
  .nav-text {
    font-size: 28rpx;
    color: #555;
    line-height: 1.2;
  }
  
  .nav-item--active .nav-text {
    color: #ff3e6c;
    font-weight: 600;
    border-bottom: 4rpx solid #ff3e6c;
    padding-bottom: 8rpx;
  }
  
  .header {
    height: var(--top-header-height);
    background: #ff3e6c;
    display: flex;
    align-items: center;
    padding: 0 20rpx;
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
    margin-top: calc(var(--top-nav-height) + var(--top-header-height));
    padding: 16rpx;
  }

  .grid {
    display: flex;
    flex-wrap: wrap;
    gap: 14rpx;
  }

  .grid-item {
    width: calc(50% - 7rpx);
  }

  .card {
    background: #ffffff;
    border-radius: 18rpx;
    overflow: hidden;
    border: 2rpx solid rgba(78, 75, 255, 0.18);
  }

  .card-img {
    width: 100%;
    height: 240rpx;
    background: #f5f5f5;
  }

  .card-body {
    padding: 16rpx 16rpx 14rpx;
  }

  .card-title {
    font-size: 28rpx;
    color: #111;
    line-height: 1.35;
    min-height: 76rpx; // 约两行
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-stock {
    margin-top: 10rpx;
    font-size: 24rpx;
    color: #8b8b8b;
  }

  .card-bottom {
    margin-top: 14rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-price {
    font-size: 34rpx;
    font-weight: 700;
    color: #ff3e6c;
  }

  .card-btn {
    height: 56rpx;
    line-height: 56rpx;
    padding: 0 24rpx;
    border-radius: 28rpx;
    font-size: 24rpx;
    border: none;
  }

  .card-btn--listed {
    background: #2ac77a;
    color: #fff;
    opacity: 1;
  }

  .card-btn--ship {
    background: #ff3e6c;
    color: #fff;
  }

  // ===== 底部弹窗（sheet）=====
  .sheet-mask {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 998;
  }

  .sheet {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #fff;
    border-radius: 24rpx 24rpx 0 0;
    padding: 22rpx 24rpx calc(22rpx + env(safe-area-inset-bottom));
    z-index: 999;
  }

  .sheet-content {
    display: flex;
    align-items: flex-start;
    gap: 18rpx;
  }

  .sheet-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: 14rpx;
    background: #f5f5f5;
  }

  .sheet-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10rpx;
    padding-top: 4rpx;
  }

  .sheet-title {
    font-size: 30rpx;
    color: #111;
  }

  .sheet-price {
    font-size: 40rpx;
    color: #ff3e6c;
    font-weight: 700;
  }

  .sheet-stock {
    padding-top: 12rpx;
    white-space: nowrap;
  }

  .sheet-stock-text {
    font-size: 26rpx;
    color: #999;
  }

  .sheet-row {
    margin-top: 26rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sheet-row-label {
    font-size: 30rpx;
    color: #666;
  }

  .qty {
    display: flex;
    align-items: center;
    border: 1rpx solid #eee;
    border-radius: 10rpx;
    overflow: hidden;
    height: 64rpx;
  }

  .qty-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    color: #666;
    font-size: 28rpx;
    border-right: 1rpx solid #eee;
  }

  .qty-btn:last-child {
    border-right: none;
    border-left: 1rpx solid #eee;
  }

  .qty-btn--disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .qty-num {
    width: 80rpx;
    text-align: center;
    font-size: 28rpx;
    color: #111;
  }

  .sheet-actions {
    margin-top: 28rpx;
    display: flex;
    gap: 18rpx;
  }

  .sheet-btn {
    flex: 1;
    height: 84rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 42rpx;
    font-size: 30rpx;
  }

  .sheet-btn--close {
    background: #f2f2f2;
    color: #111;
  }

  .sheet-btn--ok {
    background: #e53935;
    color: #fff;
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
  