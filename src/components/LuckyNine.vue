<template>
    <view class="lucky-nine">
        <view class="grid" v-if="prizes.length > 0">
            <template v-for="i in 9">
                <view v-if="i === 5" :key="'btn'" class="center-btn grid-item"> </view>
                <view v-else :key="i - 1" :class="['grid-item', { active: getPrizeIndex(i) === activeIndex }]">
                    <img :src="url + prizes[getPrizeIndex(i)].pic" />
                    <!-- {{ i-1 }}-{{ getPrizeIndex(i) }} -->
                    <view class="name">{{ prizes[getPrizeIndex(i)].name }}</view>
                </view>
            </template>
        </view>
        <view class="lottery-btn" @click="click">
            {{ getBtnText }}
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/modules/userStore';
import type { LotteryInfo } from '@/api';
import type { LotteryStatus } from '@/api/types';
const userStore = useUserStore();
const url = userStore.prefixUrl;
const emit = defineEmits(['click']);
const props = defineProps<{
    prizes: LotteryInfo[];
    lotteryStatus: LotteryStatus;
}>();

const activeIndex = ref(0);
const isRolling = ref(false);
let timer: any = null;

// 九宫格顺时针8个格子的下标
const gridMap = [0, 1, 2, 7, 3, 6, 5, 4];
const click = () => {
    emit('click');
};
const getBtnText = computed(() => {
    if (props.lotteryStatus.c_lave == 0) return '抽奖次数已用完';
    if (isRolling.value) return '抽奖中...';
    return '开始抽奖';
});
// 计算当前格子对应的奖品索引
function getPrizeIndex(i: number) {
    // i: 1~9, 中间格子i=5跳过
    // 1 2 3
    // 8   4
    // 7 6 5
    // gridMap: 0 1 2 7 3 6 5 4
    // i=1->0, i=2->1, i=3->2, i=4->7, i=6->3, i=7->6, i=8->5, i=9->4
    // i<5: gridMap[i-1]
    // i>5: gridMap[i-2]
    return i < 5 ? gridMap[i - 1] : gridMap[i - 2];
}

function startLottery(index: number) {
    return new Promise((resolve, reject) => {
        if (isRolling.value) {
            reject();
            return;
        }
        isRolling.value = true;
        let times = 0;
        const totalTimes = 60; // 增加总转动次数，确保至少转几圈
        const minSpeed = 300; // 最慢速度调大，让开始和结束更慢
        const maxSpeed = 30; // 最快速度调小，让中间转得更快
        let speed = minSpeed;

        function roll() {
            activeIndex.value = (activeIndex.value + 1) % 8;
            times++;

            // 计算当前应该的速度
            if (times < totalTimes * 0.2) {
                // 加速阶段缩短到20%
                speed = minSpeed - (minSpeed - maxSpeed) * (times / (totalTimes * 0.2));
            } else if (times < totalTimes * 0.8) {
                // 匀速阶段延长到60%
                speed = maxSpeed;
            } else {
                // 减速阶段延长到20%
                speed = maxSpeed + (minSpeed - maxSpeed) * ((times - totalTimes * 0.8) / (totalTimes * 0.2));
            }

            // 当达到目标位置且速度足够慢时停止
            if (times >= totalTimes && activeIndex.value === index && speed >= minSpeed * 0.7) {
                clearInterval(timer);
                isRolling.value = false;
                resolve(1);
                return;
            }

            // 更新定时器速度
            clearInterval(timer);
            timer = setInterval(roll, speed);
        }

        // 开始转动
        timer = setInterval(roll, speed);
    });
}
defineExpose({
    startLottery
});
</script>

<style lang="scss" scoped>
.lucky-nine {
    width: 680rpx;
    height: 890rpx;
    background-size: cover;
    position: relative;
    background-image: url('@/static/img/jiugongge.png');
    background-repeat: no-repeat;
    background-position: center;
}
.grid {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    // height: 100%;
    padding: 50rpx;
    gap: 18rpx;
    margin-top: -10rpx;
}
.grid-item {
    background-color: #fff;
    border-radius: 20rpx;
    width: 31%;
    height: 180rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2rpx solid transparent;
    transition: border 0.2s;
    img {
        width: 100rpx;
        height: 100rpx;
    }
    .name {
        color: #99182a;
        font-weight: bold;
        font-size: 24rpx;
        margin-top: 10rpx;
    }
}
.grid-item.active {
    border: 2rpx solid #ff9800;
    background: rgba(255, 230, 180, 0.5);
}
.center-btn {
    grid-column: 2;
    grid-row: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent !important;
    border-radius: 10rpx;
    cursor: pointer;
    font-weight: bold;
}
.lottery-btn {
    width: 70%;
    height: 80rpx;
    margin: 0rpx auto 0 auto;
    border: 2rpx solid #fff;
    background: linear-gradient(90deg, #ffe07a 0%, #c89b13 100%);
    border-radius: 40rpx 40rpx 24rpx 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 38rpx;
    font-weight: bold;
    color: #8a531d;
    letter-spacing: 6rpx;
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
}
</style>
