<template>
    <uni-popup ref="popup" type="center" background-color="transparent" @change="popupChange">
        <view class="reward-popup">
            <view class="popup-content">
                <view class="close-btn" @tap="hidePopup">
                    <text class="uni-icon-close" style="color: #fff; font-size: 40rpx;"></text>
                </view>
                <view class="prize-info">
                    <image mode="widthFix" :src="prefixUrl + prizeInfo.pic" class="prize-pic"/>
                    <view class="prize-name">{{ prizeInfo.name }}</view>
                    <!-- <view class="prize-desc">{{ prizeInfo.desc }}</view> -->
                </view>
                <view class="claim-btn" @tap="claimPrize">
                    <text v-if="prizeInfo.type !=3">立即领取</text>
                    <text v-else>关闭</text>
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
interface PrizeInfo {
    name: string;
    desc: string;
    pic: string;
    type: number; //3未中奖  1现金奖励 2实物奖励 9云数贸单位万
}

const popup = ref<any>(null);
const prizeInfo = ref<PrizeInfo>({
    name: '一等奖',
    desc: '海信激光电视 80英寸4K超清/台',
    pic: 'https://yunshuq.sfhdfh.com/api/Resources/preview?url=/sysset/20250521/d99e248d48b569dc5f2134d3b7ee0825.png',
    type: 1
});

const showPopup = (info: PrizeInfo) => {
    prizeInfo.value = info;
    popup.value?.open();
};

const hidePopup = () => {
    popup.value?.close();
};

const popupChange = (e: boolean) => {
    console.log('popup visible change:', e);
};

const claimPrize = () => {
    // 处理领奖逻辑
    hidePopup();
};

defineExpose({
    showPopup,
    hidePopup
});
</script>

<style scoped lang="scss">
.reward-popup {
    position: relative;
    padding-bottom: 80rpx;
    background-color: transparent;
    .popup-content {
        background-image: url('@/static/img/popbg.png');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        padding: 80rpx 40rpx;
        text-align: center;
        position: relative;
        width: 680rpx;
        height: 740rpx;
    }

    .close-btn {
        position: absolute;
        bottom: -80rpx;
        left: 50%;
        transform: translateX(-50%);
        padding: 10rpx;
        z-index: 10;
    }

    .title {
        color: #fff;
        font-size: 48rpx;
        font-weight: bold;
        margin-bottom: 40rpx;
        text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
    }

    .prize-info {
        width: 62%;
        height: 260rpx;
        // background-color: red;
        margin: 0 auto;
        margin-top: 220rpx;
        .prize-pic {
            width: 100rpx;
            height: auto;
        }
        .prize-name {
            font-size: 34rpx;
            color: #aa1700;
            margin-bottom: 20rpx;
            font-weight: bold;
            text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
        }

        .prize-desc {
            font-size: 46rpx;
            color: #fff;
            font-weight: bold;
            line-height: 1.5;
            text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.3);
        }
    }

    .claim-btn {
        width: 180rpx;
        height: 58rpx;
        line-height: 58rpx;
        margin: 0 auto;
        color: #aa1700;
        font-size: 26rpx;
        margin-top: 0rpx;
        font-weight: bold;
        background: linear-gradient(to bottom, #fadfaf, #f7c28a);
        border-radius: 40rpx;

        &:active {
            transform: scale(0.98);
        }
    }
}
</style>
