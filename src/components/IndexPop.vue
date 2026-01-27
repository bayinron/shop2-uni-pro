<template>
    <uni-popup ref="popup" type="center" background-color="transparent" @change="popupChange">
        <view class="reward-popup">
            <view class="popup-content" v-if="info.title">
                <view class="title">
                    {{ info.title }}
                </view>
                <image v-if="first" :src="prefixUrl + info.thumbnail" mode="widthFix"></image>
                <view v-else class="content">
                    <div   v-html="info.content"></div>

                </view>
                <view class="claim-btn" @click="closeClick">
                    <text>关闭</text>
                </view>
            </view>
        </view>
    </uni-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/modules/userStore';  
const userStore = useUserStore();
const prefixUrl = userStore.prefixUrl;
const first = ref(true);
const popup = ref<any>(null);
const info = ref<any>({
    title: '',
    thumbnail: '',
    content: ''
});
const emits = defineEmits(['onclose'])
const showPopup = (data: any) => {
    info.value = data;
    popup.value?.open();
};
const closeClick = () => {
    if(first.value) {
        first.value = false;
    } else {
        popup.value?.close();
        emits('onclose')
    }
};
const hidePopup = () => {
    popup.value?.close();
};

const popupChange = (e: boolean) => {
    console.log('popup visible change:', e);
};


defineExpose({
    showPopup,
    hidePopup
});
</script>

<style scoped lang="scss">
.reward-popup {
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255);
    border-radius: 20rpx;
    .popup-content {
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255);
        padding: 20rpx;
        box-sizing: border-box;
        border-radius: 20rpx;
    }
    .title {
        font-size: 32rpx;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20rpx;
    }
    .content {
        overflow:auto;
        max-height: 700rpx;
        min-height: 300rpx;
    }
    .claim-btn {
        width: 50%;
        margin: 0 auto;
        height: 60rpx;
        background-color: #000;
        color: #fff;
        border-radius: 20rpx;
        text-align: center;
        line-height: 60rpx;
        margin-top: 20rpx;
    }
}   

/* 自定义滚动条样式 */
.content::-webkit-scrollbar {
  width: 6px;
  background-color: transparent;
}

.content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.content::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
