<template>
  <view class="address-add-page">
    <view class="card">
      <!-- 收货人 -->
      <view class="row row-border">
        <text class="label">{{ t('收货人') }}</text>
        <input
          class="input"
          type="text"
          v-model="form.receiver_name"
          :placeholder="t('请输入收货人姓名')"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 手机号 -->
      <view class="row row-border">
        <text class="label">{{ t('手机号') }}</text>
        <input
          class="input"
          type="number"
          v-model="form.receiver_phone"
          :placeholder="t('请输入手机号')"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 详细地址 -->
      <view class="row">
        <text class="label">{{ t('详细地址') }}</text>
        <input
          class="input"
          type="text"
          v-model="form.address"
          :placeholder="t('请输入详细地址')"
          placeholder-class="input-placeholder"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="save-btn" @click="onSave">{{ t('保存') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { createUserAddress } from '@/api';
import globalTool from '@/utils/globalTool';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const form = ref({
  receiver_name: '',
  receiver_phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
});

function validate(): boolean {
  if (!form.value.receiver_name.trim()) {
    uni.showToast({ title: t('请输入收货人姓名'), icon: 'none' });
    return false;
  }
  if (!form.value.receiver_phone.trim()) {
    uni.showToast({ title: t('请输入手机号'), icon: 'none' });
    return false;
  }
  if (!form.value.address.trim()) {
    uni.showToast({ title: t('请输入详细地址'), icon: 'none' });
    return false;
  }
  return true;
}

async function onSave() {
  if (!validate()) return;

  try {
    await createUserAddress({
      receiver_name: form.value.receiver_name,
      receiver_phone: form.value.receiver_phone,
      province: '',
      city: '',
      district: '',
      address: form.value.address,
    });
    globalTool.showToast(t('保存成功'),true);
  } catch (e) {
    uni.showToast({ title: t('保存失败，请稍后重试'), icon: 'none' });
  }
}
</script>

<style scoped lang="scss">
.address-add-page {
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
  padding: 24rpx 0;
}

.row-border {
  border-bottom: 2rpx solid #f3f3f3;
}

.label {
  width: 150rpx;
  font-size: 28rpx;
  color: #333;
}

.input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.input-placeholder {
  color: #c7c7c7;
}

.bottom-bar {
  margin-top: 80rpx;
}

.save-btn {
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

