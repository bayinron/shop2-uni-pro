<template>
  <view class="apply-page">
    <scroll-view class="content" scroll-y>
      <!-- 基本信息卡片 -->
      <view class="card">
        <text class="section-title">基本信息</text>

        <!-- 店铺头像 -->
        <view class="form-item">
          <text class="form-label">店铺头像</text>
          <view class="avatar-upload" @click="onUploadAvatar">
            <image
              v-if="form.avatar"
              class="avatar-img"
              :src="form.avatar"
              mode="aspectFill"
            />
            <view v-else class="avatar-placeholder">
              <uni-icons type="camera" size="32" color="#ff6b9d" />
            </view>
          </view>
        </view>

        <!-- 店铺名称 -->
        <view class="form-item form-item-border">
          <text class="form-label">店铺名称</text>
          <input
            class="form-input"
            type="text"
            v-model="form.name"
            placeholder="请输入店铺名称"
            placeholder-class="input-placeholder"
          />
        </view>

        <!-- 商品类型 -->
        <view class="form-item form-item-border" @click="onSelectCategory">
          <text class="form-label">商品类型</text>
          <view class="form-select">
            <text :class="['select-text', !form.category_id ? 'select-placeholder' : '']">
              {{ selectedCategoryName || '请选择商品类型' }}
            </text>
            <uni-icons type="bottom" size="16" color="#999" />
          </view>
        </view>

        <!-- 账户所有者姓名 -->
        <view class="form-item form-item-border">
          <text class="form-label">账户所有者姓名</text>
          <input
            class="form-input"
            type="text"
            v-model="form.owner_name"
            placeholder="请输入账户所有者姓名"
            placeholder-class="input-placeholder"
          />
        </view>

        <!-- 身份证照片 -->
        <view class="form-item">
          <text class="form-label">身份证照片</text>
          <view class="id-photos">
            <view class="id-photo-item" @click="onUploadIdPhoto('front')">
              <image
                v-if="form.id_photo_front"
                class="id-photo-img"
                :src="form.id_photo_front"
                mode="aspectFill"
              />
              <view v-else class="id-photo-placeholder">
                <view class="id-photo-icon">
                  <view class="icon-person"></view>
                </view>
                <text class="id-photo-text">正面</text>
              </view>
            </view>
            <view class="id-photo-item" @click="onUploadIdPhoto('back')">
              <image
                v-if="form.id_photo_back"
                class="id-photo-img"
                :src="form.id_photo_back"
                mode="aspectFill"
              />
              <view v-else class="id-photo-placeholder">
                <view class="id-photo-icon">
                  <view class="icon-doc"></view>
                </view>
                <text class="id-photo-text">背面</text>
              </view>
            </view>
          </view>
          <text class="upload-tip">图片文件最大上传 3 MB</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部提交按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="onSubmit">提交申请</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { applyShop, getShopCategories } from '@/api';
import type { ApplyShopPayload } from '@/api';
import globalTool from '@/utils/globalTool';

const form = ref({
  name: '',
  category_id: 0,
  owner_name: '',
  avatar: '',
  id_photo_front: '',
  id_photo_back: '',
});

const categories = ref<any[]>([]);
const selectedCategoryName = computed(() => {
  const category = categories.value.find((c) => c.id === form.value.category_id);
  return category?.name || category?.slug || '';
});

// 返回
function onBack() {
  uni.navigateBack();
}

// 上传店铺头像
function onUploadAvatar() {
  globalTool.chooseImageWithLimit(3).then((tempFilePath: string) => {
    if (!tempFilePath) return;
    // 先展示本地预览，再上传到服务器获取 URL
    form.value.avatar = tempFilePath;
    globalTool.uploadAvatar(tempFilePath).then((url: string) => {
      if (url) {
        form.value.avatar = url;
      }
    });
  });
}

// 上传身份证照片
function onUploadIdPhoto(type: 'front' | 'back') {
  
}

