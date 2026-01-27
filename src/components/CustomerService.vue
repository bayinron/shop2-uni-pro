<template>
    <view class="customer-service">
        <image 
            class="chat_icon" 
            :src="'/static/img/kkkfff.png'" 
            mode="aspectFit" 
            @tap="getUrl" 
        />
    </view>
</template>


<script setup lang="ts">
// function chatClick() {
//     uni.navigateTo({
//         url: '/pages/customer/index'
//     });
// }
const getUrl = (type: string='chat') => {
    const token = uni.getStorageSync('token');
    const url = `/api/kefu_url.php?token=${token}&type=${type}`;
    uni.navigateTo({
        url: '/pages/chatcon/index?url=' + url
    });
};
</script>

<style lang="scss" scoped>
.customer-service {
    position: fixed;
    bottom: 100rpx;
    right: 100rpx;
    z-index: 999;
}
.chat_icon {
    position: fixed;
    width: 180rpx;
    height: 190rpx;
    z-index: 898;
    right: 20rpx;
    top: 70%;
}
</style>