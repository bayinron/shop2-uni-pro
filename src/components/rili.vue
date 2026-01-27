<template>
  <view class="calendar">
    <view class="calendar-header">
      <text class="calendar-title">{{ year }}年{{ month }}月</text>
    </view>
    <view class="calendar-week">
      <text v-for="(w, i) in weekList" :key="i" class="calendar-week-item">{{ w }}</text>
    </view>
    <view class="calendar-days">
      <view v-for="(item, idx) in daysArr" :key="idx" class="calendar-day-item">
        <view v-if="item > 0" class="calendar-day-content">
          <text>{{ item }}</text>
          <img v-if="punchList[item-1] === 1" src="@/static/img/gou.png" class="calendar-check" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{
  punchList: number[]; // 1为已打卡，0为未打卡，长度为当月天数
  year: number;
  month: number;
  day: number;
}>();

const year = ref(props.year);
const month = ref(props.month);
const day = ref(props.day);

const weekList = ['一', '二', '三', '四', '五', '六', '日'];
const daysArr = ref<number[]>([]);

// 监听 props.year 和 props.month 的变化，重新计算 daysArr
watch(
  () => [props.year, props.month, props.day],
  ([newYear, newMonth, newDay]) => {
    year.value = newYear;
    month.value = newMonth;
    day.value = newDay;
    const daysInMonth = new Date(newYear, newMonth, 0).getDate();
    const firstDay = new Date(newYear, newMonth - 1, 1).getDay();
    const empty = firstDay === 0 ? 6 : firstDay - 1;
    daysArr.value = [
      ...Array(empty).fill(0),
      ...Array(daysInMonth).fill(0).map((_, i) => i + 1)
    ];
  }
);
</script>

<style lang="scss" scoped>
.calendar {
  width: 100%;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 16rpx 16rpx 16rpx;
  box-sizing: border-box;
}
.calendar-header {
  text-align: center;
  margin-bottom: 12rpx;
}
.calendar-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}
.calendar-week {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}
.calendar-week-item {
  width: calc(100% / 7);
  text-align: center;
  color: #888;
  font-size: 22rpx;
}
.calendar-days {
  display: flex;
  flex-wrap: wrap;
}
.calendar-day-item {
  width: calc(100% / 7);
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
}
.calendar-day-content {
  width: 40rpx;
  height: 40rpx;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 22rpx;
  color: #333;
}
.calendar-check {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 36rpx;
  height: 36rpx;
}
</style>
