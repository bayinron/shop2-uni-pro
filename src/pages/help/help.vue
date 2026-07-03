<template>
  <view class="help-page">
    <view class="card">
      <text class="title">帮助中心</text>
      <text class="desc">这里是常见问题说明，如仍有疑问可联系客服。</text>
    </view>

    <view class="card">
      <text class="section-title">常见问题</text>
      <view class="qa-item">
        <text class="q">1. 如何下单？</text>
        <text class="a">在商品详情点击“立即购买”，确认地址后即可下单并支付。</text>
      </view>
      <view class="qa-item">
        <text class="q">2. 支付失败怎么办？</text>
        <text class="a">请检查余额或网络，稍后在“我的订单-待付款”中重新支付。</text>
      </view>
      <view class="qa-item">
        <text class="q">3. 如何查看订单状态？</text>
        <text class="a">进入“我的订单”，可查看待付款、待发货、待收货、已完成。</text>
      </view>
    </view>

    <view class="card">
      <text class="section-title">联系客服</text>
      <text class="line">客服时间：09:00 - 21:00</text>
      <text class="line">客服邮箱：support@example.com</text>
      <button class="btn" @click="goService">在线客服</button>
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
.help-page {
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
  line-height: 1.6;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.qa-item {
  margin-top: 18rpx;
}

.q {
  display: block;
  font-size: 27rpx;
  color: #333;
  font-weight: 500;
}

.a {
  display: block;
  margin-top: 8rpx;
  font-size: 25rpx;
  color: #666;
  line-height: 1.6;
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
