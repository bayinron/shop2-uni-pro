<template>
  <view class="recharge-page">
    <!-- 顶部标题栏（由导航栏控制，这里只预留背景） -->
    <view class="header-placeholder" />

    <scroll-view class="scroll" scroll-y>
      <!-- 充值金额 -->
      <view class="section">
        <text class="section-label">充值金额</text>
        <view class="amount-input-wrap">
          <text class="currency-symbol">￥</text>
          <input
            class="amount-input"
            type="number"
            v-model="form.amount"
            placeholder="请输入充值金额"
          />
        </view>
      </view>

      <!-- 充值方式 -->
      <view class="section">
        <view class="section-row" @click="onPayTypeClick">
          <text class="section-label">充值方式</text>
          <view class="section-right">
            <text class="section-value">{{ currentPayType.name }}</text>
            <uni-icons type="right" size="18" color="#999" />
          </view>
        </view>
        <view class="pay-desc">
          <text class="pay-desc-text">{{ currentPayType.instructions }}</text>
        </view>
      </view>

      <!-- 上传支付凭证 -->
      <view class="section upload-section">
        <view class="upload-card" @click="onUploadProofImg">
          <!-- 已选择图片时展示预览，否则展示占位内容 -->
          <block v-if="form.proof_img">
            <image class="upload-preview" :src="form.proof_img" mode="aspectFill" />
          </block>
          <block v-else>
            <image class="upload-icon" src="/static/img/upload.png" mode="aspectFill" />
            <view class="upload-text-wrap">
              <text class="upload-title">点击上传付款凭证</text>
              <text class="upload-sub">请上传转账截图，方便客服为您核对到账</text>
            </view>
          </block>
        </view>
      </view>

      <!-- 温馨提示 -->
      <view class="tips-section">
        <text class="tips-title">温馨提示：</text>
        <view class="tips-item" v-for="(t, idx) in tips" :key="idx">
          <text class="tips-index">{{ idx + 1 }}.</text>
          <text class="tips-text">{{ t }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <button class="submit-btn" @click="onSubmit">立即充值</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import  {submitWalletDeposit, type WalletDepositPayload,getPaymentChannels, type PaymentChannel} from '@/api/pay';
import { useUserStoreHook } from '@/stores/modules/userStore';
import globalTool from '@/utils/globalTool';

const userStore = useUserStoreHook();
const userInfo = computed(() => userStore.userInfo);


const form = ref({
  amount: '',
  payType: 'USD',
  proof_img: '',
});

const payTypes = ref<PaymentChannel[]>([
  {
  "id": 4,
  "name": "USDT-TRC20",
  "type": "crypto",
  "provider": "manual",
  "config": null,
  "is_online": 0,
  "currency": "USDT",
  "account_name": "",
  "account_detail": "T9yD14Nj9j7xAB4dbGeSv4h8cG799",
  "bank_name": "",
  "branch_name": "",
  "min_amount": "10.00000000",
  "max_amount": "100000.00000000",
  "status": 1,
  "instructions": "請僅向此地址轉入 USDT-TRC20，其他幣種或網路轉帳將無法到帳。",
  "sort_order": 2,
  "bank_info": null,
  "created_at": "2026-03-19 14:12:47",
  "updated_at": "2026-03-19 14:12:47",
  "deleted_at": null
}
]);

const currentPayType = ref<PaymentChannel>(payTypes.value[0]);

const tips = [
  '为确保充值及时到账，请严格按照充值金额进行支付。',
  '完成转账后，请上传清晰的转账截图，方便客服为您核对。',
  '每日审核时间为 9:00-22:00，其他时间提交的订单将顺延处理。',
  '如有任何疑问，请及时联系在线客服为您处理。',
];

function onPayTypeClick() {
  const itemList = payTypes.value.map((p) => p.name);
  uni.showActionSheet({
    itemList,
    success: (res) => {
      const idx = res.tapIndex;
      if (idx >= 0 && idx < payTypes.value.length) {
        currentPayType.value = payTypes.value[idx];
        form.value.payType = payTypes.value[idx].currency;
      }
    },
  });
}

function onUploadProofImg() {
  globalTool.chooseImageWithLimit(3).then((filePath: string) => {
    if (!filePath) return;
    console.log(filePath);
    form.value.proof_img = filePath;
   
  });
}
async function onSubmit() {
  const amountNum = Number(form.value.amount);
  if (!amountNum || amountNum <= 0) {
    uni.showToast({ title: '请输入正确的充值金额', icon: 'none' });
    return;
  }
  const payload: WalletDepositPayload = {
    amount: amountNum,
    currency: currentPayType.value.currency,
    channel_id: currentPayType.value.id,
    proof_img: form.value.proof_img,
  };
   submitWalletDeposit(payload).then((res: any) => {
      globalTool.showToast( '提交成功，请等待审核', true, 'success' );
    
  });
}
onLoad(() => {
  getPaymentChannels().then((res: any) => {
    payTypes.value = res;
  });
});
</script>

<style scoped lang="scss">
.recharge-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-placeholder {
  height: 0; // 头部由导航栏自身控制，这里不再占位高度
}

.scroll {
  flex: 1;
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
}

.section-value {
  font-size: 26rpx;
  color: #333;
}

.pay-desc {
  margin-top: 16rpx;
}

.pay-desc-text {
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.upload-section {
  background: #fff;
}

.upload-card {
  margin-top: 10rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fff5f7;
  display: flex;
  align-items: center;
  gap: 20rpx;
  .upload-icon {
    width: 96rpx;
    height: 96rpx;
  }
}

.upload-preview {
  width: 100%;
  height: 260rpx;
  border-radius: 12rpx;
}

.upload-icon-wrap {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #ff6b9d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon-wrap .icon {
  font-size: 48rpx;
  color: #fff;
}

.upload-text-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.upload-title {
  font-size: 28rpx;
  color: #333;
}

.upload-sub {
  font-size: 24rpx;
  color: #999;
}

.tips-section {
  margin-top: 24rpx;
  padding: 24rpx 30rpx 40rpx;
}

.tips-title {
  font-size: 26rpx;
  color: #ff3e6c;
  font-weight: 600;
}

.tips-item {
  margin-top: 8rpx;
  display: flex;
  align-items: flex-start;
}

.tips-index {
  font-size: 24rpx;
  color: #ff3e6c;
  margin-right: 8rpx;
}

.tips-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
}

.bottom-bar {
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
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