// 选择商品类型
function onSelectCategory() {
  if (!categories.value.length) {
    uni.showToast({ title: '加载分类中...', icon: 'none' });
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

// 表单验证
function validate(): boolean {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入店铺名称', icon: 'none' });
    return false;
  }
  if (!form.value.category_id) {
    uni.showToast({ title: '请选择商品类型', icon: 'none' });
    return false;
  }
  if (!form.value.owner_name.trim()) {
    uni.showToast({ title: '请输入账户所有者姓名', icon: 'none' });
    return false;
  }
  if (!form.value.avatar) {
    uni.showToast({ title: '请上传店铺头像', icon: 'none' });
    return false;
  }
  if (!form.value.id_photo_front) {
    uni.showToast({ title: '请上传身份证正面照片', icon: 'none' });
    return false;
  }
  if (!form.value.id_photo_back) {
    uni.showToast({ title: '请上传身份证背面照片', icon: 'none' });
    return false;
  }
  return true;
}

// 提交申请
async function onSubmit() {
  if (!validate()) return;

  try {
    uni.showLoading({ title: '提交中...' });
    
    // TODO: 先上传图片到服务器获取URL，然后提交表单
    // 这里暂时使用本地路径，实际应该先上传图片
    const payload: ApplyShopPayload = {
      name: form.value.name,
      category_id: form.value.category_id,
      owner_name: form.value.owner_name,
      avatar: form.value.avatar, // 应该是上传后的URL
      id_photo_front: form.value.id_photo_front, // 应该是上传后的URL
      id_photo_back: form.value.id_photo_back, // 应该是上传后的URL
    };

    await applyShop(payload);
    uni.hideLoading();
    uni.showToast({ title: '申请提交成功', icon: 'success' });
    
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (e: any) {
    uni.hideLoading();
    console.error('提交申请失败', e);
    uni.showToast({
      title: e?.message || '提交失败，请稍后重试',
      icon: 'none',
    });
  }
}

// 加载商品分类
onLoad(async () => {
  try {
    const res: any = await getShopCategories();
    categories.value = res?.data || res || [];
  } catch (e) {
    console.error('加载分类失败', e);
  }
});
</script>

<style scoped lang="scss">
.apply-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}


.content {
  flex: 1;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.card {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 30rpx;
  display: block;
}

.form-item {
  padding: 24rpx 0;
}

.form-item-border {
  border-bottom: 2rpx solid #f3f3f3;
}

.form-label {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 20rpx;
  display: block;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.input-placeholder {
  color: #c7c7c7;
}

.form-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.select-text {
  font-size: 28rpx;
  color: #333333;
}

.select-placeholder {
  color: #c7c7c7;
}

// 头像上传
.avatar-upload {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 身份证照片上传
.id-photos {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.id-photo-item {
  flex: 1;
  height: 200rpx;
  border: 2rpx dashed #4fc3f7;
  border-radius: 12rpx;
  background: #f8fdff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.id-photo-img {
  width: 100%;
  height: 100%;
}

.id-photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.id-photo-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.icon-person {
  width: 60rpx;
  height: 60rpx;
  border: 3rpx solid #4fc3f7;
  border-radius: 50%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30rpx;
    height: 30rpx;
    border: 3rpx solid #4fc3f7;
    border-top: none;
    border-radius: 0 0 30rpx 30rpx;
  }
}

.icon-doc {
  width: 50rpx;
  height: 70rpx;
  border: 3rpx solid #4fc3f7;
  border-radius: 4rpx;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 8rpx;
    left: 8rpx;
    right: 8rpx;
    height: 8rpx;
    background: #4fc3f7;
    border-radius: 2rpx;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 20rpx;
    left: 8rpx;
    right: 8rpx;
    height: 2rpx;
    background: #4fc3f7;
  }
}

.id-photo-text {
  font-size: 24rpx;
  color: #666666;
}

.upload-tip {
  font-size: 24rpx;
  color: #ff3e6c;
  margin-top: 12rpx;
  display: block;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
  border-radius: 44rpx;
  background: #ff6b9d;
  color: #ffffff;
  font-size: 32rpx;
  border: none;
}
</style>
