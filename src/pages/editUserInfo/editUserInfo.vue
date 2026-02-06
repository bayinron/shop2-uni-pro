<template>
  <view class="edit-user-page">
    <view class="card">
      <!-- 昵称 -->
      <view class="row row-border">
        <text class="label">昵称</text>
        <input
          class="input"
          type="text"
          v-model="nickname"
          placeholder="请输入昵称"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 头像 -->
      <view class="row avatar-row">
        <text class="label">头像</text>
        <view class="avatar-wrap" @click="onChooseAvatar">
          <image
            v-if="avatar"
            class="avatar-img"
            :src="avatar"
            mode="aspectFill"
          />
          <view v-else class="avatar-placeholder">
            <text class="icon iconfont icon-camera" />
          </view>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="confirm-btn" @click="onConfirm">确定</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStoreHook } from '@/stores/modules/userStore';
import {authUpdateMe} from '@/api/index';
import globalTool from '@/utils/globalTool';

const formData = ref({
  nickname: '',
  avatar: '',
});

const userStore = useUserStoreHook();
const userInfo = userStore.getUserInfo() as any;

const nickname = ref<string>(userInfo.nickname || '');
const avatar = ref<string>(userInfo.avatar || '');

onLoad(() => {
  // 如果需要，可以在这里从参数中预填数据（当前直接用 store）
});

function onChooseAvatar() {
  uni.showToast({ title: '选择头像（测试功能）', icon: 'none' });
  // 这里仅做演示，实际项目中可使用 uni.chooseImage
  // avatar.value = '/static/img/money-bag.png';
}

function onConfirm() {

  authUpdateMe(formData.value).then((res:any) => {
    globalTool.showToast('保存成功',true);
    userStore.setUserInfo(res.data);
    
  });
}
</script>

<style scoped lang="scss">
.edit-user-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.row {
  display: flex;
  align-items: center;
}

.row-border {
  border-bottom: 2rpx solid #f0f0f0;
  padding-bottom: 20rpx;
}

.avatar-row {
  margin-top: 40rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
  width: 120rpx;
}

.input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.input-placeholder {
  color: #c7c7c7;
}

.avatar-wrap {
  margin-left: 40rpx;
}

.avatar-placeholder,
.avatar-img {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
}

.avatar-placeholder {
  background: #ffdfeb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder .icon {
  font-size: 60rpx;
  color: #ff3e6c;
}

.bottom-bar {
  margin-top: 80rpx;
}

.confirm-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  background: #ff3e6c;
  color: #fff;
  font-size: 32rpx;
  border: none;
}
</style>

