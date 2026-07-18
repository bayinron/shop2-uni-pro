<template>
  <view class="product-manage-page">
    <!-- 顶部红色头部 -->
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

    <!-- 商品列表 -->
    <view class="product-list">
      <view
        v-for="product in products"
        :key="product.id"
        class="product-card"
      >
        <image class="product-img" :src="prefixUrl + product.product.images?.[0]?.url" mode="aspectFill" />
        <view class="product-info">
          <text class="product-name breakcss">{{ product.product.name }}</text>
          <text class="product-stock">{{ t('库存:') }}{{ product.product.display_stock }}</text>
          <view class="product-bottom">
            <text class="product-price">{{ t('批发价: ￥') }}{{ product.product.original_price }}</text>
            <view class="product-actions">
              <button class="btn-listed" :class="{ 'btn-listed--active': product.product.status === 'published' }">
                {{ product.product.status === 'published' ? t('已上架') : t('未上架') }}
              </button>
              <button class="btn-add" @click="onAddClick(product)">add</button>
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

    <!-- 底部弹窗：展示配置（数量 +/-） -->
    <view v-if="configSheetVisible" class="sheet-mask" @click="closeConfigSheet" />
    <view v-if="configSheetVisible" class="sheet" @click.stop>
      <view class="sheet-content">
        <image
          class="sheet-img"
          :src="prefixUrl + (currentProduct?.product?.images?.[0]?.url || currentProduct?.product?.cover_image || '/static/img/empty.svg')"
          mode="aspectFill"
        />
        <view class="sheet-info">
          <text class="sheet-title breakcss">{{ currentProduct?.product?.name || '' }}</text>
          <text class="sheet-price">￥{{ formatPrice(currentProduct?.product?.sale_price ?? currentProduct?.product?.original_price) }}</text>
        </view>
        <view class="sheet-stock">
          <text class="sheet-stock-text">{{ t('库存：') }}{{ currentProduct?.product?.stock ?? 0 }}</text>
        </view>
      </view>

      <view class="sheet-row">
        <text class="sheet-row-label">{{ t('数量') }}</text>
        <view class="qty">
          <button class="qty-btn" @click="decQty" :disabled="configQty <= 1">－</button>
          <view class="qty-num">{{ configQty }}</view>
          <button class="qty-btn" @click="incQty" :disabled="configQty >= maxQty">＋</button>
        </view>
      </view>

      <view class="sheet-actions">
        <button class="sheet-btn sheet-btn--close" @click="closeConfigSheet" :disabled="submitting">{{ t('关闭') }}</button>
        <button class="sheet-btn sheet-btn--ok" @click="confirmConfig" :disabled="submitting">{{ t('确认') }}</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onReachBottom } from '@dcloudio/uni-app';
import {
  getMyShopProducts,
  updateMyShopProductDisplayConfig,
  type MyShopProduct,
  type MyShopProductsParams,
} from '@/api/myshop';
import globalTool from '@/utils/globalTool';
import { useUserStore } from '@/stores/modules/userStore';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
  const userStore = useUserStore();
const prefixUrl = computed(() => userStore.prefixUrl);
const products = ref<MyShopProduct[]>([]);
const keyword = ref<string>('');

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
    const params: { page?: number; limit?: number; category_id?: number; keyword?: string } = {
      page: page.value,
      limit: limit.value,
    };

    if (keyword.value.trim()) {
      params.keyword = keyword.value.trim();
    }

    const res: any = await getMyShopProducts(params as MyShopProductsParams);
    const raw = res?.data ?? res;
    const newProducts = raw?.list ?? raw?.data?.list ?? raw?.data ?? [];
    if (reset) {
      products.value = newProducts;
    } else {
      products.value = [...products.value, ...newProducts];
    }
    hasMore.value = newProducts.length >= limit.value;
    if (hasMore.value) {
      page.value += 1;
    }
  } catch (e) {
    console.error(t('加载商品列表失败'), e);
    uni.showToast({ title: t('加载失败'), icon: 'none' });
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

// 添加按钮点击
function onAddClick(product: MyShopProduct) {
  openConfigSheet(product);
}

// ===== 底部弹窗：展示配置（数量）=====
const configSheetVisible = ref(false);
const currentProduct = ref<MyShopProduct | null>(null);
const configQty = ref<number>(1);
const submitting = ref(false);

const maxQty = computed(() => {
  const stock = Number(currentProduct.value?.product?.stock ?? 0);
  return stock > 0 ? stock : 1;
});

function openConfigSheet(p: MyShopProduct) {
  currentProduct.value = p;
  const stock = Number(p?.product?.stock ?? 0);
  configQty.value = stock > 0 ? stock : 1; // 按截图：默认给库存数量
  configSheetVisible.value = true;
}

function closeConfigSheet() {
  // if (submitting.value) return;
  configSheetVisible.value = false;
  currentProduct.value = null;
}

function decQty() {
  configQty.value = Math.max(1, configQty.value - 1);
}

function incQty() {
  configQty.value = Math.min(maxQty.value, configQty.value + 1);
}

function formatPrice(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v ?? '0');
  return n.toFixed(2);
}

async function confirmConfig() {
  if (!currentProduct.value) return;
  if (submitting.value) return;
  submitting.value = true;
  try {
    // 接口：PUT mall/my-shop/products/:id/config
    // 这里按“数量”做 modifier（用于销量展示修饰），type 使用 add_value
    await updateMyShopProductDisplayConfig(Number(currentProduct.value.product.id), {
      custom_stock: Number(configQty.value),
    });
    globalTool.showToast(t('已保存'), false, 'success');
    closeConfigSheet();
  } catch (e) {
    console.error(t('保存失败'), e);
    globalTool.showToast(t('保存失败，请稍后重试'), false, 'none');
  }
}

// 上拉加载更多
onReachBottom(() => {
  if (!loading.value && hasMore.value) {
    loadProducts(false);
  }
});

// 页面加载
onLoad(() => {
  loadProducts(true);
});
</script>

<style scoped lang="scss">
.product-manage-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  position: fixed;
  top: var(--window-top);
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
  margin-top: 88rpx;
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

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.product-price {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff3e6c;
  margin-bottom: 0;
  flex: 1;
  min-width: 0;
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
  line-height: 64rpx;
  text-align: center;
  background: #fff;
  color: #666;
  border: none;
  border-right: 1rpx solid #eee;
  border-radius: 0;
}

.qty-btn:last-child {
  border-right: none;
  border-left: 1rpx solid #eee;
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
  line-height: 84rpx;
  border-radius: 42rpx;
  font-size: 30rpx;
  border: none;
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
