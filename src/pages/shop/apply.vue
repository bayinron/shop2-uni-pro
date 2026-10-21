<template>
  <view class="apply-page">
    <scroll-view class="content" scroll-y>
      <!-- 品牌标题 -->
      <view class="brand-header">
        <text class="brand-title">{{ t('申请共同开设店铺') }}</text>
        <image class="brand-logo" src="/static/images/shopee_logo_400.png" mode="aspectFit" />
      </view>


      <!-- 店铺头像 -->
      <view class="section avatar-section" @click="onUploadAvatar">
        <view class="avatar-circle">
          <image v-if="form.avatar" class="avatar-img" :src="resolveMediaUrl(form.avatar)" mode="widthFix" />
          <template v-else>
            <uni-icons type="shop" size="46" color="#ee4d2d" />
            <text class="avatar-pick-hint"> {{ t('请选择图片') }}</text>
          </template>
        </view>
        <text class="section-label underline-label">{{ t('店铺头像') }}</text>
      </view>

      <!-- 店铺名称 -->
      <view class="section field-section">
        <text class="section-label">{{ t('店铺名称') }}</text>
        <input
          class="rounded-input"
          type="text"
          v-model="form.name"
          :placeholder="t('请输入店铺名称')"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 商品类别 -->
      <view class="section field-section">
        <text class="section-label">{{ t('商品类别') }}</text>
        <view class="rounded-select" @click="onSelectCategory">
          <text :class="['select-text', !form.category_id ? 'input-placeholder' : '']">
            {{ selectedCategoryName || t('请选择商品类别') }}
          </text>
          <uni-icons type="bottom" size="14" color="#666" />
        </view>
      </view>

      <!-- 个人资料 -->
      <view class="section field-section">
        <text class="section-label underline-label">{{ t('个人资料') }}</text>
        <view class="group-box">
          <input
            class="group-input"
            type="text"
            v-model="form.owner_name"
            :placeholder="t('请输入姓名和姓氏')"
            placeholder-class="input-placeholder"
          />
          <input
            class="group-input"
            type="number"
            v-model="form.phone"
            :placeholder="t('请输入电话号码')"
            placeholder-class="input-placeholder"
          />
          <input
            class="group-input group-input-last"
            type="text"
            v-model="form.address"
            :placeholder="t('请输入地址')"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 身份验证文件 -->
      <view class="section field-section">
        <text class="section-label underline-label">{{ t('身份验证文件') }}</text>
        <view class="group-box id-group-box">
          <view class="group-select" @click="onSelectDocType">
            <text :class="['select-text', !form.doc_type ? 'input-placeholder' : '']">
              {{ selectedDocTypeName || t('请选择证件类型') }}
            </text>
            <uni-icons type="bottom" size="14" color="#666" />
          </view>

          <view class="id-photos">
            <view class="id-photo-col" @click="onUploadIdPhotoFront">
              <text class="id-photo-label">-{{ t('证件正面照片') }}</text>
              <view class="id-photo-box">
                <image
                  v-if="form.id_photo_front"
                  class="id-photo-img"
                  :src="resolveMediaUrl(form.id_photo_front)"
                  mode="aspectFill"
                />
                <view v-else class="id-photo-placeholder">
                  <view class="id-icon id-icon-front">
                    <view class="id-icon-face"></view>
                    <view class="id-icon-lines">
                      <view class="id-icon-line"></view>
                      <view class="id-icon-line"></view>
                      <view class="id-icon-line short"></view>
                    </view>
                  </view>
                  <text class="pick-hint">← {{ t('请选择图片') }}</text>
                </view>
              </view>
            </view>
            <view class="id-photo-col" @click="onUploadIdPhotoBack">
              <text class="id-photo-label">-{{ t('证件背面照片') }}</text>
              <view class="id-photo-box">
                <image
                  v-if="form.id_photo_back"
                  class="id-photo-img"
                  :src="resolveMediaUrl(form.id_photo_back)"
                  mode="aspectFill"
                />
                <view v-else class="id-photo-placeholder">
                  <view class="id-icon id-icon-back">
                    <view class="id-icon-stripe"></view>
                  </view>
                  <text class="pick-hint">← {{ t('请选择图片') }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <view class="bottom-bar">
      <button class="submit-btn" @click="onSubmit">{{ t('确认') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { submitMerchantApplication } from '@/api/myshop';
import type { MerchantApplicationPayload } from '@/api/myshop';
import globalTool from '@/utils/globalTool';
import { getShopCategories } from '@/api';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();

const DOC_TYPES = ['身份证', '驾照', '护照'] as const;

const form = ref({
  name: '',
  category_id: 0,
  owner_name: '',
  phone: '',
  address: '',
  doc_type: '' as (typeof DOC_TYPES)[number] | '',
  avatar: '',
  id_photo_front: '',
  id_photo_back: '',
});

const categories = ref<any[]>([]);

const selectedCategoryName = computed(() => {
  const category = categories.value.find((c) => c.id === form.value.category_id);
  return category?.name || category?.slug || '';
});

const selectedDocTypeName = computed(() => (form.value.doc_type ? t(form.value.doc_type) : ''));

const resolveMediaUrl = (url: string) => globalTool.resolveMediaUrl(url);

function onUploadAvatar() {
  globalTool.chooseAndUploadImage(3).then((url) => {
    if (url) form.value.avatar = url;
  });
}

function onUploadIdPhotoFront() {
  globalTool.chooseAndUploadImage(3).then((url) => {
    if (url) form.value.id_photo_front = url;
  });
}

function onUploadIdPhotoBack() {
  globalTool.chooseAndUploadImage(3).then((url) => {
    if (url) form.value.id_photo_back = url;
  });
}

function onSelectCategory() {
  if (!categories.value.length) {
    globalTool.showToast(t('加载分类中...'), false, 'none');
    return;
  }

  const itemList = categories.value.map((c) => c.name || c.slug || '');
  uni.showActionSheet({
    itemList,
    success: (res) => {
      const selectedCategory = categories.value[res.tapIndex];
      if (selectedCategory) {
        form.value.category_id = selectedCategory.id;
      }
    },
  });
}

function onSelectDocType() {
  uni.showActionSheet({
    itemList: DOC_TYPES.map((key) => t(key)),
    success: (res) => {
      form.value.doc_type = DOC_TYPES[res.tapIndex] || '';
    },
  });
}

function validate(): boolean {
  if (!globalTool.isUploadedMediaUrl(form.value.avatar)) {
    globalTool.showToast(t('请上传店铺头像'), false, 'none');
    return false;
  }
  if (!form.value.name.trim()) {
    globalTool.showToast(t('请输入店铺名称'), false, 'none');
    return false;
  }
  if (!form.value.category_id) {
    globalTool.showToast(t('请选择商品类别'), false, 'none');
    return false;
  }
  if (!form.value.owner_name.trim()) {
    globalTool.showToast(t('请输入姓名和姓氏'), false, 'none');
    return false;
  }
  if (!form.value.phone.trim()) {
    globalTool.showToast(t('请输入电话号码'), false, 'none');
    return false;
  }
  if (!form.value.address.trim()) {
    globalTool.showToast(t('请输入地址'), false, 'none');
    return false;
  }
  if (!form.value.doc_type) {
    globalTool.showToast(t('请选择证件类型'), false, 'none');
    return false;
  }
  if (!globalTool.isUploadedMediaUrl(form.value.id_photo_front)) {
    globalTool.showToast(t('请上传证件正面'), false, 'none');
    return false;
  }
  if (!globalTool.isUploadedMediaUrl(form.value.id_photo_back)) {
    globalTool.showToast(t('请上传证件反面'), false, 'none');
    return false;
  }
  return true;
}

async function onSubmit() {
  if (!validate()) return;

  uni.showLoading({ title: t('提交中...') });

  try {
    const payload: MerchantApplicationPayload = {
      applicant_name: form.value.owner_name.trim(),
      shop_name: form.value.name.trim(),
      shop_description: `${t('电话号码')}: ${form.value.phone.trim()}\n${t('详细地址')}: ${form.value.address.trim()}\n${t('证件类型')}: ${t(form.value.doc_type)}`,
      shop_category_id: form.value.category_id,
      id_doc_front_url: globalTool.stripMediaUrl(form.value.id_photo_front),
      id_doc_back_url: globalTool.stripMediaUrl(form.value.id_photo_back),
      shop_logo_url: globalTool.stripMediaUrl(form.value.avatar),
    };
    await submitMerchantApplication(payload);
    globalTool.showToast(t('申请提交成功'), true, 'success');
  } catch (e) {
    console.error(t('提交申请失败'), e);
  } finally {
    uni.hideLoading();
  }
}

onLoad(async () => {
  try {
    const res: any = await getShopCategories();
    categories.value = res?.data || res || [];
  } catch (e) {
    console.error(t('加载分类失败'), e);
  }
});
</script>

<style scoped lang="scss">
$orange: #ee4d2d;
$text: #333333;
$muted: #9e9e9e;
$field-bg: #ececec;

.apply-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 24rpx 48rpx 0;
  box-sizing: border-box;
}

.brand-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 8rpx 0 20rpx;
}

.brand-title {
  font-size: 32rpx;
  font-weight: 500;
  color: $orange;
  line-height: 1.4;
  text-align: center;
}

.brand-logo {
  width: 220rpx;
  height: 80rpx;
}

.page-hint {
  display: block;
  text-align: center;
  font-size: 26rpx;
  font-weight: 500;
  color: $text;
  margin-bottom: 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.field-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-label {
  display: inline-block;
  font-size: 28rpx;
  color: $text;
  font-weight: 500;
  margin-bottom: 16rpx;
  text-align: center;
}

.underline-label {
  padding-bottom: 4rpx;
  border-bottom: 2rpx solid $text;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.avatar-circle {
  width: 220rpx;
  height: 220rpx;
  border-radius: 50%;
  background: $field-bg;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.avatar-img {
  width: 70%;
  height: 70%;
}

.avatar-pick-hint {
  font-size: 22rpx;
  color: $muted;
  margin-top: -20rpx;
}

.rounded-input,
.rounded-select {
  width: 100%;
  height: 80rpx;
  background: $field-bg;
  border-radius: 40rpx;
  padding: 0 32rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: $text;
  text-align: center;
}

.rounded-select {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.rounded-select .uni-icons {
  position: absolute;
  right: 32rpx;
}

.select-text {
  flex: 1;
  font-size: 28rpx;
  color: $text;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-placeholder {
  color: $muted;
  text-align: center;
}

.group-box {
  width: 100%;
  background: $field-bg;
  border-radius: 32rpx;
  padding: 8rpx 28rpx;
  box-sizing: border-box;
}

.group-input {
  width: 100%;
  height: 76rpx;
  font-size: 28rpx;
  color: $text;
  text-align: center;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
}

.group-input-last {
  border-bottom: none;
}

.group-select {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 76rpx;
  border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
  margin-bottom: 8rpx;
}

.group-select .uni-icons {
  position: absolute;
  right: 0;
}

.id-group-box {
  padding-bottom: 28rpx;
}

.id-photos {
  display: flex;
  gap: 24rpx;
  margin-top: 16rpx;
}

.id-photo-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.id-photo-label {
  display: block;
  font-size: 22rpx;
  color: $text;
  margin-bottom: 12rpx;
  text-align: center;
}

.id-photo-box {
  width: 100%;
  height: 180rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.id-photo-img {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.id-photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
}

.pick-hint {
  font-size: 22rpx;
  color: $muted;
}

.id-icon {
  width: 88rpx;
  height: 60rpx;
  border: 3rpx solid #b0b0b0;
  border-radius: 6rpx;
  position: relative;
  box-sizing: border-box;
}

.id-icon-front {
  display: flex;
  align-items: center;
  padding: 0 10rpx;
  gap: 8rpx;
}

.id-icon-face {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
  background: #cfcfcf;
  flex-shrink: 0;
}

.id-icon-lines {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.id-icon-line {
  height: 4rpx;
  background: #cfcfcf;
  border-radius: 2rpx;

  &.short {
    width: 60%;
  }
}

.id-icon-back {
  overflow: hidden;
}

.id-icon-stripe {
  position: absolute;
  left: 0;
  right: 0;
  top: 14rpx;
  height: 16rpx;
  background: #cfcfcf;
}

.bottom-spacer {
  height: 160rpx;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 48rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #ffffff;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  background: $orange;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  border: none;

  &::after {
    border: none;
  }
}
</style>
