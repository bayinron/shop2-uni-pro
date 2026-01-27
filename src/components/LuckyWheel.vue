<template>
    <div class="lucky-wheel-container">
        <div class="wheel" :style="{ transform: `rotate(${rotation}deg)` }">
            <!-- <div v-for="(prize, index) in prizes" :key="index" class="prize-item" :style="getItemStyle(index)">
                <div class="prize-content" :style="getTextStyle(index)">
                    {{ prize.name }}
                </div>
            </div> -->
        </div>
        <!-- <div class="pointer"></div> -->
        <img src="@/static/img/pointer.png" alt="" class="pointer-img" />
    </div>
</template>

<script setup lang="ts">
import type { LotteryInfo } from '@/api';
import { ref, computed, watch } from 'vue';

interface Prize {
    name: string;
}

const props = defineProps<{
    prizes: LotteryInfo[];
    targetIndex?: number;
}>();
const angleList = ref<number[]>([]);
const itemAngle = ref(0);
//监听prizes的变化
watch(
    () => props.prizes,
    () => {
        // 动态计算角度列表
        itemAngle.value = 360 / props.prizes.length; // 每个奖项占用的角度
        //初始角度
        const startAngle = 0;
        angleList.value = [];
        for (let i = 0; i < props.prizes.length; i++) {
            angleList.value.push(startAngle + i * itemAngle.value);
        }
        console.log(angleList.value);
    },
    { immediate: true, deep: true }
);
const rotation = ref(0);
const baseRotation = 360 * 10; // 基础旋转圈数
const currentRotation = ref(0); // 添加当前旋转角度记录
const angleOffset = 3;

// 开始抽奖
const startLottery = (targetIndex: number) => {
    // 计算目标角度
    //规则如下：先根据prizes.length计算出每个奖品的角度，然后根据targetIndex计算出目标角度
    //例如：prizes.length = 6，则每个奖品的角度为360 / 6 = 60度
    //targetIndex = 0，则目标角度为-30到30度
    //targetIndex = 1，则目标角度为30到90度
    //targetIndex = 2，则目标角度为90到150度
    //targetIndex = 3，则目标角度为150到210度
    //targetIndex = 4，则目标角度为210到270度
    //targetIndex = 5，则目标角度为270到330度
    // const angleList = [-30, 30, 90, 150, 210, 270, 330];

    //角度偏差
    //如果是中了第一个奖项，那就是-30到30度之间的随机角度值。如果是第三个奖项，那就是90到150度之间的随机角度值。同时要缩小这个范围，因为有时候ui做出来的图片角度不是很标准
    let targetAngle = (angleList.value[targetIndex] + angleOffset) + Math.floor(Math.random() * (itemAngle.value - angleOffset));
    //如果当前旋转角度不为0，则需要计算出距离0偏移的角度值
    if (currentRotation.value != 0) {
        const diff = currentRotation.value % 360;
        targetAngle = targetAngle - diff;
    }
    // 累加旋转角度
    currentRotation.value = currentRotation.value + baseRotation + targetAngle;
    rotation.value = currentRotation.value;
};

// 重置转盘
const reset = () => {
    rotation.value = 0;
    currentRotation.value = 0;
};

// 暴露方法给父组件
defineExpose({
    startLottery,
    reset
});
</script>
<style>
.van-toast {
    color: #000 !important;
    background: #fff !important;
}
</style>
<style scoped lang="scss">
.lucky-wheel-container {
    position: relative;
    width: 340px;
    height: 340px;
    margin: 20px auto;
}

.wheel {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    position: relative;
    transition: transform 5s cubic-bezier(0.25, 0.1, 0.25, 1);
    border: 8px solid #e65100;
    will-change: transform; /* 添加这行以优化动画性能 */
    background-image: url('@/static/img/circle.png');
    background-size: cover;
    background-position: center;
}

.prize-item {
    position: absolute;
    width: 50%;
    height: 50%;
    transform-origin: 100% 100%;
}

.pointer {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 20px solid transparent;
    border-right: 20px solid transparent;
    border-top: 40px solid #e65100;
    z-index: 2;
}
.pointer-img {
    position: absolute;
    top: 118px;
    left: 50%;
    transform: translateX(-50%);
    width: 83px;
    // height: 85px;
}
</style>
