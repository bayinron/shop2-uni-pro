<template>
  <view class="withdraw-page">
    <!-- 提现金额 -->
    <view class="amount-card">
      <text class="amount-label">{{ t('提现金额') }}</text>
      <view class="amount-input-wrap">
        <text class="currency-symbol">{{ currencySymbol }}</text>
        <input
          class="amount-input"
          type="number"
          v-model="form.amount"
          :placeholder="t('请输入提现金额')"
          autocomplete="off"
        />
      </view>
      <view class="balance-row">
        <text class="balance-text">
          {{ t('可用余额：') }}<text class="balance-amount">{{ availableBalance }}</text>
        </text>
      </view>
    </view>

    <!-- 表单字段 -->
    <view class="form-card">
      <view class="form-item" @click="onSelectCurrency">
        <text class="form-label">{{ t('提现币种') }}</text>
        <view class="form-right">
          <text class="form-value" :class="{ placeholder: !form.currency }">
            {{ currencyDisplay || t('请选择') }}
          </text>
          <uni-icons type="bottom" size="18" color="#c7c7c7" />
        </view>
      </view>
      <view class="form-item">
        <text class="form-label">{{ t('收款姓名') }}</text>
        <text class="form-value readonly">{{ form.account_name || '-' }}</text>
      </view>
      <view class="form-item">
        <text class="form-label">{{ t('银行名称') }}</text>
        <text class="form-value readonly">{{ form.bank_name || '-' }}</text>
      </view>
      <view class="form-item">
        <text class="form-label">{{ t('收款账号') }}</text>
        <text class="form-value readonly">{{ form.account_number || '-' }}</text>
      </view>
      <view class="form-item no-border">
        <text class="form-label">{{ t('支付密码') }}</text>
        <input
          class="form-input"
          type="text"
          password
          v-model="form.payPassword"
          :placeholder="t('请输入支付密码')"
          placeholder-class="form-input-placeholder"
        />
      </view>
    </view>

    <view class="bottom-bar">
      <button class="submit-btn" @click="onSubmit">{{ t('提现') }}</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStoreHook } from '@/stores/modules/userStore';
import {
  getUserPaymentMethods,
  getWalletBalanceOverview,
  getWithdrawCurrencies,
  submitWalletWithdraw,
  type UserPaymentMethod,
  type WalletCurrency,
} from '@/api/pay';
import globalTool from '@/utils/globalTool';
import { useI18n } from '@/utils/i18n';

const { t } = useI18n();

const form = ref({
  amount: '',
  currency: '',
  account_name: '',
  bank_name: '',
  account_number: '',
  payPassword: '',
});

const currencies = ref<WalletCurrency[]>([]);
const availableBalance = ref('0');
const hasBoundAccount = ref(false);
const checkingGate = ref(false);
let promptVisible = false;

const userStore = useUserStoreHook();
const userInfo = computed(() => userStore.userInfo);

const currencyDisplay = computed(() => {
  const code = form.value.currency;
  if (!code) return '';
  const item = currencies.value.find((c) => getCurrencyCode(c) === code);
  if (!item) return code;
  const name = item.name || '';
  return name && name !== code ? `${name} (${code})` : code;
});

const currencySymbol = computed(() => {
  const item = currencies.value.find((c) => getCurrencyCode(c) === form.value.currency);
  return item?.symbol || '฿';
});

function unwrapPaymentList(res: any): UserPaymentMethod[] {
  const data = res?.data?.data ?? res?.data ?? res;
  return Array.isArray(data) ? data : [];
}

function applyBoundAccount(account: UserPaymentMethod | null) {
  if (!account) {
    hasBoundAccount.value = false;
    form.value.account_name = '';
    form.value.bank_name = '';
    form.value.account_number = '';
    return;
  }
  hasBoundAccount.value = true;
  form.value.account_name = account.account_name || '';
  form.value.bank_name = account.bank_name || '';
  form.value.account_number = account.account_number || '';
}

function promptSetPayPassword() {
  if (promptVisible) return;
  promptVisible = true;
  uni.showModal({
    title: t('提示'),
    content: t('请先设置提现密码'),
    confirmText: t('去设置'),
    cancelText: t('取消'),
    success: (res) => {
      promptVisible = false;
      if (res.confirm) {
        uni.navigateTo({
          url: '/pages/wallet/editPayPwd?first=true',
        });
      } else {
        uni.navigateBack();
      }
    },
    fail: () => {
      promptVisible = false;
    },
  });
}

function promptBindAccount() {
  if (promptVisible) return;
  promptVisible = true;
  uni.showModal({
    title: t('提示'),
    content: t('请先绑定收款账户'),
    confirmText: t('去绑定'),
    cancelText: t('取消'),
    success: (res) => {
      promptVisible = false;
      if (res.confirm) {
        uni.navigateTo({ url: '/pages/wallet/bank' });
      } else {
        uni.navigateBack();
      }
    },
    fail: () => {
      promptVisible = false;
    },
  });
}

async function loadPaymentAccount(showPrompt = true) {
  try {
    const res: any = await getUserPaymentMethods();
    const list = unwrapPaymentList(res);
    const account = list.length > 0 ? list[0] : null;
    applyBoundAccount(account);
    if (!account && showPrompt) {
      promptBindAccount();
    }
  } catch {
    applyBoundAccount(null);
    if (showPrompt) {
      promptBindAccount();
    }
  }
}

