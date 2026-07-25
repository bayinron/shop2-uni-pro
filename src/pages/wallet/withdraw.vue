<template>
  <view class="withdraw-page">
    <view class="header-placeholder" />

    <!-- 提现金额 -->
    <view class="section">
      <text class="section-label">{{ t('提现金额') }}</text>
      <view class="amount-input-wrap">
        <text class="currency-symbol">฿</text>
        <input class="amount-input" type="number" v-model="form.amount" :placeholder="t('请输入提现金额')" />
      </view>
    </view>

    <!-- 提现类型（来自服务器银行模板） -->
    <view class="section">
      <view class="section-row" @click="onWithdrawTypeClick">
        <text class="section-label">{{ t('提现类型') }}</text>
        <view class="section-right">
          <text class="section-value">{{ currentTemplate?.name || t('请选择') }}</text>
          <uni-icons type="bottom" size="18" color="#999" />
        </view>
      </view>
    </view>

    <!-- 收款账户 -->
    <view class="section" v-if="currentTemplate">
      <view class="section-row" @click="onPaymentMethodClick">
        <text class="section-label">{{ t('收款账户') }}</text>
        <view class="section-right">
          <text class="section-value" :class="{ placeholder: !paymentMethod }">
            {{ paymentMethodSummary }}
          </text>
          <uni-icons type="right" size="18" color="#999" />
        </view>
      </view>
      <view class="account-details" v-if="paymentMethod && accountDetailLines.length">
        <view class="detail-row" v-for="line in accountDetailLines" :key="line.key">
          <text class="detail-label">{{ line.label }}</text>
          <text class="detail-value">{{ line.value }}</text>
        </view>
      </view>
    </view>

    <!-- 支付密码 -->
    <view class="section">
      <text class="section-label">{{ t('支付密码') }}</text>
      <input class="password-input" type="text" password v-model="form.payPassword" :placeholder="t('请输入支付密码')" />

      <view class="balance-row">
        <text class="balance-text">
          {{ t('可用余额：') }}<text class="balance-amount">฿ {{ availableBalance }}</text>
        </text>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="onSubmit">{{ t('提现') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStoreHook } from '@/stores/modules/userStore';
import { getBankTemplates, getUserPaymentMethods, submitWalletWithdraw } from '@/api/pay';
import globalTool from '@/utils/globalTool';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();

type BankTemplateItem = {
  id: number;
  name: string;
  currency: string;
  country_code?: string;
  fields_config?: Array<{
    key: string;
    type?: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    options?: string[];
    regex?: string;
  }>;
  status?: number;
  [key: string]: any;
};

const form = ref({
  amount: '',
  payPassword: '',
});

const bankTemplates = ref<BankTemplateItem[]>([]);
const currentTemplate = ref<BankTemplateItem | null>(null);
const paymentMethod = ref<any>(null);
const loadingMethods = ref(false);

const userStore = useUserStoreHook();
const userInfo = computed(() => userStore.userInfo);
const availableBalance = computed(() =>
  userInfo.value?.wallet?.balance_wallet?.balance_formatted ??
  userInfo.value?.balance ??
  '0'
);

const currencySymbolMap: Record<string, string> = {
  THB: '฿',
  TWD: 'NT$',
  USD: '$',
  CNY: '¥',
  USDT: '₮',
};

const currencySymbol = computed(() => {
  const code = currentTemplate.value?.currency?.toUpperCase() || 'THB';
  return currencySymbolMap[code] || code;
});

const paymentMethodSummary = computed(() => {
  if (!paymentMethod.value) return t('去绑定收款账户');
  return paymentMethod.value.name || currentTemplate.value?.name || t('已绑定');
});

const accountDetailLines = computed(() => {
  const details = paymentMethod.value?.details || {};
  const fields = currentTemplate.value?.fields_config || [];
  if (!fields.length) {
    return Object.keys(details).map((key) => ({
      key,
      label: key,
      value: String(details[key] ?? ''),
    }));
  }
  return fields
    .filter((f) => details[f.key] !== undefined && details[f.key] !== null && details[f.key] !== '')
    .map((f) => ({
      key: f.key,
      label: f.label,
      value: String(details[f.key]),
    }));
});

watch(userInfo, (newVal) => {
  if (newVal && !newVal.has_withdraw_password) {
    globalTool.showToast(t('请先设置提现密码'), () => {
      uni.navigateTo({
        url: '/pages/wallet/editPayPwd?first=true',
      });
    });
  }
});

onLoad(() => {
  loadBankTemplates();
});

onShow(() => {
  if (currentTemplate.value?.id) {
    loadPaymentMethod(currentTemplate.value.id);
  }
});

function loadBankTemplates() {
  getBankTemplates().then((res: any) => {
    const list = (res.data || []).filter((item: BankTemplateItem) => item.status !== 0);
    bankTemplates.value = list;
    if (!list.length) {
      globalTool.showToast(t('暂无可用提现方式'), false, 'none');
      return;
    }
    // 默认选中第一项
    selectTemplate(list[0]);
  });
}

function selectTemplate(tpl: BankTemplateItem) {
  currentTemplate.value = tpl;
  paymentMethod.value = null;
  loadPaymentMethod(tpl.id);
}

function loadPaymentMethod(templateId: number) {
  loadingMethods.value = true;
  getUserPaymentMethods({ bank_template_id: templateId })
    .then((methodsRes: any) => {
      const list = methodsRes.data || [];
      paymentMethod.value = list[0] || null;
    })
    .finally(() => {
      loadingMethods.value = false;
    });
}

function onWithdrawTypeClick() {
  if (!bankTemplates.value.length) {
    uni.showToast({ title: t('暂无可用提现方式'), icon: 'none' });
    return;
  }
  const itemList = bankTemplates.value.map((p) => `${p.name} (${p.currency})`);
  uni.showActionSheet({
    itemList,
    success: (res) => {
      const idx = res.tapIndex;
      if (idx >= 0 && idx < bankTemplates.value.length) {
        selectTemplate(bankTemplates.value[idx]);
      }
    },
  });
}

function goBindPaymentMethod() {
  const tpl = currentTemplate.value;
  if (!tpl?.id) return;

  // USDT 走专用页，其余走通用银行账户页并传入模板 ID
  if (String(tpl.currency).toUpperCase() === 'USDT') {
    uni.navigateTo({ url: '/pages/wallet/usdt' });
    return;
  }
  uni.navigateTo({
    url: `/pages/wallet/bank?templateId=${tpl.id}`,
  });
}

function onPaymentMethodClick() {
  goBindPaymentMethod();
}

function onSubmit() {
  const amountNum = Number(form.value.amount);
  if (!amountNum || amountNum <= 0) {
    uni.showToast({ title: t('请输入正确的提现金额'), icon: 'none' });
    return;
  }
  if (!form.value.payPassword.trim()) {
    uni.showToast({ title: t('请输入支付密码'), icon: 'none' });
    return;
  }
  if (!currentTemplate.value?.id) {
    uni.showToast({ title: t('请选择提现类型'), icon: 'none' });
    return;
  }
  if (!paymentMethod.value?.id) {
    globalTool.showToast(t('请先绑定提现地址'), () => {
      goBindPaymentMethod();
    });
    return;
  }

  submitWalletWithdraw({
    currency: currentTemplate.value.currency,
    amount: amountNum,
    payment_method_id: paymentMethod.value.id,
    withdraw_password: form.value.payPassword,
  }).then(() => {
    globalTool.showToast(t('提现成功'), () => {
      uni.navigateBack();
    });
  });
}
</script>

<style scoped lang="scss">
.withdraw-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-placeholder {
  height: 0;
}

.section {
  background: #fff;
  padding: 24rpx 30rpx;
  margin-top: 16rpx;
}

.section-label {
  font-size: 28rpx;
  color: #333;
}

.amount-input-wrap {
  margin-top: 20rpx;
  display: flex;
  align-items: center;
  border-bottom: 2rpx solid #f0f0f0;
  padding-bottom: 10rpx;
}

.currency-symbol {
  font-size: 40rpx;
  color: #ff3e6c;
  margin-right: 10rpx;
}

.amount-input {
  flex: 1;
  font-size: 40rpx;
  color: #333;
}

.section-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
  max-width: 65%;
}

.section-value {
  font-size: 26rpx;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.section-value.placeholder {
  color: #ff3e6c;
}

.account-details {
  margin-top: 20rpx;
  padding-top: 16rpx;
  border-top: 2rpx solid #f5f5f5;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8rpx 0;
}

.detail-label {
  font-size: 24rpx;
  color: #999;
}

.detail-value {
  font-size: 24rpx;
  color: #666;
  max-width: 60%;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.password-input {
  margin-top: 20rpx;
  font-size: 40rpx;
  color: #333;
  height: 80rpx;
  flex: 1;
  border-bottom: 2rpx solid #f0f0f0;
}

.balance-row {
  margin-top: 18rpx;
  display: flex;
  justify-content: flex-end;
}

.balance-text {
  font-size: 26rpx;
  color: #666;
}

.balance-amount {
  color: #ff3e6c;
  font-weight: 600;
}

.bottom-bar {
  padding: 20rpx 30rpx;
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: #ff3e6c;
  color: #fff;
  font-size: 30rpx;
  border: none;
}
</style>
