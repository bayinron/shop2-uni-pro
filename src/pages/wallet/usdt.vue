<template>
  <view class="usdt-page">
    <!-- 顶部标题栏占位（导航由 pages.json 控制） -->
    <view class="header-placeholder" />

    <!-- 表单区域（根据后端返回的 USDT fields_config 动态生成） -->
    <view class="form-card" v-if="fieldConfigs.length">
      <view
        v-for="(field, index) in fieldConfigs"
        :key="field.key"
        class="form-item"
        :class="{ 'no-border': index === fieldConfigs.length - 1 }"
        @click="field.type === 'select' ? onSelectField(field) : undefined"
      >
        <text class="form-label">{{ field.label }}</text>

        <!-- 下拉选择类型 -->
        <view
          v-if="field.type === 'select'"
          class="form-right"
        >
          <text class="form-value">
            {{ form[field.key] || '请选择' }}
          </text>
          <uni-icons type="bottom" size="18" color="#c7c7c7" />
        </view>

        <!-- 普通输入类型 -->
        <input
          v-else
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
import { onLoad } from '@dcloudio/uni-app';
import { getBankTemplates, bindUserPaymentMethod,getUserPaymentMethods } from '@/api/pay';
import globalTool from '@/utils/globalTool';

const tpl = ref<any>(null);
const fieldConfigs = ref<any[]>([]);
const form = ref<Record<string, any>>({});

onLoad(() => {
  // 与银行卡页类似，这里使用 country_code: 'usdt'
  getBankTemplates({ country_code: 'usdt' }).then((res: any) => {
    const t = res?.[0] || null;
    tpl.value = t;
    const cfg = t?.fields_config || t?.fields || [];
    fieldConfigs.value = Array.isArray(cfg) ? cfg : [];

    // 初始化表单字段
    fieldConfigs.value.forEach((f: any) => {
      if (form.value[f.key] === undefined) {
        form.value[f.key] = '';
      }
    });

    nextTick(() => {
      getUserPaymentMethods({ bank_template_id: tpl.value.id }).then((res: any) => {
        if (res.length > 0) {
          form.value = res[0].details;
        }
      });
    });
  });
});

function onSelectField(field: any) {
  const options: string[] = field.options || [];
  if (!options.length) return;
  uni.showActionSheet({
    itemList: options,
    success: (res) => {
      const idx = res.tapIndex;
      if (idx >= 0 && idx < options.length) {
        form.value[field.key] = options[idx];
      }
    },
  });
}

function onSave() {
  // 必填校验
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

  if (!tpl.value?.id) {
    uni.showToast({ title: 'USDT模板未加载完成', icon: 'none' });
    return;
  }

  const accountInfo: Record<string, any> = {};
  fieldConfigs.value.forEach((field: any) => {
    accountInfo[field.key] = form.value[field.key];
  });

  bindUserPaymentMethod({
    name: 'USDT',
    bank_template_id: tpl.value.id,
    details: accountInfo,
  }).then((res: any) => {
    console.log(res);
    globalTool.showToast('保存成功', true, 'success');
  });
}
</script>

<style scoped lang="scss">
.usdt-page {
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
  justify-content: space-between;
}

.form-item.no-border {
  border-bottom: none;
}

.form-label {
  font-size: 28rpx;
  color: #333333;
}

.form-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.form-value {
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

