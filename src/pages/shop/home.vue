<template>
  <view class="shop-home">
    <!-- 顶部粉色渐变头部 -->
    <view class="shop-header">
      <view class="shop-header-bg"></view>
      <view class="shop-header-main">
        <image
          class="shop-avatar"
          src="/static/img/invitebg.png"
          mode="aspectFill"
        />
        <view class="shop-header-info">
          <text class="shop-title">แม่ค้ามือใหม่</text>
          <view class="shop-tag-wrap">
            <text class="shop-tag">好店推荐</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品瀑布流（两列） -->
    <scroll-view scroll-y class="goods-scroll">
      <view class="goods-grid">
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
      <view class="goods-footer">
        <text class="goods-footer-text">以上为测试数据展示</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { getMallShopDetail, getMallShopProducts } from '@/api';
import { ref } from 'vue';

type Goods = {
  id: number;
  title: string;
  price: string;
  sold: number;
  img: string;
};

const goodsList = ref<Goods[]>([
  {
    id: 1,
    title: "REORIA Women's Sexy Sleeveless Racer Back...",
    price: '686.23',
    sold: 0,
    img: '/static/img/invitebg.png',
  },
  {
    id: 2,
    title: 'Women',
    price: '943.76',
    sold: 6,
    img: '/static/img/clock.png',
  },
  {
    id: 3,
    title: 'Vetinee Women’s Oversized Button Up...',
    price: '1297.81',
    sold: 0,
    img: '/static/img/profit.png',
  },
  {
    id: 4,
    title: 'Summer Casual Denim Shirt',
    price: '799.00',
    sold: 3,
    img: '/static/img/money-bag.png',
  },
  {
    id: 5,
    title: 'Basic Cotton Tank Top',
    price: '299.99',
    sold: 12,
    img: '/static/img/invitebg.png',
  },
  {
    id: 6,
    title: 'Daily Wear Fashion Jacket',
    price: '1120.50',
    sold: 5,
    img: '/static/img/clock.png',
  },
]);

function onGoodsClick(item: Goods) {
  uni.showToast({
    title: `查看：${item.title}（测试）`,
    icon: 'none',
  });
}

const shopInfo = ref<any>({});
onLoad((options: any) => {
  console.log(options);
  getMallShopDetail(options.id).then((res: any) => {
    shopInfo.value = res.data;
  });
  getMallShopProducts(options.id, { page: 1, limit: 10 }).then((res: any) => {
    goodsList.value = res.data;
  });
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

.goods-footer {
  margin-top: 20rpx;
  align-items: center;
  justify-content: center;
  display: flex;
}

.goods-footer-text {
  font-size: 22rpx;
  color: #999;
}
</style>

