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
          <text class="shop-title">{{ shopInfo.name || '店铺名称' }}</text>
          <view class="shop-tag-wrap" v-if="shopInfo.rating">
            <text class="shop-tag">评分 {{ shopInfo.rating }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品瀑布流（两列） -->
    <scroll-view scroll-y class="goods-scroll">
      <!-- 空状态 -->
      <view v-if="!goodsList.length" class="empty-goods">
        <image class="empty-img" src="/static/img/empty.svg" mode="aspectFit" />
        <text class="empty-text">暂无商品</text>
      </view>

      <!-- 商品列表 -->
      <view v-else class="goods-grid">
        <view
          v-for="item in goodsList"
          :key="item.id"
          class="goods-card"
          @click="onGoodsClick(item)"
        >
          <image
            class="goods-img"
            :src="item.img"
            mode="aspectFill"
          />
          <view class="goods-body">
            <text class="goods-title breakcss">
              {{ item.title }}
            </text>
            <view class="goods-price-row">
              <text class="goods-price">฿{{ item.price }}</text>
              <text class="goods-sold">已售{{ item.sold }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { getMallShopDetail, getMallShopProducts } from '@/api';
import { ref } from 'vue';

type Goods = {
  id: number | string;
  title: string;
  price: string | number;
  sold: number;
  img: string;
};

// 商品列表（从服务器加载）
const goodsList = ref<Goods[]>([]);

function onGoodsClick(item: Goods) {
  uni.navigateTo({
    url: `/pages/goodsDetail/goodsDetail?id=${item.id}`,
  });
}

const shopInfo = ref<any>({});
onLoad(async (options: any) => {
  console.log(options);
  try {
    // 加载店铺详情
    const shopRes: any = await getMallShopDetail(options.id);
    shopInfo.value = shopRes;
  

    // 加载商品列表
    const productsRes: any = await getMallShopProducts(options.id, { page: 1, limit: 20 });
    const products: any[] = productsRes?.data || productsRes || [];
    
    // 映射服务器返回的数据到前端需要的格式
    goodsList.value = products.map((item: any) => ({
      id: item.id || item.product_id || 0,
      title: item.name || item.title || item.product?.name || '商品',
      price: item.sale_price || item.price || item.product?.sale_price || 0,
      sold: item.sold_count || item.sold || item.product?.sold_count || 0,
      img: item.images?.[0]?.url || item.image_url || item.product?.images?.[0]?.url || '/static/img/empty.svg',
    }));
  } catch (e) {
    console.error('加载店铺数据失败', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
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
</style>

