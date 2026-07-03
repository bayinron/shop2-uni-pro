<template>
  <view class="about-page">
    <view class="card">
      <text class="title">关于我们</text>
      <text class="desc">
        我们是一个专注于日常购物体验的平台，提供商品浏览、下单、支付、订单管理等基础服务。
      </text>
    </view>

    <view class="card">
      <text class="section-title">我们的服务</text>
      <text class="line">- 商品搜索与分类浏览</text>
      <text class="line">- 购物车与快速下单</text>
      <text class="line">- 在线支付与订单跟踪</text>
      <text class="line">- 商家入驻与店铺管理</text>
    </view>

    <view class="card">
      <text class="section-title">联系方式</text>
      <text class="line">客服邮箱：support@example.com</text>
      <text class="line">客服时间：09:00 - 21:00</text>
      <button class="btn" @click="goService">联系客服</button>
    </view>
  </view>
</template>

<script setup lang="ts">
function goService() {
  uni.navigateTo({
    url: '/pages/service/index?url=' + encodeURIComponent('https://www.baidu.com'),
  });
}
</script>

<style scoped lang="scss">
.about-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
}

.title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
}

.desc {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 1.7;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.line {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #555;
}

.btn {
  margin-top: 20rpx;
  height: 76rpx;
  line-height: 76rpx;
  background: #ff3e6c;
  color: #fff;
  border-radius: 38rpx;
  font-size: 28rpx;
}
</style>
