<template>
  <view class="edit-user-page">
    <view class="card">
      <!-- 昵称 -->
      <view class="row row-border">
        <text class="label">{{ t('昵称') }}</text>
        <input
          class="input"
          type="text"
          v-model="nickname"
          :placeholder="t('请输入昵称')"
          placeholder-class="input-placeholder"
          maxlength="32"
        />
      </view>

      <!-- 头像 -->
      <view class="row avatar-row">
        <text class="label">{{ t('头像') }}</text>
        <view class="avatar-wrap" @click="onChooseAvatar">
          <image
            v-if="avatarDisplay"
            class="avatar-img"
            :src="avatarDisplay"
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
      <button class="confirm-btn" :disabled="submitting" @click="onConfirm">
        {{ t('确定') }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { useUserStoreHook } from '@/stores/modules/userStore';
import { authUpdateMe } from '@/api';
import globalTool from '@/utils/globalTool';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const userStore = useUserStoreHook();

const nickname = ref('');
const avatar = ref('');
const submitting = ref(false);

const avatarDisplay = computed(() => globalTool.resolveMediaUrl(avatar.value));

function syncFormFromStore() {
  const info = userStore.userInfo;
  nickname.value = ( info.nickname || '').trim();
  avatar.value = info.avatar || '';
}

onLoad(() => {
  syncFormFromStore();
  userStore.reqUserInfo().then(() => {
    syncFormFromStore();
  }).catch(() => {
    // 已有本地 store 数据时可继续编辑
  });
});

function onChooseAvatar() {
  if (submitting.value) return;
  globalTool.chooseAndUploadImage(3).then((url) => {
    if (url) avatar.value = url;
  });
}

function validate(): boolean {
  if (!nickname.value.trim()) {
    globalTool.showToast(t('请输入昵称'), false, 'none');
    return false;
  }
  return true;
}

async function onConfirm() {
  if (submitting.value || !validate()) return;

  submitting.value = true;
  uni.showLoading({ title: t('提交中...'), mask: true });

  try {
    const payload: { nickname: string; avatar?: string } = {
      nickname: nickname.value.trim(),
    };
    if (avatar.value) {
      payload.avatar = globalTool.stripMediaUrl(avatar.value);
    }
    await authUpdateMe(payload);
    await userStore.reqUserInfo();
    globalTool.showToast(t('保存成功'), true);
  } catch (e) {
    console.error(t('保存失败'), e);
  } finally {
    submitting.value = false;
    uni.hideLoading();
  }
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

  &[disabled] {
    opacity: 0.6;
  }
}
</style>
