<template>
    <div class="gpss" style="background: none; position: absolute; right: 80rpx; bottom: 8rpx">
        <span class="s-canvas" value="">
            <canvas id="s-canvas" width="78" height="36"></canvas>
        </span>
    </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
const emit = defineEmits(['getCode', 'update:changeCode']);

const props = defineProps({
    identifyCodes: {
        type: String,
        default: '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    },
    fontSizeMin: {
        type: Number,
        default: 25
    },
    fontSizeMax: {
        type: Number,
        default: 35
    },
    backgroundColorMin: {
        type: Number,
        default: 200
    },
    backgroundColorMax: {
        type: Number,
        default: 220
    },
    contentWidth: {
        type: Number,
        default: 78
    },
    contentHeight: {
        type: Number,
        default: 36
    }
});
const identifyCode = ref('');

onMounted(() => {
    drawPic();
    makeCode(props.identifyCodes, 4);
});

watch(identifyCode, () => {
    drawPic();
});

const randomNum = (min: number, max: number) => Math.floor(Math.random() * (max - min) + min);
const randomColor = (min: number, max: number) => {
    const r = randomNum(min, max);
    const g = randomNum(min, max);
    const b = randomNum(min, max);
    return `rgb(${r},${g},${b})`;
};

const drawPic = () => {
    const ctx = uni.createCanvasContext('s-canvas');

    if (ctx) {
        ctx.setTextBaseline('bottom');
        ctx.fillStyle = randomColor(props.backgroundColorMin, props.backgroundColorMax);
        ctx.fillRect(0, 0, props.contentWidth, props.contentHeight);
        for (let i = 0; i < identifyCode.value.length; i++) {
            drawText(ctx, identifyCode.value[i], i);
        }
        drawLine(ctx);
        drawDot(ctx);
    }
};

const drawText = (ctx: any, txt: string, i: number) => {
    ctx.fillStyle = randomColor(50, 160);
    ctx.font = `${randomNum(props.fontSizeMin, props.fontSizeMax)}px SimHei`;
    const x = (i + 1) * (props.contentWidth / (identifyCode.value.length + 1));
    const y = randomNum(props.fontSizeMax, props.contentHeight - 5);
    const deg = randomNum(-30, 30);
    ctx.translate(x, y);
    ctx.rotate((deg * Math.PI) / 180);
    ctx.fillText(txt, 0, 0);
    ctx.rotate((-deg * Math.PI) / 180);
    ctx.translate(-x, -y);
};

const drawLine = (ctx: any) => {
    for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = randomColor(100, 200);
        ctx.beginPath();
        ctx.moveTo(randomNum(0, props.contentWidth), randomNum(0, props.contentHeight));
        ctx.lineTo(randomNum(0, props.contentWidth), randomNum(0, props.contentHeight));
        ctx.stroke();
    }
};

const drawDot = (ctx: any) => {
    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = randomColor(0, 255);
        ctx.beginPath();
        ctx.arc(randomNum(0, props.contentWidth), randomNum(0, props.contentHeight), 1, 0, 2 * Math.PI);
        ctx.fill();
    }
};

const changeCode = () => {
    identifyCode.value = '';
    makeCode(props.identifyCodes, 4);
};

const makeCode = (e: string, n: number) => {
    for (let i = 0; i < n; i++) {
        identifyCode.value += e[randomNum(0, e.length)];
    }
    console.log(identifyCode.value);
    emit('getCode', identifyCode.value);
    emit('update:changeCode', identifyCode.value);
};

</script>
<style lang="scss" scoped></style>
