import { http } from '@/utils/request';

/**
 * 支付與充值相關 API
 *
 * 說明：
 *  - 所有路徑均已去掉 `/api/` 前綴，交由全局攔截器統一加上。
 *  - 默認會自動帶上 token、語言等公共參數。
 */

/**
 * =========================
 * 支付渠道
 * =========================
 */

export type PaymentChannelType = 'manual' | 'online';

export interface PaymentChannel {
  id: number;
  name: string;
  type: string; // 如: 'crypto', 'bank', 等
  provider: string; // 如: 'manual', 'stripe', 等
  config: any | null;
  is_online: number;
  currency: string;
  account_name: string;
  account_detail: string;
  bank_name: string;
  branch_name: string;
  min_amount: string;
  max_amount: string;
  status: number;
  instructions: string;
  sort_order: number;
  bank_info: any | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}



/**
 * 獲取可用支付渠道列表
 * GET /api/payment-channels
 */
export function getPaymentChannels() {
  return http<any>({
    method: 'GET',
    url: 'payment-channels',
  });
}

/**
 * =========================
 * 充值申請（錢包入金）
 * =========================
 */

export interface WalletDepositPayload {
  /** 支付渠道 ID */
  channel_id: number;
  /** 貨幣代碼 (如: USD, CNY) */
  currency: string;
  /** 充值金額 */
  amount: number;
  /** 交易 ID（手動支付適用，可選） */
  tx_id?: string;
  /** 轉賬憑證圖片（手動支付適用，可選） */
  proof_img?: string;
}

export interface WalletDepositManualData {
  type: 'manual';
  deposit_id: number;
  instructions: string;
}

export interface WalletDepositRedirectData {
  type: 'redirect';
  redirect_url: string;
  session_id?: string;
}

export type WalletDepositPaymentType = 'manual' | 'stripe' | string;

export interface WalletDepositChannelSummary {
  id: number;
  name: string;
  is_online: boolean;
}

export interface WalletDepositResponse {
  deposit_id: number;
  payment_type: WalletDepositPaymentType;
  payment_data: WalletDepositManualData | WalletDepositRedirectData | Record<string, any>;
  channel: WalletDepositChannelSummary;
}

/**
 * 提交充值申請
 * POST /api/wallet/deposit
 *
 * 後端要求 multipart/form-data，因此這裡使用 FormData 組裝參數。
 */
export function submitWalletDeposit(payload: WalletDepositPayload) {
  return http<any>({
    method: 'POST',
    url: 'wallet/deposit',
    data:payload,
  });
}

/**
 * =========================
 * 銀行模板
 * =========================
 */

export type BankTemplateFieldType = 'text' | 'number' | 'date' | string;

export interface BankTemplateField {
  name: string;
  label: string;
  type: BankTemplateFieldType;
  required: boolean;
  placeholder?: string;
}

export interface BankTemplate {
  id: number;
  bank_name: string;
  country_code: string;
  fields: BankTemplateField[];
  is_active: boolean;
}

/**
 * 銀行模板查詢參數
 */
export interface GetBankTemplatesParams {
  /** 國家代碼篩選 (如: TW, CN, US) */
  country_code?: string;
}

/**
 * 獲取銀行模板列表
 * GET /api/bank-templates
 */
export function getBankTemplates(params: GetBankTemplatesParams = {}) {
  return http<BankTemplate[]>({
    method: 'GET',
    url: 'bank-templates',
    data: params,
  });
}

/**
 * =========================
 * 用戶收款方式管理
 * =========================
 */

export interface BindPaymentMethodPayload {
  name: string;
  /** 銀行模板 ID */
  bank_template_id: number;
  /** 帳戶信息（依模板字段而定） */
  details: Record<string, any>;
  /** 是否設為預設，默認 false */
  is_default?: boolean;
}

export interface UserPaymentMethod {
  id: number;
  user_id?: number;
  bank_template_id: number;
  bank_name?: string;
  account_info: Record<string, any>;
  is_default: boolean;
  created_at?: string;
}

/**
 * 綁定收款方式
 * POST /api/user/payment-methods
 */
export function bindUserPaymentMethod(data: BindPaymentMethodPayload) {
  return http<any>({
    method: 'POST',
    url: 'user/payment-methods',
    data,
  });
}

/**
 * 獲取我的收款方式列表
 * GET /api/user/payment-methods
 */
export function getUserPaymentMethods() {
  return http<UserPaymentMethod[]>({
    method: 'GET',
    url: 'user/payment-methods',
  });
}

/**
 * 設為預設收款方式
 * PATCH /api/user/payment-methods/:id/default
 *
 * UniApp 不直接支持 PATCH，後端通常接受 POST 來表達更新語義。
 */
export function setDefaultUserPaymentMethod(id: number) {
  return http<{ success?: boolean } & Record<string, any>>({
    method: 'POST',
    url: `user/payment-methods/${id}/default`,
  });
}

/**
 * =========================
 * 提現相關
 * =========================
 */

export interface WithdrawalRules {
  min_amount: number;
  max_amount: number;
  fee_rate: number;
  daily_limit: number;
  processing_time: string;
}

/**
 * 獲取提現規則
 * GET /api/system-config/withdrawal-rules
 */
export function getWithdrawalRules() {
  return http<WithdrawalRules>({
    method: 'GET',
    url: 'system-config/withdrawal-rules',
  });
}

export interface MyShopFinancialSummary {
  total_sales: number;
  total_commission: number;
  available_balance: number;
  pending_withdrawal: number;
}

/**
 * 查看錢包餘額 / 財務摘要
 * GET /api/mall/my-shop/financial/summary
 */
export function getMyShopFinancialSummary() {
  return http<MyShopFinancialSummary>({
    method: 'GET',
    url: 'mall/my-shop/financial/summary',
  });
}

export interface ShopWithdrawPayload {
  /** 提現金額 */
  amount: number;
  /** 貨幣代碼 (如: TWD, USD) */
  currency: string;
  /** 收款方式 ID（不提供則使用預設） */
  payment_method_id?: number;
  /** 備註 */
  remark?: string;
}

export type ShopWithdrawStatus = 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';

export interface ShopWithdrawResponse {
  withdrawal_id: number;
  amount: number;
  currency: string;
  fee: number;
  actual_amount: number;
  status: ShopWithdrawStatus;
  created_at: string;
}

/**
 * 提交提現申請
 * POST /api/mall/my-shop/financial/withdraw
 */
export function submitShopWithdraw(data: ShopWithdrawPayload) {
  return http<ShopWithdrawResponse>({
    method: 'POST',
    url: 'mall/my-shop/financial/withdraw',
    data,
  });
}

