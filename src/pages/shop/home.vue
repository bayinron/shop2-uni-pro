<template>
  <view class="shop-home">
    <!-- 顶部粉色渐变头部 -->
    <view class="shop-header">
      <view class="shop-header-bg"></view>
      <view class="shop-header-main">
        <image
          class="shop-avatar"
          :src="shopInfo.logo || '/static/img/invitebg.png'"
          mode="aspectFill"
        />
        <view class="shop-header-info">
          <text class="shop-title">{{ shopInfo.name || t('店铺名称') }}</text>
          <view class="shop-tag-wrap" v-if="shopInfo.rating">
            <text class="shop-tag">{{ t('评分') }} {{ shopInfo.rating }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品瀑布流（两列） -->
    <view class="goods-scroll">
      <!-- 空状态 -->
      <view v-if="!goodsList.length && !loading" class="empty-goods">
        <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
        <text class="empty-text">{{ t('暂无商品') }}</text>
      </view>

      <!-- 商品列表 -->
      <view v-if="goodsList.length" class="goods-grid">
        <view
          v-for="item in goodsList"
          :key="item.id"
          class="goods-card"
          @click="onGoodsClick(item)"
        >
          <image
            class="goods-img"
            :src="prefixUrl + item.product.cover_image"
            mode="aspectFill"
          />
          <view class="goods-body">
            <text class="goods-title breakcss">
              {{ item.product.name }}
            </text>
            <view class="goods-price-row">
              <text class="goods-price">￥{{ item.product.sale_price }}</text>
              <text class="goods-sold">{{ t('已售') }}{{ item.product.sold_count }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view v-if="loading" class="loading-more">
        <text class="loading-text">{{ t('加载中...') }}</text>
      </view>

      <!-- 没有更多数据提示 -->
      <view v-if="!hasMore && goodsList.length > 0" class="no-more">
        <text class="no-more-text">{{ t('没有更多了') }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getMallShopDetail, getMallShopProducts } from '@/api';
import { ref, computed } from 'vue';
import { onLoad, onReachBottom } from '@dcloudio/uni-app';

import { useUserStore } from '@/stores/modules/userStore';

import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
  const userStore = useUserStore();
const prefixUrl = computed(() => userStore.prefixUrl);

// 商品列表（从服务器加载）
const goodsList = ref<any[]>([]);
const shopInfo = ref<any>({});
const shopId = ref<number>(0);

// 分页相关
const page = ref<number>(1);
const limit = ref<number>(20);
const hasMore = ref<boolean>(true);
const loading = ref<boolean>(false);

function onGoodsClick(item: any) {
  uni.navigateTo({
    url: `/pages/goodsDetail/goodsDetail?id=${item.product.id}`,
  });
}

// 加载商品列表
async function loadProducts(reset: boolean = false) {
  if (loading.value) return;
  if (!hasMore.value && !reset) return;
  if (!shopId.value) return;

  if (reset) {
    page.value = 1;
    hasMore.value = true;
    goodsList.value = [];
  }

  loading.value = true;
  try {
    const productsRes: any = await getMallShopProducts(shopId.value, {
      page: page.value,
      limit: limit.value,
    });

    const products: any[] = productsRes?.data.data || productsRes || [];


    if (reset) {
      goodsList.value = products;
    } else {
      goodsList.value = [...goodsList.value, ...products];
    }

    // 判断是否还有更多数据
    hasMore.value = products.length >= limit.value;
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

// 上拉加载更多（使用页面生命周期 onReachBottom）
onReachBottom(() => {
  if (!loading.value && hasMore.value) {
    loadProducts(false);
  }
});

onLoad(async (options: any) => {
  console.log(options);
  shopId.value = Number(options.id) || 0;
  
  try {
    // 加载店铺详情
    const shopRes: any = await getMallShopDetail(options.id);
    shopInfo.value = shopRes?.data || shopRes || {};

    // 加载商品列表
    loadProducts(true);
  } catch (e) {
    console.error(t('加载店铺数据失败'), e);
    uni.showToast({ title: t('加载失败'), icon: 'none' });
    goodsList.value = [];
  }
});
</script>

<style scoped lang="scss">
.shop-home {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.shop-header {
  position: relative;
  padding-bottom: 16rpx;
}

.shop-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200rpx;
  background: linear-gradient(180deg, #ff3d6f, #ff6b8a);
}

.shop-header-main {
  position: relative;
  padding: 60rpx 32rpx 0;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.shop-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  background: #ffffff;
}

.shop-header-info {
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
}

.shop-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}

.shop-tag-wrap {
  margin-top: 10rpx;
}

.shop-tag {
  padding: 6rpx 20rpx;
  border-radius: 26rpx;
  background: #ff3d6f;
  font-size: 24rpx;
  color: #ffffff;
}

.goods-scroll {
  flex: 1;
  padding: 12rpx 16rpx 24rpx;
}

.goods-grid {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 14rpx;
}

.goods-card {
  background: #ffffff;
  border-radius: 18rpx;
  overflow: hidden;
}

.goods-img {
  width: 100%;
  height: 320rpx;
  background: #f0f0f0;
}

.goods-body {
  padding: 16rpx 16rpx 18rpx;
}

.goods-title {
  font-size: 24rpx;
  color: #333333;
}

.goods-price-row {
  margin-top: 10rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goods-price {
  font-size: 26rpx;
  font-weight: 700;
  color: #ff3d6f;
}

.goods-sold {
  font-size: 22rpx;
  color: #999999;
}

.empty-goods {
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

