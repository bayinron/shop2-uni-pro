<template>
  <view class="bank-page">
    <!-- 顶部标题栏占位（导航由 pages.json 控制） -->
    <view class="header-placeholder" />

    <!-- 表单区域（根据后端返回的 fields_config 动态生成） -->
    <view class="form-card" v-if="fieldConfigs.length">
      <view
        v-for="(field, index) in fieldConfigs"
        :key="field.key"
        class="form-item"
        :class="{ 'no-border': index === fieldConfigs.length - 1 }"
      >
        <text class="form-label">{{ field.label }}</text>
        <input
          class="form-input"
          :type="field.type === 'number' ? 'number' : 'text'"
          v-model="form[field.key]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          placeholder-class="form-input-placeholder"
        />
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="onSave">保存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {getBankTemplates,bindUserPaymentMethod, getUserPaymentMethods} from '@/api/pay';
import { onLoad } from '@dcloudio/uni-app';
import globalTool from '@/utils/globalTool';
const cny = ref<any>(null);
const fieldConfigs = ref<any[]>([]);
onLoad(() => {
  getBankTemplates().then((res: any) => {
    const tpl = res.data.find((t: any) => t.currency === 'USD');
    if (!tpl?.id) {
      globalTool.showToast('未找到银行卡模板', false, 'none');
      return;
    }
    cny.value = tpl;
    // 兼容字段名为 fields_config 或 fields
    const cfg = tpl?.fields_config || tpl?.fields || [];
    fieldConfigs.value = Array.isArray(cfg) ? cfg : [];
    // 初始化表单字段
    fieldConfigs.value.forEach((f: any) => {
      const key = f.key;
      if (form.value[key] === undefined) {
        form.value[key] = '';
      }
    });
    nextTick(() => {
      getUserPaymentMethods({ bank_template_id: cny.value.id }).then((res: any) => {
        if (res.data.length > 0) {
          form.value = res.data[0].details;
        }
      });
    });
  });
});

const form = ref<Record<string, string>>({});

function onSave() {
  // 按配置做必填校验
  for (const field of fieldConfigs.value as any[]) {
    if (!field.required) continue;
    const rawVal = form.value[field.key] as unknown;
    const val = typeof rawVal === 'string' ? rawVal.trim() : rawVal;
    if (val === undefined || val === null || val === '') {
      uni.showToast({
        title: field.placeholder || `请输入${field.label}`,
        icon: 'none',
      });
      return;
    }
  }

  if (!cny.value?.id) {
    uni.showToast({ title: '银行模板未加载完成', icon: 'none' });
    return;
  }

  const accountInfo: Record<string, any> = {};
  fieldConfigs.value.forEach((field: any) => {
    accountInfo[field.key] = form.value[field.key];
  });

  bindUserPaymentMethod({
    name: '银行',
    bank_template_id: cny.value.id,
    details: accountInfo,
  }).then((res: any) => {
    console.log(res);
    globalTool.showToast('保存成功', true, 'success');
  });
}
</script>

<style scoped lang="scss">
.bank-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-placeholder {
  height: 0;
}

.form-card {
  margin-top: 16rpx;
  background: #ffffff;
}

.form-item {
  padding: 0 30rpx;
  height: 96rpx;
  border-bottom: 1rpx solid #f2f2f2;
  display: flex;
  align-items: center;
}

.form-item.no-border {
  border-bottom: none;
}

.form-label {
  width: 180rpx;
  font-size: 28rpx;
  color: #333333;
}

.form-input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #333333;
}

.form-input-placeholder {
  font-size: 28rpx;
  color: #c7c7c7;
}

.bottom-bar {
  margin-top: 60rpx;
  padding: 0 30rpx 40rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: #ff3e6c;
  color: #ffffff;
  font-size: 30rpx;
  border: none;
}
</style>