/** 先校验支付密码，通过后再校验收款账户，避免两个弹窗同时出现 */
async function checkWithdrawGate() {
  if (checkingGate.value || promptVisible) return;
  checkingGate.value = true;
  try {
    try {
      await userStore.reqUserInfo();
    } catch {
      // 刷新失败时沿用本地 userInfo
    }
    if (!userInfo.value?.has_withdraw_password) {
      promptSetPayPassword();
      return;
    }
    await loadPaymentAccount(true);
  } finally {
    checkingGate.value = false;
  }
}

onLoad(() => {
  loadCurrencies();
  loadBalance();
});

onShow(() => {
  checkWithdrawGate();
});

function loadBalance() {
  getWalletBalanceOverview().then((res: any) => {
    const data = res?.data ?? res;
    availableBalance.value =
      data?.balance_wallet?.balance_formatted ||
      data?.total_formatted ||
      '0';
  });
}

function getCurrencyCode(item: WalletCurrency | string): string {
  if (typeof item === 'string') return item;
  return item.code || item.currency || '';
}

function normalizeCurrencies(raw: any): WalletCurrency[] {
  const list = raw?.data?.list ?? raw?.data ?? raw?.list ?? raw ?? [];
  if (!Array.isArray(list)) return [];
  return list.map((item: any) => {
    if (typeof item === 'string') {
      return { code: item, name: item, symbol: item, decimal_places: 2, is_fiat: true };
    }
    return {
      ...item,
      code: item.code || item.currency || '',
      name: item.name || item.code || item.currency || '',
      symbol: item.symbol || item.code || item.currency || '',
    } as WalletCurrency;
  }).filter((item: WalletCurrency) => !!item.code);
}

function loadCurrencies() {
  getWithdrawCurrencies().then((res: any) => {
    const list = normalizeCurrencies(res);
    currencies.value = list;
    if (list.length === 1) {
      form.value.currency = list[0].code;
    }
  });
}

function onSelectCurrency() {
  if (!currencies.value.length) {
    uni.showToast({ title: t('暂无可用提现方式'), icon: 'none' });
    loadCurrencies();
    return;
  }
  const itemList = currencies.value.map((c) => {
    const code = getCurrencyCode(c);
    return c.name && c.name !== code ? `${c.name} (${code})` : code;
  });
  uni.showActionSheet({
    itemList,
    success: (res) => {
      const idx = res.tapIndex;
      if (idx >= 0 && idx < currencies.value.length) {
        form.value.currency = getCurrencyCode(currencies.value[idx]);
      }
    },
  });
}

function onSubmit() {
  if (!userInfo.value?.has_withdraw_password) {
    promptSetPayPassword();
    return;
  }
  if (!hasBoundAccount.value) {
    promptBindAccount();
    return;
  }
  const amountNum = Number(form.value.amount);
  if (!amountNum || amountNum <= 0) {
    uni.showToast({ title: t('请输入正确的提现金额'), icon: 'none' });
    return;
  }
  if (!form.value.currency.trim()) {
    uni.showToast({ title: t('请选择提现币种'), icon: 'none' });
    return;
  }
  if (!form.value.account_name.trim() || !form.value.bank_name.trim() || !form.value.account_number.trim()) {
    uni.showToast({ title: t('请先绑定收款账户'), icon: 'none' });
    return;
  }
  if (!form.value.payPassword.trim()) {
    uni.showToast({ title: t('请输入支付密码'), icon: 'none' });
    return;
  }

  // 新協議僅傳 amount / currency / withdraw_password；
  // 收款帳戶由後端按已綁定帳戶處理，前端不再上送 account_* / bank_name。
  submitWalletWithdraw({
    amount: String(form.value.amount).trim(),
    currency: form.value.currency.trim(),
    withdraw_password: form.value.payPassword.trim(),
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
}

.amount-card {
  margin-top: 16rpx;
  padding: 24rpx 30rpx 20rpx;
  background: #fff;
}

.amount-label {
  font-size: 26rpx;
  color: #999;
}

.amount-input-wrap {
  margin-top: 12rpx;
  display: flex;
  align-items: center;
}

.currency-symbol {
  font-size: 44rpx;
  color: #ff3e6c;
  margin-right: 10rpx;
  font-weight: 600;
}

.amount-input {
  flex: 1;
  font-size: 44rpx;
  color: #333;
  height: 64rpx;
  font-weight: 600;
}

.balance-row {
  margin-top: 12rpx;
  display: flex;
  justify-content: flex-end;
}

.balance-text {
  font-size: 24rpx;
  color: #999;
}

.balance-amount {
  color: #ff3e6c;
  font-weight: 600;
}

.form-card {
  margin-top: 16rpx;
  background: #fff;
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
  color: #333;
  flex-shrink: 0;
}

.form-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
}

.form-value {
  font-size: 28rpx;
  color: #333;
}

.form-value.placeholder {
  color: #c7c7c7;
}

.form-value.readonly {
  flex: 1;
  text-align: right;
  color: #666;
}

.form-input {
  flex: 1;
  text-align: right;
  font-size: 28rpx;
  color: #333;
  height: 96rpx;
}

.form-input-placeholder {
  font-size: 28rpx;
  color: #c7c7c7;
}

.bottom-bar {
  margin-top: 48rpx;
  padding: 0 30rpx 40rpx;
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
