<template>
  <view class="bank-page">
    <view class="header-placeholder" />

    <!-- 已绑定：只读展示，不可自行修改 -->
    <view v-if="boundAccount" class="form-card">
      <view class="form-item">
        <text class="form-label">{{ t('收款姓名') }}</text>
        <text class="form-value">{{ boundAccount.account_name }}</text>
      </view>
      <view class="form-item">
        <text class="form-label">{{ t('收款账号') }}</text>
        <text class="form-value">{{ boundAccount.account_number }}</text>
      </view>
      <view class="form-item no-border">
        <text class="form-label">{{ t('银行名称') }}</text>
        <text class="form-value">{{ boundAccount.bank_name }}</text>
      </view>
    </view>

    <!-- 未绑定：可填写表单 -->
    <view v-else-if="!loading && !bindLocked" class="form-card">
      <view class="form-item">
        <text class="form-label">{{ t('收款姓名') }}</text>
        <input
          class="form-input"
          type="text"
          v-model="form.account_name"
          :placeholder="t('请输入收款姓名')"
          placeholder-class="form-input-placeholder"
        />
      </view>
      <view class="form-item">
        <text class="form-label">{{ t('收款账号') }}</text>
        <input
          class="form-input"
          type="text"
          v-model="form.account_number"
          :placeholder="t('请输入收款账号')"
          placeholder-class="form-input-placeholder"
        />
      </view>
      <view class="form-item no-border">
        <text class="form-label">{{ t('银行名称') }}</text>
        <input
          class="form-input"
          type="text"
          v-model="form.bank_name"
          :placeholder="t('请输入银行名称')"
          placeholder-class="form-input-placeholder"
        />
      </view>
    </view>

    <!-- 已绑定或占用名额（含管理员停用）：引导联系客服 -->
    <view v-if="boundAccount || bindLocked" class="tip-card">
      <text class="tip-text">{{ tipMessage }}</text>
    </view>

    <view class="bottom-bar">
      <button
        v-if="boundAccount || bindLocked"
        class="submit-btn"
        @click="goCustomerService"
      >
        {{ t('联系客服') }}
      </button>
      <button
        v-else-if="!loading"
        class="submit-btn"
        :disabled="submitting"
        @click="onSave"
      >
        {{ t('保存') }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import {
  bindUserPaymentMethod,
  getUserPaymentMethods,
  type UserPaymentMethod,
} from '@/api/pay';
import { useUserStoreHook } from '@/stores/modules/userStore';
import globalTool from '@/utils/globalTool';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();
const userStore = useUserStoreHook();

const loading = ref(true);
const submitting = ref(false);
/** 列表为空但 POST 返回 403：停用账户仍占用绑定名额 */
const bindLocked = ref(false);
const boundAccount = ref<UserPaymentMethod | null>(null);
const form = ref({
  account_name: '',
  account_number: '',
  bank_name: '',
});

const tipMessage = computed(() =>
  t('如需变更请联系客服由管理员处理')
);

function unwrapList(res: any): UserPaymentMethod[] {
  const data = res?.data?.data ?? res?.data ?? res;
  return Array.isArray(data) ? data : [];
}

async function loadPaymentMethod() {
  loading.value = true;
  bindLocked.value = false;
  try {
    const res: any = await getUserPaymentMethods();
    const list = unwrapList(res);
    boundAccount.value = list.length > 0 ? list[0] : null;
  } catch {
    boundAccount.value = null;
  } finally {
    loading.value = false;
  }
}

onShow(() => {
  loadPaymentMethod();
});

function goCustomerService() {
  const url = userStore.kefuConfig?.external_url;
  if (!url) {
    uni.showToast({ title: t('请联系客服'), icon: 'none' });
    return;
  }
  uni.navigateTo({
    url: '/pages/service/index?url=' + url,
  });
}

function onSave() {
  const account_name = form.value.account_name.trim();
  const account_number = form.value.account_number.trim();
  const bank_name = form.value.bank_name.trim();

  if (!account_name) {
    uni.showToast({ title: t('请输入收款姓名'), icon: 'none' });
    return;
  }
  if (!account_number) {
    uni.showToast({ title: t('请输入收款账号'), icon: 'none' });
    return;
  }
  if (!bank_name) {
    uni.showToast({ title: t('请输入银行名称'), icon: 'none' });
    return;
  }

  if (submitting.value) return;
  submitting.value = true;

  bindUserPaymentMethod({
    account_name,
    account_number,
    bank_name,
  })
    .then((res: any) => {
      const data = res?.data?.data ?? res?.data ?? res;
      if (data && typeof data === 'object' && data.account_name) {
        boundAccount.value = data as UserPaymentMethod;
      }
      globalTool.showToast(t('保存成功'), () => {
        loadPaymentMethod();
      }, 'success');
    })
    .catch((err: any) => {
      const code = err?.data?.code ?? err?.statusCode;
      const message = err?.data?.message || '';
      // 已有账户（含管理员停用）：列表可能为空，需按 403 引导联系客服
      if (code === 403 || String(message).includes('已绑定')) {
        bindLocked.value = true;
      }
    })
    .finally(() => {
      submitting.value = false;
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

.form-value {
  flex: 1;
  text-align: right;
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

.tip-card {
  margin: 24rpx 30rpx 0;
  padding: 24rpx;
  background: #fff7f9;
  border-radius: 12rpx;
}

.tip-text {
  font-size: 26rpx;
  color: #ff3e6c;
  line-height: 1.5;
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

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
