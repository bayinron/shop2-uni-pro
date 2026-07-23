<template>
  <view class="bank-page">
    <view class="header-placeholder" />

    <!-- 表单区域（根据后端返回的 fields_config 动态生成） -->
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
        <view v-if="field.type === 'select'" class="form-right">
          <text class="form-value">
            {{ form[field.key] || t('请选择') }}
          </text>
          <uni-icons type="bottom" size="18" color="#c7c7c7" />
        </view>

        <!-- 普通输入类型 -->
        <input
          v-else
          class="form-input"
          :type="field.type === 'number' ? 'number' : 'text'"
          v-model="form[field.key]"
          :placeholder="field.placeholder || (t('请输入') + field.label)"
          placeholder-class="form-input-placeholder"
        />
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="onSave">{{ t('保存') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { getBankTemplates, bindUserPaymentMethod, getUserPaymentMethods } from '@/api/pay';
import { onLoad } from '@dcloudio/uni-app';
import globalTool from '@/utils/globalTool';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const currentTpl = ref<any>(null);
const fieldConfigs = ref<any[]>([]);
const form = ref<Record<string, string>>({});
const templateIdFromQuery = ref<number | null>(null);

onLoad((options: any) => {
  if (options?.templateId) {
    templateIdFromQuery.value = Number(options.templateId);
  }
  loadTemplate();
});

function loadTemplate() {
  getBankTemplates().then((res: any) => {
    const list = res.data || [];
    let tpl: any = null;

    if (templateIdFromQuery.value) {
      tpl = list.find((item: any) => item.id === templateIdFromQuery.value);
    }
    // 兼容旧入口：未传 templateId 时优先 USD，其次取第一项
    if (!tpl) {
      tpl = list.find((item: any) => item.currency === 'USD') || list[0];
    }

    if (!tpl?.id) {
      globalTool.showToast(t('未找到银行卡模板'), false, 'none');
      return;
    }

    currentTpl.value = tpl;
    if (tpl.name) {
      uni.setNavigationBarTitle({ title: tpl.name });
    }

    const cfg = tpl?.fields_config || tpl?.fields || [];
    fieldConfigs.value = Array.isArray(cfg) ? cfg : [];

    fieldConfigs.value.forEach((f: any) => {
      const key = f.key;
      if (form.value[key] === undefined) {
        form.value[key] = '';
      }
    });

    nextTick(() => {
      getUserPaymentMethods({ bank_template_id: currentTpl.value.id }).then((methodRes: any) => {
        if (methodRes.data?.length > 0) {
          form.value = { ...form.value, ...methodRes.data[0].details };
        }
      });
    });
  });
}

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
  for (const field of fieldConfigs.value as any[]) {
    if (!field.required) continue;
    const rawVal = form.value[field.key] as unknown;
    const val = typeof rawVal === 'string' ? rawVal.trim() : rawVal;
    if (val === undefined || val === null || val === '') {
      uni.showToast({
        title: field.placeholder || (t('请输入') + field.label),
        icon: 'none',
      });
      return;
    }
    if (field.regex) {
      try {
        const re = new RegExp(field.regex);
        if (!re.test(String(val))) {
          uni.showToast({
            title: field.placeholder || (t('请输入正确的') + field.label),
            icon: 'none',
          });
          return;
        }
      } catch (e) {
        // 忽略非法正则
      }
    }
  }

  if (!currentTpl.value?.id) {
    uni.showToast({ title: t('银行模板未加载完成'), icon: 'none' });
    return;
  }

  const accountInfo: Record<string, any> = {};
  fieldConfigs.value.forEach((field: any) => {
    accountInfo[field.key] = form.value[field.key];
  });

  bindUserPaymentMethod({
    name: currentTpl.value.name || t('银行'),
    bank_template_id: currentTpl.value.id,
    details: accountInfo,
  }).then(() => {
    globalTool.showToast(t('保存成功'), () => {
      uni.navigateBack();
    }, 'success');
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
  justify-content: space-between;
}

.form-item.no-border {
  border-bottom: none;
}

.form-label {
  width: 220rpx;
  font-size: 28rpx;
  color: #333333;
  flex-shrink: 0;
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
